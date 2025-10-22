'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  Search, 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe,
  BarChart3,
  Brain,
  Check,
  Filter,
  Database
} from "lucide-react"
import { ParticleBackground } from "@/components/three/particle-background"
import { NeuralNetwork } from "@/components/three/neural-network"
import { FloatingSphere } from "@/components/three/floating-sphere"
import { DNAHelix } from "@/components/three/dna-helix"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary-50/5 to-muted dark:via-primary-950/10">
      {/* Navigation */}
      <motion.nav 
        className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left side: Logo + Navigation */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Building2 className="h-6 w-6 text-primary-500" />
                </motion.div>
                <span className="font-bold text-xl gradient-text">HealthData</span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-sm font-medium text-gray-900 dark:text-white">
                  Home
                </Link>
                <Link href="/data-catalog" className="text-sm font-medium text-gray-600 hover:text-primary-500 transition-colors">
                  Data Catalog
                </Link>
                <Link href="/search" className="text-sm font-medium text-gray-600 hover:text-primary-500 transition-colors">
                  Search
                </Link>
                <Link href="/insights" className="text-sm font-medium text-gray-600 hover:text-primary-500 transition-colors">
                  Insights
                </Link>
              </div>
            </div>
            {/* Right side: Auth buttons */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 lg:py-32 relative overflow-hidden">
        {/* Three.js Background Animation */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <ParticleBackground particleCount={800} color="#3B82F6" speed={0.0003} />
        </div>
        
        <motion.div 
          className="flex flex-col items-center text-center gap-4 sm:gap-6 md:gap-8 relative z-10 max-w-7xl mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="secondary" className="px-3 py-1.5 sm:px-4 sm:py-2 glass text-xs sm:text-sm">
              Over 6M healthcare facilities indexed
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight max-w-5xl px-4"
            variants={fadeInUp}
          >
            Healthcare Data.{" "}
            <span className="gradient-text">Reimagined.</span>
          </motion.h1>
          
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl px-4"
            variants={fadeInUp}
          >
            Next-generation intelligence platform for U.S. healthcare providers. 
            Real-time insights, AI-powered search, and comprehensive facility data 
            at your fingertips.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 sm:mt-4 w-full sm:w-auto px-4"
            variants={fadeInUp}
          >
            <Link href="/signup" className="w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                <Button size="lg" className="w-full sm:w-auto gradient-primary">
                  Start Free Trial
                  <Zap className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/search" className="w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Explore Insights
                  <TrendingUp className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Stats Ticker */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-12 md:mt-16 w-full max-w-5xl relative px-4"
            variants={staggerContainer}
          >
            {/* Decorative Floating Spheres */}
            <div className="absolute -top-20 -left-20 opacity-15 pointer-events-none hidden md:block">
              <FloatingSphere size={150} color="#F59E0B" />
            </div>
            <div className="absolute -bottom-20 -right-20 opacity-15 pointer-events-none hidden md:block">
              <FloatingSphere size={150} color="#8B5CF6" />
            </div>
            <motion.div className="space-y-1 sm:space-y-2" variants={fadeInUp}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-500 counter-animate">6M+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Facilities Tracked</div>
            </motion.div>
            <motion.div className="space-y-1 sm:space-y-2" variants={fadeInUp}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary-500 counter-animate">99.9%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Data Accuracy</div>
            </motion.div>
            <motion.div className="space-y-1 sm:space-y-2" variants={fadeInUp}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 counter-animate">50K+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Daily Updates</div>
            </motion.div>
            <motion.div className="space-y-1 sm:space-y-2" variants={fadeInUp}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-500 counter-animate">24/7</div>
              <div className="text-xs sm:text-sm text-muted-foreground">AI Support</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24 bg-background/50 relative overflow-hidden">
        {/* Three.js Decorative Elements */}
        <div className="absolute top-10 right-10 opacity-20 pointer-events-none hidden lg:block">
          <FloatingSphere size={250} color="#10B981" />
        </div>
        <div className="absolute bottom-10 left-10 opacity-20 pointer-events-none hidden lg:block">
          <NeuralNetwork width={400} height={300} />
        </div>
        
        <div className="text-center mb-8 sm:mb-12 md:mb-16 relative z-10 max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-4">
            Everything you need to make informed decisions
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
            Powerful tools built for healthcare intelligence professionals
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 relative z-10 max-w-7xl mx-auto">
          <Link href="/intent" className="block">
            <Card className="card-hover h-full cursor-pointer transition-all hover:border-accent-300 dark:hover:border-accent-700">
              <CardHeader>
                <Zap className="h-10 w-10 sm:h-12 sm:w-12 text-accent-500 mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">Intent Signals</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Identify in-market companies showing active research behavior across healthcare topics
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/search" className="block">
            <Card className="card-hover h-full cursor-pointer transition-all hover:border-primary-300 dark:hover:border-primary-700">
              <CardHeader>
                <Search className="h-10 w-10 sm:h-12 sm:w-12 text-primary-500 mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">Advanced Search</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Lightning-fast search across millions of healthcare facilities with intelligent filtering
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/filtering" className="block">
            <Card className="card-hover h-full cursor-pointer transition-all hover:border-orange-300 dark:hover:border-orange-700">
              <CardHeader>
                <Filter className="h-10 w-10 sm:h-12 sm:w-12 text-orange-500 mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">Advanced Filtering</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Filter by 50+ attributes including location, bed count, ownership, and specialties
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/data-catalog" className="block">
            <Card className="card-hover h-full cursor-pointer transition-all hover:border-blue-300 dark:hover:border-blue-700">
              <CardHeader>
                <Database className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500 mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">Data Catalog</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Browse 6M+ verified healthcare records across 12 facility categories with detailed breakdowns
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/ai-assistant" className="block">
            <Card className="card-hover h-full cursor-pointer transition-all hover:border-secondary-300 dark:hover:border-secondary-700">
              <CardHeader>
                <Brain className="h-10 w-10 sm:h-12 sm:w-12 text-secondary-500 mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">AI Assistant</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  GPT-4 powered assistant for instant insights, analysis, and data exploration
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/insights" className="block">
            <Card className="card-hover h-full cursor-pointer transition-all hover:border-accent-300 dark:hover:border-accent-700">
              <CardHeader>
                <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-accent-500 mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">Real-Time Insights</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Stay ahead with live updates on M&A activity, funding, and market trends
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/mapping" className="block">
            <Card className="card-hover h-full cursor-pointer transition-all hover:border-primary-300 dark:hover:border-primary-700">
              <CardHeader>
                <Globe className="h-10 w-10 sm:h-12 sm:w-12 text-primary-500 mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">Geographic Mapping</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Interactive maps with facility locations, demographics, and market analysis
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/analytics" className="block">
            <Card className="card-hover h-full cursor-pointer transition-all hover:border-secondary-300 dark:hover:border-secondary-700">
              <CardHeader>
                <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-secondary-500 mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">Advanced Analytics</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Interactive charts and visualizations for deep data analysis
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/verified-data" className="block">
            <Card className="card-hover h-full cursor-pointer transition-all hover:border-accent-300 dark:hover:border-accent-700">
              <CardHeader>
                <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-accent-500 mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">Verified Data</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Comprehensive verification process ensuring data quality and accuracy
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container py-24 relative overflow-hidden">
        {/* Three.js DNA Helix Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden xl:block">
          <DNAHelix width={500} height={700} />
        </div>
        
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose your plan
          </h2>
          <p className="text-xl text-muted-foreground">
            Flexible pricing for teams of all sizes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative z-10">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription className="mt-4">
                Perfect for exploring the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/signup">
                <Button variant="outline" className="w-full mb-6">
                  Get Started
                </Button>
              </Link>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">100 searches/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">Basic facility data</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">Limited insights access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">Community support</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative border-primary-500 border-2">
            <div className="absolute -top-4 left-0 right-0 flex justify-center">
              <Badge className="bg-primary-500 text-white">Most Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription className="mt-4">
                For professionals who need more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/signup">
                <Button className="w-full mb-6">
                  Start Free Trial
                </Button>
              </Link>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">Unlimited searches</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">Full facility profiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">All insights & analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">AI assistant access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">Export to CSV</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-2xl">Enterprise</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <CardDescription className="mt-4">
                For large teams and organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/contact">
                <Button variant="outline" className="w-full mb-6">
                  Contact Sales
                </Button>
              </Link>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">Everything in Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">API access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">Custom integrations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">Dedicated support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">SLA guarantee</span>
          </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">Training & onboarding</span>
          </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/50 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary-500" />
                <span className="font-bold">HealthData</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Next-generation healthcare intelligence platform
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/search" className="hover:text-foreground">Search</Link></li>
                <li><Link href="/insights" className="hover:text-foreground">Insights</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="/api" className="hover:text-foreground">API</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-foreground">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
                <li><Link href="/security" className="hover:text-foreground">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2025 HealthData Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
