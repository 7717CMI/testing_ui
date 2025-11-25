"use client"

import { Suspense } from "react"
import Link from "next/link"
import { Navbar } from "@/components/shared/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Shield, 
  CheckCircle2, 
  Database,
  RefreshCw,
  Users,
  FileCheck,
  Lock,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Clock,
  Target
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ParticleBackground } from "@/components/three"

export default function VerifiedDataPage() {
  const verificationSteps = [
    {
      step: "1",
      title: "Automated Collection",
      description: "Data is collected from multiple authoritative sources including CMS, state agencies, and facility records.",
      icon: Database
    },
    {
      step: "2",
      title: "Cross-Validation",
      description: "Multiple sources are cross-referenced to ensure accuracy and identify discrepancies.",
      icon: RefreshCw
    },
    {
      step: "3",
      title: "Expert Review",
      description: "Healthcare data specialists review and verify complex cases and unusual patterns.",
      icon: Users
    },
    {
      step: "4",
      title: "Quality Assurance",
      description: "Final automated and manual checks ensure data meets our 99.9% accuracy standard.",
      icon: CheckCircle2
    }
  ]

  const dataPoints = [
    {
      category: "Facility Information",
      icon: FileCheck,
      items: [
        "Official facility names and DBAs",
        "Physical locations and addresses",
        "License numbers and types",
        "Operating status and dates"
      ]
    },
    {
      category: "Operational Data",
      icon: Clock,
      items: [
        "Bed counts and utilization",
        "Service lines and specialties",
        "Accreditation status",
        "Quality ratings and scores"
      ]
    },
    {
      category: "Ownership & Financial",
      icon: Target,
      items: [
        "Ownership structure",
        "Parent organizations",
        "M&A transaction history",
        "Financial indicators"
      ]
    }
  ]

  const sources = [
    {
      name: "Centers for Medicare & Medicaid Services",
      abbrev: "CMS",
      type: "Federal"
    },
    {
      name: "State Health Departments",
      abbrev: "SHD",
      type: "State"
    },
    {
      name: "The Joint Commission",
      abbrev: "TJC",
      type: "Accreditation"
    },
    {
      name: "American Hospital Association",
      abbrev: "AHA",
      type: "Industry"
    }
  ]

  const qualityMetrics = [
    {
      metric: "99.9%",
      label: "Data Accuracy",
      description: "Verified against multiple sources"
    },
    {
      metric: "50K+",
      label: "Daily Updates",
      description: "Fresh data every 24 hours"
    },
    {
      metric: "6M+",
      label: "Facilities Tracked",
      description: "Comprehensive coverage"
    },
    {
      metric: "24/7",
      label: "Quality Monitoring",
      description: "Continuous validation"
    }
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      
      {/* Three.js Background Animation */}
      <div className="fixed inset-0 opacity-15 pointer-events-none z-0">
        <Suspense fallback={null}>
          <ParticleBackground 
            particleCount={350} 
            color="#10B981" 
            speed={0.0003}
          />
        </Suspense>
      </div>

      <div className="container py-12 relative z-10">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300 px-4 py-2 rounded-full mb-6">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Industry-Leading Data Quality</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Verified, Accurate, Reliable Data
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Trust your decisions with healthcare data that undergoes rigorous verification. 
            Our comprehensive process ensures 99.9% accuracy across all data points.
          </p>

          {/* Quality Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {qualityMetrics.map((item, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="text-3xl font-bold text-primary-500">{item.metric}</div>
                  <CardTitle className="text-sm">{item.label}</CardTitle>
                  <CardDescription className="text-xs">{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/search">
              <Button size="lg" variant="outline">
                Explore Verified Data
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

        {/* Verification Process */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Verification Process</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {verificationSteps.map((step, index) => (
              <Card key={index} className="card-hover relative">
                <CardHeader>
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                  <step.icon className="h-10 w-10 text-primary-500 mb-4" />
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Verified Data Points */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">What We Verify</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {dataPoints.map((point, index) => (
              <Card key={index}>
                <CardHeader>
                  <point.icon className="h-8 w-8 text-secondary-500 mb-4" />
                  <CardTitle>{point.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {point.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Data Sources */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Trusted Data Sources</h2>
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center mb-6">We aggregate and verify data from multiple authoritative sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {sources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{source.name}</p>
                        <p className="text-sm text-muted-foreground">{source.abbrev}</p>
                      </div>
                      <Badge variant="secondary">{source.type}</Badge>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground text-center mt-6">
                  + dozens of additional state and federal sources
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quality Guarantees */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Quality Guarantee</h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <RefreshCw className="h-8 w-8 text-primary-500 mb-2" />
                <CardTitle className="text-lg">Daily Updates</CardTitle>
                <CardDescription>
                  Over 50,000 data points are refreshed daily to ensure you always have the most current information.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <AlertTriangle className="h-8 w-8 text-accent-500 mb-2" />
                <CardTitle className="text-lg">Change Alerts</CardTitle>
                <CardDescription>
                  Get notified immediately when key facility data changes, including ownership, status, or accreditation.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Lock className="h-8 w-8 text-secondary-500 mb-2" />
                <CardTitle className="text-lg">Data Security</CardTitle>
                <CardDescription>
                  Enterprise-grade security with SOC 2 compliance. Your data and queries are always protected.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <FileCheck className="h-8 w-8 text-primary-500 mb-2" />
                <CardTitle className="text-lg">Audit Trail</CardTitle>
                <CardDescription>
                  Every data point includes source attribution and verification timestamps for complete transparency.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Our Data Stands Out</h2>
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Multi-Source Verification</p>
                      <p className="text-sm text-muted-foreground">Every data point is cross-checked against multiple authoritative sources</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Human-in-the-Loop</p>
                      <p className="text-sm text-muted-foreground">Healthcare specialists review complex cases and edge scenarios</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Continuous Monitoring</p>
                      <p className="text-sm text-muted-foreground">24/7 automated systems detect and flag data anomalies instantly</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Transparent Sourcing</p>
                      <p className="text-sm text-muted-foreground">See exactly where each data point comes from with full attribution</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950 border-primary-200 dark:border-primary-800">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Shield className="h-16 w-16 text-primary-500" />
              </div>
              <CardTitle className="text-2xl mb-4">
                Experience Data You Can Trust
              </CardTitle>
              <CardDescription className="text-base">
                Start your free trial and see the difference verified data makes in your decision-making.
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
                    Browse Facilities
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

