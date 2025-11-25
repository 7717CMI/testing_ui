'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface TimelineData {
  date: string
  events: number
  totalLayoffs?: number
}

interface TimelineChartProps {
  data: TimelineData[]
}

export function TimelineChart({ data }: TimelineChartProps) {
  // Helper to check if item has any numeric value
  const hasAnyNumericValue = (item: any): boolean => {
    if (!item) return false
    const numericFields = ['layoffs', 'closures', 'investment', 'marketSize', 'adoptionRate', 'growthRate', 'marketShare', 'value', 'totalLayoffs', 'totalInvestment', 'events', 'totalMarketSize', 'averageAdoptionRate', 'totalValue']
    return numericFields.some(field => {
      const val = item[field]
      return typeof val === 'number' && val > 0
    })
  }

  // Filter out entries with no meaningful data - check all numeric fields
  const validData = data?.filter(hasAnyNumericValue) || []

  // Timeline charts need at least 2 data points to show a meaningful trend
  if (!validData || validData.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-sm">Insufficient data for timeline chart</p>
          <p className="text-xs text-gray-400 mt-1">
            This chart requires at least 2 data points with numeric values to show a meaningful timeline trend.
            {validData.length === 1 && ' Only 1 data point found.'}
          </p>
        </div>
      </div>
    )
  }

  // Format data for chart (using validData) - map all possible numeric fields
  const chartData = validData.map(item => ({
    date: formatDate(item.date),
    events: item.events || 0,
    layoffs: item.totalLayoffs || 0,
    investment: item.investment || 0,
    marketSize: item.marketSize || 0,
    adoptionRate: item.adoptionRate || 0,
    value: item.value || 0
  }))

  // Calculate key insights
  const totalEvents = chartData.reduce((sum, d) => sum + d.events, 0)
  const totalLayoffs = chartData.reduce((sum, d) => sum + d.layoffs, 0)
  const peakEvent = chartData.reduce((max, d) => d.events > max.events ? d : max, chartData[0])
  const peakLayoffs = chartData.reduce((max, d) => d.layoffs > max.layoffs ? d : max, chartData[0])
  
  // Calculate trend
  const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2))
  const secondHalf = chartData.slice(Math.floor(chartData.length / 2))
  const firstAvg = firstHalf.reduce((sum, d) => sum + d.layoffs, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.layoffs, 0) / secondHalf.length
  const trendDirection = secondAvg > firstAvg ? 'increasing' : secondAvg < firstAvg ? 'decreasing' : 'stable'
  const TrendIcon = trendDirection === 'increasing' ? TrendingUp : trendDirection === 'decreasing' ? TrendingDown : Minus
  const trendColor = trendDirection === 'increasing' ? 'text-red-600' : trendDirection === 'decreasing' ? 'text-green-600' : 'text-gray-600'

  // Custom tooltip with better formatting
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value.toLocaleString()}</span>
              {entry.name === 'Layoffs' && entry.value > 0 && (
                <span className="text-xs text-gray-500 ml-1">employees affected</span>
              )}
              {entry.name === 'Events' && (
                <span className="text-xs text-gray-500 ml-1">events occurred</span>
              )}
            </p>
          ))}
        </div>
      )
    }
    return null
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
                What This Chart Shows
              </h4>
              <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                This timeline visualizes when events occurred over time. The <span className="font-semibold">blue line</span> shows the number of events per period, 
                and the <span className="font-semibold">red line</span> shows total layoffs. Higher points indicate more activity or impact during that period.
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
            <li>Read <span className="font-semibold">left to right</span> for time progression</li>
            <li>Each point = time period (month/date)</li>
            <li><span className="font-semibold">Higher points</span> = more activity</li>
            <li><span className="font-semibold">Hover</span> for exact numbers</li>
            <li><span className="font-semibold">Rising lines</span> = increasing activity</li>
          </ul>
        </div>
      </div>

      {/* Chart - Larger size */}
      <div className="w-full bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <ResponsiveContainer width="100%" height={450}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis 
            dataKey="date" 
            className="text-sm"
            tick={{ fill: 'currentColor', fontSize: 12 }}
            label={{ value: 'Time Period', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: 'currentColor', fontSize: '13px' } }}
          />
          <YAxis 
            className="text-sm"
            tick={{ fill: 'currentColor', fontSize: 12 }}
            width={60}
            label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'currentColor', fontSize: '13px' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="events" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Events (count)"
            dot={{ r: 4 }}
          />
          {chartData.some(d => d.investment > 0) && (
            <Line 
              type="monotone" 
              dataKey="investment" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Investment ($)"
              dot={{ r: 4 }}
            />
          )}
          {chartData.some(d => d.layoffs > 0) && (
            <Line 
              type="monotone" 
              dataKey="layoffs" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Layoffs (employees)"
              dot={{ r: 4 }}
            />
          )}
          {chartData.some(d => d.marketSize > 0) && (
            <Line 
              type="monotone" 
              dataKey="marketSize" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Market Size ($B)"
              dot={{ r: 4 }}
            />
          )}
          {chartData.some(d => d.adoptionRate > 0) && (
            <Line 
              type="monotone" 
              dataKey="adoptionRate" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name="Adoption Rate (%)"
              dot={{ r: 4 }}
            />
          )}
          {chartData.some(d => d.value > 0) && !hasInvestment && !hasLayoffs && !hasMarketSize && !hasAdoptionRate && (
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#f59e0b" 
              strokeWidth={2}
              name="Value"
              dot={{ r: 4 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      </div>

      {/* Key Insights Section */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
        <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
          💡 Key Insights:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-green-800 dark:text-green-200">
          <div>
            <span className="font-semibold">Peak Activity:</span> {peakValue.date} had the highest {primaryMetric === 'investment' ? `investment ($${(peakValue[primaryMetric] || 0).toLocaleString()})` : primaryMetric === 'layoffs' ? `layoffs (${(peakValue[primaryMetric] || 0).toLocaleString()})` : primaryMetric === 'marketSize' ? `market size ($${(peakValue[primaryMetric] || 0).toLocaleString()})` : primaryMetric === 'adoptionRate' ? `adoption rate (${(peakValue[primaryMetric] || 0).toLocaleString()}%)` : `${primaryMetricLabel} (${(peakValue[primaryMetric] || 0).toLocaleString()})`}
            {peakEvent.events > 0 && peakEvent.date !== peakValue.date && (
              <span>, while {peakEvent.date} had the most events ({peakEvent.events} events)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Overall Trend:</span>
            <span className={`font-semibold ${trendColor} inline-flex items-center gap-1`}>
              <TrendIcon className="h-3 w-3" />
              {trendDirection}
            </span>
            {' '}over the period
          </div>
          <div className="md:col-span-2">
            <span className="font-semibold">Total Impact:</span> {totalPrimary.toLocaleString()} total {primaryMetricLabel} across the timeline
            {totalEvents > 0 && primaryMetric !== 'events' && ` (${totalEvents} events)`}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  try {
    // Try to parse various date formats
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return format(date, 'MMM yyyy')
    }
    // If it's already in a readable format, return as is
    return dateStr.length > 10 ? dateStr.substring(0, 10) : dateStr
  } catch {
    return dateStr
  }
}

