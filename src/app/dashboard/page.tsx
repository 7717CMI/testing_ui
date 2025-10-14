'use client'

import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Phone, 
  Search, 
  Brain, 
  Activity,
  Network,
  Users,
  Target,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardShell } from '@/components/dashboard-shell'
import { useCallStore } from '@/lib/store/call-store'
import { useGraphStore } from '@/lib/store/graph-store'
import { useIntentStore } from '@/lib/store/intent-store'
import { ParticleBackground } from '@/components/three'
import Link from 'next/link'

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 1000
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return (
    <span className="counter-animate">
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

function StatCard({ 
  title, 
  value, 
  suffix = '', 
  icon: Icon, 
  trend, 
  trendValue,
  color = 'blue' 
}: {
  title: string
  value: number
  suffix?: string
  icon: any
  trend?: 'up' | 'down'
  trendValue?: string
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'pink'
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
  }

  return (
    <Card className="glass-heavy card-hover-2 ambient-glow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          {trend && (
            <Badge variant={trend === 'up' ? 'default' : 'destructive'} className="gap-1">
              {trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {trendValue}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold">
            <AnimatedCounter value={value} suffix={suffix} />
          </p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function RecentActivityFeed() {
  const activities = [
    {
      id: 1,
      type: 'call',
      title: 'Call completed',
      description: 'Memorial Hospital - 4m 5s',
      time: '2 hours ago',
      icon: Phone,
      color: 'text-green-500',
    },
    {
      id: 2,
      type: 'intent',
      title: 'New high-intent lead',
      description: 'HealthTech Solutions Inc. (Score: 89)',
      time: '3 hours ago',
      icon: Target,
      color: 'text-yellow-500',
    },
    {
      id: 3,
      type: 'search',
      title: 'Search performed',
      description: '247 facilities found in California',
      time: '5 hours ago',
      icon: Search,
      color: 'text-blue-500',
    },
    {
      id: 4,
      type: 'ai',
      title: 'AI Analysis completed',
      description: 'Market trends report generated',
      time: '6 hours ago',
      icon: Brain,
      color: 'text-purple-500',
    },
  ]

  return (
    <Card className="glass-heavy h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Your latest interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className={`mt-0.5 ${activity.color}`}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function EntityGraphSummary() {
  const { totalNodes, totalLinks } = useGraphStore()

  return (
    <Card className="glass-heavy h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5 text-primary-500" />
          Entity Graph
        </CardTitle>
        <CardDescription>Relationship network overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-lg bg-primary-50 dark:bg-primary-950/20">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              <AnimatedCounter value={totalNodes} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">Total Entities</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-secondary-50 dark:bg-secondary-950/20">
            <div className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
              <AnimatedCounter value={totalLinks} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">Connections</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              States
            </span>
            <span className="font-semibold">3</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Hospitals
            </span>
            <span className="font-semibold">5</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-pink-500" />
              Drugs
            </span>
            <span className="font-semibold">4</span>
          </div>
        </div>

        <Link href="/graph-linkage">
          <Button variant="outline" size="sm" className="w-full gap-2">
            <Network className="h-4 w-4" />
            View Full Graph
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function IntentActivityWidget() {
  const { totalCompanies, averageScore } = useIntentStore()

  return (
    <Card className="glass-heavy h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-yellow-500" />
          Intent Signals
        </CardTitle>
        <CardDescription>Market intent activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              <AnimatedCounter value={totalCompanies} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">Active Companies</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              <AnimatedCounter value={averageScore} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">Avg Score</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Healthcare Analytics</span>
            <Badge variant="outline" className="gap-1">
              <ArrowUp className="h-3 w-3 text-green-500" />
              15%
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Patient Management</span>
            <Badge variant="outline" className="gap-1">
              <ArrowUp className="h-3 w-3 text-green-500" />
              22%
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>AI Diagnostics</span>
            <Badge variant="outline" className="gap-1">
              <ArrowUp className="h-3 w-3 text-green-500" />
              28%
            </Badge>
          </div>
        </div>

        <Link href="/insights">
          <Button variant="outline" size="sm" className="w-full gap-2">
            <Target className="h-4 w-4" />
            View All Intent
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { fetchCallLogs, totalCalls, totalDuration, totalCost } = useCallStore()
  const { fetchGraphData, totalNodes, totalLinks } = useGraphStore()
  const { fetchIntentData, totalCompanies, averageScore } = useIntentStore()

  useEffect(() => {
    fetchCallLogs()
    fetchGraphData()
    fetchIntentData()
  }, [fetchCallLogs, fetchGraphData, fetchIntentData])

  return (
    <DashboardShell>
      {/* Three.js Background Animation */}
      <div className="fixed inset-0 opacity-20 pointer-events-none z-0">
        <Suspense fallback={null}>
          <ParticleBackground 
            particleCount={300} 
            color="#10B981" 
            speed={0.0002}
          />
        </Suspense>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 relative z-10"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text">Command Center</h1>
          <p className="text-muted-foreground mt-2">
            Real-time overview of your healthcare intelligence platform
          </p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Calls"
            value={totalCalls}
            icon={Phone}
            trend="up"
            trendValue="+12%"
            color="green"
          />
          <StatCard
            title="Call Duration"
            value={Math.floor(totalDuration / 60)}
            suffix="m"
            icon={TrendingUp}
            trend="up"
            trendValue="+8%"
            color="blue"
          />
          <StatCard
            title="Intent Leads"
            value={totalCompanies}
            icon={Target}
            trend="up"
            trendValue="+24%"
            color="yellow"
          />
          <StatCard
            title="Graph Entities"
            value={totalNodes}
            icon={Network}
            trend="up"
            trendValue="+5%"
            color="purple"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <RecentActivityFeed />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <EntityGraphSummary />
            <IntentActivityWidget />
          </div>
        </div>
      </motion.div>
    </DashboardShell>
  )
}

