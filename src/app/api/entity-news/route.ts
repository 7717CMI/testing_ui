import { NextRequest, NextResponse } from 'next/server'

interface EntityNewsRequest {
  entityName: string
  entityType: string // e.g., "hospital", "clinic", "agency"
  location?: string // City, State for better targeting
  timeRange?: string // "1year", "6months", "3months"
}

interface NewsArticle {
  title: string
  summary: string
  source: string
  sourceUrl: string
  date: string
  category: string
  relevanceScore: number
}

export async function POST(request: NextRequest) {
  try {
    const requestData: EntityNewsRequest = await request.json()
    const { entityName, entityType, location, timeRange = '1year' } = requestData

    if (!entityName || !entityType) {
      return NextResponse.json(
        { success: false, error: 'Entity name and type are required' },
        { status: 400 }
      )
    }

    const perplexityApiKey = process.env.PERPLEXITY_API_KEY

    if (!perplexityApiKey) {
      console.error('❌ PERPLEXITY_API_KEY not configured')
      return NextResponse.json(
        { 
          success: false, 
          error: 'API key not configured',
          fallback: true,
          articles: []
        },
        { status: 200 }
      )
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    if (timeRange === '1year') {
      startDate.setFullYear(startDate.getFullYear() - 1)
    } else if (timeRange === '6months') {
      startDate.setMonth(startDate.getMonth() - 6)
    } else if (timeRange === '3months') {
      startDate.setMonth(startDate.getMonth() - 3)
    }

    const dateRangeText = `from ${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} to ${endDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`

    // Construct query with fallback strategy
    // Make query broader if entity name seems generic
    const isGenericName = entityName.toLowerCase().includes('facilities') || 
                         entityName.toLowerCase().includes('healthcare') ||
                         entityName.length > 50
    
    let searchTerm = entityName
    let queryContext = ''
    
    if (isGenericName) {
      // For generic names, focus on the facility type instead
      const typeKeywords = entityType.toLowerCase()
        .replace(/-/g, ' ')
        .replace(/clinic center/gi, 'clinic')
        .replace(/hospital center/gi, 'hospital')
      
      searchTerm = typeKeywords
      queryContext = ` Search for news about ${typeKeywords} facilities, including specific facility names, industry trends, and developments.`
    } else {
      queryContext = ` Focus on this specific facility: "${entityName}".`
    }
    
    const locationText = location && location !== 'United States' ? ` in ${location}` : ' across the United States'
    
    const query = `Find verified news articles and press releases about ${searchTerm}${locationText}, related to ${entityType} healthcare facilities. ${dateRangeText}.${queryContext}

Search for articles about:
- Facility expansions and new locations
- Acquisitions, mergers, and partnerships  
- Technology adoptions and digital health
- Policy changes and regulatory updates
- Service additions and care model changes
- Leadership appointments and changes
- Awards, recognition, and certifications
- Funding rounds and financial news
- Market trends and industry analysis

For EACH article found, provide: exact article title, publication date (YYYY-MM-DD), source publication name, full article URL, 2-3 sentence summary, and appropriate category.

Return 10-15 diverse articles if available.`

    console.log('🔍 Fetching entity news:', entityName)
    console.log('📅 Date range:', dateRangeText)
    console.log('🎯 Search term:', searchTerm)
    console.log('🎯 Is generic?:', isGenericName)
    console.log('🎯 Query:', query.substring(0, 200) + '...')

    const systemPrompt = `You are a healthcare news researcher specializing in finding real, verified news articles.

CRITICAL RULES:
1. Return ONLY real news articles with actual URLs from credible sources
2. If you cannot find specific facility news, return industry/sector news instead
3. NEVER fabricate or hallucinate news stories
4. Include publication dates in ISO format (YYYY-MM-DD)
5. Only include articles from the specified date range
6. Prioritize: Healthcare Business News, Becker's Healthcare, Modern Healthcare, Healthcare Dive, Fierce Healthcare, McKnight's, local news outlets

IMPORTANT: If no specific facility news exists, search for:
- Industry trends affecting this facility type
- Regional healthcare news in the same sector
- Policy changes impacting this type of care
- Market analysis reports for this facility category

Return your response as a valid JSON array with this exact structure:
[
  {
    "title": "Exact article title",
    "summary": "Brief 2-3 sentence summary focusing on key developments",
    "source": "Publication name",
    "sourceUrl": "Full article URL",
    "date": "YYYY-MM-DD",
    "category": "expansion|acquisition|partnership|regulatory|service|leadership|award|controversy|technology|policy|funding|market trend",
    "relevanceScore": 0.0-1.0
  }
]

Aim for 10-15 diverse articles across different categories. If fewer specific articles exist, include relevant industry news.
If absolutely no relevant news exists after thorough search, return: []`

    // Call Perplexity API
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.1, // Low temperature for factual accuracy
        max_tokens: 4000,
        return_citations: true,
        search_recency_filter: timeRange === '1year' ? 'year' : timeRange === '6months' ? 'month' : 'week'
      })
    })

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text()
      console.error('❌ Perplexity API Error:', perplexityResponse.status, errorText)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch news',
        fallback: true,
        articles: []
      })
    }

    const perplexityData = await perplexityResponse.json()
    console.log('✅ Perplexity API Response received')

    // Parse the AI response
    const aiResponse = perplexityData.choices?.[0]?.message?.content || '[]'
    console.log('📄 AI Response length:', aiResponse.length)

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = aiResponse.trim()
    const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/```\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim()
    } else if (jsonText.startsWith('[') || jsonText.startsWith('{')) {
      // Already JSON, use as is
    } else {
      // Try to find JSON array in the text
      const arrayMatch = jsonText.match(/\[[\s\S]*\]/)
      if (arrayMatch) {
        jsonText = arrayMatch[0]
      }
    }

    let articles: NewsArticle[] = []
    try {
      articles = JSON.parse(jsonText)
      if (!Array.isArray(articles)) {
        articles = []
      }
      console.log('✅ Parsed articles:', articles.length)
    } catch (parseError) {
      console.error('❌ Failed to parse AI response as JSON:', parseError)
      console.log('Raw response:', aiResponse.substring(0, 500))
      articles = []
    }

    // Filter articles by date range (additional validation)
    const filteredArticles = articles.filter(article => {
      try {
        const articleDate = new Date(article.date)
        return articleDate >= startDate && articleDate <= endDate && article.title && article.sourceUrl
      } catch {
        return false
      }
    })

    // Sort by date (newest first)
    filteredArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    console.log('✅ Filtered articles:', filteredArticles.length)

    // Get citations if available
    const citations = perplexityData.citations || []

    return NextResponse.json({
      success: true,
      entityName,
      entityType,
      location,
      timeRange,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      articles: filteredArticles,
      totalArticles: filteredArticles.length,
      citations,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ Entity news API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      fallback: true,
      articles: [],
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

