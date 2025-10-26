'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  ExternalLink,
  TrendingUp,
  Building2,
  Award,
  Users,
  AlertCircle,
  Newspaper,
  Clock,
  Filter,
  Download,
  RefreshCw,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface NewsArticle {
  title: string
  summary: string
  source: string
  sourceUrl: string
  date: string
  category: string
  relevanceScore: number
}

interface EntityNewsResponse {
  success: boolean
  entityName: string
  entityType: string
  location?: string
  timeRange: string
  articles: NewsArticle[]
  totalArticles: number
  dateRange: {
    start: string
    end: string
  }
  timestamp: string
}

export default function EntityNewsTimelinePage() {
  const searchParams = useSearchParams()
  const entityName = searchParams.get('name') || ''
  const entityType = searchParams.get('type') || ''
  const location = searchParams.get('location') || ''

  const [loading, setLoading] = useState(true)
  const [newsData, setNewsData] = useState<EntityNewsResponse | null>(null)
  const [timeRange, setTimeRange] = useState<'1year' | '6months' | '3months'>('1year')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    if (entityName && entityType) {
      fetchEntityNews()
    }
  }, [entityName, entityType, timeRange])

  async function fetchEntityNews() {
    setLoading(true)
    try {
      const response = await fetch('/api/entity-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityName,
          entityType,
          location,
          timeRange
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }

      const data: EntityNewsResponse = await response.json()
      setNewsData(data)

      if (data.totalArticles === 0) {
        toast.info('No news articles found', {
          description: `No verified news found for ${entityName} in the selected time range.`
        })
      } else {
        toast.success('News loaded successfully', {
          description: `Found ${data.totalArticles} verified article${data.totalArticles > 1 ? 's' : ''}`
        })
      }
    } catch (error) {
      console.error('Failed to fetch entity news:', error)
      toast.error('Failed to load news', {
        description: 'Please try again later'
      })
    } finally {
      setLoading(false)
    }
  }

  function getCategoryIcon(category: string) {
    switch (category) {
      case 'expansion': return <TrendingUp className="h-4 w-4" />
      case 'acquisition': return <Building2 className="h-4 w-4" />
      case 'partnership': return <Users className="h-4 w-4" />
      case 'award': return <Award className="h-4 w-4" />
      case 'leadership': return <Users className="h-4 w-4" />
      case 'regulatory': return <AlertCircle className="h-4 w-4" />
      case 'controversy': return <AlertCircle className="h-4 w-4" />
      default: return <Newspaper className="h-4 w-4" />
    }
  }

  function getCategoryColor(category: string) {
    switch (category) {
      case 'expansion': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'acquisition': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'partnership': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'award': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'leadership': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      case 'regulatory': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'controversy': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const filteredArticles = selectedCategory === 'all' 
    ? newsData?.articles || []
    : newsData?.articles.filter(article => article.category === selectedCategory) || []

  const categories = Array.from(new Set(newsData?.articles.map(a => a.category) || [])).filter(Boolean)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/data-catalog">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Data Catalog
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              News Timeline
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 font-medium">
              {entityName}
            </p>
            {location && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                📍 {location}
              </p>
            )}
          </motion.div>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Time Range Selector */}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Range:</span>
                <div className="flex gap-2">
                  {['3months', '6months', '1year'].map((range) => (
                    <Button
                      key={range}
                      size="sm"
                      variant={timeRange === range ? 'default' : 'outline'}
                      onClick={() => setTimeRange(range as any)}
                      disabled={loading}
                    >
                      {range === '3months' ? '3 Months' : range === '6months' ? '6 Months' : '1 Year'}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex-1" />

              {/* Action Buttons */}
              <Button
                size="sm"
                variant="outline"
                onClick={fetchEntityNews}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Category Filters */}
        {!loading && newsData && newsData.articles.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by:</span>
                <Button
                  size="sm"
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                >
                  All ({newsData.articles.length})
                </Button>
                {categories.map((category) => {
                  const count = newsData.articles.filter(a => a.category === category).length
                  return (
                    <Button
                      key={category}
                      size="sm"
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(category)}
                      className="capitalize"
                    >
                      {category} ({count})
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && newsData && newsData.articles.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Newspaper className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No News Articles Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We couldn't find any verified news articles for <strong>{entityName}</strong> in the selected time range.
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setTimeRange('1year')} disabled={timeRange === '1year'}>
                  Try 1 Year Range
                </Button>
                <Button variant="outline" onClick={fetchEntityNews}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* News Articles Timeline */}
        {!loading && newsData && filteredArticles.length > 0 && (
          <div className="space-y-6">
            <AnimatePresence>
              {filteredArticles.map((article, index) => (
                <motion.div
                  key={`${article.sourceUrl}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${getCategoryColor(article.category)} capitalize flex items-center gap-1`}>
                              {getCategoryIcon(article.category)}
                              {article.category}
                            </Badge>
                            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(article.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {article.title}
                          </CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Newspaper className="h-3 w-3" />
                            {article.source}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                        {article.summary}
                      </p>
                      <div className="flex items-center justify-between">
                        <a
                          href={article.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                        >
                          Read Full Article
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        {article.relevanceScore > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Relevance: {(article.relevanceScore * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Summary Footer */}
        {!loading && newsData && newsData.articles.length > 0 && (
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Showing {filteredArticles.length} of {newsData.totalArticles} article{newsData.totalArticles > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Data retrieved: {new Date(newsData.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    All articles are verified and sourced
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Powered by Perplexity AI
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

