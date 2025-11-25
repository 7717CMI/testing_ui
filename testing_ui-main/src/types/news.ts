/**
 * TypeScript types for NewsAPI.org integration
 * Documentation: https://newsapi.org/docs/endpoints
 */

export interface NewsSource {
  id: string | null
  name: string
}

export interface NewsArticle {
  source: NewsSource
  author: string | null
  title: string
  description: string | null
  url: string
  urlToImage: string | null
  publishedAt: string
  content: string | null
}

export interface NewsAPIResponse {
  status: string
  totalResults: number
  articles: NewsArticle[]
}

export type NewsCategory =
  | 'all'
  | 'expansion'
  | 'technology'
  | 'policy'
  | 'market-trends'
  | 'funding'
