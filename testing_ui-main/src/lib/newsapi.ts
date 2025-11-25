/**
 * NewsAPI.org Client
 * Fetches U.S. healthcare news with category-based keyword filtering
 */

import { NewsAPIResponse, NewsCategory } from '@/types/news'

interface FetchNewsParams {
  category?: NewsCategory
  pageSize?: number
}

/**
 * Keyword mapping for different healthcare categories
 * Each category maps to specific search terms relevant to that topic
 */
const KEYWORD_MAP: Record<NewsCategory, string> = {
  all: 'healthcare OR hospital OR clinic OR medical',
  expansion:
    '(hospital OR healthcare) AND (expansion OR growth OR "new facility" OR merger OR acquisition OR "opening")',
  technology:
    '(healthcare OR medical) AND (technology OR AI OR "artificial intelligence" OR telemedicine OR EHR OR "health tech" OR digital OR innovation)',
  policy:
    '(healthcare OR medical) AND (policy OR regulation OR CMS OR medicare OR medicaid OR legislation OR "health policy")',
  funding:
    '(healthcare OR medical) AND (funding OR investment OR "venture capital" OR IPO OR "series A" OR "series B" OR startup)',
  'market-trends':
    '(healthcare OR medical) AND (market OR trends OR industry OR forecast OR analysis OR outlook)',
}

/**
 * USA news source domains
 * Filtering by domains ensures we get USA-focused healthcare news
 */
const USA_HEALTHCARE_DOMAINS = [
  'reuters.com',
  'apnews.com',
  'bloomberg.com',
  'cnbc.com',
  'forbes.com',
  'modernhealthcare.com',
  'healthcaredive.com',
  'fiercehealthcare.com',
  'healthcareitnews.com',
  'mobihealthnews.com',
  'beckershospitalreview.com',
  'healthleadersmedia.com',
  'ama-assn.org',
].join(',')

/**
 * Fetch healthcare news from NewsAPI.org
 * @param params - Category and page size configuration
 * @returns NewsAPI response with articles
 */
export async function fetchHealthcareNews(
  params: FetchNewsParams = {}
): Promise<NewsAPIResponse> {
  const apiKey = process.env.NEWSAPI_KEY

  if (!apiKey) {
    throw new Error('NEWSAPI_KEY is not configured')
  }

  const { category = 'all', pageSize = 15 } = params

  // Get search query for category
  const query = KEYWORD_MAP[category] || KEYWORD_MAP.all

  // Calculate date range - last 7 days for fresh news
  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - 7)
  const fromDateString = fromDate.toISOString().split('T')[0]

  // Build API URL
  const url = new URL('https://newsapi.org/v2/everything')
  url.searchParams.append('apiKey', apiKey)
  url.searchParams.append('q', query)
  url.searchParams.append('language', 'en')
  url.searchParams.append('sortBy', 'publishedAt') // Latest first
  url.searchParams.append('pageSize', String(pageSize))
  url.searchParams.append('from', fromDateString)
  url.searchParams.append('domains', USA_HEALTHCARE_DOMAINS)

  console.log(`📰 Fetching news for category: ${category}`)
  console.log(`🔍 Search query: ${query}`)

  const response = await fetch(url.toString())

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`❌ NewsAPI error: ${response.status}`, errorText)
    throw new Error(`NewsAPI error: ${response.status}`)
  }

  const data: NewsAPIResponse = await response.json()

  console.log(`✅ Fetched ${data.articles.length} articles`)

  return data
}
