'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useIntentStore } from '@/lib/store/intent-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target,
  Zap,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  Building2,
  MapPin,
  Users,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

export default function IntentDataPage() {
  const {
    intents,
    trendingTopics,
    totalCompanies,
    averageScore,
    topicCount,
    isLoading,
    fetchIntentData,
    exportIntentData,
  } = useIntentStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [minScoreFilter, setMinScoreFilter] = useState(0)

  useEffect(() => {
    fetchIntentData()
  }, [fetchIntentData])

  const filteredIntents = intents.filter((intent) => {
    const matchesSearch = intent.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         intent.domain.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesScore = intent.overallScore >= minScoreFilter
    const matchesCategory = !selectedCategory || 
                           intent.topics.some(t => t.category === selectedCategory)
    return matchesSearch && matchesScore && matchesCategory
  })

  const categories = Array.from(new Set(trendingTopics.map(t => t.category)))

  const getBuyingStage = (score: number) => {
    if (score >= 85) return { stage: 'Late Stage', color: 'text-red-500', icon: AlertCircle }
    if (score >= 70) return { stage: 'Mid Stage', color: 'text-yellow-500', icon: Clock }
    return { stage: 'Early Stage', color: 'text-blue-500', icon: CheckCircle }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading intent data...</p>
        </div>
      </div>
    )
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
                <Target className="h-10 w-10 text-primary-500" />
                Intent Signals
              </h1>
              <p className="text-xl text-muted-foreground">
                Identify in-market companies showing active research behavior
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => exportIntentData('json')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
              <Button onClick={() => exportIntentData('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="gradient-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary-500">{totalCompanies}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Showing intent signals
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Intent Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{averageScore}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Out of 100
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tracked Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent-500">{topicCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all categories
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                High Intent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">
                {intents.filter(i => i.overallScore >= 85).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Late stage buying
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trending Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Trending Topics
              </CardTitle>
              <CardDescription>
                Topics showing the highest surge in research activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingTopics.map((topic) => (
                  <Card key={topic.id} className="card-hover border-l-4 border-l-primary-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold">{topic.name}</h4>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {topic.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(topic.trend)}
                          <span className={`text-sm font-medium ${
                            topic.trend === 'up' ? 'text-green-500' : 
                            topic.trend === 'down' ? 'text-red-500' : 
                            'text-gray-500'
                          }`}>
                            {topic.trend === 'stable' ? '±' : topic.trend === 'up' ? '+' : ''}
                            {topic.changePercent}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                            style={{ width: `${topic.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{topic.score}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies or domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(null)}
              size="sm"
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Companies with Intent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-secondary-500" />
                    Companies Showing Intent
                  </CardTitle>
                  <CardDescription>
                    {filteredIntents.length} companies match your criteria
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredIntents.map((intent) => {
                  const buyingStage = getBuyingStage(intent.overallScore)
                  const StageIcon = buyingStage.icon

                  return (
                    <Card key={intent.id} className="card-hover">
                      <CardContent className="pt-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                          {/* Company Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-xl font-bold mb-1">{intent.companyName}</h3>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <span>{intent.domain}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {intent.location.city}, {intent.location.state}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {intent.employeeCount} employees
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-3xl font-bold text-primary-500">
                                  {intent.overallScore}
                                </div>
                                <div className="text-xs text-muted-foreground">Intent Score</div>
                              </div>
                            </div>

                            {/* Industry & Buying Stage */}
                            <div className="flex items-center gap-2 mb-4">
                              <Badge variant="secondary">{intent.industry}</Badge>
                              <Badge className={buyingStage.color}>
                                <StageIcon className="h-3 w-3 mr-1" />
                                {buyingStage.stage}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Last activity: {new Date(intent.lastActivityDate).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Research Topics */}
                            <div>
                              <p className="text-sm font-medium mb-2">Active Research Topics:</p>
                              <div className="flex flex-wrap gap-2">
                                {intent.topics.map((topic) => (
                                  <div
                                    key={topic.id}
                                    className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg text-sm"
                                  >
                                    <span>{topic.name}</span>
                                    <span className="font-bold text-primary-500">{topic.score}</span>
                                    {getTrendIcon(topic.trend)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex lg:flex-col gap-2 lg:w-40">
                            <Button className="flex-1">
                              <ArrowUpRight className="h-4 w-4 mr-2" />
                              View Profile
                            </Button>
                            <Button variant="outline" className="flex-1">
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Analytics
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-500 rounded-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">What is Intent Data?</h3>
                  <p className="text-muted-foreground mb-4">
                    Intent data reveals which companies are actively researching topics related to your solutions. 
                    By tracking research behavior across thousands of healthcare and B2B websites, we identify 
                    in-market accounts showing genuine buying signals—helping you prioritize outreach, 
                    personalize messaging, and close deals faster.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-1">🎯 Identify In-Market Accounts</h4>
                      <p className="text-muted-foreground">
                        Pinpoint companies actively researching healthcare solutions
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">📊 Buying Stage Mapping</h4>
                      <p className="text-muted-foreground">
                        Understand where prospects are in their buying journey
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">⚡ Actionable Insights</h4>
                      <p className="text-muted-foreground">
                        Tailor outreach with topics they're actually researching
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}


