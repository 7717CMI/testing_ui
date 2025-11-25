'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { Info, TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react'

interface TrendData {
  date: string
  events: number
  totalLayoffs?: number
}

interface TrendChartProps {
  data: TrendData[]
}

export function TrendChart({ data }: TrendChartProps) {
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

  // Trend charts need at least 2 data points to show a meaningful trend
  if (!validData || validData.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-sm">Insufficient data for trend analysis</p>
          <p className="text-xs text-gray-400 mt-1">
            This chart requires at least 2 data points with numeric values to show a meaningful trend.
            {validData.length === 1 && ' Only 1 data point found.'}
          </p>
        </div>
      </div>
    )
  }

  // Format data for chart - map all possible numeric fields
  const chartData = validData.map(item => ({
    date: formatDate(item.date),
    layoffs: item.totalLayoffs || 0,
    investment: item.investment || 0,
    events: item.events || 0,
    marketSize: item.marketSize || 0,
    adoptionRate: item.adoptionRate || 0,
    value: item.value || 0
  }))

  // Determine primary metric (the one with the most data)
  const hasInvestment = chartData.some(d => d.investment > 0)
  const hasLayoffs = chartData.some(d => d.layoffs > 0)
  const hasMarketSize = chartData.some(d => d.marketSize > 0)
  const hasAdoptionRate = chartData.some(d => d.adoptionRate > 0)
  const hasValue = chartData.some(d => d.value > 0)
  
  const primaryMetric = hasInvestment ? 'investment' :
                        hasLayoffs ? 'layoffs' : 
                        hasMarketSize ? 'marketSize' : 
                        hasAdoptionRate ? 'adoptionRate' : 
                        hasValue ? 'value' : 'events'
  
  const primaryMetricLabel = primaryMetric === 'investment' ? 'Investment ($)' :
                             primaryMetric === 'layoffs' ? 'Layoffs' :
                             primaryMetric === 'marketSize' ? 'Market Size ($B)' :
                             primaryMetric === 'adoptionRate' ? 'Adoption Rate (%)' :
                             primaryMetric === 'value' ? 'Value' : 'Events'

  // Calculate trend insights based on primary metric
  const totalPrimary = chartData.reduce((sum, d) => sum + (d[primaryMetric] || 0), 0)
  const averagePrimary = totalPrimary / chartData.length
  const peakPeriod = chartData.reduce((max, d) => (d[primaryMetric] || 0) > (max[primaryMetric] || 0) ? d : max, chartData[0])
  const lowestPeriod = chartData.reduce((min, d) => (d[primaryMetric] || 0) < (min[primaryMetric] || 0) ? d : min, chartData[0])
  
  // Calculate trend direction
  const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2))
  const secondHalf = chartData.slice(Math.floor(chartData.length / 2))
  const firstAvg = firstHalf.reduce((sum, d) => sum + (d[primaryMetric] || 0), 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, d) => sum + (d[primaryMetric] || 0), 0) / secondHalf.length
  const trendDirection = secondAvg > firstAvg * 1.1 ? 'increasing' : secondAvg < firstAvg * 0.9 ? 'decreasing' : 'stable'
  const trendChange = firstAvg > 0 ? Math.abs(((secondAvg - firstAvg) / firstAvg) * 100).toFixed(0) : 0
  const TrendIcon = trendDirection === 'increasing' ? TrendingUp : trendDirection === 'decreasing' ? TrendingDown : Minus
  const trendColor = trendDirection === 'increasing' ? 'text-red-600' : trendDirection === 'decreasing' ? 'text-green-600' : 'text-gray-600'

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">{label}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            {payload[0].name}: <span className="font-semibold">{value.toLocaleString()}</span> employees
          </p>
          {averageLayoffs > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {value > averageLayoffs ? (
                <span className="text-red-600">↑ Above average ({((value / averageLayoffs - 1) * 100).toFixed(0)}% higher)</span>
              ) : value < averageLayoffs ? (
                <span className="text-green-600">↓ Below average ({((1 - value / averageLayoffs) * 100).toFixed(0)}% lower)</span>
              ) : (
                <span>≈ At average</span>
              )}
            </p>
          )}
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
                This area chart visualizes the overall trend of layoffs over time. The <span className="font-semibold">filled red area</span> represents the volume 
                of layoffs, with the area under the curve showing cumulative impact. An <span className="font-semibold">upward trend</span> indicates increasing layoffs, 
                while a <span className="font-semibold">downward trend</span> shows decreasing impact.
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
            <li>Read <span className="font-semibold">left to right</span> for trend changes</li>
            <li><span className="font-semibold">Area under curve</span> = total volume</li>
            <li><span className="font-semibold">Steeper slopes</span> = rapid changes</li>
            <li><span className="font-semibold">Flat areas</span> = stable periods</li>
            <li><span className="font-semibold">Hover</span> for exact numbers</li>
          </ul>
        </div>
      </div>

      {/* Chart - Larger size */}
      <div className="w-full bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <ResponsiveContainer width="100%" height={450}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLayoffs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMarketSize" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAdoptionRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
            width={70}
            label={{ value: 'Number of Layoffs', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'currentColor', fontSize: '13px' } }}
          />
          <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={primaryMetric}
                stroke={primaryMetric === 'investment' ? "#10b981" : primaryMetric === 'layoffs' ? "#ef4444" : primaryMetric === 'marketSize' ? "#10b981" : primaryMetric === 'adoptionRate' ? "#8b5cf6" : "#3b82f6"}
                fillOpacity={1}
                fill={primaryMetric === 'investment' ? "url(#colorInvestment)" : primaryMetric === 'layoffs' ? "url(#colorLayoffs)" : primaryMetric === 'marketSize' ? "url(#colorMarketSize)" : primaryMetric === 'adoptionRate' ? "url(#colorAdoptionRate)" : "url(#colorValue)"}
                name={primaryMetricLabel}
              />
        </AreaChart>
      </ResponsiveContainer>
      </div>

      {/* Key Insights Section */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
        <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
          💡 Key Insights:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-green-800 dark:text-green-200">
          <div className="flex items-center gap-2">
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
            <div>
              <span className="font-semibold">Overall Trend:</span>{' '}
              <span className={`font-semibold ${trendColor}`}>{trendDirection}</span>
              {trendChange !== '0' && ` (${trendChange}% change)`}
            </div>
          </div>
          <div>
            <span className="font-semibold">Peak Period:</span> {peakPeriod.date} ({peakPeriod.layoffs.toLocaleString()} employees)
          </div>
          {lowestPeriod.layoffs < peakPeriod.layoffs && (
            <div>
              <span className="font-semibold">Lowest Period:</span> {lowestPeriod.date} ({lowestPeriod.layoffs.toLocaleString()} employees)
            </div>
          )}
          <div>
            <span className="font-semibold">Average:</span> {averageLayoffs.toFixed(0)} employees per period
          </div>
          <div className="md:col-span-2">
            <span className="font-semibold">Total Impact:</span> <span className="font-bold">{totalLayoffs.toLocaleString()}</span> total employees affected over the entire period
          </div>
        </div>
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return format(date, 'MMM yyyy')
    }
    return dateStr.length > 10 ? dateStr.substring(0, 10) : dateStr
  } catch {
    return dateStr
  }
}

