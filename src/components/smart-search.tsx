'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Brain,
  Sparkles,
  Loader2,
  Search,
  MessageSquare,
  TrendingUp,
  Lightbulb,
  Target,
  ChevronRight,
  X,
  Info,
} from 'lucide-react'

interface SmartSearchProps {
  facilityType?: string
  category?: string
  currentFilters?: any
  currentResults?: number
  onFiltersApplied?: (filters: any) => void
  placeholder?: string
}

type SearchMode = 'search' | 'question' | 'insights' | 'recommendations'

export function SmartSearchComponent({
  facilityType,
  category,
  currentFilters,
  currentResults,
  onFiltersApplied,
  placeholder,
}: SmartSearchProps) {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<SearchMode>('search')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [autocompleteResults, setAutocompleteResults] = useState<string[]>([])
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [hasSearched, setHasSearched] = useState(false) // NEW: Track if search was performed
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout>()

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('searchHistory')
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
  }, [])

  // Auto-complete as user types
  useEffect(() => {
    // Don't show autocomplete if search was already performed
    if (hasSearched) {
      return
    }

    if (query.length >= 3) {
      // Clear previous timeout
      if (autocompleteTimeoutRef.current) {
        clearTimeout(autocompleteTimeoutRef.current)
      }

      // Set new timeout for autocomplete
      autocompleteTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch('/api/smart-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query,
              mode: 'autocomplete',
              context: { facilityType, category }
            })
          })
          const data = await response.json()
          if (data.success && data.suggestions) {
            setAutocompleteResults(data.suggestions)
            setShowAutocomplete(true)
          }
        } catch (error) {
          console.error('Autocomplete failed:', error)
        }
      }, 500) // Wait 500ms after user stops typing
    } else {
      setShowAutocomplete(false)
    }

    return () => {
      if (autocompleteTimeoutRef.current) {
        clearTimeout(autocompleteTimeoutRef.current)
      }
    }
  }, [query, facilityType, category, hasSearched])

  async function handleSearch() {
    if (!query.trim()) return

    setLoading(true)
    setShowAutocomplete(false)
    setHasSearched(true) // Mark that search was performed

    try {
      const response = await fetch('/api/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          mode,
          context: {
            facilityType,
            category,
            currentFilters,
            currentResults,
            userSearchHistory: searchHistory,
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        setResults(data)

        // Apply filters if in search mode
        if (mode === 'search' && data.extractedFilters && onFiltersApplied) {
          onFiltersApplied(data.extractedFilters)
        }

        // Save to search history
        const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10)
        setSearchHistory(newHistory)
        localStorage.setItem('searchHistory', JSON.stringify(newHistory))
      }
    } catch (error) {
      console.error('Smart search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  function selectAutocomplete(suggestion: string) {
    setQuery(suggestion)
    setShowAutocomplete(false)
    setHasSearched(false) // Reset so user can type again
    inputRef.current?.focus()
  }

  function clearResults() {
    setResults(null)
    setQuery('')
    setHasSearched(false) // Reset so autocomplete works again
  }

  const modes = [
    { id: 'search' as SearchMode, label: 'Smart Search', icon: Brain },
    { id: 'question' as SearchMode, label: 'Ask Questions', icon: MessageSquare },
    { id: 'insights' as SearchMode, label: 'Get Insights', icon: TrendingUp },
    { id: 'recommendations' as SearchMode, label: 'Recommendations', icon: Target },
  ]

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {modes.map((modeOption) => {
          const Icon = modeOption.icon
          return (
            <button
              key={modeOption.id}
              onClick={() => {
                setMode(modeOption.id)
                setResults(null)
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                mode === modeOption.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {modeOption.label}
            </button>
          )
        })}
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Brain className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-500" />
            <Input
              ref={inputRef}
              placeholder={
                placeholder ||
                mode === 'search'
                  ? "Try: 'Find facilities in California with phone numbers'"
                  : mode === 'question'
                  ? 'Ask anything about these facilities...'
                  : mode === 'insights'
                  ? 'Get insights about current results...'
                  : 'Get personalized recommendations...'
              }
              className="pl-12 h-14 bg-white border-2 border-gray-200 focus:border-purple-500 text-base pr-12"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setHasSearched(false) // Reset when user starts typing again
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <AnimatePresence>
              {query && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2"
                >
                  <button
                    onClick={() => setQuery('')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Button
            size="lg"
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                {mode === 'search' ? 'Search' : mode === 'question' ? 'Ask' : 'Analyze'}
              </>
            )}
          </Button>
        </div>

        {/* Autocomplete Dropdown */}
        <AnimatePresence>
          {showAutocomplete && autocompleteResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-2 bg-white border-2 border-purple-200 rounded-lg shadow-xl overflow-hidden"
            >
              <div className="p-2 bg-purple-50 border-b border-purple-100">
                <p className="text-xs font-semibold text-purple-700 flex items-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  Suggested Searches
                </p>
              </div>
              {autocompleteResults.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => selectAutocomplete(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors flex items-center gap-3 group"
                >
                  <Search className="h-4 w-4 text-gray-400 group-hover:text-purple-500" />
                  <span className="text-sm text-gray-700 group-hover:text-purple-700">
                    {suggestion}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Display */}
      <AnimatePresence>
        {results && results.success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      {mode === 'search' && <Brain className="h-5 w-5 text-white" />}
                      {mode === 'question' && <MessageSquare className="h-5 w-5 text-white" />}
                      {mode === 'insights' && <Lightbulb className="h-5 w-5 text-white" />}
                      {mode === 'recommendations' && <Target className="h-5 w-5 text-white" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {mode === 'search' && 'Search Results'}
                        {mode === 'question' && 'Answer'}
                        {mode === 'insights' && 'Data Insights'}
                        {mode === 'recommendations' && 'Recommendations'}
                      </h3>
                      {results.fallback && (
                        <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                          <Info className="h-3 w-3" />
                          Using smart fallback mode
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={clearResults}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Search Mode Results */}
                {mode === 'search' && (
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">{results.answer}</p>
                    {results.appliedFilters && results.appliedFilters.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Applied Filters:</p>
                        <div className="flex flex-wrap gap-2">
                          {results.appliedFilters.map((filter: string, i: number) => (
                            <Badge key={i} className="bg-purple-100 text-purple-700">
                              {filter}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {results.suggestions && results.suggestions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Try these searches:</p>
                        <div className="flex flex-wrap gap-2">
                          {results.suggestions.map((suggestion: string, i: number) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="cursor-pointer hover:bg-purple-100 hover:border-purple-300"
                              onClick={() => {
                                setQuery(suggestion)
                                inputRef.current?.focus()
                              }}
                            >
                              {suggestion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Question Mode Results */}
                {mode === 'question' && (
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">{results.answer}</p>
                    {results.keyPoints && results.keyPoints.length > 0 && (
                      <div className="bg-white/50 rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Key Points:
                        </p>
                        <ul className="space-y-2">
                          {results.keyPoints.map((point: string, i: number) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <ChevronRight className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {results.relatedQuestions && results.relatedQuestions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Related Questions:</p>
                        <div className="space-y-2">
                          {results.relatedQuestions.map((question: string, i: number) => (
                            <button
                              key={i}
                              onClick={() => {
                                setQuery(question)
                                inputRef.current?.focus()
                              }}
                              className="w-full text-left px-4 py-2 bg-white rounded-lg hover:bg-purple-50 transition-colors text-sm text-gray-700 hover:text-purple-700"
                            >
                              {question}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Insights Mode Results */}
                {mode === 'insights' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4">
                      <p className="font-semibold text-purple-900">{results.mainInsight}</p>
                    </div>
                    {results.statistics && results.statistics.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-2">Statistics:</p>
                        <ul className="space-y-2">
                          {results.statistics.map((stat: string, i: number) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <TrendingUp className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                              {stat}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {results.recommendations && results.recommendations.length > 0 && (
                      <div className="bg-white/50 rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Recommendations:</p>
                        <ul className="space-y-2">
                          {results.recommendations.map((rec: string, i: number) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <Lightbulb className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {results.trends && (
                      <p className="text-sm text-gray-600 italic">{results.trends}</p>
                    )}
                  </div>
                )}

                {/* Recommendations Mode Results */}
                {mode === 'recommendations' && (
                  <div className="space-y-4">
                    {results.similarFacilities && results.similarFacilities.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4 text-purple-500" />
                          Similar Facilities:
                        </p>
                        <div className="space-y-2">
                          {results.similarFacilities.map((item: string, i: number) => (
                            <div key={i} className="bg-white rounded-lg p-3 text-sm text-gray-700">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {results.nearbyAreas && results.nearbyAreas.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-2">Nearby Areas:</p>
                        <div className="flex flex-wrap gap-2">
                          {results.nearbyAreas.map((area: string, i: number) => (
                            <Badge key={i} className="bg-blue-100 text-blue-700">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {results.relatedSearches && results.relatedSearches.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-2">Users Also Searched:</p>
                        <div className="flex flex-wrap gap-2">
                          {results.relatedSearches.map((search: string, i: number) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="cursor-pointer hover:bg-purple-100"
                              onClick={() => {
                                setQuery(search)
                                inputRef.current?.focus()
                              }}
                            >
                              {search}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {results.tip && (
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-yellow-900 mb-1 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          Pro Tip:
                        </p>
                        <p className="text-sm text-yellow-800">{results.tip}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

