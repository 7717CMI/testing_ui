"use client"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/shared/navbar"
import { InsightCard } from "@/components/shared/insight-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Insight } from "@/types"
import { toast } from "sonner"
import { TrendingUp, Bookmark, Target, ArrowUp, ArrowDown, ExternalLink, Download } from "lucide-react"
import { useIntentStore } from "@/lib/store/intent-store"
import { ParticleBackground } from "@/components/three"

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const { intents, trendingTopics: intentTopics, fetchIntentData, exportIntentData } = useIntentStore()

  useEffect(() => {
    fetch("/mock-data/insights.json")
      .then((res) => res.json())
      .then((data) => setInsights(data))
    
    fetchIntentData()
  }, [fetchIntentData])

  const filteredInsights = insights.filter((insight) => {
    if (activeTab === "all") return true
    return insight.type.toLowerCase() === activeTab.toLowerCase()
  })

  function handleBookmark(insight: Insight) {
    toast.success(`"${insight.title}" bookmarked!`)
  }

  function handleShare(insight: Insight) {
    toast.success("Link copied to clipboard!")
  }

  const trendingTopics = [
    { name: "Hospital Expansion", count: 234 },
    { name: "AI in Healthcare", count: 189 },
    { name: "Mental Health Funding", count: 156 },
    { name: "Telehealth Growth", count: 142 },
    { name: "Value-Based Care", count: 128 },
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      
      {/* Three.js Background Animation */}
      <div className="fixed inset-0 opacity-15 pointer-events-none z-0">
        <Suspense fallback={null}>
          <ParticleBackground 
            particleCount={350} 
            color="#FACC15" 
            speed={0.0004}
          />
        </Suspense>
      </div>

      <div className="container py-6 relative z-10">
        <div className="flex gap-6">
          {/* Main Content */}
          <main className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Healthcare Insights</h1>
              <p className="text-muted-foreground">
                Stay informed with the latest trends, news, and analysis
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
                <TabsTrigger value="clinics">Clinics</TabsTrigger>
                <TabsTrigger value="mental health">Mental Health</TabsTrigger>
                <TabsTrigger value="urgent care">Urgent Care</TabsTrigger>
                <TabsTrigger value="policy">Policy</TabsTrigger>
                <TabsTrigger value="intent" className="gap-2">
                  <Target className="h-4 w-4" />
                  Market Intent
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {activeTab !== "intent" ? (
                  <div className="space-y-4">
                    {filteredInsights.map((insight) => (
                      <InsightCard
                        key={insight.id}
                        insight={insight}
                        onBookmark={() => handleBookmark(insight)}
                        onShare={() => handleShare(insight)}
                      />
                    ))}
                  </div>
                ) : null}
              </TabsContent>

              <TabsContent value="intent" className="mt-6">
                <div className="space-y-6">
                  {/* Intent Header */}
                  <Card className="glass-heavy">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-yellow-500" />
                            Market Intent Signals
                          </CardTitle>
                          <CardDescription className="mt-2">
                            Powered by Bombora Intent Data - Track companies showing active research behavior
                          </CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => exportIntentData('json')}
                        >
                          <Download className="h-4 w-4" />
                          Export
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 rounded-lg bg-primary-50 dark:bg-primary-950/20">
                          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {intents.length}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Active Companies</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-secondary-50 dark:bg-secondary-950/20">
                          <div className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
                            {intentTopics.length}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Trending Topics</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {intents.reduce((acc, intent) => acc + intent.overallScore, 0) / intents.length || 0}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Avg Intent Score</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trending Intent Topics */}
                  <Card className="glass">
                    <CardHeader>
                      <CardTitle className="text-lg">🔥 Trending Topics</CardTitle>
                      <CardDescription>Topics with highest intent signals this week</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {intentTopics.slice(0, 6).map((topic, index) => (
                          <motion.div
                            key={topic.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="text-2xl">{index < 3 ? '🏆' : '📊'}</div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{topic.name}</div>
                                <div className="text-xs text-muted-foreground">{topic.category}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={topic.trend === 'up' ? 'default' : topic.trend === 'down' ? 'destructive' : 'secondary'}
                                className="gap-1"
                              >
                                {topic.trend === 'up' && <ArrowUp className="h-3 w-3" />}
                                {topic.trend === 'down' && <ArrowDown className="h-3 w-3" />}
                                {topic.changePercent}%
                              </Badge>
                              <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                {topic.score}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Company Intent Cards */}
                  <div className="space-y-4">
                    {intents.map((intent, index) => (
                      <motion.div
                        key={intent.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="glass-heavy card-hover-2">
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              {/* Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold">{intent.companyName}</h3>
                                    <Badge className="gradient-primary text-white">
                                      Score: {intent.overallScore}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                    <span>{intent.industry}</span>
                                    <span>•</span>
                                    <span>{intent.employeeCount} employees</span>
                                    <span>•</span>
                                    <span>{intent.location.city}, {intent.location.state}</span>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" className="gap-2">
                                  <ExternalLink className="h-4 w-4" />
                                  Visit
                                </Button>
                              </div>

                              {/* Topics */}
                              <div>
                                <div className="text-sm font-medium mb-2">Active Research Topics:</div>
                                <div className="flex flex-wrap gap-2">
                                  {intent.topics.map((topic) => (
                                    <Badge
                                      key={topic.id}
                                      variant="outline"
                                      className="gap-2 px-3 py-1"
                                    >
                                      <span>{topic.name}</span>
                                      <span className="text-primary-600 dark:text-primary-400 font-semibold">
                                        {topic.score}
                                      </span>
                                      {topic.trend === 'up' && (
                                        <ArrowUp className="h-3 w-3 text-green-500" />
                                      )}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Footer */}
                              <div className="flex items-center justify-between pt-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                  Last activity: {new Date(intent.lastActivityDate).toLocaleString()}
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline">
                                    View Profile
                                  </Button>
                                  <Button size="sm" className="gap-2">
                                    <Target className="h-4 w-4" />
                                    Engage
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0 space-y-6">
            <div className="sticky top-20 space-y-6">
              {/* Trending Topics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-primary-500" />
                    Trending Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div
                      key={topic.name}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs font-semibold">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium">{topic.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {topic.count}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Saved Articles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bookmark className="h-5 w-5 text-primary-500" />
                    Saved Articles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No saved articles yet. Bookmark articles to read them later.
                  </p>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

