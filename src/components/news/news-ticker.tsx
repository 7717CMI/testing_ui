/**
 * News Ticker Component
 * Displays U.S. healthcare news headlines in a continuous circular/marquee scrolling animation
 * Similar to club name displays - smooth horizontal scrolling
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { NewsAPIResponse, NewsArticle, NewsCategory } from '@/types/news'
import { Newspaper } from 'lucide-react'

interface NewsTickerProps {
  category?: NewsCategory
}

export function NewsTicker({ category = 'all' }: NewsTickerProps) {
  // Fetch news headlines with TanStack Query
  const { data, isLoading, error } = useQuery<NewsAPIResponse>({
    queryKey: ['healthcare-news', category],
    queryFn: async () => {
      const res = await fetch(`/api/news/healthcare?category=${category}`)
      if (!res.ok) {
        throw new Error('Failed to fetch news')
      }
      return res.json()
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  })

  const articles = data?.articles || []

  // Loading state
  if (isLoading) {
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

  // Error or no articles
  if (error || articles.length === 0) {
    return null // Gracefully hide if no news available
  }

  // Duplicate articles for seamless infinite scroll
  const duplicatedArticles = [...articles, ...articles]

  return (
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
            '--scroll-duration': `${articles.length * 0.8}s`,
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
              onClick={() => window.open(article.url, '_blank')}
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
  )
}
