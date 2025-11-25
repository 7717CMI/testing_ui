"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { Navbar } from "@/components/shared/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp,
  Download,
  Share2,
  Filter,
  Calendar,
  ArrowRight,
  Sparkles,
  Activity,
  Target,
  Layers
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ParticleBackground, FloatingSphere } from "@/components/three"

export default function AnalyticsPage() {
  const [selectedChart, setSelectedChart] = useState("trend")

  const features = [
    {
      icon: BarChart3,
      title: "Interactive Charts",
      description: "Visualize data with bar charts, line graphs, pie charts, and more. Drill down for deeper insights.",
      color: "text-primary-500"
    },
    {
      icon: TrendingUp,
      title: "Trend Analysis",
      description: "Track changes over time with powerful trend visualization and forecasting capabilities.",
      color: "text-secondary-500"
    },
    {
      icon: Filter,
      title: "Custom Dashboards",
      description: "Create personalized dashboards with the metrics that matter most to your organization.",
      color: "text-accent-500"
    },
    {
      icon: Download,
      title: "Export Reports",
      description: "Download charts, tables, and full reports in multiple formats (PDF, Excel, CSV).",
      color: "text-primary-500"
    }
  ]

  const chartTypes = [
    {
      id: "trend",
      icon: LineChart,
      name: "Trend Analysis",
      description: "Visualize changes over time"
    },
    {
      id: "comparison",
      icon: BarChart3,
      name: "Comparative Analysis",
      description: "Compare facilities and markets"
    },
    {
      id: "distribution",
      icon: PieChart,
      name: "Distribution Charts",
      description: "Understand data composition"
    }
  ]

  const metrics = [
    {
      category: "Facility Metrics",
      items: [
        "Bed count and utilization",
        "Patient volume trends",
        "Service line mix",
        "Quality scores and ratings"
      ]
    },
    {
      category: "Market Metrics",
      items: [
        "Market share analysis",
        "Competitor benchmarking",
        "Growth rates by region",
        "Demographic trends"
      ]
    },
    {
      category: "Financial Metrics",
      items: [
        "Revenue trends",
        "Cost per bed",
        "Profitability indicators",
        "M&A valuations"
      ]
    }
  ]

  const useCases = [
    {
      title: "Executive Reporting",
      description: "Create comprehensive executive dashboards with KPIs and visual summaries for leadership.",
      icon: Target,
      features: ["Real-time updates", "Custom metrics", "Automated reports"]
    },
    {
      title: "Competitive Analysis",
      description: "Benchmark your facilities against competitors with side-by-side comparisons and market analysis.",
      icon: Activity,
      features: ["Peer comparisons", "Market positioning", "Share trends"]
    },
    {
      title: "Portfolio Management",
      description: "Monitor multiple facilities across your portfolio with unified analytics and performance tracking.",
      icon: Layers,
      features: ["Multi-site views", "Rollup metrics", "Alerts & notifications"]
    }
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      
      {/* Three.js Background Animations */}
      <div className="fixed inset-0 opacity-15 pointer-events-none z-0">
        <Suspense fallback={null}>
          <ParticleBackground 
            particleCount={400} 
            color="#8B5CF6" 
            speed={0.0003}
          />
        </Suspense>
      </div>
      
      {/* Floating Sphere - Decorative Element */}
      <div className="fixed left-0 top-40 opacity-10 pointer-events-none z-0 hidden xl:block">
        <Suspense fallback={null}>
          <FloatingSphere 
            size={350} 
            color="#8B5CF6" 
          />
        </Suspense>
      </div>

      <div className="container py-12 relative z-10">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300 px-4 py-2 rounded-full mb-6">
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm font-medium">Advanced Analytics Engine</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Advanced Analytics & Visualization
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Transform healthcare data into actionable insights with interactive charts, 
            custom dashboards, and powerful analytics tools built for decision-makers.
          </p>

          {/* Chart Preview Placeholder */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="mb-6 flex flex-wrap justify-center gap-2">
                {chartTypes.map((chart) => (
                  <Button
                    key={chart.id}
                    variant={selectedChart === chart.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedChart(chart.id)}
                    className="flex items-center gap-2"
                  >
                    <chart.icon className="h-4 w-4" />
                    {chart.name}
                  </Button>
                ))}
              </div>

              <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg overflow-hidden p-8" style={{ height: "350px" }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <BarChart3 className="h-20 w-20 text-primary-500 mx-auto animate-pulse" />
                    <p className="text-lg font-medium">Interactive Chart View</p>
                    <p className="text-sm text-muted-foreground">
                      {chartTypes.find(c => c.id === selectedChart)?.description}
                    </p>
                  </div>
                </div>

                {/* Decorative chart bars */}
                <div className="absolute bottom-8 left-1/4 w-12 bg-primary-500/30 animate-pulse" style={{ height: "120px" }} />
                <div className="absolute bottom-8 left-1/3 w-12 bg-secondary-500/30 animate-pulse" style={{ height: "160px", animationDelay: "0.5s" }} />
                <div className="absolute bottom-8 left-1/2 w-12 bg-accent-500/30 animate-pulse" style={{ height: "100px", animationDelay: "1s" }} />
                <div className="absolute bottom-8 right-1/3 w-12 bg-primary-500/30 animate-pulse" style={{ height: "140px", animationDelay: "1.5s" }} />
              </div>

              <div className="mt-6 flex justify-center gap-2">
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button size="sm" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date Range
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/search">
              <Button size="lg" variant="outline">
                View Sample Data
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
        </div>

        {/* Key Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Analytics Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover">
                <CardHeader>
                  <feature.icon className={`h-10 w-10 ${feature.color} mb-4`} />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Available Metrics */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Available Metrics</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{metric.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {metric.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-primary-500 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Use Cases</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {useCases.map((useCase, index) => (
              <Card key={index}>
                <CardHeader>
                  <useCase.icon className="h-8 w-8 text-primary-500 mb-4" />
                  <CardTitle>{useCase.title}</CardTitle>
                  <CardDescription>{useCase.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Key Features:</p>
                    <div className="flex flex-wrap gap-2">
                      {useCase.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Chart Types */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Visualization Types</h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <LineChart className="h-8 w-8 text-primary-500 mb-2" />
                <CardTitle className="text-lg">Time Series Charts</CardTitle>
                <CardDescription>
                  Track metrics over time with line charts, area charts, and sparklines. Identify trends and patterns.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-secondary-500 mb-2" />
                <CardTitle className="text-lg">Comparison Charts</CardTitle>
                <CardDescription>
                  Compare facilities, regions, or time periods with bar charts, column charts, and grouped visualizations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <PieChart className="h-8 w-8 text-accent-500 mb-2" />
                <CardTitle className="text-lg">Distribution Charts</CardTitle>
                <CardDescription>
                  Understand composition with pie charts, donut charts, and treemaps showing data breakdowns.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Activity className="h-8 w-8 text-primary-500 mb-2" />
                <CardTitle className="text-lg">Advanced Visualizations</CardTitle>
                <CardDescription>
                  Use scatter plots, bubble charts, heatmaps, and geographic visualizations for deep analysis.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Dashboard Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Dashboard Capabilities</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary-500" />
                  Customizable Layout
                </CardTitle>
                <CardDescription>
                  Drag and drop widgets, resize charts, and create the perfect dashboard for your workflow.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-secondary-500" />
                  Real-Time Updates
                </CardTitle>
                <CardDescription>
                  Dashboards update automatically with the latest data. Set refresh intervals from minutes to daily.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-accent-500" />
                  Collaboration
                </CardTitle>
                <CardDescription>
                  Share dashboards with teammates, export as PDF reports, or embed in presentations.
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
                <BarChart3 className="h-16 w-16 text-primary-500" />
              </div>
              <CardTitle className="text-2xl mb-4">
                Transform Data Into Insights
              </CardTitle>
              <CardDescription className="text-base">
                Start analyzing healthcare data with powerful visualizations. Free trial includes full analytics access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg">
                    Start Free Trial
                    <Sparkles className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/search">
                  <Button size="lg" variant="outline">
                    Explore Data
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

