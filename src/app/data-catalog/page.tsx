'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Building2,
  Activity,
  Search,
  Filter,
  Download,
  ArrowRight,
  Shield,
  AlertCircle,
  Database,
  Briefcase,
  Pill,
  Package,
  Home,
  FlaskConical,
  Building,
  Heart,
  Stethoscope,
  Syringe,
} from 'lucide-react'

interface CategoryInfo {
  id: number
  name: string
  display_name: string
  description?: string
  provider_count: number
  facility_types_count: number
}

interface DataCatalogOverview {
  total_providers: number
  total_categories: number
  total_facility_types: number
  categories: CategoryInfo[]
  last_updated: string
}

async function fetchCatalogOverview(): Promise<DataCatalogOverview> {
  const response = await fetch('/api/v1/catalog/overview')
  if (!response.ok) throw new Error('Failed to fetch catalog overview')
  return response.json()
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
}

const gradientTextVariants = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 3,
      ease: 'linear',
      repeat: Infinity,
    },
  },
}

// Category icon mapping
function getCategoryIcon(categoryName: string) {
  const iconMap: Record<string, React.ElementType> = {
    'clinic': Stethoscope,
    'clinics': Stethoscope,
    'agency': Briefcase,
    'agencies': Briefcase,
    'pharmacy': Pill,
    'pharmacies': Pill,
    'supplier': Package,
    'suppliers': Package,
    'assisted living': Home,
    'assisted-living': Home,
    'laboratory': FlaskConical,
    'laboratories': FlaskConical,
    'hospital': Building2,
    'hospitals': Building2,
    'home health agency': Heart,
    'hospice': Heart,
    'blood & eye banks': Syringe,
    'mental health units': Building,
  }
  
  const normalizedName = categoryName.toLowerCase()
  const Icon = iconMap[normalizedName] || Building2
  return Icon
}

function getCategorySlug(categoryName: string): string {
  if (categoryName.toLowerCase() === 'hospitals') return 'hospitals'
  return categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function DataCatalogPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: catalogData, isLoading, error } = useQuery({
    queryKey: ['catalog-overview'],
    queryFn: fetchCatalogOverview,
    staleTime: 5 * 60 * 1000,
  })

  const filteredCategories = catalogData?.categories?.filter(cat =>
    cat.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  function handleExportCSV() {
    if (!catalogData) {
      alert('No data to export')
      return
    }
    
    const headers = ['Category ID', 'Category Code', 'Category Name', 'Description', 'Provider Count', 'Facility Types Count']
    const csvRows = [
      headers.join(','),
      ...catalogData.categories.map(category => [
        category.id,
        `"${(category.name || '').replace(/"/g, '""')}"`,
        `"${(category.display_name || '').replace(/"/g, '""')}"`,
        `"${(category.description || '').replace(/"/g, '""')}"`,
        category.provider_count,
        category.facility_types_count
      ].join(','))
    ]
    
    csvRows.push('', 'Summary', `Total Providers,${catalogData.total_providers}`, `Total Categories,${catalogData.total_categories}`, `Last Updated,${catalogData.last_updated}`)
    
    const csvContent = csvRows.join('\n')
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'data-catalog-overview.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Failed to Load Data Catalog</h2>
          <p className="text-gray-600">Unable to connect to the database. Please try again later.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Glassmorphism Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/70 backdrop-blur-lg shadow-sm">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                <Activity className="h-6 w-6 text-blue-600" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HealthData AI
              </span>
          </Link>
            
          <div className="hidden md:flex items-center gap-6">
              {['Home', 'Data Catalog', 'Search', 'Insights'].map((item, index) => {
                const href = item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`
                const isActive = item === 'Data Catalog'
                return (
                  <Link 
                    key={item}
                    href={href}
                    className={`text-sm font-medium transition-all duration-200 relative ${
                      isActive 
                        ? 'text-blue-600' 
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    {item}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute -bottom-4 left-0 right-0 h-0.5 bg-blue-600"
                      />
                    )}
            </Link>
                )
              })}
          </div>
            
          <div className="flex items-center gap-3">
            <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                  Login
                </Button>
            </Link>
            <Link href="/signup">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Sign Up
                  </Button>
                </motion.div>
            </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto text-center space-y-6"
          >
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200">
              <Database className="h-3 w-3 mr-1" />
              Live Healthcare Data Catalog
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Healthcare Data
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Catalog
              </span>
            </h1>
            
            <div className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              {isLoading ? (
                <Skeleton className="h-6 w-96 mx-auto" />
              ) : (
                `Access ${(catalogData.total_providers / 1000).toLocaleString()}K+ verified healthcare records across ${catalogData.total_categories} facility categories. Real-time data directly from PostgreSQL.`
              )}
            </div>
            
            {/* Animated Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12">
              {[
                { label: 'Total Records', value: catalogData ? `${(catalogData.total_providers / 1000).toFixed(0)}K+` : '0' },
                { label: 'Categories', value: catalogData?.total_categories || 0 },
                { label: 'Facility Types', value: catalogData?.total_facility_types || 0 },
                { label: 'Live Data', value: '100%' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  className="text-center"
                >
                {isLoading ? (
                    <Skeleton className="h-12 w-16 mx-auto mb-2" />
                  ) : (
                    <motion.div
                      variants={gradientTextVariants}
                      animate="animate"
                      className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                      style={{ backgroundSize: '200% auto' }}
                    >
                      {stat.value}
                    </motion.div>
                  )}
                  <div className="text-sm text-gray-600 mt-2 font-medium">{stat.label}</div>
                </motion.div>
              ))}
              </div>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="py-6">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                  placeholder="Search healthcare facilities..."
                  className="pl-12 h-12 bg-white border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="h-12 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button 
                variant="outline" 
                  className="h-12 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                onClick={handleExportCSV}
                disabled={!catalogData}
              >
                <Download className="h-4 w-4 mr-2" />
                  Export
              </Button>
            </div>
          </div>
          </motion.div>
        </div>
      </section>

      {/* Custom Dataset CTA */}
      <section className="py-6">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Filter className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Build Your Custom Dataset
                    </h3>
                      <p className="text-gray-600 max-w-xl leading-relaxed">
                        Select categories, facility types, locations, and export only the data you need. Advanced filtering with real-time results.
                    </p>
                  </div>
                </div>
                <Link href="/data-catalog/custom">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg whitespace-nowrap">
                        Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                    </motion.div>
                </Link>
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      </section>

      {/* Data Catalog Grid */}
      <section className="py-12 pb-20">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by Category</h2>
            <p className="text-gray-600">Explore healthcare facilities organized by category</p>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="bg-white border-gray-200">
                  <CardContent className="p-8 space-y-4">
                    <div className="flex items-start justify-between">
                      <Skeleton className="w-14 h-14 rounded-xl" />
                      <Skeleton className="w-20 h-6 rounded-full" />
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredCategories.map((category) => {
                const Icon = getCategoryIcon(category.display_name)
                return (
                  <motion.div key={category.id} variants={cardVariants}>
                    <Link href={`/data-catalog/${getCategorySlug(category.display_name)}`}>
                      <motion.div
                        whileHover={{ y: -8, scale: 1.02 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="group relative"
                      >
                        <Card className="bg-white border-gray-200 hover:border-blue-200 hover:shadow-2xl transition-all duration-300 h-full">
                          <CardContent className="p-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                              <motion.div 
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                                className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg"
                              >
                                <Icon className="h-7 w-7 text-white" />
                              </motion.div>
                              <Badge className="rounded-full px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse">
                                <motion.span 
                                  initial={{ scale: 0.8 }}
                                  animate={{ scale: [0.8, 1.2, 0.8] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2"
                                />
                                LIVE
                      </Badge>
                    </div>

                            {/* Title & Count */}
                            <div className="space-y-3">
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {category.display_name}
                      </h3>
                              <motion.div
                                variants={gradientTextVariants}
                                animate="animate"
                                className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                                style={{ backgroundSize: '200% auto' }}
                              >
                        {category.provider_count.toLocaleString()}+
                              </motion.div>
                              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                        {category.description || `Healthcare facilities in the ${category.display_name.toLowerCase()} category`}
                      </p>
                    </div>

                    {/* Metadata */}
                            <div className="pt-4 border-t border-gray-100">
                              <div className="flex items-center justify-between text-xs font-medium">
                                <span className="text-gray-500">{category.facility_types_count} Types</span>
                                <span className="text-emerald-600">Real-time</span>
                      </div>
                    </div>

                            {/* Floating Action Button */}
                            <motion.div
                              className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <ArrowRight className="h-5 w-5 text-white" />
                            </motion.div>
                  </CardContent>
                </Card>
                      </motion.div>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/70 backdrop-blur-lg py-12">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span className="font-bold text-gray-900">HealthData AI</span>
            </div>
            <div className="text-sm text-gray-600 text-center">
              © 2025 HealthData AI | Real-time data from PostgreSQL
            </div>
            <div className="flex items-center gap-4">
              <Shield className="h-5 w-5 text-gray-400" />
              <span className="text-xs text-gray-500">SOC 2 Type II | HIPAA Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
