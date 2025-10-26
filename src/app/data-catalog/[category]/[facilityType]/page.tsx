'use client'

import { useState, useMemo } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  Newspaper,
} from 'lucide-react'
import { useBookmarksStore } from '@/stores/bookmarks-store'
import { SmartSearchComponent } from '@/components/smart-search'
import { motion } from 'framer-motion'

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

// All 50 US States
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
  'Wisconsin', 'Wyoming'
]

export default function FacilityTypePage() {
  const params = useParams()
  const categorySlug = params.category as string
  const facilityTypeSlug = params.facilityType as string
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(50)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<ProviderInfo | null>(null)
  const [citySearch, setCitySearch] = useState('')
  const [filters, setFilters] = useState({
    state: '',
    city: '',
    zipcode: '',
    hasPhone: false
  })

  // Bookmarks store
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useBookmarksStore()

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

  // Extract unique cities with counts for dropdowns
  const { citiesWithCounts } = useMemo(() => {
    if (!providersData?.providers) {
      return { citiesWithCounts: [] }
    }

    const cityCountMap = new Map<string, number>()

    providersData.providers.forEach(provider => {
      // Only add cities that match the selected state (or all if no state selected)
      if (!filters.state || filters.state === 'all' || provider.business_state === filters.state) {
        if (provider.business_city) {
          const city = provider.business_city
          cityCountMap.set(city, (cityCountMap.get(city) || 0) + 1)
        }
      }
    })

    // Convert to array and sort by name
    const citiesArray = Array.from(cityCountMap.entries()).map(([city, count]) => ({
      name: city,
      count: count
    })).sort((a, b) => a.name.localeCompare(b.name))

    return {
      citiesWithCounts: citiesArray,
    }
  }, [providersData, filters.state])

  // Filter cities based on search with fuzzy matching
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) {
      return citiesWithCounts
    }

    const searchLower = citySearch.toLowerCase().trim()
    
    return citiesWithCounts.filter(city => {
      const cityLower = city.name.toLowerCase()
      
      // Exact match or starts with
      if (cityLower.includes(searchLower)) {
        return true
      }
      
      // Fuzzy match - check if all characters appear in order
      let searchIndex = 0
      for (let i = 0; i < cityLower.length && searchIndex < searchLower.length; i++) {
        if (cityLower[i] === searchLower[searchIndex]) {
          searchIndex++
        }
      }
      return searchIndex === searchLower.length
    }).slice(0, 100) // Limit to 100 results for performance
  }, [citiesWithCounts, citySearch])

  const filteredProviders = providersData?.providers.filter(provider => {
    // Search filter
    const searchMatch = !searchQuery || 
      provider.provider_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.business_city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.business_state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.business_zip_code?.toLowerCase().includes(searchQuery.toLowerCase())
    
    // State filter
    const stateMatch = !filters.state || filters.state === 'all' || provider.business_state === filters.state
    
    // City filter
    const cityMatch = !filters.city || filters.city === 'all' || provider.business_city === filters.city
    
    // Zipcode filter (partial match for text input)
    const zipcodeMatch = !filters.zipcode || provider.business_zip_code?.includes(filters.zipcode)
    
    // Phone filter
    const phoneMatch = !filters.hasPhone || (provider.business_phone && provider.business_phone.trim() !== '')
    
    return searchMatch && stateMatch && cityMatch && zipcodeMatch && phoneMatch
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
      zipcode: '',
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
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left side: Logo + Navigation */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 flex-shrink-0">
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
            </div>
            {/* Right side: Auth buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/login">
                <Button variant="outline" size="sm" className="border-gray-300">Login</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-[#006AFF] hover:bg-[#0052CC]">Sign Up</Button>
              </Link>
            </div>
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
                <Skeleton className="w-20 h-20 rounded-2xl" />
              ) : (
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg text-4xl"
                >
                  {categoryInfo ? getCategoryIcon(categoryInfo.display_name) : '🏥'}
                </motion.div>
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
                  <motion.div 
                    className="text-3xl font-bold"
                    style={{
                      background: 'linear-gradient(90deg, #006AFF, #8A2BE2, #006AFF)',
                      backgroundSize: '200% 200%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    {facilityTypeInfo?.provider_count.toLocaleString() || '0'}
                  </motion.div>
                )}
                <div className="text-sm text-gray-600 mt-1">Total Facilities</div>
              </div>
              <div className="text-center">
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                ) : (
                  <motion.div 
                    className="text-3xl font-bold"
                    style={{
                      background: 'linear-gradient(90deg, #006AFF, #8A2BE2, #006AFF)',
                      backgroundSize: '200% 200%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    {providersData?.total_count.toLocaleString() || '0'}
                  </motion.div>
                )}
                <div className="text-sm text-gray-600 mt-1">Showing</div>
              </div>
              <div className="text-center">
                <motion.div 
                  className="text-3xl font-bold"
                  style={{
                    background: 'linear-gradient(90deg, #006AFF, #8A2BE2, #006AFF)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  {pageSize}
                </motion.div>
                <div className="text-sm text-gray-600 mt-1">Per Page</div>
              </div>
              <div className="text-center">
                <motion.div 
                  className="text-3xl font-bold"
                  style={{
                    background: 'linear-gradient(90deg, #006AFF, #8A2BE2, #006AFF)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  100%
                </motion.div>
                <div className="text-sm text-gray-600 mt-1">Live Data</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Search Section */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-blue-50 border-b py-8">
        <div className="container max-w-6xl">
          <SmartSearchComponent
            facilityType={facilityTypeInfo?.display_name}
            category={categoryInfo?.display_name}
            currentFilters={filters}
            currentResults={filteredProviders.length}
            onFiltersApplied={(extractedFilters) => {
              setFilters(prev => ({
                ...prev,
                state: extractedFilters.state || prev.state,
                city: extractedFilters.city || prev.city,
                zipcode: extractedFilters.zipcode || prev.zipcode,
                hasPhone: extractedFilters.hasPhone || prev.hasPhone,
              }))
            }}
          />
        </div>
      </section>

      {/* Traditional Filter Bar */}
      <section className="bg-white border-b py-6">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Or use traditional search by name, city, or state..."
                className="pl-10 bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Link 
                href={`/insights?facilityType=${encodeURIComponent(facilityTypeInfo?.display_name || '')}&category=${encodeURIComponent(categoryInfo?.display_name || '')}`}
              >
                <Button 
                  variant="outline"
                  size="sm"
                  className="gap-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white"
                >
                  <TrendingUp className="h-4 w-4" />
                  View Insights
                </Button>
              </Link>
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
              <Link href="/bookmarks">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-[#006AFF] text-[#006AFF] hover:bg-[#006AFF] hover:text-white"
                >
                  <BookmarkCheck className="h-4 w-4 mr-2" />
                  View Bookmarks
                  {bookmarks.length > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-[#006AFF] text-white rounded">
                      {bookmarks.length}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State <span className="text-xs text-gray-500">(Select state first)</span>
                  </label>
                  <Select
                    value={filters.state}
                    onValueChange={(value) => {
                      setFilters({ ...filters, state: value, city: '' }) // Reset city when state changes
                    }}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="All States" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="all">All States</SelectItem>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-xs text-gray-500">(Type to search)</span>
                  </label>
                  <div className="relative">
                    <Select
                      value={filters.city}
                      onValueChange={(value) => {
                        setFilters({ ...filters, city: value })
                        setCitySearch('')
                      }}
                      disabled={!filters.state || filters.state === 'all'}
                      onOpenChange={(open) => {
                        if (!open) setCitySearch('')
                      }}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder={
                          !filters.state || filters.state === 'all' 
                            ? "Select state first" 
                            : filters.city && filters.city !== 'all'
                              ? `${filters.city} (${citiesWithCounts.find(c => c.name === filters.city)?.count || 0})`
                              : "All Cities"
                        } />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <div className="px-2 py-2 sticky top-0 bg-white border-b">
                          <Input
                            placeholder="Type to search cities..."
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                            className="h-8 text-sm"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          />
                        </div>
                        <SelectItem value="all">
                          All Cities ({citiesWithCounts.reduce((sum, c) => sum + c.count, 0)} facilities)
                        </SelectItem>
                        {filteredCities.length > 0 ? (
                          filteredCities.map((city) => (
                            <SelectItem key={city.name} value={city.name}>
                              {city.name} ({city.count} {city.count === 1 ? 'facility' : 'facilities'})
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-6 text-center text-sm text-gray-500">
                            No cities found. Try a different search.
                          </div>
                        )}
                        {citySearch && filteredCities.length === citiesWithCounts.length && (
                          <div className="px-2 py-2 text-xs text-gray-500 border-t">
                            Showing all {filteredCities.length} cities
                          </div>
                        )}
                        {citySearch && filteredCities.length < citiesWithCounts.length && filteredCities.length > 0 && (
                          <div className="px-2 py-2 text-xs text-gray-500 border-t">
                            Showing {filteredCities.length} of {citiesWithCounts.length} cities
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code <span className="text-xs text-gray-500">(Type to search)</span>
                  </label>
                  <Input
                    placeholder="e.g., 90210"
                    value={filters.zipcode}
                    onChange={(e) => setFilters({ ...filters, zipcode: e.target.value })}
                    className="bg-white"
                    maxLength={10}
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
              <div className="mt-4 flex gap-2 flex-wrap">
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
                {filters.state && filters.state !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    State: {filters.state}
                  </Badge>
                )}
                {filters.city && filters.city !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    City: {filters.city}
                  </Badge>
                )}
                {filters.zipcode && (
                  <Badge variant="secondary" className="text-xs">
                    ZIP: {filters.zipcode}
                  </Badge>
                )}
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
            <div className="grid grid-cols-1 gap-6">
              {filteredProviders.map((provider) => {
                const bookmarked = isBookmarked(provider.npi_number || '')
                
                return (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="group"
                >
                  <Card 
                    className="bg-white border-gray-200 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 ease-in-out cursor-pointer relative hover:translate-y-[-4px]"
                  >
                    {/* Bookmark Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (bookmarked) {
                          removeBookmark(provider.npi_number || '')
                        } else {
                          addBookmark({
                            id: provider.id.toString(),
                            npi: provider.npi_number || '',
                            name: provider.provider_name,
                            city: provider.business_city || '',
                            state: provider.business_state || '',
                            phone: provider.business_phone || undefined,
                            facilityType: facilityTypeInfo?.name || '',
                            category: categoryInfo?.name || '',
                          })
                        }
                      }}
                      className={`absolute top-6 right-6 p-2.5 rounded-full transition-all z-10 ${
                        bookmarked 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-100' 
                          : 'bg-gray-100 text-gray-400 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 scale-90 hover:scale-100'
                      }`}
                      title={bookmarked ? 'Remove bookmark' : 'Bookmark facility'}
                    >
                      {bookmarked ? (
                        <BookmarkCheck className="h-5 w-5" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </button>

                    <CardContent className="p-8" onClick={() => setSelectedProvider(provider)}>
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-6 flex-1 min-w-0">
                          <motion.div 
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                            className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg flex-shrink-0"
                          >
                            {getCategoryIcon(provider.facility_category_name)}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors truncate">
                              {provider.provider_name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              {provider.provider_credentials && (
                                <span className="flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-full">
                                  <Users className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium text-blue-900">{provider.provider_credentials}</span>
                                </span>
                              )}
                              {provider.business_city && provider.business_state && (
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span>{provider.business_city}, {provider.business_state}</span>
                                </span>
                              )}
                              {provider.business_phone && (
                                <span className="flex items-center gap-1.5">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <span className="font-mono">{provider.business_phone}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3 flex-shrink-0">
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                            Active
                          </Badge>
                          {provider.npi_number && (
                            <div className="text-xs text-gray-500 font-mono">
                              NPI: {provider.npi_number}
                            </div>
                          )}
                          {provider.enumeration_date && (
                            <div className="text-xs text-gray-500 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(provider.enumeration_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Floating Action Icon */}
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
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex flex-col md:flex-row items-center justify-between mt-12 gap-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-700">
                Showing <span className="text-blue-600 font-bold">{currentPage * pageSize + 1}</span> to <span className="text-blue-600 font-bold">{Math.min((currentPage + 1) * pageSize, providersData?.total_count || 0)}</span> of <span className="text-blue-600 font-bold">{providersData?.total_count || 0}</span> facilities
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + Math.max(0, currentPage - 2)
                    if (page >= totalPages) return null
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={page === currentPage 
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg min-w-[40px]" 
                          : "border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 min-w-[40px]"
                        }
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
                  className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
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
            
            {/* View News Timeline Button */}
            <Link 
              href={`/entity-news?name=${encodeURIComponent(selectedProvider?.provider_name || '')}&type=${encodeURIComponent(selectedProvider?.facility_type_name || categoryInfo?.display_name || '')}&location=${encodeURIComponent(`${selectedProvider?.business_city || ''}, ${selectedProvider?.business_state || ''}`.trim())}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all"
              >
                <Newspaper className="h-4 w-4 mr-2" />
                View News Timeline (Past Year)
              </Button>
            </Link>
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








