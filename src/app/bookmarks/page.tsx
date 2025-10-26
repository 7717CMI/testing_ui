'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useBookmarksStore, BookmarkedFacility } from '@/stores/bookmarks-store'
import {
  BookmarkCheck,
  Trash2,
  Search,
  Activity,
  Building2,
  MapPin,
  Phone,
  Newspaper,
  ExternalLink,
  AlertCircle,
  Calendar,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react'

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

export default function BookmarksPage() {
  const { bookmarks, removeBookmark, clearAllBookmarks } = useBookmarksStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFacility, setExpandedFacility] = useState<string | null>(null)
  const [globalCustomSearchQuery, setGlobalCustomSearchQuery] = useState('')
  const [facilityNews, setFacilityNews] = useState<{ [npi: string]: FacilityNews }>({})

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
      // Build search query based on whether we're trying broader search
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
      
      // If no news found for specific hospital and haven't tried broader search yet
      if (newsItems.length === 0 && !tryBroader && !customQuery) {
        // Try broader search
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
      // Collapse if already expanded
      setExpandedFacility(null)
    } else {
      // Expand and fetch news if not already fetched
      setExpandedFacility(facility.npi)
      if (!facilityNews[facility.npi]) {
        fetchNews(facility)
      }
    }
  }

  const handleGlobalCustomSearch = async () => {
    if (!globalCustomSearchQuery.trim()) return
    
    // If a facility is expanded, search for that specific facility
    if (expandedFacility) {
      const facility = bookmarks.find(b => b.npi === expandedFacility)
      if (facility) {
        await fetchNews(facility, globalCustomSearchQuery, false)
        setGlobalCustomSearchQuery('')
        return
      }
    }
    
    // Otherwise, search for general healthcare news
    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityName: 'Healthcare',
          city: '',
          state: '',
          searchQuery: globalCustomSearchQuery,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }

      const data = await response.json()
      const newsItems = data.news || []
      
      // Store general search results in a special key
      setFacilityNews(prev => ({
        ...prev,
        'general-search': { 
          loading: false, 
          news: newsItems,
          searchType: 'general',
        }
      }))
      
      setGlobalCustomSearchQuery('')
    } catch (error) {
      console.error('Error fetching general news:', error)
    }
  }

  const filteredBookmarks = bookmarks.filter(bookmark =>
    bookmark.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.state.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getCategoryIcon = (category: string) => {
    if (!category) return '🏥'
    const lower = category.toLowerCase()
    if (lower.includes('hospital')) return '🏥'
    if (lower.includes('clinic')) return '🏥'
    if (lower.includes('pharmacy')) return '💊'
    if (lower.includes('laboratory')) return '🔬'
    if (lower.includes('agency')) return '👥'
    if (lower.includes('supplier')) return '📦'
    return '🏥'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                <Activity className="h-6 w-6 text-[#006AFF]" />
                <span className="text-xl font-bold text-gray-900">HealthData AI</span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-sm font-medium text-gray-600 hover:text-[#006AFF] transition-colors">
                  Home
                </Link>
                <Link href="/data-catalog" className="text-sm font-medium text-gray-600 hover:text-[#006AFF] transition-colors">
                  Data Catalog
                </Link>
                <Link href="/search" className="text-sm font-medium text-gray-600 hover:text-[#006AFF] transition-colors">
                  Search
                </Link>
                <Link href="/bookmarks" className="text-sm font-medium text-[#006AFF]">
                  Bookmarks
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/login">
                <Button variant="outline" size="sm" className="border-gray-300">Login</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-[#006AFF] hover:bg-[#0052CC]">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#006AFF] to-[#0052CC] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <BookmarkCheck className="h-12 w-12" />
                <h1 className="text-5xl font-bold">My Bookmarks</h1>
              </div>
              <p className="text-xl text-blue-100 max-w-2xl">
                Click on any facility to view latest news (last 30 days) or perform custom searches
              </p>
            </div>
            {bookmarks.length > 0 && (
              <div className="text-right">
                <div className="text-4xl font-bold">{bookmarks.length}</div>
                <div className="text-blue-100">Saved {bookmarks.length === 1 ? 'Facility' : 'Facilities'}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {bookmarks.length === 0 ? (
          /* Empty State */
          <Card className="text-center py-16">
            <CardContent>
              <BookmarkCheck className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Bookmarks Yet</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start bookmarking healthcare facilities to track them and get news updates. 
                Look for the bookmark icon on facility cards!
              </p>
              <Link href="/data-catalog">
                <Button className="bg-[#006AFF] hover:bg-[#0052CC]">
                  Browse Data Catalog
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Controls */}
            <div className="space-y-4 mb-8">
              {/* Search Bookmarks */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search bookmarks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'result' : 'results'}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllBookmarks}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
              
              {/* Custom News Search */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Custom news search (e.g., 'new services', 'awards', 'expansion')"
                    value={globalCustomSearchQuery}
                    onChange={(e) => setGlobalCustomSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleGlobalCustomSearch()
                    }}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={handleGlobalCustomSearch}
                  disabled={!globalCustomSearchQuery.trim()}
                  className="bg-[#006AFF] hover:bg-[#0052CC]"
                  size="sm"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search News
                </Button>
              </div>
            </div>

            {/* Bookmarked Facilities */}
            <div className="space-y-4">
              {filteredBookmarks.map((bookmark) => {
                const news = facilityNews[bookmark.npi]
                const isExpanded = expandedFacility === bookmark.npi
                
                return (
                  <Card key={bookmark.npi} className="overflow-hidden border-2 hover:border-[#006AFF]/30 transition-all">
                    {/* Facility Header - Clickable */}
                    <CardHeader 
                      className="bg-gradient-to-r from-gray-50 to-white border-b cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleFacilityClick(bookmark)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="text-4xl">{getCategoryIcon(bookmark.category)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-2xl font-bold">{bookmark.name}</CardTitle>
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-[#006AFF]" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-2">
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
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {bookmark.category}
                              </Badge>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
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
                                  className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
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
                            <Newspaper className="h-5 w-5 text-[#006AFF]" />
                            <h3 className="font-semibold text-lg">Latest News & Updates (Last 30 Days)</h3>
                          </div>
                        </div>

                        {/* News Display */}
                        {news?.loading ? (
                          <div className="space-y-3">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <p className="text-sm text-gray-500 text-center py-2">
                              Searching for news...
                            </p>
                          </div>
                        ) : news?.error ? (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-red-800 font-medium">Error loading news</p>
                              <p className="text-xs text-red-600 mt-1">{news.error}</p>
                            </div>
                          </div>
                        ) : news?.news && news.news.length > 0 ? (
                          <>
                            {news.searchType === 'broader' && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-yellow-800">
                                  <AlertCircle className="h-4 w-4 inline mr-2" />
                                  No specific news found for this facility. Showing news for <strong>{bookmark.facilityType}</strong> facilities instead.
                                </p>
                              </div>
                            )}
                            <div className="space-y-4">
                              {news.news.map((item, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-[#006AFF]" />
                                        {item.title}
                                      </h4>
                                      <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                        {item.summary}
                                      </p>
                                      <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span>{item.source}</span>
                                        {item.publishedAt && <span>{item.publishedAt}</span>}
                                      </div>
                                    </div>
                                    {item.url && (
                                      <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0 p-2 hover:bg-white rounded-lg transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <ExternalLink className="h-4 w-4 text-[#006AFF]" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                            <Newspaper className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium">No recent news found</p>
                            <p className="text-sm text-gray-500 mt-2">
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
            
            {/* General Search Results */}
            {facilityNews['general-search'] && facilityNews['general-search'].news && facilityNews['general-search'].news.length > 0 && (
              <div className="mt-8">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Newspaper className="h-5 w-5 text-[#006AFF]" />
                    <h3 className="font-semibold text-lg">General Healthcare News Search Results</h3>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {facilityNews['general-search'].news.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-[#006AFF]" />
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-700 leading-relaxed mb-2">
                            {item.summary}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{item.source}</span>
                            {item.publishedAt && <span>{item.publishedAt}</span>}
                          </div>
                        </div>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 p-2 hover:bg-white rounded-lg transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-4 w-4 text-[#006AFF]" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

