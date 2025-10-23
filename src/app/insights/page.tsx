"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Navbar } from "@/components/shared/navbar"
import { InsightCard } from "@/components/shared/insight-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Insight } from "@/types"
import { toast } from "sonner"
import { TrendingUp, Bookmark, Target, ArrowUp, ArrowDown, ExternalLink, Download, Loader2, Info, RefreshCw } from "lucide-react"
import { useIntentStore } from "@/lib/store/intent-store"
import { ParticleBackground } from "@/components/three"
import { Skeleton } from "@/components/ui/skeleton"

interface Article {
  id?: number
  title: string
  summary: string
  fullContent?: string
  category: string
  date: string
  source: string
  sourceUrl?: string
  views: number
  trending: boolean
}

interface TrendingTopic {
  name: string
  count: number
  category: string
  trend: string
  changePercent: number
}

interface InsightsData {
  articles: Article[]
  trending: TrendingTopic[]
  marketInsights: {
    total_facilities_mentioned: number
    recent_expansions: number
    technology_adoptions: number
    policy_changes: number
  }
  lastUpdated: string
}

export default function InsightsPage() {
  const searchParams = useSearchParams()
  const facilityType = searchParams?.get('facilityType')
  const category = searchParams?.get('category')
  
  const [insights, setInsights] = useState<Insight[]>([])
  const [realInsights, setRealInsights] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFallback, setIsFallback] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const { intents, trendingTopics: intentTopics, fetchIntentData, exportIntentData } = useIntentStore()

  useEffect(() => {
    async function fetchRealInsights() {
      setLoading(true)
      try {
        const response = await fetch('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            facilityType: facilityType || 'Healthcare Facilities',
            category: category || 'Healthcare'
          })
        })

        const data = await response.json()
        
        if (data.success) {
          setRealInsights(data.data)
          setIsFallback(data.fallback || false)
          
          // Convert articles to Insight format
          const convertedInsights: Insight[] = data.data.articles.map((article: Article, index: number) => ({
            id: (article.id || index + 1).toString(),
            title: article.title,
            category: article.category as "Expansion" | "Technology" | "Funding" | "M&A" | "Regulation",
            type: article.category,
            summary: article.summary,
            content: article.fullContent || article.summary, // Use fullContent if available, otherwise summary
            views: article.views,
            date: article.date,
            author: article.source,
            sourceUrl: article.sourceUrl, // ← Add source URL
            tags: [article.category, article.source],
            excerpt: article.summary,
            readTime: Math.ceil((article.fullContent || article.summary).length / 200) + 2,
          }))
          
          setInsights(convertedInsights)
          
          // If no articles and it's fallback, show as empty instead of mock data
          if (data.fallback && convertedInsights.length === 0) {
            setInsights([])
          }
        }
      } catch (error) {
        console.error('Failed to fetch insights:', error)
        toast.error('Failed to load insights')
      } finally {
        setLoading(false)
      }
    }

    fetchRealInsights()
    fetchIntentData()
  }, [facilityType, category, fetchIntentData])

  const filteredInsights = insights.filter((insight) => {
    if (activeTab === "all") return true
    return insight.type.toLowerCase() === activeTab.toLowerCase()
  })

  function handleBookmark(insight: Insight) {
    toast.success(`"${insight.title}" bookmarked!`)
  }

  function handleShare(insight: Insight) {
    toast.success("Link copied to clipboard!")
  }

  function handleRefresh() {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      
      {/* Three.js Background Animation */}
      <div className="fixed inset-0 opacity-15 pointer-events-none z-0">
        <Suspense fallback={null}>
          <ParticleBackground 
            particleCount={350} 
            color="#FACC15" 
            speed={0.0004}
          />
        </Suspense>
      </div>

      <div className="container py-6 relative z-10">
        <div className="flex gap-6">
          {/* Main Content */}
          <main className="flex-1 space-y-6">
            {/* Header with context info */}
            <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-bold mb-2">
                  {facilityType ? `${facilityType} - Healthcare Insights` : 'Healthcare Insights'}
                </h1>
              <p className="text-muted-foreground">
                  {facilityType 
                    ? `Latest trends, news, and analysis for ${facilityType} across the United States`
                    : 'Stay informed with the latest healthcare trends, news, and analysis'}
                </p>
              </div>

              {/* Fallback indicator */}
              {isFallback && (
                <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200">
                  <CardContent className="py-3">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                      <Info className="h-4 w-4" />
                      <span className="text-sm">Using intelligent fallback mode - General industry insights being shown</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Market Insights Overview */}
              {realInsights && !loading && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <motion.div 
                          className="text-3xl font-bold"
                          style={{
                            background: 'linear-gradient(90deg, #006AFF, #8A2BE2, #006AFF)',
                            backgroundSize: '200% 200%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        >
                          {realInsights.marketInsights.total_facilities_mentioned}
                        </motion.div>
                        <div className="text-xs text-muted-foreground mt-2">Facilities Mentioned</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <motion.div 
                          className="text-3xl font-bold"
                          style={{
                            background: 'linear-gradient(90deg, #006AFF, #8A2BE2, #006AFF)',
                            backgroundSize: '200% 200%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        >
                          {realInsights.marketInsights.recent_expansions}
                        </motion.div>
                        <div className="text-xs text-muted-foreground mt-2">Recent Expansions</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <motion.div 
                          className="text-3xl font-bold"
                          style={{
                            background: 'linear-gradient(90deg, #006AFF, #8A2BE2, #006AFF)',
                            backgroundSize: '200% 200%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        >
                          {realInsights.marketInsights.technology_adoptions}
                        </motion.div>
                        <div className="text-xs text-muted-foreground mt-2">Tech Adoptions</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <motion.div 
                          className="text-3xl font-bold"
                          style={{
                            background: 'linear-gradient(90deg, #006AFF, #8A2BE2, #006AFF)',
                            backgroundSize: '200% 200%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        >
                          {realInsights.marketInsights.policy_changes}
                        </motion.div>
                        <div className="text-xs text-muted-foreground mt-2">Policy Changes</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between">
                <TabsList className="w-full max-w-4xl justify-start">
                <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="expansion">Expansion</TabsTrigger>
                  <TabsTrigger value="technology">Technology</TabsTrigger>
                <TabsTrigger value="policy">Policy</TabsTrigger>
                  <TabsTrigger value="market trend">Market Trends</TabsTrigger>
                  <TabsTrigger value="funding">Funding</TabsTrigger>
              </TabsList>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={loading}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              <TabsContent value={activeTab} className="mt-6">
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <div className="space-y-3">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <div className="flex gap-2">
                              <Skeleton className="h-5 w-20" />
                              <Skeleton className="h-5 w-24" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredInsights.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Info className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            No Articles Available
                          </h3>
                          <p className="text-sm text-muted-foreground max-w-md">
                            {isFallback 
                              ? `We couldn't find recent news articles about ${facilityType || 'this facility type'}. Try checking back later or exploring other facility types.`
                              : `No ${activeTab === 'all' ? '' : activeTab} articles found. Try a different category or refresh to check for updates.`
                            }
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={handleRefresh}
                          disabled={loading}
                          className="gap-2 mt-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Try Again
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredInsights.map((insight) => (
                      <InsightCard
                        key={insight.id}
                        insight={insight}
                        onBookmark={() => handleBookmark(insight)}
                        onShare={() => handleShare(insight)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0 space-y-6">
            <div className="sticky top-20 space-y-6">
              {/* Trending Topics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-primary-500" />
                    Trending Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-5 w-12" />
                      </div>
                    ))
                  ) : realInsights?.trending ? (
                    realInsights.trending.map((topic, index) => (
                    <div
                      key={topic.name}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs font-semibold flex-shrink-0">
                          {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium truncate block">{topic.name}</span>
                            <span className="text-xs text-muted-foreground">{topic.category}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge 
                            variant={topic.trend === 'up' ? 'default' : topic.trend === 'down' ? 'destructive' : 'secondary'}
                            className="text-xs gap-1"
                          >
                            {topic.trend === 'up' && <ArrowUp className="h-3 w-3" />}
                            {topic.trend === 'down' && <ArrowDown className="h-3 w-3" />}
                            {topic.changePercent}%
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : null}
                </CardContent>
              </Card>

              {/* Saved Articles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bookmark className="h-5 w-5 text-primary-500" />
                    Saved Articles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No saved articles yet. Bookmark articles to read them later.
                  </p>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

