import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Insight } from "@/types"
import { Eye, Bookmark, Share2, Clock, ExternalLink, Newspaper, BookmarkCheck, TrendingUp, Lightbulb, BarChart3, FileText, Loader2, LineChart } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { canUseIframe } from "@/lib/iframe-whitelist"
import { useSavedInsightsStore } from "@/stores/saved-insights-store"
import { toast } from "sonner"
import { ArticleDataVisualization } from "@/components/article-visualizations/article-data-visualization"
import type { ArticleAnalysis } from "@/types/article-analysis"

interface InsightCardProps {
  insight: Insight
  onBookmark?: () => void
  onShare?: () => void
  onViewArticle?: (insight: Insight) => void // NEW: callback for opening article viewer
}

// ArticleAnalysis type is now imported from types/article-analysis

export function InsightCard({ insight, onBookmark, onShare, onViewArticle }: InsightCardProps) {
  const [showFullArticle, setShowFullArticle] = useState(false)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [analysis, setAnalysis] = useState<ArticleAnalysis | null>(null)
  const [activeTab, setActiveTab] = useState('analysis')
  const [loadingVisualizations, setLoadingVisualizations] = useState(false)
  const [visualizationData, setVisualizationData] = useState<any>(null)
  const [visualizationError, setVisualizationError] = useState<string | null>(null)
  const router = useRouter()
  const { isSaved } = useSavedInsightsStore()
  const isBookmarked = isSaved(insight.id)

  // Fetch analysis when modal opens (only for Analysis tab)
  useEffect(() => {
    if (showFullArticle && !analysis && !loadingAnalysis && activeTab === 'analysis') {
      fetchArticleAnalysis()
    }
  }, [showFullArticle, activeTab])

  // Fetch visualization data when user clicks Visualizations tab
  useEffect(() => {
    if (showFullArticle && activeTab === 'visualizations' && !visualizationData && !loadingVisualizations && !visualizationError) {
      fetchVisualizationData()
    }
  }, [showFullArticle, activeTab, visualizationData, loadingVisualizations, visualizationError])

  async function fetchVisualizationData() {
    setLoadingVisualizations(true)
    setVisualizationError(null)
    
    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, 65000) // 65 seconds timeout (slightly longer than API maxDuration)
    
    try {
      console.log('🔄 Fetching visualization data for:', insight.title)
      
      const response = await fetch('/api/generate-visualization-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: insight.title,
          content: insight.content,
          category: insight.category,
          sourceUrl: insight.sourceUrl
        }),
        signal: controller.signal // Add timeout signal
      })

      clearTimeout(timeoutId) // Clear timeout if request completes

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ API response not OK:', response.status, errorData)
        const errorMsg = errorData.error || `Failed to generate visualization data (${response.status})`
        throw new Error(errorMsg)
      }

      const data = await response.json()
      console.log('📊 Visualization data response:', {
        success: data.success,
        hasData: !!data.data,
        message: data.message
      })
      
      if (data.success) {
        if (data.data) {
          console.log('✅ Visualization data received:', {
            events: data.data.events?.length || 0,
            byOrg: data.data.byOrganization?.length || 0,
            byLocation: data.data.byLocation?.length || 0,
            timeline: data.data.timeline?.length || 0
          })
          setVisualizationData(data.data)
          setVisualizationError(null)
        } else {
          console.log('⚠️ No data returned from API')
          setVisualizationData(null)
          setVisualizationError(data.message || 'No quantifiable data available for visualization.')
          toast.info('No visualization data available', {
            description: data.message || 'This article does not contain enough numeric data for visualizations'
          })
        }
      } else {
        throw new Error(data.error || 'Visualization generation failed')
      }
    } catch (error: any) {
      clearTimeout(timeoutId) // Clear timeout on error
      
      console.error('❌ Failed to fetch visualization data:', error)
      
      let errorMessage = 'Unknown error'
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. The visualization generation is taking too long. Please try again.'
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      setVisualizationError(errorMessage)
      setVisualizationData(null)
      
      toast.error('Failed to load visualizations', {
        description: errorMessage
      })
    } finally {
      setLoadingVisualizations(false)
    }
  }

  async function fetchArticleAnalysis() {
    setLoadingAnalysis(true)
    try {
      const response = await fetch('/api/analyze-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: insight.title,
          content: insight.content,
          category: insight.category,
          sourceUrl: insight.sourceUrl
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze article')
      }

      const data = await response.json()
      if (data.success) {
        setAnalysis(data.data)
      } else {
        throw new Error(data.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('Failed to fetch article analysis:', error)
      toast.error('Failed to load analysis', {
        description: 'Showing article content only'
      })
      // Set default analysis structure
      setAnalysis({
        summary: insight.summary,
        analysis: insight.content,
        recommendations: [
          'Monitor this development closely',
          'Assess relevance to your operations',
          'Consider strategic implications'
        ]
      })
    } finally {
      setLoadingAnalysis(false)
    }
  }

  const categoryColors: Record<string, string> = {
    Expansion: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    Technology: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    Funding: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    "M&A": "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    Regulation: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    Policy: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    "Market Trend": "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
  }

  // Hybrid approach: Check if site allows iframe or use reader mode
  const handleReadFullArticle = () => {
    if (!insight.sourceUrl) {
      console.warn('No source URL available for article')
      return
    }

    // Check if this site is iframe-friendly
    const useIframe = canUseIframe(insight.sourceUrl)
    
    console.log('📰 Opening article:', {
      title: insight.title,
      url: insight.sourceUrl,
      useIframe,
    })

    if (useIframe) {
      // Site allows iframe - open in article viewer with header
      console.log('✅ Site is iframe-friendly, opening in article viewer')
      router.push(
        `/article-viewer?url=${encodeURIComponent(insight.sourceUrl)}&title=${encodeURIComponent(insight.title)}&source=${encodeURIComponent(insight.author)}`
      )
    } else {
      // Site blocks iframe - use reader mode extraction
      console.log('⚠️ Site not iframe-friendly, using reader mode')
      if (onViewArticle) {
        setShowFullArticle(false) // Close summary modal first
        onViewArticle(insight) // Open reader mode modal
      }
    }
  }

  return (
    <>
      <Card className="card-hover cursor-pointer overflow-visible">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Badge className={`${categoryColors[insight.category] || "bg-gray-100 text-gray-700"} mb-2`}>
                {insight.category}
              </Badge>
              <h3 className="font-semibold text-lg mt-2 line-clamp-2 break-words">
                {insight.title}
              </h3>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 overflow-visible">
          <p className="text-sm text-muted-foreground line-clamp-3 break-words">
            {insight.summary}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="font-medium">{insight.views.toLocaleString()} views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{formatDate(insight.date)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {insight.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-3 border-t flex-wrap">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onBookmark}
              className={isBookmarked ? "text-blue-600 hover:text-blue-700" : ""}
              title={isBookmarked ? "Remove from saved" : "Save for later"}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 fill-current" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
              <span className="sr-only">{isBookmarked ? "Remove from saved" : "Save for later"}</span>
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onShare} 
              title="Share article"
            >
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Share article</span>
            </Button>
            
            {/* View News Timeline Button */}
            <Link 
              href={`/entity-news?name=${encodeURIComponent(insight.title.split(' - ')[0] || insight.title.split(':')[0] || insight.title)}&type=${encodeURIComponent(insight.category.toLowerCase())}&location=United States`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="ml-auto flex-shrink-0"
            >
              <Button 
                size="sm" 
                variant="outline"
                className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/20 whitespace-nowrap"
                title="View 1-year news timeline for this facility"
              >
                <TrendingUp className="h-3 w-3" />
                <span className="hidden sm:inline">News Timeline</span>
                <span className="sm:hidden">Timeline</span>
              </Button>
            </Link>
            
            <Button 
              size="sm" 
              onClick={() => setShowFullArticle(true)}
              className="flex-shrink-0 whitespace-nowrap"
            >
              Read More
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Full Article Modal with Analysis */}
      <Dialog open={showFullArticle} onOpenChange={setShowFullArticle}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw]">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Badge className={categoryColors[insight.category] || "bg-gray-100 text-gray-700"}>
                  {insight.category}
                </Badge>
                <DialogTitle className="mt-2 text-2xl leading-tight">{insight.title}</DialogTitle>
                <DialogDescription className="mt-2 flex items-center gap-4 text-sm flex-wrap">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {insight.views.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(insight.date)}
                  </span>
                  <span>By {insight.author}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {loadingAnalysis ? (
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                  <p className="text-sm text-muted-foreground">Generating detailed analysis...</p>
                </div>
              </div>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : analysis ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="analysis" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Analysis
                </TabsTrigger>
                <TabsTrigger value="visualizations" className="gap-2">
                  <LineChart className="h-4 w-4" />
                  Visualizations
                </TabsTrigger>
              </TabsList>

              {/* Analysis Tab - Existing Content */}
              <TabsContent value="analysis" className="space-y-6 mt-6">
                {/* Executive Summary Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100">Detailed Summary</h3>
                  </div>
                  <div className="text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {analysis.summary}
                  </div>
                </div>

                {/* Detailed Analysis Section */}
                <div className="bg-white dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Detailed Analysis</h3>
                    <Badge variant="secondary" className="ml-2 text-xs">Sales Intelligence</Badge>
                  </div>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {analysis.analysis}
                    </div>
                  </div>
                </div>

                {/* Recommendations Section */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-5 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <h3 className="font-semibold text-lg text-green-900 dark:text-green-100">Sales Action Plan</h3>
                    <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Actionable Steps</Badge>
                  </div>
                  <ul className="space-y-3">
                    {analysis.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 dark:bg-green-500 text-white text-sm font-semibold flex items-center justify-center mt-0.5">
                          {index + 1}
                        </span>
                        <span className="flex-1 text-base leading-relaxed text-gray-700 dark:text-gray-300">
                          {recommendation}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              {/* Visualizations Tab - Lazy loaded on click */}
              <TabsContent value="visualizations" className="mt-6">
                {loadingVisualizations ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      Generating visualizations...
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      Analyzing article and gathering real data for charts
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      This may take up to 60 seconds...
                    </p>
                  </div>
                ) : visualizationError ? (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-600 dark:text-red-400 font-medium mb-2">
                      Failed to load visualizations
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {visualizationError}
                    </p>
                    <Button 
                      onClick={() => {
                        setVisualizationError(null)
                        setVisualizationData(null)
                        fetchVisualizationData()
                      }} 
                      variant="secondary"
                      size="sm"
                      className="gap-2"
                    >
                      <Loader2 className="h-4 w-4" />
                      Try Again
                    </Button>
                  </div>
                ) : visualizationData ? (
                  <ArticleDataVisualization 
                    data={visualizationData} 
                    articleTitle={insight.title}
                  />
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No quantifiable data available for visualization.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      This article doesn't contain enough numeric data points to generate meaningful visualizations.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Source Attribution with Read Full Article Button - Always Visible */}
              <div className="space-y-3 mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Source: {insight.author}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      Published: {formatDate(insight.date)} • {insight.views.toLocaleString()} views
                    </p>
                  </div>
                </div>

                {/* Read Full Article Button - Opens in hybrid viewer */}
                {insight.sourceUrl && (
                  <Button
                    onClick={handleReadFullArticle}
                    className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    size="lg"
                  >
                    <Newspaper className="h-5 w-5" />
                    View Complete Original Article
                  </Button>
                )}
                {insight.sourceUrl && (
                  <p className="text-xs text-center text-muted-foreground">
                    {canUseIframe(insight.sourceUrl)
                      ? 'Opens article within HealthData AI wrapper'
                      : 'Opens article in reader mode (content extraction)'}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap pt-4 border-t">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags:</span>
                {insight.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-4">
                <Button 
                  size="sm" 
                  variant={isBookmarked ? "primary" : "outline"}
                  onClick={onBookmark}
                  className={isBookmarked ? "gap-2 bg-blue-600 hover:bg-blue-700" : "gap-2"}
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="h-4 w-4 fill-current" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                  {isBookmarked ? "Saved" : "Bookmark"}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={onShare}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </Tabs>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

