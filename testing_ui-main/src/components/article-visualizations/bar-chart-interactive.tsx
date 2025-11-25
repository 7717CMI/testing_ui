'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { useState, useMemo } from 'react'
import { Info, Award, TrendingUp } from 'lucide-react'

interface BarChartData {
  [key: string]: string | number | undefined
}

interface BarChartInteractiveProps {
  data: BarChartData[]
  xKey: string
  yKey: string
  label: string
  description?: string
  unit?: string
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#6366f1']

export function BarChartInteractive({ data, xKey, yKey, label, description, unit = '' }: BarChartInteractiveProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Filter out zero values and validate data - handle multiple possible value fields
  const validData = useMemo(() => {
    if (!data || data.length === 0) return []
    return data.filter(item => {
      // Try the specified yKey first
      let value = Number(item[yKey]) || 0
      
      // If that's zero, try common alternative fields
      if (value === 0) {
        value = Number(item.value) || Number(item.marketSize) || Number(item.adoptionRate) || 
                Number(item.marketShare) || Number(item.layoffs) || Number(item.closures) || 0
      }
      
      return value > 0
    }).map(item => {
      // Ensure we have a value field for the chart
      let value = Number(item[yKey]) || 0
      if (value === 0) {
        value = Number(item.value) || Number(item.marketSize) || Number(item.adoptionRate) || 
                Number(item.marketShare) || Number(item.layoffs) || Number(item.closures) || 0
      }
      return {
        ...item,
        [yKey]: value // Ensure yKey has a value
      }
    })
  }, [data, yKey])

  // Bar charts need at least 2 items to make a meaningful comparison
  if (!validData || validData.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-sm">Insufficient data for comparison chart</p>
          <p className="text-xs text-gray-400 mt-1">
            This chart requires at least 2 items with numeric values greater than zero to make a meaningful comparison.
            {validData.length === 1 && ' Only 1 item found.'}
          </p>
        </div>
      </div>
    )
  }

  // Sort by value descending and limit to top 10 (using validData)
  const sortedData = useMemo(() => {
    return [...validData]
      .sort((a, b) => {
        const aVal = Number(a[yKey]) || 0
        const bVal = Number(b[yKey]) || 0
        return bVal - aVal
      })
      .slice(0, 10)
      .map((item, index) => ({
        ...item,
        name: String(item[xKey] || 'Unknown').substring(0, 25), // Truncate long names
        value: Number(item[yKey]) || 0,
        originalIndex: index,
        fullName: String(item[xKey] || 'Unknown')
      }))
  }, [validData, xKey, yKey])

  // Calculate key insights
  const topItem = sortedData[0]
  const total = sortedData.reduce((sum, d) => sum + d.value, 0)
  const topThreeTotal = sortedData.slice(0, 3).reduce((sum, d) => sum + d.value, 0)
  const topThreePercentage = total > 0 ? Math.round((topThreeTotal / total) * 100) : 0

  // Custom tooltip with better formatting
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value
      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">{label}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            {payload[0].name}: <span className="font-semibold">{value.toLocaleString()}{unit}</span>
          </p>
          {total > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Represents {percentage}% of total
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const defaultDescription = xKey === 'name' 
    ? `This chart compares different organizations by their impact. Taller bars represent higher numbers. Organizations are sorted from highest to lowest impact, making it easy to identify the most affected entities.`
    : `This chart shows the distribution across different locations. Taller bars indicate higher impact in those regions. Locations are sorted from most to least affected.`

  return (
    <div className="space-y-5 w-full">
      {/* Compact Description Section - Side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1.5">
                What This Chart Shows
              </h4>
              <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                {description || defaultDescription}
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
            <li>Each <span className="font-semibold">bar = one {xKey === 'name' ? 'organization' : 'location'}</span></li>
            <li><span className="font-semibold">Height = {label.toLowerCase()}</span> (taller = higher)</li>
            <li><span className="font-semibold">Sorted left to right</span> (highest first)</li>
            <li><span className="font-semibold">Hover</span> for exact numbers</li>
          </ul>
        </div>
      </div>

      {/* Chart - Larger size */}
      <div className="w-full bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <ResponsiveContainer width="100%" height={450}>
        <BarChart data={sortedData} margin={{ top: 10, right: 30, left: 10, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={90}
            className="text-sm"
            tick={{ fill: 'currentColor', fontSize: 12 }}
            label={{ value: xKey === 'name' ? 'Organization' : 'Location', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: 'currentColor', fontSize: '13px' } }}
          />
          <YAxis 
            className="text-sm"
            tick={{ fill: 'currentColor', fontSize: 12 }}
            width={60}
            label={{ value: label, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'currentColor', fontSize: '13px' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="value" 
            name={label}
            onMouseEnter={(_, index) => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {sortedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === 0 ? '#ef4444' : COLORS[index % COLORS.length]}
                opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.6}
                stroke={index === 0 ? '#dc2626' : 'none'}
                strokeWidth={index === 0 ? 2 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>

      {/* Key Insights Section */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
        <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
          💡 Key Insights:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-green-800 dark:text-green-200">
          <div className="flex items-start gap-2">
            <Award className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold">Top {xKey === 'name' ? 'Organization' : 'Location'}:</span>{' '}
              {topItem.fullName} with <span className="font-bold">{topItem.value.toLocaleString()}{unit}</span> ({total > 0 ? Math.round((topItem.value / total) * 100) : 0}% of total)
            </div>
          </div>
          {sortedData.length >= 3 && (
            <div>
              <span className="font-semibold">Top 3 Impact:</span> {topThreePercentage}% of total ({topThreeTotal.toLocaleString()}{unit} of {total.toLocaleString()}{unit})
            </div>
          )}
          <div className="md:col-span-2">
            <span className="font-semibold">Total:</span> {sortedData.length} {xKey === 'name' ? 'organizations' : 'locations'} shown, combined total of <span className="font-bold">{total.toLocaleString()}{unit}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

