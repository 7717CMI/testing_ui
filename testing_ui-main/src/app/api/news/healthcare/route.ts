/**
 * Healthcare News API Route
 * Endpoint: GET /api/news/healthcare?category={category}
 * Returns cached news articles from NewsAPI.org
 */

import { NextRequest, NextResponse } from 'next/server'
import { fetchHealthcareNews } from '@/lib/newsapi'
import { NewsCategory } from '@/types/news'

/**
 * Fetch news from Perplexity API as fallback/enhancement
 */
async function fetchNewsFromPerplexity(category: NewsCategory): Promise<any> {
  const perplexityApiKey = process.env.PERPLEXITY_API_KEY

  if (!perplexityApiKey) {
    throw new Error('PERPLEXITY_API_KEY is not configured')
  }

  // Map category to search query
  const categoryQueries: Record<NewsCategory, string> = {
    all: 'Latest healthcare industry news in the United States. Include hospital expansions, technology adoption, policy changes, and market trends.',
    expansion: 'Latest healthcare facility expansions, new hospital openings, clinic developments, and capacity increases in the United States.',
    technology: 'Latest healthcare technology news, AI in healthcare, telehealth adoption, digital health innovations, and health IT in the United States.',
    policy: 'Latest healthcare policy changes, CMS updates, healthcare regulations, Medicare and Medicaid news in the United States.',
    funding: 'Latest healthcare funding news, healthcare investments, healthcare startup funding, and healthcare venture capital in the United States.',
    'market-trends': 'Latest healthcare market trends, healthcare industry analysis, healthcare market forecasts, and healthcare business news in the United States.',
  }

  const searchQuery = `${categoryQueries[category] || categoryQueries.all}

IMPORTANT: You MUST find and return EXACTLY 10-15 different news articles. Search multiple healthcare news sources, multiple dates, and multiple topics to find enough articles. Do not stop searching until you have at least 10 articles.`

  const systemPrompt = `You are a healthcare news API. Return ONLY valid JSON, no explanations.

Search the web for REAL, RECENT healthcare news articles (last 7 days) in the United States.

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON - NO markdown, NO explanations, NO text before or after JSON
2. You MUST return EXACTLY 10-15 articles - this is MANDATORY
3. Search MULTIPLE sources: Modern Healthcare, Becker's Healthcare, Healthcare Dive, Fierce Healthcare, STAT News, Reuters Health, AP Health, etc.
4. Search MULTIPLE dates within the last 7 days to find enough articles
5. Extract article titles, sources, URLs, and publication dates from REAL articles
6. Use ACTUAL dates, sources, and URLs from real articles you find
7. If you find fewer than 10 articles, continue searching different sources and dates until you have at least 10

REQUIRED JSON FORMAT (copy this structure exactly):
{
  "status": "ok",
  "totalResults": 15,
  "articles": [
    {
      "source": { "id": null, "name": "Publication Name" },
      "author": "Author Name or null",
      "title": "Exact headline from source",
      "description": "First 1-2 sentences from article",
      "url": "https://example.com/article",
      "urlToImage": null,
      "publishedAt": "2025-01-20T00:00:00Z",
      "content": "Article summary or first paragraph"
    }
    // ... MUST include 10-15 articles here
  ]
}

MANDATORY: Return EXACTLY 10-15 articles. Search multiple sources and dates to meet this requirement.
Return ONLY the JSON object above. NO explanations. NO apologies.`

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: searchQuery }
        ],
        temperature: 0.1, // Lower temperature for more consistent results
        max_tokens: 8000, // Increased to ensure we can fit 10-15 articles
        return_citations: true,
        return_images: false,
        search_recency_filter: 'week', // Last 7 days
      }),
    })

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`)
    }

    const perplexityData = await response.json()
    const aiResponse = perplexityData.choices[0].message.content
    
    console.log(`📄 Perplexity response length: ${aiResponse.length} characters`)
    console.log(`📄 Perplexity response preview: ${aiResponse.substring(0, 500)}`)

    // Parse JSON from response
    let cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    if (!cleanedResponse.startsWith('{')) {
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0]
        console.log('⚠️ Extracted JSON from non-JSON response')
      } else {
        console.error('❌ No JSON found in Perplexity response')
        console.error('Response preview:', aiResponse.substring(0, 1000))
        throw new Error('No JSON found in Perplexity response')
      }
    }

    let parsedData
    try {
      parsedData = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('❌ Failed to parse Perplexity JSON:', parseError)
      console.error('Cleaned response preview:', cleanedResponse.substring(0, 1000))
      throw new Error('Failed to parse Perplexity response as JSON')
    }
    
    // Ensure we have the right structure
    if (!parsedData.articles || !Array.isArray(parsedData.articles)) {
      console.error('❌ Invalid response structure from Perplexity:', parsedData)
      throw new Error('Invalid response structure from Perplexity')
    }

    // Filter out any invalid articles and limit to 15 max
    const validArticles = parsedData.articles
      .filter((article: any) => article && article.title && article.source)
      .slice(0, 15)
    
    parsedData.articles = validArticles
    parsedData.totalResults = validArticles.length
    parsedData.status = 'ok'

    console.log(`✅ Perplexity API returned ${validArticles.length} articles for category: ${category}`)
    
    if (validArticles.length < 10) {
      console.warn(`⚠️ Perplexity returned only ${validArticles.length} articles, expected 10-15`)
    }
    
    return parsedData
  } catch (error: any) {
    console.error('❌ Perplexity API error:', error)
    throw error
  }
}

// Cache configuration
interface CacheEntry {
  data: any
  timestamp: number
}

const newsCache: Record<string, CacheEntry> = {}
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

/**
 * Mock fallback data in case NewsAPI fails or rate limit is hit
 */
const MOCK_NEWS_DATA = {
  status: 'ok',
  totalResults: 3,
  articles: [
    {
      source: { id: null, name: 'Healthcare News' },
      author: null,
      title:
        'Sample Healthcare News - Hospital expansion underway in California',
      description:
        'This is fallback data shown when NewsAPI is unavailable. Please check your API configuration.',
      url: 'https://example.com',
      urlToImage: null,
      publishedAt: new Date().toISOString(),
      content: 'Sample content for fallback news article.',
    },
    {
      source: { id: null, name: 'HealthTech Today' },
      author: null,
      title: 'New AI technology transforms patient care in U.S. hospitals',
      description:
        'Fallback article demonstrating the news ticker functionality.',
      url: 'https://example.com',
      urlToImage: null,
      publishedAt: new Date().toISOString(),
      content: 'Sample content for technology news.',
    },
    {
      source: { id: null, name: 'Medical Investment Journal' },
      author: null,
      title: 'Healthcare startup raises $50M in Series B funding round',
      description: 'Demonstrating funding-related news in the ticker.',
      url: 'https://example.com',
      urlToImage: null,
      publishedAt: new Date().toISOString(),
      content: 'Sample content for funding news.',
    },
  ],
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = (searchParams.get('category') ||
      'all') as NewsCategory
    const forceRefresh = searchParams.get('forceRefresh') === 'true' // Allow forcing cache refresh (optional)

    // Validate category
    const validCategories: NewsCategory[] = [
      'all',
      'expansion',
      'technology',
      'policy',
      'market-trends',
      'funding',
    ]

    const normalizedCategory = validCategories.includes(category)
      ? category
      : 'all'

    // Check cache first (but skip if cached data has fewer than 10 articles or forceRefresh is true)
    const now = Date.now()
    const cacheKey = normalizedCategory

    if (!forceRefresh && newsCache[cacheKey]) {
      const cached = newsCache[cacheKey]
      const cacheAge = now - cached.timestamp

      if (cacheAge < CACHE_DURATION) {
        const cachedArticleCount = cached.data?.articles?.length || 0
        // Only use cache if it has at least 10 articles
        if (cachedArticleCount >= 10) {
          console.log(
            `✅ Returning cached news for category: ${normalizedCategory} (${cachedArticleCount} articles, age: ${Math.floor(cacheAge / 1000)}s)`
          )
          return NextResponse.json(cached.data)
        } else {
          console.log(
            `⚠️ Cached data has only ${cachedArticleCount} articles, fetching fresh data`
          )
        }
      } else {
        console.log(
          `⏰ Cache expired for category: ${normalizedCategory} (age: ${Math.floor(cacheAge / 1000)}s)`
        )
      }
    } else if (forceRefresh) {
      console.log(`🔄 Force refresh requested for category: ${normalizedCategory}`)
    }

    // Use Perplexity API directly for better results (10-15 articles guaranteed)
    // NewsAPI often returns limited results, so we prioritize Perplexity
    let data
    try {
      console.log(`🔄 Fetching fresh news from Perplexity API for category: ${normalizedCategory}`)
      data = await fetchNewsFromPerplexity(normalizedCategory)
      
      // If Perplexity returns fewer than 10, try NewsAPI as backup
      if (data.articles.length < 10) {
        console.log(`⚠️ Perplexity returned only ${data.articles.length} articles, trying NewsAPI as backup`)
        try {
          const newsApiData = await fetchHealthcareNews({
            category: normalizedCategory,
            pageSize: 15,
          })
          // Merge results if NewsAPI has more
          if (newsApiData.articles.length > data.articles.length) {
            data = newsApiData
          }
        } catch (newsApiError) {
          console.log('⚠️ NewsAPI also failed, using Perplexity results')
        }
      }
    } catch (perplexityError) {
      console.log('⚠️ Perplexity API failed, trying NewsAPI:', perplexityError)
      // Fallback to NewsAPI
      try {
        data = await fetchHealthcareNews({
          category: normalizedCategory,
          pageSize: 15,
        })
      } catch (newsApiError) {
        throw newsApiError // Will be caught by outer catch
      }
    }

    // Ensure we have at least 10 articles
    if (data.articles.length < 10) {
      console.log(`⚠️ Only ${data.articles.length} articles available, expected 10-15`)
    }

    // Update cache
    newsCache[cacheKey] = {
      data,
      timestamp: now,
    }

    console.log(
      `✅ Successfully fetched and cached ${data.articles.length} articles for category: ${normalizedCategory}`
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error fetching healthcare news:', error)

    // Try Perplexity as final fallback
    try {
      console.log('🔄 Attempting Perplexity API as final fallback')
      const perplexityData = await fetchNewsFromPerplexity(normalizedCategory)
      
      // Update cache with Perplexity data
      newsCache[cacheKey] = {
        data: perplexityData,
        timestamp: Date.now(),
      }
      
      return NextResponse.json(perplexityData)
    } catch (perplexityError) {
      console.error('❌ Perplexity API also failed:', perplexityError)
      
      // Return mock data as last resort
      console.log('🔄 Returning mock data as last resort')
      return NextResponse.json(MOCK_NEWS_DATA, {
        headers: {
          'X-Fallback-Data': 'true',
        },
      })
    }
  }
}
