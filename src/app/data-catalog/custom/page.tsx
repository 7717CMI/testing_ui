'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Building2,
  Activity,
  Download,
  Database,
  Filter,
  X,
  Search,
  MapPin,
  Home,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

interface FilterState {
  categories: number[]
  facility_types: number[]
  states: string[]
  cities: string[]
  zip_codes: string[]
  has_phone: boolean
  has_fax: boolean
}

interface Category {
  id: number
  name: string
  display_name: string
  provider_count: number
}

interface FacilityType {
  id: number
  name: string
  display_name: string
  provider_count: number
  category_id?: number
  category_name?: string
}

interface State {
  id: number
  code: string
  name: string
}

export default function CustomDataPage() {
  const searchParams = useSearchParams()
  const preSelectedCategoryId = searchParams.get('category')
  
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    facility_types: [],
    states: [],
    cities: [],
    zip_codes: [],
    has_phone: false,
    has_fax: false,
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>([])
  const [states, setStates] = useState<State[]>([])
  const [cityInput, setCityInput] = useState('')
  const [zipInput, setZipInput] = useState('')
  const [matchingCount, setMatchingCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchFacilityType, setSearchFacilityType] = useState('')

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/v1/catalog/categories')
        const data = await response.json()
        setCategories(data.data?.categories || data.categories || [])
        
        if (preSelectedCategoryId) {
          setFilters(prev => ({
            ...prev,
            categories: [parseInt(preSelectedCategoryId)]
          }))
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    
    fetchCategories()
  }, [preSelectedCategoryId])

  // Fetch facility types based on selected categories
  useEffect(() => {
    async function fetchFacilityTypes() {
      if (filters.categories.length === 0) {
        setFacilityTypes([])
        return
      }

      try {
        const allTypesPromises = filters.categories.map(async (categoryId) => {
          const typesResponse = await fetch(`/api/v1/catalog/categories/${categoryId}/types`)
          const typesData = await typesResponse.json()
          const category = categories.find(c => c.id === categoryId)
          return typesData.data.facility_types.map((type: any) => ({
            ...type,
            category_id: categoryId,
            category_name: category?.display_name || ''
          }))
        })
        
        const allTypes = (await Promise.all(allTypesPromises)).flat()
        setFacilityTypes(allTypes)
      } catch (error) {
        console.error('Error fetching facility types:', error)
      }
    }
    
    fetchFacilityTypes()
  }, [filters.categories, categories])

  // Mock states data - in production, fetch from API
  useEffect(() => {
    setStates([
      { id: 1, code: 'AL', name: 'Alabama' },
      { id: 2, code: 'AK', name: 'Alaska' },
      { id: 3, code: 'AZ', name: 'Arizona' },
      { id: 4, code: 'AR', name: 'Arkansas' },
      { id: 5, code: 'CA', name: 'California' },
      { id: 6, code: 'CO', name: 'Colorado' },
      { id: 7, code: 'CT', name: 'Connecticut' },
      { id: 8, code: 'DE', name: 'Delaware' },
      { id: 9, code: 'FL', name: 'Florida' },
      { id: 10, code: 'GA', name: 'Georgia' },
      { id: 11, code: 'HI', name: 'Hawaii' },
      { id: 12, code: 'ID', name: 'Idaho' },
      { id: 13, code: 'IL', name: 'Illinois' },
      { id: 14, code: 'IN', name: 'Indiana' },
      { id: 15, code: 'IA', name: 'Iowa' },
      { id: 16, code: 'KS', name: 'Kansas' },
      { id: 17, code: 'KY', name: 'Kentucky' },
      { id: 18, code: 'LA', name: 'Louisiana' },
      { id: 19, code: 'ME', name: 'Maine' },
      { id: 20, code: 'MD', name: 'Maryland' },
      { id: 21, code: 'MA', name: 'Massachusetts' },
      { id: 22, code: 'MI', name: 'Michigan' },
      { id: 23, code: 'MN', name: 'Minnesota' },
      { id: 24, code: 'MS', name: 'Mississippi' },
      { id: 25, code: 'MO', name: 'Missouri' },
      { id: 26, code: 'MT', name: 'Montana' },
      { id: 27, code: 'NE', name: 'Nebraska' },
      { id: 28, code: 'NV', name: 'Nevada' },
      { id: 29, code: 'NH', name: 'New Hampshire' },
      { id: 30, code: 'NJ', name: 'New Jersey' },
      { id: 31, code: 'NM', name: 'New Mexico' },
      { id: 32, code: 'NY', name: 'New York' },
      { id: 33, code: 'NC', name: 'North Carolina' },
      { id: 34, code: 'ND', name: 'North Dakota' },
      { id: 35, code: 'OH', name: 'Ohio' },
      { id: 36, code: 'OK', name: 'Oklahoma' },
      { id: 37, code: 'OR', name: 'Oregon' },
      { id: 38, code: 'PA', name: 'Pennsylvania' },
      { id: 39, code: 'RI', name: 'Rhode Island' },
      { id: 40, code: 'SC', name: 'South Carolina' },
      { id: 41, code: 'SD', name: 'South Dakota' },
      { id: 42, code: 'TN', name: 'Tennessee' },
      { id: 43, code: 'TX', name: 'Texas' },
      { id: 44, code: 'UT', name: 'Utah' },
      { id: 45, code: 'VT', name: 'Vermont' },
      { id: 46, code: 'VA', name: 'Virginia' },
      { id: 47, code: 'WA', name: 'Washington' },
      { id: 48, code: 'WV', name: 'West Virginia' },
      { id: 49, code: 'WI', name: 'Wisconsin' },
      { id: 50, code: 'WY', name: 'Wyoming' },
    ])
  }, [])

  // Get matching count
  useEffect(() => {
    async function getCount() {
      if (filters.facility_types.length === 0 && filters.states.length === 0 && 
          filters.cities.length === 0 && filters.zip_codes.length === 0) {
        setMatchingCount(null)
        return
      }

      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        
        if (filters.facility_types.length > 0) {
          params.append('facility_type_ids', filters.facility_types.join(','))
        }
        if (filters.states.length > 0) {
          params.append('states', filters.states.join(','))
        }
        if (filters.cities.length > 0) {
          params.append('cities', filters.cities.join(','))
        }
        if (filters.zip_codes.length > 0) {
          params.append('zip_codes', filters.zip_codes.join(','))
        }
        if (filters.has_phone) {
          params.append('has_phone', 'true')
        }
        if (filters.has_fax) {
          params.append('has_fax', 'true')
        }

        const response = await fetch(`/api/v1/catalog/custom/count?${params}`)
        const data = await response.json()
        setMatchingCount(data.count)
      } catch (error) {
        console.error('Error getting count:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(getCount, 500)
    return () => clearTimeout(debounce)
  }, [filters])

  function toggleCategory(categoryId: number) {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId],
      // Clear facility types when categories change
      facility_types: prev.categories.includes(categoryId)
        ? prev.facility_types.filter(ftId => {
            const ft = facilityTypes.find(t => t.id === ftId)
            return ft?.category_id !== categoryId
          })
        : prev.facility_types
    }))
  }

  function toggleFacilityType(typeId: number) {
    setFilters(prev => ({
      ...prev,
      facility_types: prev.facility_types.includes(typeId)
        ? prev.facility_types.filter(id => id !== typeId)
        : [...prev.facility_types, typeId]
    }))
  }

  function toggleState(stateCode: string) {
    setFilters(prev => ({
      ...prev,
      states: prev.states.includes(stateCode)
        ? prev.states.filter(s => s !== stateCode)
        : [...prev.states, stateCode]
    }))
  }

  function addCity() {
    if (cityInput.trim() && !filters.cities.includes(cityInput.trim())) {
      setFilters(prev => ({
        ...prev,
        cities: [...prev.cities, cityInput.trim()]
      }))
      setCityInput('')
    }
  }

  function removeCity(city: string) {
    setFilters(prev => ({
      ...prev,
      cities: prev.cities.filter(c => c !== city)
    }))
  }

  function addZipCode() {
    if (zipInput.trim() && !filters.zip_codes.includes(zipInput.trim())) {
      setFilters(prev => ({
        ...prev,
        zip_codes: [...prev.zip_codes, zipInput.trim()]
      }))
      setZipInput('')
    }
  }

  function removeZipCode(zip: string) {
    setFilters(prev => ({
      ...prev,
      zip_codes: prev.zip_codes.filter(z => z !== zip)
    }))
  }

  function clearAllFilters() {
    setFilters({
      facility_types: [],
      states: [],
      cities: [],
      zip_codes: [],
      has_phone: false,
      has_fax: false,
    })
    setCityInput('')
    setZipInput('')
  }

  async function handleExportCSV() {
    const params = new URLSearchParams()
    
    if (filters.facility_types.length > 0) {
      params.append('facility_type_ids', filters.facility_types.join(','))
    }
    if (filters.states.length > 0) {
      params.append('states', filters.states.join(','))
    }
    if (filters.cities.length > 0) {
      params.append('cities', filters.cities.join(','))
    }
    if (filters.zip_codes.length > 0) {
      params.append('zip_codes', filters.zip_codes.join(','))
    }
    if (filters.has_phone) {
      params.append('has_phone', 'true')
    }
    if (filters.has_fax) {
      params.append('has_fax', 'true')
    }

    window.open(`/api/v1/catalog/custom/export?${params}`, '_blank')
  }

  const filteredFacilityTypes = facilityTypes.filter(type =>
    type.display_name.toLowerCase().includes(searchFacilityType.toLowerCase())
  )

  const activeFiltersCount = 
    filters.categories.length +
    filters.facility_types.length +
    filters.states.length +
    filters.cities.length +
    filters.zip_codes.length +
    (filters.has_phone ? 1 : 0) +
    (filters.has_fax ? 1 : 0)

  return (
    <div className="min-h-screen bg-[#f8faff]">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
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
            <span className="text-[#006AFF] font-medium">Custom Dataset Builder</span>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#006AFF]/5 via-white to-[#006AFF]/5 py-16 border-b">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="bg-[#006AFF]/10 text-[#006AFF] border-[#006AFF]/20 hover:bg-[#006AFF]/20">
              <Filter className="h-3 w-3 mr-1" />
              Custom Dataset Builder
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
              Customize Your Healthcare Data
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Build your perfect dataset by selecting categories (Hospitals, Clinics, etc.), their types, states, cities, ZIP codes, and more. 
              Export only the data you need for your research or analysis.
            </p>

            {/* Results Preview */}
            <div className="flex items-center justify-center gap-6 pt-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#006AFF]">
                  {activeFiltersCount}
                </div>
                <div className="text-sm text-gray-600 mt-1">Active Filters</div>
              </div>
              <div className="h-12 w-px bg-gray-200" />
              <div className="text-center">
                <div className="text-4xl font-bold text-[#006AFF]">
                  {isLoading ? '...' : matchingCount !== null ? matchingCount.toLocaleString() : '0'}
                </div>
                <div className="text-sm text-gray-600 mt-1">Matching Providers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Builder */}
      <section className="py-16">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Filters */}
            <div className="lg:col-span-2 space-y-6">
              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-[#006AFF]" />
                      Categories
                    </span>
                    {filters.categories.length > 0 && (
                      <Badge variant="secondary">{filters.categories.length} selected</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Select healthcare categories (Hospitals, Clinics, etc.) to filter facility types
                  </p>
                  <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-4">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer border border-transparent hover:border-[#006AFF]/20"
                      >
                        <Checkbox
                          checked={filters.categories.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{category.display_name}</p>
                          <p className="text-xs text-gray-500">{category.provider_count?.toLocaleString() || 0} providers</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Facility Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-[#006AFF]" />
                      Facility Types
                    </span>
                    {filters.facility_types.length > 0 && (
                      <Badge variant="secondary">{filters.facility_types.length} selected</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filters.categories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Select categories above to view facility types</p>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search facility types..."
                          className="pl-10"
                          value={searchFacilityType}
                          onChange={(e) => setSearchFacilityType(e.target.value)}
                        />
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-3 border rounded-lg p-4">
                        {filteredFacilityTypes.map((type) => (
                          <label
                            key={type.id}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <Checkbox
                              checked={filters.facility_types.includes(type.id)}
                              onCheckedChange={() => toggleFacilityType(type.id)}
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{type.display_name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">{type.category_name}</Badge>
                                <span className="text-xs text-gray-500">{type.provider_count?.toLocaleString() || 0} providers</span>
                              </div>
                            </div>
                          </label>
                        ))}
                        {filteredFacilityTypes.length === 0 && (
                          <p className="text-center text-sm text-gray-500 py-4">No facility types found</p>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* States */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-[#006AFF]" />
                      States
                    </span>
                    {filters.states.length > 0 && (
                      <Badge variant="secondary">{filters.states.length} selected</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-64 overflow-y-auto grid grid-cols-2 gap-2 border rounded-lg p-4">
                    {states.map((state) => (
                      <label
                        key={state.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <Checkbox
                          checked={filters.states.includes(state.code)}
                          onCheckedChange={() => toggleState(state.code)}
                        />
                        <span className="text-sm">{state.name} ({state.code})</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-[#006AFF]" />
                      Cities
                    </span>
                    {filters.cities.length > 0 && (
                      <Badge variant="secondary">{filters.cities.length} selected</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter city name..."
                      value={cityInput}
                      onChange={(e) => setCityInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCity()}
                    />
                    <Button onClick={addCity}>Add</Button>
                  </div>
                  {filters.cities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {filters.cities.map((city) => (
                        <Badge key={city} variant="secondary" className="gap-1">
                          {city}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeCity(city)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ZIP Codes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-[#006AFF]" />
                      ZIP Codes
                    </span>
                    {filters.zip_codes.length > 0 && (
                      <Badge variant="secondary">{filters.zip_codes.length} selected</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter ZIP code..."
                      value={zipInput}
                      onChange={(e) => setZipInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addZipCode()}
                    />
                    <Button onClick={addZipCode}>Add</Button>
                  </div>
                  {filters.zip_codes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {filters.zip_codes.map((zip) => (
                        <Badge key={zip} variant="secondary" className="gap-1">
                          {zip}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeZipCode(zip)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-[#006AFF]" />
                    Additional Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer">
                    <Checkbox
                      checked={filters.has_phone}
                      onCheckedChange={(checked) => 
                        setFilters(prev => ({ ...prev, has_phone: checked as boolean }))
                      }
                    />
                    <div>
                      <p className="font-medium text-sm">Has Phone Number</p>
                      <p className="text-xs text-gray-500">Only include providers with phone numbers</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer">
                    <Checkbox
                      checked={filters.has_fax}
                      onCheckedChange={(checked) => 
                        setFilters(prev => ({ ...prev, has_fax: checked as boolean }))
                      }
                    />
                    <div>
                      <p className="font-medium text-sm">Has Fax Number</p>
                      <p className="text-xs text-gray-500">Only include providers with fax numbers</p>
                    </div>
                  </label>
                </CardContent>
              </Card>
            </div>

            {/* Summary & Actions */}
            <div className="space-y-6">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-[#006AFF]" />
                    Dataset Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Matching Records</p>
                    <p className="text-4xl font-bold text-[#006AFF]">
                      {isLoading ? (
                        <span className="text-2xl">Loading...</span>
                      ) : matchingCount !== null ? (
                        matchingCount.toLocaleString()
                      ) : (
                        <span className="text-2xl text-gray-400">Select filters</span>
                      )}
                    </p>
                  </div>

                  <div className="space-y-2 py-4 border-y">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Facility Types</span>
                      <span className="font-medium">{filters.facility_types.length || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">States</span>
                      <span className="font-medium">{filters.states.length || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Cities</span>
                      <span className="font-medium">{filters.cities.length || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">ZIP Codes</span>
                      <span className="font-medium">{filters.zip_codes.length || '-'}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      className="w-full bg-[#006AFF] hover:bg-[#0052CC]"
                      onClick={handleExportCSV}
                      disabled={matchingCount === null || matchingCount === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export to CSV
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={clearAllFilters}
                      disabled={activeFiltersCount === 0}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  </div>

                  {matchingCount === 0 && activeFiltersCount > 0 && (
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">No matching records</p>
                        <p className="text-xs mt-1">Try adjusting your filters</p>
                      </div>
                    </div>
                  )}

                  {matchingCount !== null && matchingCount > 0 && (
                    <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-green-800">
                        <p className="font-medium">Dataset ready!</p>
                        <p className="text-xs mt-1">
                          {matchingCount.toLocaleString()} providers match your criteria
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

