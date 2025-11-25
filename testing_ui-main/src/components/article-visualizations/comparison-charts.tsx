'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { Info } from 'lucide-react'

interface StructuredData {
  byOrganization: Array<{
    name: string
    layoffs?: number
    closures?: number
    location: string
  }>
  byLocation: Array<{
    state: string
    layoffs?: number
    closures?: number
  }>
}

interface ComparisonChartsProps {
  data: StructuredData
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#6366f1', '#14b8a6', '#f97316']

export function ComparisonCharts({ data }: ComparisonChartsProps) {
  // Prepare pie chart data for organizations - filter out zero values
  const orgData = (data.byOrganization || [])
    .filter(org => (org.layoffs && org.layoffs > 0) || (org.closures && org.closures > 0))
    .slice(0, 8)
    .map(org => ({
      name: org.name.length > 15 ? org.name.substring(0, 15) + '...' : org.name,
      fullName: org.name,
      value: org.layoffs || org.closures || 0
    }))

  // Prepare location data - filter out zero values
  const locationData = (data.byLocation || [])
    .filter(loc => (loc.layoffs && loc.layoffs > 0) || (loc.closures && loc.closures > 0))
    .slice(0, 8)
    .map(loc => ({
      name: loc.state,
      value: loc.layoffs || loc.closures || 0
    }))

  // Calculate totals and insights
  const orgTotal = orgData.reduce((sum, d) => sum + d.value, 0)
  const locationTotal = locationData.reduce((sum, d) => sum + d.value, 0)
  const topOrg = orgData[0]
  const topLocation = locationData[0]

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const percentage = ((data.value / (data.payload.total || orgTotal || locationTotal)) * 100).toFixed(1)
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-1">{data.name}</p>
          <p className="text-sm">
            Value: <span className="font-semibold">{data.value.toLocaleString()}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {percentage}% of total
          </p>
        </div>
      )
    }
    return null
  }

  // Pie charts need at least 2 items to show meaningful distribution
  const hasValidOrgData = orgData.length >= 2
  const hasValidLocationData = locationData.length >= 2

  if (!hasValidOrgData && !hasValidLocationData) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-sm">Insufficient data for distribution charts</p>
          <p className="text-xs text-gray-400 mt-1">
            Pie charts require at least 2 items with numeric values to show meaningful distribution.
            {orgData.length === 1 && ' Only 1 organization found.'}
            {locationData.length === 1 && ' Only 1 location found.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 w-full">
      {/* Compact Description Section - Side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1.5">
                What These Charts Show
              </h4>
              <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                These pie charts show how the total impact is distributed across different categories. Each slice represents a portion of the total. 
                <span className="font-semibold"> Larger slices</span> indicate greater impact, and the percentages show exact proportions.
              </p>
            </div>
          </div>
        </div>

        {/* How to Read Section */}
        <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
            📖 How to Read:
          </h4>
          <ul className="text-xs text-purple-800 dark:text-purple-200 space-y-1 list-disc list-inside">
            <li>Each <span className="font-semibold">slice</span> = one category</li>
            <li><span className="font-semibold">Larger slice</span> = greater impact</li>
            <li><span className="font-semibold">Percentages</span> show exact shares</li>
            <li><span className="font-semibold">Hover</span> for exact numbers</li>
            <li>All slices = <span className="font-semibold">100%</span> total</li>
          </ul>
        </div>
      </div>

      {/* Charts - Full width grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Organization Distribution - Only show if at least 2 items */}
        {hasValidOrgData && (
          <Card className="w-full">
            <CardContent className="pt-6">
              <h4 className="text-base font-semibold mb-4 text-center">Distribution by Organization</h4>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={orgData.map(d => ({ ...d, total: orgTotal }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orgData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    formatter={(value, entry: any) => {
                      const percentage = ((entry.payload.value / orgTotal) * 100).toFixed(1)
                      return `${value}: ${percentage}%`
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {topOrg && (
                <div className="mt-4 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-800 dark:text-green-200">
                    <span className="font-semibold">Top Contributor:</span> {topOrg.fullName} accounts for {((topOrg.value / orgTotal) * 100).toFixed(1)}% of total impact
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Location Distribution - Only show if at least 2 items */}
        {hasValidLocationData && (
          <Card className="w-full">
            <CardContent className="pt-6">
              <h4 className="text-base font-semibold mb-4 text-center">Distribution by Location</h4>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={locationData.map(d => ({ ...d, total: locationTotal }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {locationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    formatter={(value, entry: any) => {
                      const percentage = ((entry.payload.value / locationTotal) * 100).toFixed(1)
                      return `${value}: ${percentage}%`
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {topLocation && (
                <div className="mt-4 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-800 dark:text-green-200">
                    <span className="font-semibold">Most Affected Location:</span> {topLocation.name} accounts for {((topLocation.value / locationTotal) * 100).toFixed(1)}% of total impact
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

