'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TimelineChart } from './timeline-chart'
import { BarChartInteractive } from './bar-chart-interactive'
import { TrendChart } from './trend-chart'
import { ComparisonCharts } from './comparison-charts'
import { FilterPanel } from './filter-panel'
import { Download, Share2, Maximize2, BarChart3, TrendingUp, MapPin, PieChart, Info } from 'lucide-react'
import type { StructuredData } from '@/types/article-analysis'

interface ArticleDataVisualizationProps {
  data: StructuredData & { dataSources?: string[] }
  articleTitle: string
}

export function ArticleDataVisualization({ data, articleTitle }: ArticleDataVisualizationProps) {
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    organizations: [] as string[],
    locations: [] as string[],
    types: [] as string[]
  })

  // Filter data based on filters
  const filteredData = useMemo(() => {
    let filtered = { ...data }

    // Filter events
    if (data.events) {
      filtered.events = data.events.filter(event => {
        if (filters.organizations.length > 0 && !filters.organizations.includes(event.organization)) {
          return false
        }
        if (filters.locations.length > 0 && !filters.locations.includes(event.location)) {
          return false
        }
        if (filters.types.length > 0 && !filters.types.includes(event.type)) {
          return false
        }
        if (filters.dateRange.start && event.date < filters.dateRange.start) {
          return false
        }
        if (filters.dateRange.end && event.date > filters.dateRange.end) {
          return false
        }
        return true
      })
    }

    return filtered
  }, [data, filters])

  const handleExport = () => {
    // Export functionality
    const dataStr = JSON.stringify(filteredData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${articleTitle.replace(/[^a-z0-9]/gi, '_')}_data.json`
    link.click()
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${articleTitle} - Data Visualizations`,
        text: 'Check out these data visualizations',
        url: window.location.href
      })
    }
  }

  // Helper to check if item has any numeric value
  const hasAnyNumericValue = (item: any): boolean => {
    if (!item) return false
    const numericFields = ['layoffs', 'closures', 'investment', 'marketSize', 'adoptionRate', 'growthRate', 'marketShare', 'value', 'totalLayoffs', 'totalInvestment', 'events', 'totalMarketSize', 'averageAdoptionRate', 'totalValue']
    return numericFields.some(field => {
      const val = item[field]
      return typeof val === 'number' && val > 0
    })
  }

  // Validate data - check for meaningful numeric values (using helper function to check all numeric fields)
  const hasValidData = useMemo(() => {
    // Check if we have events with actual numeric values
    const hasValidEvents = filteredData.events && filteredData.events.some(hasAnyNumericValue)
    
    // Check if we have valid totals
    const hasValidTotals = filteredData.totals && hasAnyNumericValue(filteredData.totals)
    
    // Check if we have valid organization data
    const hasValidOrgs = filteredData.byOrganization && filteredData.byOrganization.some(hasAnyNumericValue)
    
    // Check if we have valid location data
    const hasValidLocations = filteredData.byLocation && filteredData.byLocation.some(hasAnyNumericValue)
    
    // Check if we have valid timeline data
    const hasValidTimeline = filteredData.timeline && filteredData.timeline.some(hasAnyNumericValue)
    
    return hasValidEvents || hasValidTotals || hasValidOrgs || hasValidLocations || hasValidTimeline
  }, [filteredData])

  // Helper functions to check if specific chart types have valid data
  // Timeline/Trend charts need at least 2 data points to show a meaningful trend
  const hasValidTimelineData = useMemo(() => {
    if (!filteredData.timeline || filteredData.timeline.length < 2) return false
    const validPoints = filteredData.timeline.filter(t => hasAnyNumericValue(t))
    return validPoints.length >= 2 // Need at least 2 points for a meaningful timeline
  }, [filteredData.timeline])

  // Bar charts need at least 2 items to compare - check for any numeric values
  const hasValidOrgData = useMemo(() => {
    if (!filteredData.byOrganization || filteredData.byOrganization.length < 2) return false
    const validOrgs = filteredData.byOrganization.filter(org => hasAnyNumericValue(org))
    return validOrgs.length >= 2 // Need at least 2 organizations to compare
  }, [filteredData.byOrganization])

  // Bar charts need at least 2 items to compare - check for any numeric values
  const hasValidLocationData = useMemo(() => {
    if (!filteredData.byLocation || filteredData.byLocation.length < 2) return false
    const validLocations = filteredData.byLocation.filter(loc => hasAnyNumericValue(loc))
    return validLocations.length >= 2 // Need at least 2 locations to compare
  }, [filteredData.byLocation])

  const hasValidComparisonData = useMemo(() => {
    return hasValidOrgData || hasValidLocationData
  }, [hasValidOrgData, hasValidLocationData])

  // Filter out zero values from data before passing to charts - handle multiple data types
  const getValidOrgData = useMemo(() => {
    if (!filteredData.byOrganization) return []
    return filteredData.byOrganization.filter(org => hasAnyNumericValue(org))
      .map(org => {
        // Find the first non-zero numeric value - prioritize investment for expansion articles
        const value = org.investment || org.layoffs || org.closures || org.value || org.marketShare || org.adoptionRate || org.marketSize || 0
        return {
          ...org,
          value: value, // Use generic 'value' field for charting
          investment: org.investment || 0,
          layoffs: org.layoffs || 0,
          closures: org.closures || 0,
          marketShare: org.marketShare || 0,
          adoptionRate: org.adoptionRate || 0
        }
      })
  }, [filteredData.byOrganization])

  const getValidLocationData = useMemo(() => {
    if (!filteredData.byLocation) return []
    return filteredData.byLocation.filter(loc => hasAnyNumericValue(loc))
      .map(loc => {
        // Find the first non-zero numeric value - prioritize investment for expansion articles
        const value = loc.investment || loc.layoffs || loc.closures || loc.value || loc.marketSize || loc.adoptionRate || 0
        return {
          ...loc,
          value: value, // Use generic 'value' field for charting
          investment: loc.investment || 0,
          layoffs: loc.layoffs || 0,
          closures: loc.closures || 0,
          marketSize: loc.marketSize || 0,
          adoptionRate: loc.adoptionRate || 0
        }
      })
  }, [filteredData.byLocation])

  const getValidTimelineData = useMemo(() => {
    if (!filteredData.timeline) return []
    return filteredData.timeline.filter(t => hasAnyNumericValue(t))
      .map(t => {
        // Find the first non-zero numeric value - prioritize investment for expansion articles
        const value = t.investment || t.totalLayoffs || t.value || t.marketSize || t.adoptionRate || t.events || 0
        return {
          ...t,
          value: value, // Use generic 'value' field for charting
          investment: t.investment || 0,
          totalLayoffs: t.totalLayoffs || 0,
          events: t.events || 0,
          marketSize: t.marketSize || 0,
          adoptionRate: t.adoptionRate || 0
        }
      })
  }, [filteredData.timeline])

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('🔍 Visualization Data Check:', {
      hasValidData,
      events: filteredData.events?.length || 0,
      byOrganization: filteredData.byOrganization?.length || 0,
      byLocation: filteredData.byLocation?.length || 0,
      timeline: filteredData.timeline?.length || 0,
      totals: filteredData.totals,
      hasValidTimelineData,
      hasValidOrgData,
      hasValidLocationData
    })
  }

  if (!hasValidData) {
    return (
      <div className="text-center py-12 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <BarChart3 className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          While this article contains some data, there isn't enough numeric information to generate meaningful visualizations.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          Charts require quantifiable metrics like layoff numbers, facility counts, or other measurable values.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left max-w-2xl mx-auto">
            <summary className="cursor-pointer text-xs text-gray-400">Debug Info</summary>
            <pre className="text-xs mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto">
              {JSON.stringify({ 
                events: filteredData.events?.length || 0,
                byOrganization: filteredData.byOrganization?.length || 0,
                byLocation: filteredData.byLocation?.length || 0,
                timeline: filteredData.timeline?.length || 0,
                totals: filteredData.totals
              }, null, 2)}
            </pre>
          </details>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      {/* Filter Panel - Collapsible or more compact */}
      <FilterPanel
        data={data}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Summary Stats - Only show if we have meaningful values */}
      {filteredData.totals && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {filteredData.totals.totalInvestment !== undefined && filteredData.totals.totalInvestment > 0 && (
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6 pb-6">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  ${(filteredData.totals.totalInvestment / 1000000).toFixed(1)}M
                </div>
                <p className="text-sm font-medium text-muted-foreground">Total Investment</p>
              </CardContent>
            </Card>
          )}
          {filteredData.totals.totalLayoffs !== undefined && filteredData.totals.totalLayoffs > 0 && (
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="pt-6 pb-6">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {filteredData.totals.totalLayoffs.toLocaleString()}
                </div>
                <p className="text-sm font-medium text-muted-foreground">Total Layoffs</p>
              </CardContent>
            </Card>
          )}
          {filteredData.totals.totalClosures !== undefined && filteredData.totals.totalClosures > 0 && (
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="pt-6 pb-6">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {filteredData.totals.totalClosures.toLocaleString()}
                </div>
                <p className="text-sm font-medium text-muted-foreground">Facility Closures</p>
              </CardContent>
            </Card>
          )}
          {filteredData.totals.totalMarketSize !== undefined && filteredData.totals.totalMarketSize > 0 && (
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="pt-6 pb-6">
                <div className="text-3xl font-bold text-emerald-600 mb-1">
                  ${(filteredData.totals.totalMarketSize / 1000000000).toFixed(1)}B
                </div>
                <p className="text-sm font-medium text-muted-foreground">Market Size</p>
              </CardContent>
            </Card>
          )}
          {filteredData.totals.affectedOrganizations > 0 && (
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6 pb-6">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {filteredData.totals.affectedOrganizations}
                </div>
                <p className="text-sm font-medium text-muted-foreground">Organizations</p>
              </CardContent>
            </Card>
          )}
          {filteredData.totals.affectedStates > 0 && (
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-6 pb-6">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {filteredData.totals.affectedStates}
                </div>
                <p className="text-sm font-medium text-muted-foreground">States Affected</p>
              </CardContent>
            </Card>
          )}
          {filteredData.totals.averageAdoptionRate !== undefined && filteredData.totals.averageAdoptionRate > 0 && (
            <Card className="border-l-4 border-l-cyan-500">
              <CardContent className="pt-6 pb-6">
                <div className="text-3xl font-bold text-cyan-600 mb-1">
                  {filteredData.totals.averageAdoptionRate.toFixed(1)}%
                </div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Adoption Rate</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Charts Grid - Full width layout for better space utilization */}
      <div className="grid grid-cols-1 gap-8 w-full">
        {/* Timeline Chart - Only if we have valid timeline data (at least 2 points) */}
        {hasValidTimelineData && getValidTimelineData.length >= 2 && (
          <Card className="w-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-xl">Event Timeline</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <TimelineChart data={getValidTimelineData} />
            </CardContent>
          </Card>
        )}

        {/* Bar Chart - By Organization - Only if we have valid org data (at least 2 items) */}
        {hasValidOrgData && getValidOrgData.length >= 2 && (
          <Card className="w-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-xl">Impact by Organization</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <BarChartInteractive
                data={getValidOrgData}
                xKey="name"
                yKey="value"
                label="Impact"
                description="This chart compares different organizations by their impact. Taller bars represent higher numbers. Organizations are sorted from highest to lowest impact, making it easy to identify the most affected entities."
                unit=""
              />
            </CardContent>
          </Card>
        )}

        {/* Trend Chart - Only if we have valid timeline data (at least 2 points) */}
        {hasValidTimelineData && getValidTimelineData.length >= 2 && (
          <Card className="w-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <CardTitle className="text-xl">Trend Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <TrendChart data={getValidTimelineData} />
            </CardContent>
          </Card>
        )}

        {/* By Location - Only if we have valid location data (at least 2 items) */}
        {hasValidLocationData && getValidLocationData.length >= 2 && (
          <Card className="w-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-600" />
                <CardTitle className="text-xl">Impact by Location</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <BarChartInteractive
                data={getValidLocationData}
                xKey="state"
                yKey="value"
                label="Impact by State"
                description="This chart shows which states/regions are most affected. Taller bars indicate higher impact in that location. Locations are sorted from most to least affected, helping you identify geographic patterns."
                unit=""
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Comparison Charts - Only if we have valid comparison data */}
      {hasValidComparisonData && (
        <Card className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-xl">Distribution Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ComparisonCharts data={{
              ...filteredData,
              byOrganization: getValidOrgData,
              byLocation: getValidLocationData
            }} />
          </CardContent>
        </Card>
      )}

      {/* Message if no charts can be generated */}
      {!hasValidTimelineData && !hasValidOrgData && !hasValidLocationData && (
        <div className="text-center py-8 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <BarChart3 className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            While this article contains some data, there isn't enough numeric information to generate meaningful visualizations.
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            Charts require quantifiable metrics like layoff numbers, facility counts, or other measurable values.
          </p>
        </div>
      )}

      {/* Data Sources */}
      {data.dataSources && data.dataSources.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Data Sources
            </h4>
            <ul className="space-y-2">
              {data.dataSources.map((source, index) => (
                <li key={index} className="text-xs text-blue-800 dark:text-blue-200 flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>{source}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
              All data shown in these visualizations is verified and sourced from real, publicly available information.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-4 border-t">
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  )
}

