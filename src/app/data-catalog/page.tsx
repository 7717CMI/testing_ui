'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
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
  TrendingUp,
  Database,
  ArrowRight,
  Shield,
  AlertCircle,
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
  if (!response.ok) {
    throw new Error('Failed to fetch catalog overview')
  }
  return response.json()
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

function getCategorySlug(categoryName: string): string {
  // Special handling for Hospitals to link to the hospital types page
  if (categoryName.toLowerCase() === 'hospitals') {
    return 'hospitals'
  }
  return categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function DataCatalogPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: catalogData, isLoading, error } = useQuery({
    queryKey: ['catalog-overview'],
    queryFn: fetchCatalogOverview,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    
    // CSV headers
    const headers = [
      'Category ID',
      'Category Code',
      'Category Name',
      'Description',
      'Provider Count',
      'Facility Types Count'
    ]
    
    // Convert data to CSV rows
    const csvRows = [
      headers.join(','), // Header row
      ...catalogData.categories.map(category => [
        category.id,
        `"${(category.name || '').replace(/"/g, '""')}"`,
        `"${(category.display_name || '').replace(/"/g, '""')}"`,
        `"${(category.description || '').replace(/"/g, '""')}"`,
        category.provider_count,
        category.facility_types_count
      ].join(','))
    ]
    
    // Add summary row
    csvRows.push('')
    csvRows.push('Summary')
    csvRows.push(`Total Providers,${catalogData.total_providers}`)
    csvRows.push(`Total Categories,${catalogData.total_categories}`)
    csvRows.push(`Last Updated,${catalogData.last_updated}`)
    
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
      <div className="min-h-screen bg-[#f8faff] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Failed to Load Data Catalog</h2>
          <p className="text-gray-600">Unable to connect to the database. Please try again later.</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#006AFF]/5 via-white to-[#006AFF]/5 py-16 border-b">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="bg-[#006AFF]/10 text-[#006AFF] border-[#006AFF]/20 hover:bg-[#006AFF]/20">
              <Database className="h-3 w-3 mr-1" />
              Live Healthcare Data Catalog
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
              Healthcare Data Catalog
            </h1>
            <div className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              {isLoading ? (
                <Skeleton className="h-6 w-96 mx-auto" />
              ) : (
                <p>Access {catalogData ? (catalogData.total_providers / 1000000).toFixed(1) : '0'}M+ verified healthcare records across {catalogData?.total_categories || 0} facility categories. Real-time data directly from PostgreSQL database.</p>
              )}
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
              <div className="text-center">
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                ) : (
                  <div className="text-3xl font-bold text-[#006AFF]">
                    {catalogData ? (catalogData.total_providers / 1000000).toFixed(1) : '0'}M+
                  </div>
                )}
                <div className="text-sm text-gray-600 mt-1">Total Records</div>
              </div>
              <div className="text-center">
                {isLoading ? (
                  <Skeleton className="h-8 w-8 mx-auto mb-2" />
                ) : (
                  <div className="text-3xl font-bold text-[#006AFF]">{catalogData?.total_categories || 0}</div>
                )}
                <div className="text-sm text-gray-600 mt-1">Categories</div>
              </div>
              <div className="text-center">
                {isLoading ? (
                  <Skeleton className="h-8 w-12 mx-auto mb-2" />
                ) : (
                  <div className="text-3xl font-bold text-[#006AFF]">{catalogData?.total_facility_types || 0}</div>
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
                placeholder="Search healthcare facilities across the U.S..."
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
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-300"
                onClick={handleExportCSV}
                disabled={!catalogData}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Data Catalog Grid */}
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
                      Customize Your Healthcare Data
                    </h3>
                    <p className="text-gray-600 max-w-2xl">
                      Build your perfect dataset by selecting categories (Hospitals, Clinics, etc.), their types, states, cities, ZIP codes, and more. 
                      Export only the data you need for your research or analysis.
                    </p>
                  </div>
                </div>
                <Link href="/data-catalog/custom">
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
            <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
            <p className="text-gray-600 mt-2">Explore healthcare facilities organized by category</p>
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
              {filteredCategories.map((category) => (
                <Card
                  key={category.id}
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white border-gray-200 hover:border-[#006AFF]/30"
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-lg bg-[#006AFF]/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {getCategoryIcon(category.display_name)}
                      </div>
                      <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Live
                      </Badge>
                    </div>

                    {/* Name & Count */}
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#006AFF] transition-colors">
                        {category.display_name}
                      </h3>
                      <div className="text-3xl font-bold text-[#006AFF] mt-2">
                        {category.provider_count.toLocaleString()}+
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {category.description || `Healthcare facilities in the ${category.display_name.toLowerCase()} category`}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="pt-4 border-t border-gray-100 space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Facility Types: {category.facility_types_count}</span>
                        <span>Real-time</span>
                      </div>
                    </div>

                    {/* Action */}
                    <Link href={`/data-catalog/${getCategorySlug(category.display_name)}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4 border-[#006AFF]/30 text-[#006AFF] hover:bg-[#006AFF] hover:text-white group-hover:border-[#006AFF]"
                      >
                        View Details
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

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[#006AFF] to-[#0052CC] py-16 text-white">
        <div className="container text-center space-y-6">
          <h2 className="text-4xl font-bold">Ready to Access Premium Healthcare Data?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Get started with flexible, credit-based pricing. Purchase only what you need.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-[#006AFF] hover:bg-gray-100">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Request Demo
            </Button>
          </div>
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


