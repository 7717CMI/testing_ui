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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  MapPin,
  Phone,
  Calendar,
  Users,
  Mail,
  FileText,
  Briefcase,
  X,
} from 'lucide-react'

interface ProviderInfo {
  id: number
  npi_number?: string
  provider_name: string
  provider_first_name?: string
  provider_last_name?: string
  provider_credentials?: string
  facility_category_id: number
  facility_category_name: string
  facility_type_id: number
  facility_type_name: string
  business_city?: string
  business_state_id?: number
  business_state?: string
  business_zip_code?: string
  business_phone?: string
  business_fax?: string
  primary_taxonomy_code_id?: number
  enumeration_date?: string
  last_update_date?: string
  is_active: boolean
}

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

async function fetchFacilityTypeInfo(categoryId: number, facilityTypeSlug: string): Promise<FacilityTypeInfo> {
  const response = await fetch(`/api/v1/catalog/categories/${categoryId}/types`)
  if (!response.ok) {
    throw new Error('Failed to fetch facility types')
  }
  const data = await response.json()
  const facilityType = data.data.facility_types.find((type: FacilityTypeInfo) => 
    type.display_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === facilityTypeSlug
  )
  if (!facilityType) {
    throw new Error('Facility type not found')
  }
  return facilityType
}

async function fetchProviders(facilityTypeId: number, limit: number = 50, offset: number = 0): Promise<{
  providers: ProviderInfo[]
  total_count: number
}> {
  const response = await fetch(`/api/v1/catalog/providers?facility_type_id=${facilityTypeId}&limit=${limit}&offset=${offset}`)
  if (!response.ok) {
    throw new Error('Failed to fetch providers')
  }
  const data = await response.json()
  return data.data
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

export default function FacilityTypePage() {
  const params = useParams()
  const categorySlug = params.category as string
  const facilityTypeSlug = params.facilityType as string
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(50)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<ProviderInfo | null>(null)
  const [filters, setFilters] = useState({
    state: '',
    city: '',
    hasPhone: false
  })

  const { data: categoryInfo, isLoading: categoryLoading, error: categoryError } = useQuery({
    queryKey: ['category-info', categorySlug],
    queryFn: () => fetchCategoryInfo(categorySlug),
    enabled: !!categorySlug,
  })

  const { data: facilityTypeInfo, isLoading: typeLoading, error: typeError } = useQuery({
    queryKey: ['facility-type-info', categoryInfo?.id, facilityTypeSlug],
    queryFn: () => fetchFacilityTypeInfo(categoryInfo!.id, facilityTypeSlug),
    enabled: !!categoryInfo?.id && !!facilityTypeSlug,
  })

  const { data: providersData, isLoading: providersLoading, error: providersError } = useQuery({
    queryKey: ['providers', facilityTypeInfo?.id, currentPage, pageSize],
    queryFn: () => fetchProviders(facilityTypeInfo!.id, pageSize, currentPage * pageSize),
    enabled: !!facilityTypeInfo?.id,
  })

  const filteredProviders = providersData?.providers.filter(provider => {
    // Search filter
    const searchMatch = !searchQuery || 
      provider.provider_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.business_city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.business_state?.toLowerCase().includes(searchQuery.toLowerCase())
    
    // State filter
    const stateMatch = !filters.state || provider.business_state?.toLowerCase().includes(filters.state.toLowerCase())
    
    // City filter
    const cityMatch = !filters.city || provider.business_city?.toLowerCase().includes(filters.city.toLowerCase())
    
    // Phone filter
    const phoneMatch = !filters.hasPhone || (provider.business_phone && provider.business_phone.trim() !== '')
    
    return searchMatch && stateMatch && cityMatch && phoneMatch
  }) || []

  const isLoading = categoryLoading || typeLoading || providersLoading
  const error = categoryError || typeError || providersError

  const totalPages = providersData ? Math.ceil(providersData.total_count / pageSize) : 0

  function handleExportCSV() {
    if (!filteredProviders || filteredProviders.length === 0) {
      alert('No data to export')
      return
    }
    
    // CSV headers - ALL important columns
    const headers = [
      'ID',
      'NPI Number',
      'Entity Type',
      'Category',
      'Facility Type',
      'Provider Name',
      'First Name',
      'Middle Name',
      'Last Name',
      'Credentials',
      'Sex',
      'Is Sole Proprietor',
      'Is Organization Subpart',
      'Parent Organization',
      'EIN',
      'Business Address Line 1',
      'Business Address Line 2',
      'Business City',
      'Business State',
      'Business State Code',
      'Business ZIP',
      'Business Phone',
      'Business Fax',
      'Mailing Address Line 1',
      'Mailing Address Line 2',
      'Mailing City',
      'Mailing State',
      'Mailing State Code',
      'Mailing ZIP',
      'Mailing Phone',
      'Mailing Fax',
      'Authorized Official Phone',
      'All Phones',
      'All Faxes',
      'Taxonomy Code',
      'Taxonomy Classification',
      'Taxonomy Specialization',
      'Primary License Number',
      'License State',
      'Authorized Official First Name',
      'Authorized Official Last Name',
      'Authorized Official Title',
      'Enumeration Date',
      'Last Update Date',
      'Source Folder',
      'Source File',
      'Created At',
      'Updated At',
      'Active'
    ]
    
    // Convert data to CSV rows
    const csvRows = [
      headers.join(','), // Header row
      ...filteredProviders.map(provider => [
        provider.id || '',
        provider.npi_number || '',
        `"${(provider.entity_type_name || '').replace(/"/g, '""')}"`,
        `"${(provider.facility_category_name || '').replace(/"/g, '""')}"`,
        `"${(provider.facility_type_name || '').replace(/"/g, '""')}"`,
        `"${(provider.provider_name || '').replace(/"/g, '""')}"`,
        `"${(provider.provider_first_name || '').replace(/"/g, '""')}"`,
        `"${(provider.provider_middle_name || '').replace(/"/g, '""')}"`,
        `"${(provider.provider_last_name || '').replace(/"/g, '""')}"`,
        `"${(provider.provider_credentials || '').replace(/"/g, '""')}"`,
        `"${(provider.provider_sex || '').replace(/"/g, '""')}"`,
        provider.is_sole_proprietor === true ? 'Yes' : provider.is_sole_proprietor === false ? 'No' : '',
        provider.is_organization_subpart === true ? 'Yes' : provider.is_organization_subpart === false ? 'No' : '',
        `"${(provider.parent_organization_name || '').replace(/"/g, '""')}"`,
        provider.ein || '',
        `"${(provider.business_address_line1 || '').replace(/"/g, '""')}"`,
        `"${(provider.business_address_line2 || '').replace(/"/g, '""')}"`,
        `"${(provider.business_city || '').replace(/"/g, '""')}"`,
        `"${(provider.business_state || '').replace(/"/g, '""')}"`,
        `"${(provider.business_state_code || '').replace(/"/g, '""')}"`,
        provider.business_zip_code || '',
        provider.business_phone || '',
        provider.business_fax || '',
        `"${(provider.mailing_address_line1 || '').replace(/"/g, '""')}"`,
        `"${(provider.mailing_address_line2 || '').replace(/"/g, '""')}"`,
        `"${(provider.mailing_city || '').replace(/"/g, '""')}"`,
        `"${(provider.mailing_state || '').replace(/"/g, '""')}"`,
        `"${(provider.mailing_state_code || '').replace(/"/g, '""')}"`,
        provider.mailing_zip_code || '',
        provider.mailing_phone || '',
        provider.mailing_fax || '',
        provider.authorized_official_phone || '',
        `"${(provider.all_phones || '').replace(/"/g, '""')}"`,
        `"${(provider.all_faxes || '').replace(/"/g, '""')}"`,
        `"${(provider.taxonomy_code || '').replace(/"/g, '""')}"`,
        `"${(provider.taxonomy_classification || '').replace(/"/g, '""')}"`,
        `"${(provider.taxonomy_specialization || '').replace(/"/g, '""')}"`,
        provider.primary_license_number || '',
        `"${(provider.license_state || '').replace(/"/g, '""')}"`,
        `"${(provider.authorized_official_first_name || '').replace(/"/g, '""')}"`,
        `"${(provider.authorized_official_last_name || '').replace(/"/g, '""')}"`,
        `"${(provider.authorized_official_title || '').replace(/"/g, '""')}"`,
        provider.enumeration_date || '',
        provider.last_update_date || '',
        `"${(provider.source_folder || '').replace(/"/g, '""')}"`,
        `"${(provider.source_file || '').replace(/"/g, '""')}"`,
        provider.created_at || '',
        provider.updated_at || '',
        provider.is_active ? 'Yes' : 'No'
      ].join(','))
    ]
    
    const csvContent = csvRows.join('\n')
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${facilityTypeSlug}-providers-complete.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  function clearFilters() {
    setFilters({
      state: '',
      city: '',
      hasPhone: false
    })
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8faff] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Failed to Load Facility Data</h2>
          <p className="text-gray-600">Unable to load facility information. Please try again later.</p>
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
            <Link href={`/data-catalog/${categorySlug}`} className="hover:text-[#006AFF] transition-colors">
              {isLoading ? <Skeleton className="h-4 w-32" /> : categoryInfo?.display_name}
            </Link>
            <span>/</span>
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <span className="text-[#006AFF] font-medium">{facilityTypeInfo?.display_name}</span>
            )}
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#006AFF]/5 via-white to-[#006AFF]/5 py-16 border-b">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-4">
              <Link href={`/data-catalog/${categorySlug}`}>
                <Button variant="outline" size="sm" className="border-gray-300">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to {categoryInfo?.display_name}
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
                  {facilityTypeInfo?.display_name}
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                  {facilityTypeInfo?.description || `Explore ${facilityTypeInfo?.display_name.toLowerCase()} facilities across the United States with real-time data from our PostgreSQL database.`}
                </p>
              </>
            )}
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
              <div className="text-center">
                {isLoading ? (
                  <Skeleton className="h-8 w-20 mx-auto mb-2" />
                ) : (
                  <div className="text-3xl font-bold text-[#006AFF]">
                    {facilityTypeInfo?.provider_count.toLocaleString() || '0'}
                  </div>
                )}
                <div className="text-sm text-gray-600 mt-1">Total Facilities</div>
              </div>
              <div className="text-center">
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                ) : (
                  <div className="text-3xl font-bold text-[#006AFF]">
                    {providersData?.total_count.toLocaleString() || '0'}
                  </div>
                )}
                <div className="text-sm text-gray-600 mt-1">Showing</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#006AFF]">{pageSize}</div>
                <div className="text-sm text-gray-600 mt-1">Per Page</div>
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
                placeholder="Search facilities by name, city, or state..."
                className="pl-10 bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-300"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {(filters.state || filters.city || filters.hasPhone) && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-[#006AFF] text-white rounded">
                    •
                  </span>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-300"
                onClick={handleExportCSV}
                disabled={!filteredProviders || filteredProviders.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
          
          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <Input
                    placeholder="e.g., CA, NY, TX"
                    value={filters.state}
                    onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    placeholder="e.g., Los Angeles"
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    className="bg-white"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasPhone}
                      onChange={(e) => setFilters({ ...filters, hasPhone: e.target.checked })}
                      className="w-4 h-4 text-[#006AFF] border-gray-300 rounded focus:ring-[#006AFF]"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Has Phone Number
                    </span>
                  </label>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
                <div className="text-sm text-gray-600 flex items-center">
                  Showing {filteredProviders.length} of {providersData?.providers.length || 0} providers
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Data Table */}
      <section className="py-16">
        <div className="container">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <Card key={index} className="bg-white border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProviders.map((provider) => (
                <Card 
                  key={provider.id} 
                  className="bg-white border-gray-200 hover:shadow-lg hover:border-[#006AFF]/30 transition-all cursor-pointer"
                  onClick={() => setSelectedProvider(provider)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#006AFF]/10 flex items-center justify-center text-2xl">
                          {getCategoryIcon(provider.facility_category_name)}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">
                            {provider.provider_name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            {provider.provider_credentials && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {provider.provider_credentials}
                              </span>
                            )}
                            {provider.business_city && provider.business_state && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {provider.business_city}, {provider.business_state}
                              </span>
                            )}
                            {provider.business_phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {provider.business_phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                        {provider.npi_number && (
                          <div className="text-xs text-gray-500">
                            NPI: {provider.npi_number}
                          </div>
                        )}
                        {provider.enumeration_date && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(provider.enumeration_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-600">
                Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, providersData?.total_count || 0)} of {providersData?.total_count || 0} facilities
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + Math.max(0, currentPage - 2)
                    if (page >= totalPages) return null
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page + 1}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Provider Detail Modal */}
      <Dialog open={!!selectedProvider} onOpenChange={() => setSelectedProvider(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#006AFF]/10 flex items-center justify-center text-2xl">
                {selectedProvider && getCategoryIcon(selectedProvider.facility_category_name)}
              </div>
              {selectedProvider?.provider_name}
            </DialogTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
              <span className="text-sm text-gray-600">
                NPI: {selectedProvider?.npi_number}
              </span>
            </div>
            {selectedProvider?.facility_type_name && (
              <p className="text-sm text-gray-600 mt-1">
                {selectedProvider.facility_type_name}
              </p>
            )}
          </DialogHeader>

          {selectedProvider && (
            <div className="space-y-6 mt-6">
              {/* Business Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-[#006AFF]" />
                      Business Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedProvider.business_address_line1 && (
                      <div>
                        <p className="font-medium">{selectedProvider.business_address_line1}</p>
                        {selectedProvider.business_address_line2 && (
                          <p className="text-sm text-gray-600">{selectedProvider.business_address_line2}</p>
                        )}
                      </div>
                    )}
                    {(selectedProvider.business_city || selectedProvider.business_state) && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>
                          {[selectedProvider.business_city, selectedProvider.business_state_code || selectedProvider.business_state, selectedProvider.business_zip_code]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                    {selectedProvider.business_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedProvider.business_phone}</span>
                      </div>
                    )}
                    {selectedProvider.business_fax && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span>Fax: {selectedProvider.business_fax}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Mailing Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Mail className="h-5 w-5 text-[#006AFF]" />
                      Mailing Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedProvider.mailing_address_line1 && (
                      <div>
                        <p className="font-medium">{selectedProvider.mailing_address_line1}</p>
                        {selectedProvider.mailing_address_line2 && (
                          <p className="text-sm text-gray-600">{selectedProvider.mailing_address_line2}</p>
                        )}
                      </div>
                    )}
                    {(selectedProvider.mailing_city || selectedProvider.mailing_state) && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>
                          {[selectedProvider.mailing_city, selectedProvider.mailing_state_code || selectedProvider.mailing_state, selectedProvider.mailing_zip_code]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                    {selectedProvider.mailing_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedProvider.mailing_phone}</span>
                      </div>
                    )}
                    {selectedProvider.mailing_fax && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span>Fax: {selectedProvider.mailing_fax}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Professional Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-[#006AFF]" />
                    Professional Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedProvider.provider_sex && (
                    <div>
                      <p className="text-sm text-gray-600">Sex</p>
                      <p className="font-medium">{selectedProvider.provider_sex}</p>
                    </div>
                  )}
                  {selectedProvider.taxonomy_classification && (
                    <div>
                      <p className="text-sm text-gray-600">Classification</p>
                      <p className="font-medium">{selectedProvider.taxonomy_classification}</p>
                    </div>
                  )}
                  {selectedProvider.taxonomy_specialization && (
                    <div>
                      <p className="text-sm text-gray-600">Specialization</p>
                      <p className="font-medium">{selectedProvider.taxonomy_specialization}</p>
                    </div>
                  )}
                  {selectedProvider.taxonomy_code && (
                    <div>
                      <p className="text-sm text-gray-600">Taxonomy Code</p>
                      <p className="font-medium font-mono text-xs">{selectedProvider.taxonomy_code}</p>
                    </div>
                  )}
                  {selectedProvider.primary_license_number && (
                    <div>
                      <p className="text-sm text-gray-600">License</p>
                      <p className="font-medium">{selectedProvider.primary_license_number} ({selectedProvider.license_state})</p>
                    </div>
                  )}
                  {selectedProvider.ein && (
                    <div>
                      <p className="text-sm text-gray-600">EIN</p>
                      <p className="font-medium">{selectedProvider.ein}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Authorized Official */}
              {(selectedProvider.authorized_official_first_name || selectedProvider.authorized_official_last_name) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-[#006AFF]" />
                      Authorized Official
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-medium text-lg">
                        {[selectedProvider.authorized_official_first_name, selectedProvider.authorized_official_last_name]
                          .filter(Boolean)
                          .join(' ')}
                      </p>
                      {selectedProvider.authorized_official_title && (
                        <p className="text-sm text-gray-600">{selectedProvider.authorized_official_title}</p>
                      )}
                    </div>
                    {selectedProvider.authorized_official_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedProvider.authorized_official_phone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Organization Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#006AFF]" />
                    Organization Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {selectedProvider.entity_type_name && (
                    <div>
                      <p className="text-sm text-gray-600">Entity Type</p>
                      <p className="font-medium">{selectedProvider.entity_type_name}</p>
                    </div>
                  )}
                  {selectedProvider.is_sole_proprietor !== null && selectedProvider.is_sole_proprietor !== undefined && (
                    <div>
                      <p className="text-sm text-gray-600">Sole Proprietor</p>
                      <p className="font-medium">{selectedProvider.is_sole_proprietor ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                  {selectedProvider.is_organization_subpart !== null && selectedProvider.is_organization_subpart !== undefined && (
                    <div>
                      <p className="text-sm text-gray-600">Organization Subpart</p>
                      <p className="font-medium">{selectedProvider.is_organization_subpart ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                  {selectedProvider.parent_organization_name && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Parent Organization</p>
                      <p className="font-medium">{selectedProvider.parent_organization_name}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* All Contact Numbers */}
              {selectedProvider.all_phones && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Phone className="h-5 w-5 text-[#006AFF]" />
                      All Contact Numbers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-mono">{selectedProvider.all_phones}</p>
                    {selectedProvider.all_faxes && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Faxes:</strong> {selectedProvider.all_faxes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Dates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#006AFF]" />
                    Important Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedProvider.enumeration_date && (
                    <div>
                      <p className="text-sm text-gray-600">Enumeration Date</p>
                      <p className="font-medium">{new Date(selectedProvider.enumeration_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedProvider.last_update_date && (
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="font-medium">{new Date(selectedProvider.last_update_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedProvider.created_at && (
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium">{new Date(selectedProvider.created_at).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedProvider.updated_at && (
                    <div>
                      <p className="text-sm text-gray-600">Record Updated</p>
                      <p className="font-medium">{new Date(selectedProvider.updated_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

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








