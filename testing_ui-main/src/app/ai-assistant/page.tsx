"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Navbar } from "@/components/shared/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Brain, Sparkles, MessageSquare, Zap, Code, TrendingUp, FileText, ArrowRight, Send, Network, Target, Phone, Database } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useGraphStore } from "@/lib/store/graph-store"
import { useIntentStore } from "@/lib/store/intent-store"
import { useCallStore } from "@/lib/store/call-store"
import { ParticleBackground } from "@/components/three"

export default function AIAssistantPage() {
  const [query, setQuery] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { totalNodes, totalLinks } = useGraphStore()
  const { totalCompanies, averageScore } = useIntentStore()
  const { totalCalls, totalDuration } = useCallStore()

  useEffect(() => {
    // Fetch data for context awareness
  }, [])

  const handleQuery = () => {
    if (!query.trim()) return
    setIsProcessing(true)
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false)
    }, 2000)
  }

  const suggestedQueries = [
    {
      text: "What are the top hospitals in California by bed count?",
      category: "Search",
      icon: Database
    },
    {
      text: "Show me the relationship between hospitals and drug prescriptions in the entity graph",
      category: "Graph Analysis",
      icon: Network
    },
    {
      text: "Which companies show high intent for healthcare analytics solutions?",
      category: "Intent Data",
      icon: Target
    },
    {
      text: "Summarize my recent call activities and engagement patterns",
      category: "Call Analytics",
      icon: Phone
    },
    {
      text: "Analyze M&A activity trends in healthcare",
      category: "Trends",
      icon: TrendingUp
    },
    {
      text: "Find facilities with recent ownership changes",
      category: "Market Intel",
      icon: FileText
    }
  ]

  const capabilities = [
    {
      icon: MessageSquare,
      title: "Natural Language Query",
      description: "Ask questions in plain English and get instant, contextual answers from our healthcare database.",
      color: "text-primary-500"
    },
    {
      icon: Network,
      title: "Graph-Aware Analysis",
      description: "Understands entity relationships and can navigate complex hospital-drug-location networks.",
      color: "text-blue-500"
    },
    {
      icon: Target,
      title: "Intent-Driven Insights",
      description: "Leverages Bombora intent data to identify high-value opportunities and market signals.",
      color: "text-yellow-500"
    },
    {
      icon: Phone,
      title: "Engagement Context",
      description: "Aware of your call history and engagement patterns to provide personalized recommendations.",
      color: "text-green-500"
    },
    {
      icon: TrendingUp,
      title: "Predictive Analysis",
      description: "Automatically analyze trends, patterns, and insights from millions of facility records.",
      color: "text-secondary-500"
    },
    {
      icon: FileText,
      title: "Report Generation",
      description: "Generate comprehensive reports and summaries with citations and data visualizations.",
      color: "text-accent-500"
    }
  ]

  const useCases = [
    {
      title: "Market Research",
      description: "Quickly gather insights on healthcare markets, competitors, and opportunities.",
      example: "What's the average bed count for hospitals in Texas?"
    },
    {
      title: "Due Diligence",
      description: "Analyze facility profiles, ownership changes, and financial indicators.",
      example: "Show me all facilities acquired by HCA Healthcare last year"
    },
    {
      title: "Strategic Planning",
      description: "Identify growth opportunities and underserved markets.",
      example: "Where are the gaps in mental health facilities nationwide?"
    }
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      
      {/* Three.js Background Animation */}
      <div className="fixed inset-0 opacity-15 pointer-events-none z-0">
        <Suspense fallback={null}>
          <ParticleBackground 
            particleCount={400} 
            color="#8B5CF6" 
            speed={0.0003}
          />
        </Suspense>
      </div>

      <div className="container py-12 relative z-10">
        {/* Hero Section */}
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300 px-4 py-2 rounded-full mb-6 glass">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Powered by GPT-4 + Hybrid RAG</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Context-Aware AI Assistant
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Get instant insights, analysis, and data exploration powered by advanced AI. 
            Now with full access to entity graphs, intent data, call history, and market intelligence.
          </p>

          {/* Context Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <Badge variant="outline" className="gap-2 px-3 py-1.5">
              <Network className="h-3 w-3 text-blue-500" />
              {totalNodes} Graph Entities
            </Badge>
            <Badge variant="outline" className="gap-2 px-3 py-1.5">
              <Target className="h-3 w-3 text-yellow-500" />
              {totalCompanies} Intent Leads
            </Badge>
            <Badge variant="outline" className="gap-2 px-3 py-1.5">
              <Phone className="h-3 w-3 text-green-500" />
              {totalCalls} Calls Logged
            </Badge>
            <Badge variant="outline" className="gap-2 px-3 py-1.5">
              <Database className="h-3 w-3 text-purple-500" />
              6M+ Facilities
            </Badge>
          </div>

          {/* Interactive Query Box */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask anything about healthcare facilities..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                  className="text-base"
                />
                <Button onClick={handleQuery} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-pulse" />
                      Processing
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Ask
                    </>
                  )}
                </Button>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Try:</span>
                {suggestedQueries.slice(0, 2).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery(suggestion.text)}
                    className="text-xs"
                  >
                    {suggestion.text}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/search">
              <Button size="lg" variant="outline">
                Try with Search Data
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg">
                Start Free Trial
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Key Capabilities */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Key Capabilities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((capability, index) => (
              <Card key={index} className="card-hover">
                <CardHeader>
                  <capability.icon className={`h-10 w-10 ${capability.color} mb-4`} />
                  <CardTitle className="text-lg">{capability.title}</CardTitle>
                  <CardDescription>{capability.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Common Use Cases</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {useCases.map((useCase, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{useCase.title}</CardTitle>
                  <CardDescription>{useCase.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm italic text-muted-foreground">
                      "{useCase.example}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features List */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">What Makes Our AI Special</h2>
          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Healthcare-Trained</CardTitle>
                <CardDescription>
                  Fine-tuned on healthcare-specific data and terminology for accurate, relevant responses
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Real-Time Data</CardTitle>
                <CardDescription>
                  Access to live facility data with 50K+ daily updates for current insights
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Multi-Turn Conversations</CardTitle>
                <CardDescription>
                  Context-aware conversations that remember previous queries for deeper analysis
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Source Citations</CardTitle>
                <CardDescription>
                  Every answer includes data sources and references for verification
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export & Share</CardTitle>
                <CardDescription>
                  Save conversations, export insights, and share findings with your team
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Privacy First</CardTitle>
                <CardDescription>
                  Your queries and conversations are private, secure, and never used for training
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950 border-primary-200 dark:border-primary-800">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Brain className="h-16 w-16 text-primary-500" />
              </div>
              <CardTitle className="text-2xl mb-4">
                Experience the Future of Healthcare Intelligence
              </CardTitle>
              <CardDescription className="text-base">
                Start using our AI Assistant today with a free trial. No credit card required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg">
                    Get Started Free
                    <Sparkles className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/search">
                  <Button size="lg" variant="outline">
                    See It In Action
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

