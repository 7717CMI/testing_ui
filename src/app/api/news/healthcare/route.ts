/**
 * Healthcare News API Route
 * Endpoint: GET /api/news/healthcare?category={category}
 * Returns cached news articles from NewsAPI.org
 */

import { NextRequest, NextResponse } from 'next/server'
import { fetchHealthcareNews } from '@/lib/newsapi'
import { NewsCategory } from '@/types/news'

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

    // Check cache first
    const now = Date.now()
    const cacheKey = normalizedCategory

    if (newsCache[cacheKey]) {
      const cached = newsCache[cacheKey]
      const cacheAge = now - cached.timestamp

      if (cacheAge < CACHE_DURATION) {
        console.log(
          `✅ Returning cached news for category: ${normalizedCategory} (age: ${Math.floor(cacheAge / 1000)}s)`
        )
        return NextResponse.json(cached.data)
      } else {
        console.log(
          `⏰ Cache expired for category: ${normalizedCategory} (age: ${Math.floor(cacheAge / 1000)}s)`
        )
      }
    }

    // Fetch fresh news from NewsAPI
    console.log(`🔄 Fetching fresh news for category: ${normalizedCategory}`)

    const data = await fetchHealthcareNews({
      category: normalizedCategory,
      pageSize: 15,
    })

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

    // Return mock data as fallback
    console.log('🔄 Returning mock data as fallback')
    return NextResponse.json(MOCK_NEWS_DATA, {
      headers: {
        'X-Fallback-Data': 'true',
      },
    })
  }
}
