import { NextRequest, NextResponse } from 'next/server'

interface EntityNewsRequest {
  name?: string // Legacy support
  entityName?: string
  type?: string // Legacy support
  entityType?: string
  location?: string
  timeRange?: string
}

interface NewsArticle {
  title: string
  summary: string
  source: string
  sourceUrl: string
  publishedAt: string
  category: string
  tags: string[]
}

export async function POST(request: NextRequest) {
  try {
    const requestData: EntityNewsRequest = await request.json()
    
    // Support both old and new parameter names
    const entityName = requestData.name || requestData.entityName || ''
    const entityType = requestData.type || requestData.entityType || 'Healthcare'
    const location = requestData.location || ''
    const timeRange = requestData.timeRange || '1y'

    if (!entityName && !entityType) {
      return NextResponse.json(
        { success: false, error: 'Entity name or type is required' },
        { status: 400 }
      )
    }

    const perplexityApiKey = process.env.PERPLEXITY_API_KEY

    if (!perplexityApiKey) {
      console.error('❌ PERPLEXITY_API_KEY not configured')
      return NextResponse.json(
        { success: true, data: [] },
        { status: 200 }
      )
    }

    // Determine search recency filter
    let searchRecencyFilter = 'year'
    if (timeRange === '3m') searchRecencyFilter = 'month'
    else if (timeRange === '6m') searchRecencyFilter = 'month'
    else searchRecencyFilter = 'year'

    // Build smart query (same approach as Insights API)
    let searchTerm = entityName || entityType
    
    // Simplify generic facility type names
    searchTerm = searchTerm
      .replace(/clinic center/gi, 'clinic')
      .replace(/hospital center/gi, 'hospital')
      .replace(/care center/gi, 'care')
      .trim()

    const locationText = location && location !== 'United States' ? ` in ${location}` : ''
    
    // Build query similar to Insights API - bullet points, not JSON
    const query = `Find recent news and developments about ${searchTerm}${locationText} healthcare facilities. 

Search for news about:
- Facility expansions and new locations
- Acquisitions, mergers, and partnerships
- Technology adoptions and digital health initiatives
- Policy changes and regulatory updates
- Service additions and new care models
- Leadership appointments and organizational changes
- Awards, certifications, and recognition
- Funding rounds and financial developments
- Market trends and industry analysis

Provide 10-15 recent news items as bullet points. For each item include the specific article title, brief summary, and focus on real, verifiable developments. Include a mix of specific facility news and broader industry trends affecting this type of healthcare facility.`

    console.log('🔍 Fetching news for:', searchTerm)
    console.log('📅 Time range:', timeRange, '→ Recency filter:', searchRecencyFilter)

    // Call Perplexity API (same as Insights API)
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar', // Same model as Insights
        messages: [
          {
            role: 'system',
            content: 'You are a healthcare news researcher. Provide accurate, recent news about healthcare facilities and industry trends. Format your response as clean bullet points without any markdown formatting. Each bullet point should contain: the article title or headline, a brief summary, and the publication or source. Focus on real, verifiable news from credible healthcare publications. Use simple bullet points like "-" or "•".'
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2, // Same as Insights
        max_tokens: 2000,
        return_citations: true, // Get real sources
        return_images: false,
        search_recency_filter: searchRecencyFilter
      })
    })

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text()
      console.error('❌ Perplexity API Error:', perplexityResponse.status, errorText)
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    const perplexityData = await perplexityResponse.json()
    console.log('✅ Perplexity API Response received')

    // Parse response (same approach as Insights API)
    const content = perplexityData.choices?.[0]?.message?.content || ''
    const citations = perplexityData.citations || []

    console.log('📄 Content length:', content.length)
    console.log('🔗 Citations:', citations.length)

    // Parse into structured articles
    const articles = parseNewsContent(content, citations, entityType)

    console.log('✅ Parsed articles:', articles.length)

    return NextResponse.json({
      success: true,
      data: articles
    })

  } catch (error: any) {
    console.error('❌ Entity news error:', error)
    return NextResponse.json({
      success: true,
      data: []
    })
  }
}

// Parse news content into structured articles (same approach as Insights API)
function parseNewsContent(content: string, citations: string[], entityType: string): NewsArticle[] {
  const articles: NewsArticle[] = []
  
  // Clean markdown formatting
  const cleanContent = content
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
    .replace(/\*(.*?)\*/g, '$1')     // Remove *italic*
    .replace(/`(.*?)`/g, '$1')       // Remove `code`
  
  // Split by bullet points
  const lines = cleanContent.split('\n').filter(line => line.trim())
  
  let currentItem = ''
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Check if it's a bullet point or numbered item
    if (trimmed.match(/^[-•*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
      if (currentItem) {
        articles.push(parseArticleItem(currentItem, entityType))
      }
      currentItem = trimmed.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, '')
    } else if (currentItem) {
      currentItem += ' ' + trimmed
    } else {
      currentItem = trimmed
    }
  }
  
  // Add the last item
  if (currentItem) {
    articles.push(parseArticleItem(currentItem, entityType))
  }

  // Add citations as URLs if available
  if (citations.length > 0) {
    articles.forEach((article, index) => {
      if (citations[index]) {
        article.sourceUrl = citations[index]
        try {
          article.source = new URL(citations[index]).hostname.replace('www.', '')
        } catch (e) {
          // Keep existing source if URL parsing fails
        }
      }
    })
  }

  return articles
}

function parseArticleItem(text: string, entityType: string): NewsArticle {
  // Extract title (first sentence or first 80 chars)
  const firstSentence = text.split(/[.!?]/)[0]
  const title = firstSentence && firstSentence.length < 120 
    ? firstSentence.trim() 
    : text.substring(0, 80).trim() + '...'
  
  // Categorize based on keywords
  const lowerText = text.toLowerCase()
  let category = 'General'
  
  if (lowerText.includes('expand') || lowerText.includes('new location') || lowerText.includes('opening')) {
    category = 'Expansion'
  } else if (lowerText.includes('acqui') || lowerText.includes('merger') || lowerText.includes('m&a')) {
    category = 'M&A'
  } else if (lowerText.includes('technology') || lowerText.includes('digital') || lowerText.includes('ai') || lowerText.includes('software')) {
    category = 'Technology'
  } else if (lowerText.includes('policy') || lowerText.includes('regulation') || lowerText.includes('compliance') || lowerText.includes('law')) {
    category = 'Policy'
  } else if (lowerText.includes('funding') || lowerText.includes('investment') || lowerText.includes('capital')) {
    category = 'Funding'
  } else if (lowerText.includes('leadership') || lowerText.includes('ceo') || lowerText.includes('appoint')) {
    category = 'Leadership'
  } else if (lowerText.includes('award') || lowerText.includes('recognition') || lowerText.includes('certified')) {
    category = 'Awards'
  } else if (lowerText.includes('partner') || lowerText.includes('collaboration')) {
    category = 'Partnership'
  } else if (lowerText.includes('market') || lowerText.includes('trend') || lowerText.includes('industry') || lowerText.includes('growth')) {
    category = 'Market Trend'
  }
  
  // Extract tags
  const tags: string[] = []
  if (lowerText.includes('telehealth') || lowerText.includes('telemedicine')) tags.push('Telehealth')
  if (lowerText.includes('medicare') || lowerText.includes('medicaid')) tags.push('Insurance')
  if (lowerText.includes('quality') || lowerText.includes('patient satisfaction')) tags.push('Quality')
  if (lowerText.includes('cost') || lowerText.includes('efficiency')) tags.push('Efficiency')
  if (entityType) tags.push(entityType)
  
  // Estimate date (for now, just say "Recent")
  const publishedAt = 'Recent'
  
  return {
    title,
    summary: text,
    source: 'Healthcare News',
    sourceUrl: '',
    publishedAt,
    category,
    tags: tags.slice(0, 3) // Limit to 3 tags
  }
}
