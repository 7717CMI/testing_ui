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
import { Navbar } from '@/components/shared/navbar'
import { PremiumGuard } from '@/components/premium/premium-guard'
import { ScrollReveal } from '@/components/animations/scroll-reveal'
import { StaggeredList } from '@/components/animations/staggered-list'
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
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Failed to Load Data Catalog</h2>
          <p className="text-neutral-600 dark:text-neutral-400">Unable to connect to the database. Please try again later.</p>
          <Button onClick={() => window.location.reload()} className="bg-primary-700 hover:bg-primary-800">Retry</Button>
        </div>
      </div>
    )
  }

  // Create preview content for free users
  const previewContent = (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <div className="container mx-auto px-4 lg:px-8 py-12 max-w-7xl">
          {/* Page Header Section */}
          <div className="mb-12 pb-8 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight mb-3">
                  Healthcare Intelligence Database
                </h1>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
                  Comprehensive data on over {catalogData?.total_providers.toLocaleString() || '650,000'} healthcare facilities across the United States. Search, filter, and analyze organizations to power your market intelligence.
                </p>
              </div>
              <div className="flex gap-8 lg:gap-12">
                <div>
                  <div className="text-3xl font-bold text-primary-800 dark:text-primary-400 tracking-tight tabular-nums">
                    {Math.round((catalogData?.total_providers || 650000) / 1000)}K+
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-500 font-medium uppercase tracking-wider mt-1">
                    Total Facilities
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary-800 dark:text-primary-400 tracking-tight tabular-nums">
                    {catalogData?.total_categories || 10}
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-500 font-medium uppercase tracking-wider mt-1">
                    Facility Types
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary-800 dark:text-primary-400 tracking-tight">
                    Daily
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-500 font-medium uppercase tracking-wider mt-1">
                    Data Updates
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Export Controls */}
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-400 dark:text-neutral-500" />
                <Input
                  placeholder="Search facility categories..."
                  className="w-full pl-11 pr-4 py-3 text-[15px] border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900"
                  disabled
                />
              </div>
              <Button variant="outline" disabled className="px-4 py-3">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          {/* Data Catalog Grid Preview */}
          <ScrollReveal>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Browse by Category</h2>
              <p className="text-neutral-600 dark:text-neutral-400">Explore healthcare facilities organized by category</p>
            </div>
          </ScrollReveal>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.2,
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {Array.from({ length: 6 }).map((_, index) => {
              const Icon = Building2
              return (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        duration: 0.5,
                        ease: [0.33, 1, 0.68, 1],
                      },
                    },
                  }}
                  whileHover={{
                    y: -6,
                    scale: 1.02,
                    transition: {
                      duration: 0.2,
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    },
                  }}
                >
                  <Card className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl transition-all duration-300 hover:shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-5">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className="flex items-center justify-center w-12 h-12 bg-neutral-100 dark:bg-neutral-700 rounded-xl flex-shrink-0"
                        >
                          <Icon className="w-6 h-6 text-primary-700 dark:text-primary-400 stroke-[2]" />
                        </motion.div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-success-600 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                            Updated Daily
                          </span>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2 tracking-tight">
                        Category Name
                      </h3>
                      <div className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mb-3 tabular-nums">
                        XXX,XXX
                      </div>
                      <p className="text-[15px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-5 line-clamp-2">
                        Healthcare facilities in this category
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700 text-[13px]">
                        <span className="text-neutral-500 dark:text-neutral-400 font-medium">
                          X facility types
                        </span>
                        <div className="flex items-center gap-1.5 text-success-700 dark:text-success-500 font-medium">
                          <div className="w-1 h-1 bg-success-600 rounded-full"></div>
                          Real-time data
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </>
  )

  return (
    <PremiumGuard
      featureName="Data Catalog"
      featureDescription="The Data Catalog provides comprehensive access to over 650,000 healthcare facilities across the United States. Browse facilities by category, search and filter by location and type, and export data for analysis. This powerful tool helps you discover healthcare providers, analyze market trends, and make data-driven decisions."
      benefits={[
        "Browse 650K+ healthcare facilities",
        "Advanced filtering and search",
        "Export data as CSV",
        "Real-time data updates",
        "Detailed facility information"
      ]}
      showPreview={true}
      previewContent={previewContent}
    >
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* Page Container */}
        <div className="container mx-auto px-4 lg:px-8 py-12 max-w-7xl">
        
        {/* Page Header Section */}
        <div className="mb-12 pb-8 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            {/* Left: Title & Description */}
            <div className="flex-1">
              <h1 className="text-4xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight mb-3">
                Healthcare Intelligence Database
              </h1>
              {isLoading ? (
                <Skeleton className="h-6 w-96" />
              ) : (
                <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
                  Comprehensive data on over {catalogData?.total_providers.toLocaleString() || 0} healthcare facilities across the United States. Search, filter, and analyze organizations to power your market intelligence.
                </p>
              )}
            </div>
            
            {/* Right: Stats */}
            <div className="flex gap-8 lg:gap-12">
              <div>
                {isLoading ? (
                  <Skeleton className="h-10 w-20 mb-2" />
                ) : (
                  <div className="text-3xl font-bold text-primary-800 dark:text-primary-400 tracking-tight tabular-nums">
                    {Math.round((catalogData?.total_providers || 0) / 1000)}K+
                  </div>
                )}
                <div className="text-sm text-neutral-500 dark:text-neutral-500 font-medium uppercase tracking-wider mt-1">
                  Total Facilities
                </div>
              </div>
              
              <div>
                {isLoading ? (
                  <Skeleton className="h-10 w-16 mb-2" />
                ) : (
                  <div className="text-3xl font-bold text-primary-800 dark:text-primary-400 tracking-tight tabular-nums">
                    {catalogData?.total_categories || 0}
                  </div>
                )}
                <div className="text-sm text-neutral-500 dark:text-neutral-500 font-medium uppercase tracking-wider mt-1">
                  Facility Types
                </div>
              </div>
              
              <div>
                <div className="text-3xl font-bold text-primary-800 dark:text-primary-400 tracking-tight">
                  Daily
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-500 font-medium uppercase tracking-wider mt-1">
                  Data Updates
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Export Controls */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-400 dark:text-neutral-500" />
              <Input
                placeholder="Search facility categories..."
                className="w-full pl-11 pr-4 py-3 text-[15px] border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleExportCSV}
              disabled={!catalogData}
              className="px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-400 transition-all"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
          
          {searchQuery && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} found
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSearchQuery('')}
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Clear search
              </Button>
            </div>
          )}
        </div>

        {/* Custom Dataset CTA */}
        <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950 dark:to-accent-950 border border-primary-200 dark:border-primary-800 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-700 dark:bg-primary-600 flex items-center justify-center flex-shrink-0">
                <Filter className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Build Your Custom Dataset
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
                  Select categories, facility types, and locations to export only the data you need. Advanced filtering with real-time results.
                </p>
              </div>
            </div>
            <Link href="/data-catalog/custom">
              <Button className="bg-primary-700 hover:bg-primary-800 dark:bg-primary-600 dark:hover:bg-primary-700 shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap">
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Data Catalog Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Browse by Category</h2>
          <p className="text-neutral-600 dark:text-neutral-400">Explore healthcare facilities organized by category</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <Skeleton className="w-20 h-5 rounded-full" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.1,
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCategories.map((category, index) => {
              const Icon = getCategoryIcon(category.display_name)
              return (
                <motion.div
                  key={category.id}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        duration: 0.5,
                        ease: [0.33, 1, 0.68, 1],
                      },
                    },
                  }}
                  whileHover={{
                    y: -6,
                    scale: 1.02,
                    transition: {
                      duration: 0.2,
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    },
                  }}
                >
                  <Link href={`/data-catalog/${getCategorySlug(category.display_name)}`}>
                    <Card className="group relative bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl transition-all duration-300 hover:shadow-xl cursor-pointer h-full">
                    
                    {/* Accent line on hover */}
                    <div className="absolute left-0 top-0 bottom-0 w-0 bg-primary-600 dark:bg-primary-500 rounded-l-xl transition-all duration-300 group-hover:w-1"></div>
                    
                    <CardContent className="p-6">
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-5">
                        {/* Icon */}
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className="flex items-center justify-center w-12 h-12 bg-neutral-100 dark:bg-neutral-700 rounded-xl flex-shrink-0"
                        >
                          <Icon className="w-6 h-6 text-primary-700 dark:text-primary-400 stroke-[2]" />
                        </motion.div>
                        
                        {/* Status Indicator */}
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-success-600 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                            Updated Daily
                          </span>
                        </div>
                      </div>
                      
                      {/* Facility Type Title */}
                      <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2 tracking-tight">
                        {category.display_name}
                      </h3>
                      
                      {/* Count Display */}
                      <div className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mb-3 tabular-nums">
                        {category.provider_count.toLocaleString()}
                      </div>
                      
                      {/* Description Text */}
                      <p className="text-[15px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-5 line-clamp-2">
                        {category.description || `Healthcare facilities in the ${category.display_name.toLowerCase()} category`}
                      </p>
                      
                      {/* Card Footer Metadata */}
                      <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700 text-[13px]">
                        <span className="text-neutral-500 dark:text-neutral-400 font-medium">
                          {category.facility_types_count} facility {category.facility_types_count === 1 ? 'type' : 'types'}
                        </span>
                        <div className="flex items-center gap-1.5 text-success-700 dark:text-success-500 font-medium">
                          <div className="w-1 h-1 bg-success-600 rounded-full"></div>
                          Real-time data
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
    </>
    </PremiumGuard>
  )
}
