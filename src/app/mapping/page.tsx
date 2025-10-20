"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { Navbar } from "@/components/shared/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Globe, 
  MapPin, 
  Layers, 
  Filter, 
  Download,
  TrendingUp,
  Users,
  Building2,
  ArrowRight,
  Sparkles,
  Target
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ParticleBackground, FloatingSphere } from "@/components/three"

export default function MappingPage() {
  const [selectedView, setSelectedView] = useState("heatmap")

  const features = [
    {
      icon: MapPin,
      title: "Facility Locations",
      description: "Visualize all 6M+ healthcare facilities on an interactive map with precise geolocation data.",
      color: "text-primary-500"
    },
    {
      icon: Layers,
      title: "Data Layers",
      description: "Toggle between demographics, market data, competition analysis, and more with custom overlays.",
      color: "text-secondary-500"
    },
    {
      icon: Filter,
      title: "Advanced Filtering",
      description: "Apply sophisticated filters by type, size, ownership, accreditation, and service lines.",
      color: "text-accent-500"
    },
    {
      icon: TrendingUp,
      title: "Market Analysis",
      description: "Identify trends, gaps, and opportunities with density maps and growth indicators.",
      color: "text-primary-500"
    }
  ]

  const useCases = [
    {
      title: "Site Selection",
      description: "Find optimal locations for new facilities based on demographics, competition, and market demand.",
      metrics: ["Population density", "Competitor analysis", "Service gaps"]
    },
    {
      title: "Territory Planning",
      description: "Define and analyze sales territories with custom boundaries and market segments.",
      metrics: ["Coverage areas", "Travel time", "Market size"]
    },
    {
      title: "Market Research",
      description: "Understand market dynamics with visual analysis of facility distribution and trends.",
      metrics: ["Facility density", "Growth patterns", "Market share"]
    }
  ]

  const mapViews = [
    {
      id: "heatmap",
      name: "Heat Map",
      description: "Visualize facility density and market concentration"
    },
    {
      id: "clusters",
      name: "Clusters",
      description: "Group nearby facilities for easier navigation"
    },
    {
      id: "markers",
      name: "Individual Markers",
      description: "See each facility as a separate pin"
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
            color="#10B981" 
            speed={0.0003}
          />
        </Suspense>
      </div>
      
      {/* Floating Sphere - Decorative Element */}
      <div className="fixed right-0 bottom-20 opacity-10 pointer-events-none z-0 hidden xl:block">
        <Suspense fallback={null}>
          <FloatingSphere 
            size={350} 
            color="#10B981" 
          />
        </Suspense>
      </div>

      <div className="container py-12 relative z-10">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full mb-6">
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium">Interactive Mapping Platform</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Geographic Mapping & Market Intelligence
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Visualize healthcare facilities with interactive maps. Analyze demographics, 
            identify market opportunities, and make location-based decisions with confidence.
          </p>

          {/* Map Preview Placeholder */}
          <Card className="mb-8">
            <CardContent className="p-0">
              <div className="relative bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-lg overflow-hidden" style={{ height: "400px" }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Globe className="h-20 w-20 text-primary-500 mx-auto animate-pulse" />
                    <p className="text-lg font-medium">Interactive Map View</p>
                    <p className="text-sm text-muted-foreground">Real-time facility mapping with multiple data layers</p>
                    
                    <div className="flex gap-2 justify-center pt-4">
                      {mapViews.map((view) => (
                        <Button
                          key={view.id}
                          variant={selectedView === view.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedView(view.id)}
                        >
                          {view.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Decorative map elements */}
                <div className="absolute top-8 left-8">
                  <MapPin className="h-8 w-8 text-red-500 animate-bounce" />
                </div>
                <div className="absolute bottom-12 right-12">
                  <MapPin className="h-8 w-8 text-blue-500 animate-bounce" style={{ animationDelay: "0.5s" }} />
                </div>
                <div className="absolute top-24 right-24">
                  <MapPin className="h-8 w-8 text-green-500 animate-bounce" style={{ animationDelay: "1s" }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/search">
              <Button size="lg" variant="outline">
                View with Data
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
          <h2 className="text-3xl font-bold text-center mb-12">Mapping Features</h2>
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

        {/* Use Cases */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Use Cases</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {useCases.map((useCase, index) => (
              <Card key={index}>
                <CardHeader>
                  <Target className="h-8 w-8 text-primary-500 mb-4" />
                  <CardTitle>{useCase.title}</CardTitle>
                  <CardDescription>{useCase.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Key Metrics:</p>
                    <div className="flex flex-wrap gap-2">
                      {useCase.metrics.map((metric, idx) => (
                        <Badge key={idx} variant="secondary">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Data Layers */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Available Data Layers</h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-secondary-500 mb-2" />
                <CardTitle className="text-lg">Demographics</CardTitle>
                <CardDescription>
                  Population density, age distribution, income levels, insurance coverage, and health indicators
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Building2 className="h-8 w-8 text-primary-500 mb-2" />
                <CardTitle className="text-lg">Facilities</CardTitle>
                <CardDescription>
                  Hospitals, clinics, urgent care, nursing homes, and specialized care centers by type
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-accent-500 mb-2" />
                <CardTitle className="text-lg">Market Trends</CardTitle>
                <CardDescription>
                  Growth rates, M&A activity, new facility openings, and market share changes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Layers className="h-8 w-8 text-secondary-500 mb-2" />
                <CardTitle className="text-lg">Service Areas</CardTitle>
                <CardDescription>
                  Drive time analysis, catchment areas, service line coverage, and accessibility metrics
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Technical Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Technical Capabilities</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary-500" />
                  Export & Share
                </CardTitle>
                <CardDescription>
                  Export maps as images or PDFs. Share custom map views with colleagues and stakeholders.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5 text-secondary-500" />
                  Multiple Basemaps
                </CardTitle>
                <CardDescription>
                  Switch between street, satellite, terrain, and dark mode map views for different use cases.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5 text-accent-500" />
                  Custom Boundaries
                </CardTitle>
                <CardDescription>
                  Draw custom regions, define territories, and create service areas with precision tools.
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
                <Globe className="h-16 w-16 text-primary-500" />
              </div>
              <CardTitle className="text-2xl mb-4">
                Start Mapping Your Healthcare Market
              </CardTitle>
              <CardDescription className="text-base">
                Get access to interactive mapping tools with your free trial. Visualize opportunities today.
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

