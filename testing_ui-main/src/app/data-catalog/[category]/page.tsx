'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
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
  Database,
  ArrowRight,
  ArrowLeft,
  Shield,
  AlertCircle,
  Home,
  Briefcase,
  Pill,
  Package,
  FlaskConical,
  Stethoscope,
  Heart,
  Building,
  Syringe,
  ChevronRight,
} from 'lucide-react'

interface FacilityTypeInfo {
  id: number
  name: string
  display_name: string
  description?: string
  category_id: number
  category_name: string
  provider_count: number
}

interface CategoryInfo {
  id: number
  name: string
  display_name: string
  description?: string
  provider_count: number
  facility_types_count: number
}

async function fetchCategoryInfo(categorySlug: string): Promise<CategoryInfo> {
  try {
  // Use the unified category endpoint that handles both IDs and slugs
    const response = await fetch(`/api/v1/catalog/categories/${encodeURIComponent(categorySlug)}`)
    
  if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
    if (response.status === 404) {
        const errorMessage = errorData.message || `Category "${categorySlug}" not found`
        console.error('[Category Page] Category not found:', {
          slug: categorySlug,
          availableCategories: errorData.availableCategories
        })
        throw new Error(errorMessage)
      }
      
      if (response.status === 500) {
        const errorMessage = errorData.message || 'Server error while fetching category'
        console.error('[Category Page] Server error:', errorData)
        throw new Error(errorMessage)
      }
      
      throw new Error(errorData.message || `Failed to fetch category (${response.status})`)
  }
    
  const data = await response.json()
    
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Invalid response from server')
    }
    
    return data.data
  } catch (error: any) {
    console.error('[Category Page] Error fetching category:', error)
    throw error
  }
}

async function fetchFacilityTypes(categoryId: number): Promise<FacilityTypeInfo[]> {
  const response = await fetch(`/api/v1/catalog/categories/${categoryId}/types`)
  if (!response.ok) throw new Error('Failed to fetch facility types')
  const data = await response.json()
  return data.data.facility_types
}

// Animation variants - optimized for performance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03, // Reduced from 0.08 for faster rendering
      delayChildren: 0.05, // Reduced from 0.15
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2, // Reduced from 0.4 for faster rendering
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

// Icon mapping
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
  return iconMap[normalizedName] || Building2
}

function getFacilityTypeSlug(facilityTypeName: string): string {
  return facilityTypeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function CategoryPage() {
  const params = useParams()
  const categorySlug = params.category as string
  const [searchQuery, setSearchQuery] = useState('')

  const { data: categoryInfo, isLoading: categoryLoading, error: categoryError } = useQuery({
    queryKey: ['category-info', categorySlug],
    queryFn: () => fetchCategoryInfo(categorySlug),
    enabled: !!categorySlug,
    staleTime: 10 * 60 * 1000, // 10 minutes - category data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
  })

  const { data: facilityTypes, isLoading: typesLoading, error: typesError } = useQuery({
    queryKey: ['facility-types', categoryInfo?.id],
    queryFn: () => fetchFacilityTypes(categoryInfo!.id),
    enabled: !!categoryInfo?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })

  const filteredFacilityTypes = facilityTypes?.filter(type =>
    type.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const isLoading = categoryLoading || typesLoading
  const error = categoryError || typesError

  const Icon = categoryInfo ? getCategoryIcon(categoryInfo.display_name) : Building2

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const isNotFound = errorMessage.toLowerCase().includes('not found')
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 max-w-md"
        >
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Failed to Load Category</h2>
          <p className="text-gray-600">
            {isNotFound 
              ? `Category "${categorySlug}" was not found. Please check the URL or return to the catalog.`
              : errorMessage || 'Unable to load category information. Please try again later.'}
          </p>
          {typeof window !== 'undefined' && errorMessage && (
            <p className="text-sm text-gray-500 font-mono bg-gray-100 p-2 rounded break-words">
              {errorMessage}
            </p>
          )}
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.location.reload()}>Retry</Button>
            <Link href="/data-catalog">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Catalog
              </Button>
            </Link>
          </div>
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
              {['Home', 'Data Catalog', 'Search', 'Insights'].map((item) => {
                const href = item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`
                const isActive = item === 'Data Catalog'
                return (
                  <Link
                    key={item}
                    href={href}
                    className={`text-sm font-medium transition-all duration-200 relative ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
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

      {/* Breadcrumb */}
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/50 backdrop-blur-sm border-b border-gray-200/50 py-4"
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Link href="/data-catalog" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Data Catalog
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {isLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <span className="text-blue-600 font-semibold">{categoryInfo?.display_name}</span>
            )}
          </div>
        </div>
      </motion.section>

      {/* Hero Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto text-center space-y-6"
          >
            {/* Back Button */}
            <Link href="/data-catalog">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Button variant="outline" size="sm" className="border-gray-300 hover:border-blue-300 hover:bg-blue-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Catalog
                </Button>
              </motion.div>
            </Link>

            {/* Icon */}
            {isLoading ? (
              <Skeleton className="w-20 h-20 rounded-2xl mx-auto" />
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                whileHover={{ rotate: 360 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto shadow-2xl"
              >
                <Icon className="h-10 w-10 text-white" />
              </motion.div>
            )}

            {/* Badge */}
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200">
              <Database className="h-3 w-3 mr-1" />
              Live Healthcare Data
            </Badge>

            {/* Title & Description */}
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-14 w-96 mx-auto" />
                <Skeleton className="h-6 w-128 mx-auto" />
              </div>
            ) : (
              <>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                    {categoryInfo?.display_name}
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                  {categoryInfo?.description || `Explore ${categoryInfo?.display_name.toLowerCase()} facilities across the United States with real-time data.`}
                </p>
              </>
            )}

            {/* Animated Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12">
              {[
                { label: 'Total Facilities', value: categoryInfo?.provider_count.toLocaleString() || '0' },
                { label: 'Facility Types', value: facilityTypes?.length || 0 },
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
                    <Skeleton className="h-12 w-20 mx-auto mb-2" />
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

      {/* Search Bar */}
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
                  placeholder={`Search ${categoryInfo?.display_name.toLowerCase() || 'facility'} types...`}
                  className="pl-12 h-12 bg-white border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="h-12 border-gray-200 hover:border-blue-300 hover:bg-blue-50">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" className="h-12 border-gray-200 hover:border-blue-300 hover:bg-blue-50">
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
                        Build Custom {categoryInfo?.display_name} Dataset
                      </h3>
                      <p className="text-gray-600 max-w-xl leading-relaxed">
                        Select specific {categoryInfo?.display_name.toLowerCase()} types, filter by location, and export only the data you need.
                      </p>
                    </div>
                  </div>
                  <Link href={`/data-catalog/custom?category=${categoryInfo?.id}`}>
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

      {/* Facility Types Grid */}
      <section className="py-12 pb-20">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by Facility Type</h2>
            <p className="text-gray-600">Select a facility type to explore detailed provider data</p>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              {filteredFacilityTypes.map((facilityType) => (
                <motion.div key={facilityType.id} variants={cardVariants} className="h-full">
                  <Link href={`/data-catalog/${categorySlug}/${getFacilityTypeSlug(facilityType.display_name)}`} className="block h-full">
                    <motion.div
                      whileHover={{ y: -8, scale: 1.02 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="group relative h-full"
                    >
                      <Card className="bg-white border-gray-200 hover:border-blue-200 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                        <CardContent className="p-8 space-y-6 flex-1 flex flex-col">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <motion.div
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.6 }}
                              className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg flex-shrink-0"
                            >
                              <Icon className="h-7 w-7 text-white" />
                            </motion.div>
                            <Badge className="rounded-full px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse flex-shrink-0">
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
                          <div className="space-y-3 flex-1">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors min-h-[3.5rem] flex items-start">
                              {facilityType.display_name}
                            </h3>
                            <motion.div
                              variants={gradientTextVariants}
                              animate="animate"
                              className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                              style={{ backgroundSize: '200% auto' }}
                            >
                              {facilityType.provider_count.toLocaleString()}+
                            </motion.div>
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                              {facilityType.description || `${facilityType.display_name} facilities`}
                            </p>
                          </div>

                          {/* Metadata - Fixed spacing to prevent overlap */}
                          <div className="pt-4 border-t border-gray-100 pb-12">
                            <div className="flex items-center justify-between text-xs font-medium">
                              <span className="text-gray-500 truncate pr-2">{facilityType.category_name}</span>
                              <span className="text-emerald-600 flex-shrink-0">Real-time</span>
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
              ))}
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
