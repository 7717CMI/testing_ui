/**
 * News Ticker Component
 * Displays U.S. healthcare news headlines in a continuous circular/marquee scrolling animation
 * 
 * Features:
 * - localStorage caching
 * - Auto-refresh every 6 hours
 * - Supports single category or multiple custom categories
 * - Merges and deduplicates articles from multiple sources
 * - Notifies user of new articles
 */

'use client'

import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query'
import { NewsAPIResponse, NewsArticle, NewsCategory } from '@/types/news'
import { Newspaper } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import { NewsReaderModal } from './news-reader-modal'

interface NewsTickerProps {
  category?: NewsCategory
  customCategories?: NewsCategory[]
}

// localStorage key for caching news ticker data
const getCacheKey = (category: string) => `news-ticker-cache-${category}`
const CACHE_DURATION = 6 * 60 * 60 * 1000 // 6 hours

interface CachedNewsData {
  data: NewsAPIResponse
  timestamp: number
}

// Load from localStorage
function loadCachedNews(category: string): NewsAPIResponse | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(getCacheKey(category))
    if (!cached) return null
    
    const parsed: CachedNewsData = JSON.parse(cached)
    const age = Date.now() - parsed.timestamp
    
    // Check if cache is still valid (within 6 hours)
    if (age < CACHE_DURATION && parsed.data?.articles?.length >= 5) {
      // console.log(`✅ News ticker: Loaded ${parsed.data.articles.length} articles from cache for ${category}`)
      return parsed.data
    } else {
      // console.log(`⏰ News ticker: Cache expired for ${category}`)
      localStorage.removeItem(getCacheKey(category))
      return null
    }
  } catch (error) {
    console.error('Error loading cached news:', error)
    return null
  }
}

// Save to localStorage
function saveCachedNews(category: string, data: NewsAPIResponse) {
  if (typeof window === 'undefined') return
  
  try {
    const cacheData: CachedNewsData = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(getCacheKey(category), JSON.stringify(cacheData))
  } catch (error) {
    console.error('Error saving cached news:', error)
  }
}

// Fetch function
async function fetchNewsCategory(category: string): Promise<NewsAPIResponse> {
  const res = await fetch(`/api/news/healthcare?category=${category}`, {
    cache: 'default',
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch news: ${res.status}`)
  }
  const data = await res.json()
  
  // Cache successful responses
  if (data.articles?.length > 0) {
    saveCachedNews(category, data)
  }
  
  return data
}

export function NewsTicker({ category = 'all', customCategories }: NewsTickerProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)
  const lastArticleRef = useRef<string | null>(null)
  const isFirstLoadRef = useRef(true)

  // Case 1: Single Category (Standard Mode)
  const singleQuery = useQuery({
    queryKey: ['healthcare-news', category],
    queryFn: () => fetchNewsCategory(category),
    enabled: !customCategories,
    initialData: () => loadCachedNews(category) || undefined,
    staleTime: CACHE_DURATION,
    refetchInterval: CACHE_DURATION,
  })

  // Case 2: Multiple Categories (Custom Mode)
  const categoryQueries = useQueries({
    queries: (customCategories || []).map(cat => ({
      queryKey: ['healthcare-news', cat],
      queryFn: () => fetchNewsCategory(cat),
      initialData: () => loadCachedNews(cat) || undefined,
      staleTime: CACHE_DURATION,
      refetchInterval: CACHE_DURATION,
    }))
  })

  // Process and merge data
  useEffect(() => {
    let mergedArticles: NewsArticle[] = []

    if (customCategories) {
      // Merge results from all queries
      const allResults = categoryQueries.flatMap(q => q.data?.articles || [])
      
      // Deduplicate by URL or Title
      const seen = new Set()
      mergedArticles = allResults.filter(article => {
        const key = article.url || article.title
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

      // Sort by date (newest first)
      mergedArticles.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )

      setIsLoading(categoryQueries.some(q => q.isLoading && !q.data))
    } else {
      // Single category mode
      mergedArticles = singleQuery.data?.articles || []
      setIsLoading(singleQuery.isLoading && !singleQuery.data)
    }

    if (mergedArticles.length > 0) {
      setArticles(mergedArticles)

      // Check for new articles to notify
      const newestArticle = mergedArticles[0]
      const newestKey = newestArticle.url || newestArticle.title

      if (!isFirstLoadRef.current && lastArticleRef.current && lastArticleRef.current !== newestKey) {
        // New article detected!
        toast.info('New Healthcare News Arrived', {
          description: newestArticle.title,
          action: {
            label: 'Read',
            onClick: () => setSelectedArticle(newestArticle)
          }
        })
      }

      lastArticleRef.current = newestKey
      isFirstLoadRef.current = false
    }
  }, [singleQuery.data, ...categoryQueries.map(q => q.data), customCategories])


  // Loading state
  if (isLoading && articles.length === 0) {
    return (
      <div className="w-full p-4 rounded-lg bg-muted/50 border border-border animate-pulse">
        <div className="flex items-center gap-3">
          <Newspaper className="w-5 h-5 text-muted-foreground" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (articles.length === 0) return null

  // Ensure smooth scrolling with enough items
  const articlesToShow = articles.length >= 10 ? articles.slice(0, 15) : articles
  const duplicatedArticles = [...articlesToShow, ...articlesToShow]

  return (
    <>
      <div className="w-full p-4 rounded-lg bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 overflow-hidden relative group" style={{ height: '60px', flexShrink: 0 }}>
        {/* Icon - Fixed on left */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex-shrink-0">
          <Newspaper className="w-5 h-5 text-primary" />
        </div>

        {/* Scrolling container */}
        <div className="ml-12 overflow-hidden h-full">
          <div
            className="flex gap-8 animate-news-scroll h-full items-center"
            style={{
              '--scroll-duration': `${Math.max(articlesToShow.length * 0.6, 20)}s`,
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.animationPlayState = 'paused'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.animationPlayState = 'running'
            }}
          >
            {duplicatedArticles.map((article: NewsArticle, index: number) => (
              <div
                key={`${article.url}-${index}`}
                className="flex-shrink-0 flex items-center gap-4 cursor-pointer hover:text-primary transition-colors"
                onClick={() => setSelectedArticle(article)}
                title="Click to read full article"
              >
                <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                  {article.title}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {article.source.name}
                </span>
                <span className="text-primary/40">•</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gradient fade on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none z-10" />
      </div>

      <NewsReaderModal 
        article={selectedArticle} 
        isOpen={!!selectedArticle} 
        onClose={() => setSelectedArticle(null)} 
      />
    </>
  )
}
