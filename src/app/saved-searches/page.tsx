'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSavedSearchesStore } from '@/stores/saved-searches-store'
import { useSavedInsightsStore } from '@/stores/saved-insights-store'
import { useBookmarksStore, BookmarkedFacility } from '@/stores/bookmarks-store'
import { ArticleViewerModal, ArticleData } from '@/components/ArticleViewerModal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Search,
  Bookmark,
  Plus,
  Trash2,
  Edit,
  Copy,
  Play,
  Download,
  List,
  Star,
  Clock,
  Bell,
  BellOff,
  Newspaper,
  Eye,
  ExternalLink,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Calendar,
  AlertCircle,
  Building2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface NewsItem {
  title: string
  summary: string
  source: string
  url?: string
  publishedAt?: string
}

interface FacilityNews {
  news: NewsItem[]
  loading: boolean
  error?: string
  searchType?: 'specific' | 'broader'
}

export default function SavedSearchesPage() {
  const {
    savedSearches,
    facilityLists,
    deleteSavedSearch,
    duplicateSavedSearch,
    updateSavedSearch,
    deleteFacilityList,
    exportList,
  } = useSavedSearchesStore()

  const { savedInsights, removeSavedInsight } = useSavedInsightsStore()
  const { bookmarks, removeBookmark } = useBookmarksStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedColor, setSelectedColor] = useState('#3B82F6')
  const [articleViewerOpen, setArticleViewerOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<ArticleData | null>(null)
  const [expandedFacility, setExpandedFacility] = useState<string | null>(null)
  const [facilityNews, setFacilityNews] = useState<{ [npi: string]: FacilityNews }>({})
  const [customSearchQuery, setCustomSearchQuery] = useState('')

  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#14B8A6', // teal
  ]

  const filteredSearches = savedSearches.filter((search) =>
    search.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredBookmarkedFacilities = bookmarks.filter((bookmark) =>
    bookmark.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.state.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredArticles = savedInsights.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.summary.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Expansion': 'bg-blue-500',
      'Technology': 'bg-purple-500',
      'Funding': 'bg-green-500',
      'M&A': 'bg-orange-500',
      'Regulation': 'bg-red-500',
      'Policy': 'bg-yellow-500',
      'Market Trend': 'bg-teal-500',
    }
    return colors[category] || 'bg-gray-500'
  }

  const getCategoryIcon = (category: string) => {
    return <Building2 className="h-10 w-10 text-primary-700" />
  }

  const fetchNews = async (facility: BookmarkedFacility, customQuery?: string, tryBroader = false) => {
    setFacilityNews(prev => ({
      ...prev,
      [facility.npi]: { 
        ...prev[facility.npi], 
        loading: true, 
        error: undefined,
        news: prev[facility.npi]?.news || []
      }
    }))

    try {
      const searchQuery = customQuery || 
        (tryBroader 
          ? `Latest news about ${facility.facilityType} facilities in the last 30 days. Recent developments, services, awards, or announcements.`
          : `Latest news about ${facility.name} in ${facility.city}, ${facility.state} in the last 30 days. Recent developments, services, awards, or announcements.`
        )

      const response = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityName: tryBroader ? facility.facilityType : facility.name,
          city: tryBroader ? undefined : facility.city,
          state: tryBroader ? undefined : facility.state,
          searchQuery: searchQuery,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }

      const data = await response.json()
      const newsItems = data.news || []
      
      if (newsItems.length === 0 && !tryBroader && !customQuery) {
        await fetchNews(facility, undefined, true)
        return
      }

      setFacilityNews(prev => ({
        ...prev,
        [facility.npi]: { 
          loading: false, 
          news: newsItems,
          searchType: tryBroader ? 'broader' : 'specific',
        }
      }))
    } catch (error) {
      console.error('Error fetching news:', error)
      setFacilityNews(prev => ({
        ...prev,
        [facility.npi]: { 
          ...prev[facility.npi],
          loading: false, 
          error: 'Failed to load news. Please try again.',
        }
      }))
    }
  }

  const handleFacilityClick = (facility: BookmarkedFacility) => {
    if (expandedFacility === facility.npi) {
      setExpandedFacility(null)
    } else {
      setExpandedFacility(facility.npi)
      if (!facilityNews[facility.npi]) {
        fetchNews(facility)
      }
    }
  }

  const handleCustomSearch = async () => {
    if (!customSearchQuery.trim() || !expandedFacility) return
    
    const facility = bookmarks.find(b => b.npi === expandedFacility)
    if (facility) {
      await fetchNews(facility, customSearchQuery, false)
      setCustomSearchQuery('')
    }
  }

  const handleReadArticle = (article: any) => {
    if (!article.sourceUrl) {
      toast.error("Article URL not available")
      return
    }

    setSelectedArticle({
      title: article.title,
      url: article.sourceUrl,
      source: article.author,
      publishedDate: article.date,
      description: article.summary
    })
    setArticleViewerOpen(true)
  }

  const handleCloseArticleViewer = () => {
    setArticleViewerOpen(false)
    setTimeout(() => setSelectedArticle(null), 300)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Bookmark className="h-10 w-10 text-primary-500" />
                Saved Searches & Lists
              </h1>
              <p className="text-xl text-muted-foreground">
                Organize and track your most important searches and facility lists
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Save Current Search
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save New Search</DialogTitle>
                  <DialogDescription>
                    Create a saved search to quickly access results later
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Go to the Search page to save your current search criteria
                  </p>
                  <Link href="/search">
                    <Button className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Go to Search
                    </Button>
                  </Link>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search saved searches and lists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="searches" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="searches" className="gap-2">
                <Search className="h-4 w-4" />
                Saved Searches ({savedSearches.length})
              </TabsTrigger>
              <TabsTrigger value="lists" className="gap-2">
                <List className="h-4 w-4" />
                Facility Lists ({bookmarks.length})
              </TabsTrigger>
              <TabsTrigger value="articles" className="gap-2 relative">
                <Newspaper className="h-4 w-4" />
                <span className="hidden sm:inline">Saved Articles</span>
                <span className="sm:hidden">Articles</span>
                {savedInsights.length > 10 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-1 h-5 px-1.5 bg-green-500 text-white text-xs"
                  >
                    10+
                  </Badge>
                )}
                {savedInsights.length <= 10 && savedInsights.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-1 h-5 px-1.5 bg-green-500 text-white text-xs"
                  >
                    {savedInsights.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Saved Searches Tab */}
            <TabsContent value="searches" className="space-y-4">
              {filteredSearches.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-semibold mb-2">No saved searches yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Save your search criteria to quickly access results later
                    </p>
                    <Link href="/search">
                      <Button>
                        <Search className="h-4 w-4 mr-2" />
                        Go to Search
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSearches.map((search) => (
                    <Card key={search.id} className="card-hover group">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                            style={{ backgroundColor: search.color || '#3B82F6' }}
                          />
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => duplicateSavedSearch(search.id)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => deleteSavedSearch(search.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <CardTitle className="text-lg">{search.name}</CardTitle>
                        {search.description && (
                          <CardDescription>{search.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Criteria Preview */}
                        <div className="flex flex-wrap gap-2">
                          {search.criteria.state && (
                            <Badge variant="secondary">State: {search.criteria.state}</Badge>
                          )}
                          {search.criteria.facilityType && (
                            <Badge variant="secondary">Type: {search.criteria.facilityType}</Badge>
                          )}
                          {search.criteria.query && (
                            <Badge variant="secondary">Query: "{search.criteria.query}"</Badge>
                          )}
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(search.updatedAt, { addSuffix: true })}
                          </span>
                          {search.resultsCount && (
                            <span>{search.resultsCount} results</span>
                          )}
                        </div>

                        {/* Settings */}
                        <div className="flex items-center gap-4 text-xs">
                          <button
                            onClick={() =>
                              updateSavedSearch(search.id, {
                                autoRefresh: !search.autoRefresh,
                              })
                            }
                            className={`flex items-center gap-1 ${
                              search.autoRefresh
                                ? 'text-primary-500'
                                : 'text-muted-foreground'
                            }`}
                          >
                            <Star className="h-3 w-3" />
                            Auto-refresh
                          </button>
                          <button
                            onClick={() =>
                              updateSavedSearch(search.id, {
                                notifyOnNewResults: !search.notifyOnNewResults,
                              })
                            }
                            className={`flex items-center gap-1 ${
                              search.notifyOnNewResults
                                ? 'text-primary-500'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {search.notifyOnNewResults ? (
                              <Bell className="h-3 w-3" />
                            ) : (
                              <BellOff className="h-3 w-3" />
                            )}
                            Notify
                          </button>
                        </div>

                        {/* Actions */}
                        <Link href="/search">
                          <Button className="w-full" size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Run Search
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Facility Lists Tab - WITH BOOKMARKS FUNCTIONALITY */}
            <TabsContent value="lists" className="space-y-4">
              {filteredBookmarkedFacilities.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-semibold mb-2">No bookmarked facilities yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Bookmark facilities to track them and get news updates
                    </p>
                    <Link href="/data-catalog">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Browse Data Catalog
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Custom News Search */}
                  {expandedFacility && (
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Custom news search (e.g., 'new services', 'awards', 'expansion')"
                              value={customSearchQuery}
                              onChange={(e) => setCustomSearchQuery(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCustomSearch()
                              }}
                              className="pl-10"
                            />
                          </div>
                          <Button
                            onClick={handleCustomSearch}
                            disabled={!customSearchQuery.trim()}
                            size="sm"
                          >
                            <Search className="h-4 w-4 mr-2" />
                            Search News
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Bookmarked Facilities */}
                  <div className="space-y-4">
                    {filteredBookmarkedFacilities.map((bookmark) => {
                      const news = facilityNews[bookmark.npi]
                      const isExpanded = expandedFacility === bookmark.npi
                      
                      return (
                        <Card key={bookmark.npi} className="overflow-hidden border-2 hover:border-primary/30 transition-all">
                          {/* Facility Header - Clickable */}
                          <CardHeader 
                            className="bg-gradient-to-r from-muted/50 to-background border-b cursor-pointer hover:bg-muted/30 transition-colors"
                            onClick={() => handleFacilityClick(bookmark)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4 flex-1">
                                <div>{getCategoryIcon(bookmark.category)}</div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <CardTitle className="text-2xl font-bold">{bookmark.name}</CardTitle>
                                    {isExpanded ? (
                                      <ChevronUp className="h-5 w-5 text-primary" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {bookmark.city}, {bookmark.state}
                                    </span>
                                    {bookmark.phone && (
                                      <span className="flex items-center gap-1">
                                        <Phone className="h-4 w-4" />
                                        {bookmark.phone}
                                      </span>
                                    )}
                                    <Badge variant="outline">{bookmark.facilityType}</Badge>
                                    <Badge variant="outline" className="bg-primary/10">{bookmark.category}</Badge>
                                  </div>
                                  <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Bookmarked {new Date(bookmark.bookmarkedAt).toLocaleDateString()}
                                  </div>
                                  
                                  {/* View News Timeline Button */}
                                  <div className="mt-3">
                                    <Link 
                                      href={`/entity-news?name=${encodeURIComponent(bookmark.name)}&type=${encodeURIComponent(bookmark.facilityType)}&location=${encodeURIComponent(`${bookmark.city}, ${bookmark.state}`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="gap-2"
                                      >
                                        <TrendingUp className="h-4 w-4" />
                                        View News Timeline (Past Year)
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeBookmark(bookmark.npi)
                                  toast.success('Bookmark removed')
                                }}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>

                          {/* News Section - Expandable */}
                          {isExpanded && (
                            <CardContent className="pt-6">
                              <div className="mb-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <Newspaper className="h-5 w-5 text-primary" />
                                  <h3 className="font-semibold text-lg">Latest News & Updates (Last 30 Days)</h3>
                                </div>
                              </div>

                              {/* News Display */}
                              {news?.loading ? (
                                <div className="space-y-3">
                                  <Skeleton className="h-20 w-full" />
                                  <Skeleton className="h-20 w-full" />
                                  <p className="text-sm text-muted-foreground text-center py-2">
                                    Searching for news...
                                  </p>
                                </div>
                              ) : news?.error ? (
                                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
                                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-medium">Error loading news</p>
                                    <p className="text-xs text-muted-foreground mt-1">{news.error}</p>
                                  </div>
                                </div>
                              ) : news?.news && news.news.length > 0 ? (
                                <>
                                  {news.searchType === 'broader' && (
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                                      <p className="text-sm">
                                        <AlertCircle className="h-4 w-4 inline mr-2" />
                                        No specific news found for this facility. Showing news for <strong>{bookmark.facilityType}</strong> facilities instead.
                                      </p>
                                    </div>
                                  )}
                                  <div className="space-y-4">
                                    {news.news.map((item, index) => (
                                      <div
                                        key={index}
                                        className="bg-muted/50 rounded-lg p-4 hover:bg-muted transition-colors border"
                                      >
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="flex-1">
                                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                              <TrendingUp className="h-4 w-4 text-primary" />
                                              {item.title}
                                            </h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                                              {item.summary}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                              <span>{item.source}</span>
                                              {item.publishedAt && <span>{item.publishedAt}</span>}
                                            </div>
                                          </div>
                                          {item.url && (
                                            <a
                                              href={item.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex-shrink-0 p-2 hover:bg-background rounded-lg transition-colors"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <ExternalLink className="h-4 w-4 text-primary" />
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              ) : (
                                <div className="bg-muted/50 border rounded-lg p-8 text-center">
                                  <Newspaper className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                                  <p className="font-medium">No recent news found</p>
                                  <p className="text-sm text-muted-foreground mt-2">
                                    Try a custom search or check back later
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          )}
                        </Card>
                      )
                    })}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Saved Articles Tab */}
            <TabsContent value="articles" className="space-y-4">
              {filteredArticles.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-semibold mb-2">No saved articles yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Save interesting articles from the Insights page to read later
                    </p>
                    <Link href="/insights">
                      <Button>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Go to Insights
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredArticles.map((article) => (
                    <Card key={article.id} className="card-hover group">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`${getCategoryColor(article.category)} text-white text-xs`}>
                                {article.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {article.date}
                              </span>
                            </div>
                            <CardTitle className="text-lg mb-2">{article.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {article.summary}
                            </CardDescription>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => removeSavedInsight(article.id)}
                              title="Remove from saved"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {article.views?.toLocaleString() || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {article.readTime || 5} min read
                          </span>
                          <span className="text-xs">
                            By {article.author}
                          </span>
                        </div>

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {article.tags.slice(0, 3).map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Saved Info */}
                        <div className="pt-3 border-t flex items-center justify-between">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Bookmark className="h-3 w-3 text-green-500" />
                            Saved {formatDistanceToNow((article as any).savedAt || Date.now(), { addSuffix: true })}
                          </span>
                          
                          {/* Actions */}
                          <div className="flex gap-2">
                            {article.sourceUrl && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-2"
                                onClick={() => handleReadArticle(article)}
                              >
                                <Newspaper className="h-3 w-3" />
                                Read Article
                              </Button>
                            )}
                            <Link href="/insights">
                              <Button size="sm" className="gap-2">
                                <TrendingUp className="h-3 w-3" />
                                View Insights
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary-500" />
                    Saved Searches
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Save your search criteria to quickly re-run searches without setting filters again.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500">•</span>
                      <span>Auto-refresh to get latest results</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500">•</span>
                      <span>Get notified when new facilities match</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500">•</span>
                      <span>Duplicate and modify existing searches</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <Bookmark className="h-5 w-5 text-secondary-500" />
                    Bookmarked Facilities
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Track specific facilities and get real-time news updates.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-secondary-500">•</span>
                      <span>Click to expand and view latest news</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary-500">•</span>
                      <span>Custom news search for specific topics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary-500">•</span>
                      <span>View full news timeline for past year</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <Newspaper className="h-5 w-5 text-green-500" />
                    Saved Articles
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Save interesting healthcare news articles to read later or reference.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>Read articles offline anytime</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>Organize by category and tags</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>Track reading history and progress</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Article Viewer Modal */}
      <ArticleViewerModal
        isOpen={articleViewerOpen}
        onClose={handleCloseArticleViewer}
        article={selectedArticle}
      />
    </div>
  )
}
