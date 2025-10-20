'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  CheckCircle2,
  Database,
  ArrowRight,
  ArrowLeft,
  Shield,
  AlertCircle,
  Home,
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
  const response = await fetch(`/api/v1/catalog/categories`)
  if (!response.ok) {
    throw new Error('Failed to fetch categories')
  }
  const data = await response.json()
  const category = data.data.categories.find((cat: CategoryInfo) => 
    cat.display_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === categorySlug
  )
  if (!category) {
    throw new Error('Category not found')
  }
  return category
}

async function fetchFacilityTypes(categoryId: number): Promise<FacilityTypeInfo[]> {
  const response = await fetch(`/api/v1/catalog/categories/${categoryId}/types`)
  if (!response.ok) {
    throw new Error('Failed to fetch facility types')
  }
  const data = await response.json()
  return data.data.facility_types
}

function getCategoryIcon(categoryName: string): string {
  const iconMap: Record<string, string> = {
    'Hospitals': '🏥',
    'Clinics': '⚕️',
    'Agencies': '🏛️',
    'Assisted Living': '🏡',
    'Blood & Eye Banks': '🩸',
    'Custodial Facilities': '🏢',
    'Home Health Agency': '🏠',
    'Hospice': '💚',
    'Laboratory': '🔬',
    'Mental Health Units': '🧠',
    'Pharmacy': '💊',
    'SNF (Skilled Nursing)': '🏥',
  }
  return iconMap[categoryName] || '🏥'
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
  })

  const { data: facilityTypes, isLoading: typesLoading, error: typesError } = useQuery({
    queryKey: ['facility-types', categoryInfo?.id],
    queryFn: () => fetchFacilityTypes(categoryInfo!.id),
    enabled: !!categoryInfo?.id,
  })

  const filteredFacilityTypes = facilityTypes?.filter(type =>
    type.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const isLoading = categoryLoading || typesLoading
  const error = categoryError || typesError

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8faff] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Failed to Load Category</h2>
          <p className="text-gray-600">Unable to load category information. Please try again later.</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
            <Link href="/data-catalog">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Catalog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8faff]">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-[#006AFF]" />
            <span className="text-xl font-bold text-gray-900">HealthData AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-[#006AFF] transition-colors">
              Home
            </Link>
            <Link href="/data-catalog" className="text-sm font-medium text-[#006AFF]">
              Data Catalog
            </Link>
            <Link href="/search" className="text-sm font-medium text-gray-600 hover:text-[#006AFF] transition-colors">
              Search
            </Link>
            <Link href="/insights" className="text-sm font-medium text-gray-600 hover:text-[#006AFF] transition-colors">
              Insights
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-gray-300">Login</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-[#006AFF] hover:bg-[#0052CC]">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <section className="bg-white border-b py-4">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#006AFF] transition-colors">
              <Home className="h-4 w-4" />
            </Link>
            <span>/</span>
            <Link href="/data-catalog" className="hover:text-[#006AFF] transition-colors">
              Data Catalog
            </Link>
            <span>/</span>
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <span className="text-[#006AFF] font-medium">{categoryInfo?.display_name}</span>
            )}
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#006AFF]/5 via-white to-[#006AFF]/5 py-16 border-b">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-4">
              <Link href="/data-catalog">
                <Button variant="outline" size="sm" className="border-gray-300">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Catalog
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              {isLoading ? (
                <Skeleton className="w-16 h-16 rounded-lg" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-[#006AFF]/10 flex items-center justify-center text-4xl">
                  {categoryInfo ? getCategoryIcon(categoryInfo.display_name) : '🏥'}
                </div>
              )}
            </div>

            <Badge className="bg-[#006AFF]/10 text-[#006AFF] border-[#006AFF]/20 hover:bg-[#006AFF]/20">
              <Database className="h-3 w-3 mr-1" />
              Live Healthcare Data
            </Badge>
            
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-96 mx-auto" />
                <Skeleton className="h-6 w-128 mx-auto" />
              </div>
            ) : (
              <>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
                  {categoryInfo?.display_name}
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                  {categoryInfo?.description || `Explore ${categoryInfo?.display_name.toLowerCase()} facilities across the United States with real-time data from our PostgreSQL database.`}
                </p>
              </>
            )}
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                {isLoading ? (
                  <Skeleton className="h-8 w-20 mx-auto mb-2" />
                ) : (
                  <div className="text-3xl font-bold text-[#006AFF]">
                    {categoryInfo?.provider_count.toLocaleString() || '0'}
                  </div>
                )}
                <div className="text-sm text-gray-600 mt-1">Total Facilities</div>
              </div>
              <div className="text-center">
                {isLoading ? (
                  <Skeleton className="h-8 w-8 mx-auto mb-2" />
                ) : (
                  <div className="text-3xl font-bold text-[#006AFF]">{facilityTypes?.length || 0}</div>
                )}
                <div className="text-sm text-gray-600 mt-1">Facility Types</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#006AFF]">100%</div>
                <div className="text-sm text-gray-600 mt-1">Live Data</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-white border-b py-6">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={`Search ${categoryInfo?.display_name.toLowerCase()} facility types...`}
                className="pl-10 bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-gray-300">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm" className="border-gray-300">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Facility Types Grid */}
      <section className="py-16">
        <div className="container">
          {/* Custom Dataset Builder CTA */}
          <Card className="mb-12 bg-gradient-to-br from-[#006AFF]/5 via-white to-[#006AFF]/5 border-[#006AFF]/20 hover:shadow-xl transition-shadow">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl bg-[#006AFF]/10 flex items-center justify-center">
                    <Filter className="h-8 w-8 text-[#006AFF]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Customize Your {categoryInfo?.display_name} Data
                    </h3>
                    <p className="text-gray-600 max-w-2xl">
                      Build your perfect dataset by selecting specific {categoryInfo?.display_name.toLowerCase()} types, states, cities, ZIP codes, and more. 
                      Export only the data you need for your research or analysis.
                    </p>
                  </div>
                </div>
                <Link href={`/data-catalog/custom?category=${categoryInfo?.id}`}>
                  <Button size="lg" className="bg-[#006AFF] hover:bg-[#0052CC] whitespace-nowrap">
                    <Filter className="h-4 w-4 mr-2" />
                    Build Custom Dataset
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Browse by Facility Type</h2>
            <p className="text-gray-600 mt-2">Select a facility type to explore detailed provider data</p>
          </div>
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="bg-white border-gray-200">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <Skeleton className="w-16 h-6" />
                    </div>
                    <div>
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-8 w-20 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFacilityTypes.map((facilityType) => (
                <Card
                  key={facilityType.id}
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white border-gray-200 hover:border-[#006AFF]/30"
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-lg bg-[#006AFF]/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {getCategoryIcon(categoryInfo?.display_name || '')}
                      </div>
                      <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Live
                      </Badge>
                    </div>

                    {/* Name & Count */}
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#006AFF] transition-colors">
                        {facilityType.display_name}
                      </h3>
                      <div className="text-3xl font-bold text-[#006AFF] mt-2">
                        {facilityType.provider_count.toLocaleString()}+
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {facilityType.description || `${facilityType.display_name} facilities in the ${categoryInfo?.display_name.toLowerCase()} category`}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="pt-4 border-t border-gray-100 space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Category: {facilityType.category_name}</span>
                        <span>Real-time</span>
                      </div>
                    </div>

                    {/* Action */}
                    <Link href={`/data-catalog/${categorySlug}/${getFacilityTypeSlug(facilityType.display_name)}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4 border-[#006AFF]/30 text-[#006AFF] hover:bg-[#006AFF] hover:text-white group-hover:border-[#006AFF]"
                      >
                        View Data
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#006AFF]" />
              <span className="font-bold text-gray-900">HealthData AI</span>
            </div>
            <div className="text-sm text-gray-600 text-center">
              © 2025 HealthData AI | Real-time data from PostgreSQL database
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








