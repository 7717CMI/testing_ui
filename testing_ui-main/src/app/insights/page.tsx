"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Navbar } from "@/components/shared/navbar"
import { InsightCard } from "@/components/shared/insight-card"
import { ArticleViewerModal, ArticleData } from "@/components/ArticleViewerModal"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Insight } from "@/types"
import { toast } from "sonner"
import { TrendingUp, Bookmark, Target, ArrowUp, ArrowDown, ExternalLink, Download, Loader2, Info, RefreshCw, Trash2, Eye, Newspaper, Building2, Zap, FileText } from "lucide-react"
import { useIntentStore } from "@/lib/store/intent-store"
import { ParticleBackground } from "@/components/three"
import { Skeleton } from "@/components/ui/skeleton"
import { useSavedInsightsStore } from "@/stores/saved-insights-store"
import { PremiumGuard } from "@/components/premium/premium-guard"
import { EnhancedMetricCard } from "@/components/animations/enhanced-metric-card"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { StaggeredList } from "@/components/animations/staggered-list"
import { NewsTicker } from "@/components/news/news-ticker"

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
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)
  const { intents, trendingTopics: intentTopics, fetchIntentData, exportIntentData } = useIntentStore()
  
  // Saved Insights Store
  const { savedInsights, addSavedInsight, removeSavedInsight, isSaved } = useSavedInsightsStore()

  // Article Viewer Modal State
  const [articleViewerOpen, setArticleViewerOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<ArticleData | null>(null)

  // Handle bookmarking/saving an article
  const handleBookmark = (insight: Insight) => {
    if (isSaved(insight.id)) {
      removeSavedInsight(insight.id)
      toast.success('Article removed from saved', {
        description: insight.title,
      })
    } else {
      addSavedInsight(insight)
      toast.success('Article saved!', {
        description: 'You can find it in the Saved Articles section',
      })
    }
  }

  // Handle sharing an article
  const handleShare = (insight: Insight) => {
    if (navigator.share && insight.sourceUrl) {
      navigator.share({
        title: insight.title,
        text: insight.summary,
        url: insight.sourceUrl,
      })
      .then(() => toast.success('Shared successfully'))
      .catch(() => {
        // Fallback: Copy to clipboard
        copyToClipboard(insight)
      })
    } else {
      copyToClipboard(insight)
    }
  }

  const copyToClipboard = (insight: Insight) => {
    const text = `${insight.title}\n\n${insight.summary}\n\n${insight.sourceUrl || ''}`
    navigator.clipboard.writeText(text)
    toast.success('Link copied to clipboard')
  }

  // Handle opening article in viewer modal
  const handleViewArticle = (insight: Insight) => {
    if (insight.sourceUrl) {
      setSelectedArticle({
        title: insight.title,
        url: insight.sourceUrl,
        source: insight.author,
        publishedDate: insight.date,
        description: insight.summary
      })
      setArticleViewerOpen(true)
    } else {
      toast.error("Article URL not available")
    }
  }

  // Handle closing article viewer
  const handleCloseArticleViewer = () => {
    setArticleViewerOpen(false)
    // Clear after animation completes
    setTimeout(() => setSelectedArticle(null), 300)
  }

  // Memoize fetchRealInsights to avoid recreating on every render
  const fetchRealInsights = useCallback(async () => {
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

      // Check if response is OK
      if (!response.ok) {
        console.error('❌ API response not OK:', response.status, response.statusText)
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }

      // Check content type before parsing
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ Response is not JSON, got:', contentType)
        const text = await response.text()
        console.error('❌ Response text:', text.substring(0, 500))
        throw new Error('API did not return JSON')
      }

      const data = await response.json()
      
      if (data.success) {
        console.log('📰 Received articles:', data.data.articles?.length || 0)
        
        setRealInsights(data.data)
        setIsFallback(data.fallback || false)
        setLastRefreshTime(new Date()) // Track when data was last refreshed
        
        // Log category distribution
        if (data.data.articles && data.data.articles.length > 0) {
          const categoryCounts: Record<string, number> = {}
          data.data.articles.forEach((article: Article) => {
            const cat = article.category || 'Unknown'
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
          })
          console.log('📊 Frontend - Category distribution:', categoryCounts)
          
          if (data.data.articles.length < 10) {
            console.warn(`⚠️ Only ${data.data.articles.length} articles received, expected 10+`)
          }
        }
        
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
        
        // Notify user if we got fewer articles than expected
        if (convertedInsights.length > 0 && convertedInsights.length < 10) {
          toast.info(`Loaded ${convertedInsights.length} articles`, {
            description: 'Searching for more articles... Please refresh if needed.'
          })
        } else if (convertedInsights.length >= 10) {
          toast.success(`Loaded ${convertedInsights.length} articles`, {
            description: 'Articles refreshed successfully'
          })
        }
        
        // If no articles and it's fallback, show as empty instead of mock data
        if (data.fallback && convertedInsights.length === 0) {
          setInsights([])
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch insights:', error)
      toast.error('Failed to load insights', {
        description: error.message || 'Please try again'
      })
      // Set empty state on error
      setInsights([])
      setIsFallback(true)
    } finally {
      setLoading(false)
    }
  }, [facilityType, category])

  // Initial fetch
  useEffect(() => {
    fetchRealInsights()
    fetchIntentData()
  }, [facilityType, category, fetchIntentData, fetchRealInsights])

  // Auto-refresh every 6 hours (21600000 milliseconds)
  useEffect(() => {
    const REFRESH_INTERVAL = 6 * 60 * 60 * 1000 // 6 hours in milliseconds
    
    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refreshing insights (6-hour interval)')
      fetchRealInsights()
    }, REFRESH_INTERVAL)

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [fetchRealInsights])

  const filteredInsights = insights.filter((insight) => {
    if (activeTab === "all") return true
    return insight.type.toLowerCase() === activeTab.toLowerCase()
  })

  function handleRefresh() {
    window.location.reload()
  }

  // Handle clicking on a trending topic
  async function handleTrendingTopicClick(topicName: string, category: string) {
    setLoading(true)
    setActiveTab("all") // Reset to all tab
    
    try {
      // Fetch articles specifically about this topic
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          facilityType: topicName, // Use topic name as search term
          category: category
        })
      })

      // Check if response is OK
      if (!response.ok) {
        console.error('❌ API response not OK:', response.status, response.statusText)
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }

      // Check content type before parsing
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ Response is not JSON, got:', contentType)
        const text = await response.text()
        console.error('❌ Response text:', text.substring(0, 500))
        throw new Error('API did not return JSON')
      }

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
          content: article.fullContent || article.summary,
          views: article.views,
          date: article.date,
          author: article.source,
          sourceUrl: article.sourceUrl,
          tags: [article.category, article.source],
          excerpt: article.summary,
          readTime: Math.ceil((article.fullContent || article.summary).length / 200) + 2,
        }))
        
        setInsights(convertedInsights)
        
        // Show success message
        if (convertedInsights.length > 0) {
          toast.success(`Loaded articles about "${topicName}"`, {
            description: `Found ${convertedInsights.length} related articles`
          })
        } else {
          toast.info(`No articles found for "${topicName}"`, {
            description: 'Try another trending topic or refresh to see general insights'
          })
        }
        
        // If no articles and it's fallback, show as empty
        if (data.fallback && convertedInsights.length === 0) {
          setInsights([])
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch topic insights:', error)
      toast.error(`Failed to load articles about "${topicName}"`, {
        description: error.message || 'Please try again'
      })
      // Set empty state on error
      setInsights([])
      setIsFallback(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PremiumGuard
      featureName="Healthcare Insights"
      featureDescription="Access real-time healthcare industry insights, trending topics, and market analysis"
      benefits={[
        "Real-time healthcare news and insights",
        "Trending topics analysis",
        "Market intelligence reports",
        "Saved articles and bookmarks"
      ]}
    >
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
          <main className="flex-1 space-y-6 min-w-0">
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
                {lastRefreshTime && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last updated: {lastRefreshTime.toLocaleTimeString()} • Auto-refreshes every 6 hours
                  </p>
                )}
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

              {/* Market Insights Overview - Enhanced with Meridian-style animations */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.15,
                      delayChildren: 0.1,
                    },
                  },
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
              >
                {loading ? (
                  <>
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </>
                ) : realInsights ? (
                  <>
                    <EnhancedMetricCard
                      title="Facilities Mentioned"
                      value={realInsights.marketInsights.total_facilities_mentioned}
                      change={12}
                      trend="up"
                      icon={Building2}
                      delay={0}
                    />
                    <EnhancedMetricCard
                      title="Recent Expansions"
                      value={realInsights.marketInsights.recent_expansions}
                      change={8}
                      trend="up"
                      icon={TrendingUp}
                      delay={0.15}
                    />
                    <EnhancedMetricCard
                      title="Tech Adoptions"
                      value={realInsights.marketInsights.technology_adoptions}
                      change={15}
                      trend="up"
                      icon={Zap}
                      delay={0.3}
                    />
                    <EnhancedMetricCard
                      title="Policy Changes"
                      value={realInsights.marketInsights.policy_changes}
                      change={-3}
                      trend="down"
                      icon={FileText}
                      delay={0.45}
                    />
                  </>
                ) : (
                  <>
                    <EnhancedMetricCard
                      title="Facilities Mentioned"
                      value={0}
                      change={0}
                      trend="up"
                      icon={Building2}
                      delay={0}
                    />
                    <EnhancedMetricCard
                      title="Recent Expansions"
                      value={0}
                      change={0}
                      trend="up"
                      icon={TrendingUp}
                      delay={0.15}
                    />
                    <EnhancedMetricCard
                      title="Tech Adoptions"
                      value={0}
                      change={0}
                      trend="up"
                      icon={Zap}
                      delay={0.3}
                    />
                    <EnhancedMetricCard
                      title="Policy Changes"
                      value={0}
                      change={0}
                      trend="down"
                      icon={FileText}
                      delay={0.45}
                    />
                  </>
                )}
              </motion.div>

              {/* News Ticker - Latest U.S. Healthcare Headlines */}
              <NewsTicker category={activeTab as any} />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <TabsList className="w-full sm:w-auto justify-start flex-wrap">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="expansion">Expansion</TabsTrigger>
                  <TabsTrigger value="technology">Technology</TabsTrigger>
                  <TabsTrigger value="policy">Policy</TabsTrigger>
                  <TabsTrigger value="market trend">Market Trends</TabsTrigger>
                  <TabsTrigger value="funding">Funding</TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                  {/* All Insights (1 Year) Button */}
                  <Link 
                    href={`/entity-news?name=${encodeURIComponent(facilityType || 'Healthcare Facilities')}&type=${encodeURIComponent(category || 'Healthcare')}&location=United States`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0"
                  >
                    <Button 
                      size="sm" 
                      className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg whitespace-nowrap w-full sm:w-auto"
                      title="View comprehensive 1-year news timeline for this facility type"
                    >
                      <Newspaper className="h-4 w-4" />
                      <span className="hidden sm:inline">All Insights (1 Year)</span>
                      <span className="sm:hidden">1 Year News</span>
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={loading}
                    className="gap-2 whitespace-nowrap flex-shrink-0"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </div>
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
                        onViewArticle={handleViewArticle}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0 space-y-6 overflow-visible">
            <div className="sticky top-20 space-y-6 overflow-visible">
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
                  ) : realInsights?.trending && realInsights.trending.length > 0 ? (
                    <StaggeredList staggerDelay={0.08}>
                      {realInsights.trending.map((topic, index) => (
                        <div
                          key={topic.name}
                          onClick={() => handleTrendingTopicClick(topic.name, topic.category)}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/20 cursor-pointer transition-all border border-transparent hover:border-primary-200 dark:hover:border-primary-800 group"
                          title={`Click to view articles about ${topic.name}`}
                        >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                          {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold truncate block group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {topic.name}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">{topic.category}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge 
                            variant={topic.trend === 'up' ? 'default' : topic.trend === 'down' ? 'destructive' : 'secondary'}
                            className="text-xs gap-1 font-semibold"
                          >
                            {topic.trend === 'up' && <ArrowUp className="h-3 w-3" />}
                            {topic.trend === 'down' && <ArrowDown className="h-3 w-3" />}
                            {topic.changePercent}%
                          </Badge>
                        </div>
                      </div>
                      ))}
                    </StaggeredList>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No trending topics available
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Saved Articles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                    <Bookmark className="h-5 w-5 text-primary-500" />
                    Saved Articles
                    </div>
                    {savedInsights.length > 0 && (
                      <Badge variant="secondary">{savedInsights.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {savedInsights.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No saved articles yet. Bookmark articles to read them later.
                  </p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {savedInsights.map((saved) => (
                        <div
                          key={saved.id}
                          className="group p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all cursor-pointer"
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {saved.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="secondary" className="text-xs">
                                  {saved.category}
                                </Badge>
                                <span>•</span>
                                <span>{new Date(saved.savedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleViewArticle(saved)
                                }}
                                title="View article"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleBookmark(saved)
                                }}
                                title="Remove from saved"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>

      {/* Article Viewer Modal */}
      <ArticleViewerModal
        isOpen={articleViewerOpen}
        onClose={handleCloseArticleViewer}
        article={selectedArticle}
      />
    </div>
    </PremiumGuard>
  )
}

