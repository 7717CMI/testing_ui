'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Building2,
  Activity,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Database,
  ArrowRight,
  Shield,
  Home,
  MapPin,
  Phone,
  Calendar,
  Users,
} from 'lucide-react'

// Mock data to demonstrate the functionality
const mockCategories = [
  {
    id: 1,
    name: 'Hospitals',
    display_name: 'Hospitals',
    description: 'Acute care hospitals, critical access hospitals, and general medical facilities',
    provider_count: 850000,
    facility_types_count: 12
  },
  {
    id: 2,
    name: 'Clinics',
    display_name: 'Clinics',
    description: 'Outpatient clinics, urgent care centers, and specialty medical offices',
    provider_count: 1200000,
    facility_types_count: 8
  },
  {
    id: 3,
    name: 'Laboratory',
    display_name: 'Laboratory',
    description: 'Clinical laboratories, diagnostic testing centers, and research facilities',
    provider_count: 410000,
    facility_types_count: 6
  },
  {
    id: 4,
    name: 'Pharmacy',
    display_name: 'Pharmacy',
    description: 'Retail pharmacies, hospital pharmacies, and specialty pharmaceutical services',
    provider_count: 620000,
    facility_types_count: 4
  },
  {
    id: 5,
    name: 'Mental Health Units',
    display_name: 'Mental Health Units',
    description: 'Psychiatric hospitals, behavioral health clinics, and addiction treatment centers',
    provider_count: 390000,
    facility_types_count: 7
  },
  {
    id: 6,
    name: 'Home Health Agency',
    display_name: 'Home Health Agency',
    description: 'Home healthcare providers, in-home nursing services, and mobile care units',
    provider_count: 520000,
    facility_types_count: 5
  }
]

const mockFacilityTypes = {
  'Hospitals': [
    { id: 1, name: 'Acute Care Hospital', display_name: 'Acute Care Hospital', provider_count: 450000, description: 'General acute care hospitals providing comprehensive medical services' },
    { id: 2, name: 'Critical Access Hospital', display_name: 'Critical Access Hospital', provider_count: 120000, description: 'Small rural hospitals with limited inpatient services' },
    { id: 3, name: 'Children\'s Hospital', display_name: 'Children\'s Hospital', provider_count: 85000, description: 'Specialized hospitals for pediatric care' },
    { id: 4, name: 'Military Hospital', display_name: 'Military Hospital', provider_count: 45000, description: 'Hospitals operated by military services' },
    { id: 5, name: 'Psychiatric Hospital', display_name: 'Psychiatric Hospital', provider_count: 78000, description: 'Hospitals specializing in mental health treatment' },
    { id: 6, name: 'Rehabilitation Hospital', display_name: 'Rehabilitation Hospital', provider_count: 92000, description: 'Hospitals focused on physical and occupational therapy' }
  ],
  'Clinics': [
    { id: 7, name: 'Outpatient Clinic', display_name: 'Outpatient Clinic', provider_count: 650000, description: 'General outpatient medical clinics' },
    { id: 8, name: 'Urgent Care Center', display_name: 'Urgent Care Center', provider_count: 280000, description: 'Walk-in clinics for non-emergency medical care' },
    { id: 9, name: 'Specialty Clinic', display_name: 'Specialty Clinic', provider_count: 270000, description: 'Clinics specializing in specific medical areas' }
  ]
}

const mockProviders = {
  'Acute Care Hospital': [
    {
      id: 1,
      provider_name: 'St. Mary\'s Medical Center',
      facility_type_name: 'Acute Care Hospital',
      business_city: 'Dallas',
      business_state: 'TX',
      business_phone: '(214) 555-1234',
      provider_credentials: 'MD',
      npi_number: '1234567890',
      enumeration_date: '2020-01-15'
    },
    {
      id: 2,
      provider_name: 'General Hospital of Los Angeles',
      facility_type_name: 'Acute Care Hospital',
      business_city: 'Los Angeles',
      business_state: 'CA',
      business_phone: '(213) 555-5678',
      provider_credentials: 'MD',
      npi_number: '1234567891',
      enumeration_date: '2019-03-22'
    },
    {
      id: 3,
      provider_name: 'Metropolitan Health Center',
      facility_type_name: 'Acute Care Hospital',
      business_city: 'New York',
      business_state: 'NY',
      business_phone: '(212) 555-9012',
      provider_credentials: 'MD',
      npi_number: '1234567892',
      enumeration_date: '2021-06-10'
    }
  ]
}

function getCategoryIcon(categoryName: string): string {
  const iconMap: Record<string, string> = {
    'Hospitals': '🏥',
    'Clinics': '⚕️',
    'Laboratory': '🔬',
    'Pharmacy': '💊',
    'Mental Health Units': '🧠',
    'Home Health Agency': '🏠',
  }
  return iconMap[categoryName] || '🏥'
}

function getCategorySlug(categoryName: string): string {
  return categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function getFacilityTypeSlug(facilityTypeName: string): string {
  return facilityTypeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function DataCatalogDemoPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedFacilityType, setSelectedFacilityType] = useState<string | null>(null)

  const filteredCategories = mockCategories.filter(cat =>
    cat.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalRecords = mockCategories.reduce((sum, cat) => sum + cat.provider_count, 0)

  // If a facility type is selected, show providers
  if (selectedFacilityType) {
    const providers = mockProviders[selectedFacilityType as keyof typeof mockProviders] || []
    return (
      <div className="min-h-screen bg-[#f8faff]">
        {/* Header */}
        <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-[#006AFF]" />
              <span className="text-xl font-bold text-gray-900">HealthData AI</span>
            </Link>
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
              <Link href="/data-catalog-demo" className="hover:text-[#006AFF] transition-colors">
                Data Catalog
              </Link>
              <span>/</span>
              <button 
                onClick={() => setSelectedFacilityType(null)}
                className="hover:text-[#006AFF] transition-colors"
              >
                {selectedCategory}
              </button>
              <span>/</span>
              <span className="text-[#006AFF] font-medium">{selectedFacilityType}</span>
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#006AFF]/5 via-white to-[#006AFF]/5 py-16 border-b">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={() => setSelectedFacilityType(null)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  ← Back to {selectedCategory}
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-[#006AFF]/10 flex items-center justify-center text-4xl">
                  {getCategoryIcon(selectedCategory || '')}
                </div>
              </div>

              <Badge className="bg-[#006AFF]/10 text-[#006AFF] border-[#006AFF]/20 hover:bg-[#006AFF]/20">
                <Database className="h-3 w-3 mr-1" />
                Demo Healthcare Data
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
                {selectedFacilityType}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Explore {selectedFacilityType.toLowerCase()} facilities across the United States with real-time data from our PostgreSQL database.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#006AFF]">
                    {providers.length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Sample Facilities</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#006AFF]">3</div>
                  <div className="text-sm text-gray-600 mt-1">Showing</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#006AFF]">50</div>
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

        {/* Data Table */}
        <section className="py-16">
          <div className="container">
            <div className="space-y-4">
              {providers.map((provider) => (
                <Card key={provider.id} className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#006AFF]/10 flex items-center justify-center text-2xl">
                          {getCategoryIcon(selectedCategory || '')}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">
                            {provider.provider_name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {provider.provider_credentials}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {provider.business_city}, {provider.business_state}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {provider.business_phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                        <div className="text-xs text-gray-500">
                          NPI: {provider.npi_number}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(provider.enumeration_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  // If a category is selected, show facility types
  if (selectedCategory) {
    const facilityTypes = mockFacilityTypes[selectedCategory as keyof typeof mockFacilityTypes] || []
    return (
      <div className="min-h-screen bg-[#f8faff]">
        {/* Header */}
        <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-[#006AFF]" />
              <span className="text-xl font-bold text-gray-900">HealthData AI</span>
            </Link>
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
              <button 
                onClick={() => setSelectedCategory(null)}
                className="hover:text-[#006AFF] transition-colors"
              >
                Data Catalog
              </button>
              <span>/</span>
              <span className="text-[#006AFF] font-medium">{selectedCategory}</span>
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#006AFF]/5 via-white to-[#006AFF]/5 py-16 border-b">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  ← Back to Catalog
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-[#006AFF]/10 flex items-center justify-center text-4xl">
                  {getCategoryIcon(selectedCategory)}
                </div>
              </div>

              <Badge className="bg-[#006AFF]/10 text-[#006AFF] border-[#006AFF]/20 hover:bg-[#006AFF]/20">
                <Database className="h-3 w-3 mr-1" />
                Demo Healthcare Data
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
                {selectedCategory}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Explore {selectedCategory.toLowerCase()} facilities across the United States with real-time data from our PostgreSQL database.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#006AFF]">
                    {mockCategories.find(c => c.display_name === selectedCategory)?.provider_count.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Total Facilities</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#006AFF]">{facilityTypes.length}</div>
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

        {/* Facility Types Grid */}
        <section className="py-16">
          <div className="container">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilityTypes.map((facilityType) => (
                <Card
                  key={facilityType.id}
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white border-gray-200 hover:border-[#006AFF]/30"
                  onClick={() => setSelectedFacilityType(facilityType.display_name)}
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-lg bg-[#006AFF]/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {getCategoryIcon(selectedCategory)}
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
                        {facilityType.description}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="pt-4 border-t border-gray-100 space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Category: {selectedCategory}</span>
                        <span>Real-time</span>
                      </div>
                    </div>

                    {/* Action */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4 border-[#006AFF]/30 text-[#006AFF] hover:bg-[#006AFF] hover:text-white group-hover:border-[#006AFF]"
                      onClick={() => setSelectedFacilityType(facilityType.display_name)}
                    >
                      View Data
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  // Main catalog overview
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
            <Link href="/data-catalog-demo" className="text-sm font-medium text-[#006AFF]">
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
              Demo Healthcare Data Catalog
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
              Healthcare Data Catalog
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Access {(totalRecords / 1000000).toFixed(1)}M+ verified healthcare records across {mockCategories.length} facility categories. This is a demo showing the complete functionality.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#006AFF]">
                  {(totalRecords / 1000000).toFixed(1)}M+
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Records</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#006AFF]">{mockCategories.length}</div>
                <div className="text-sm text-gray-600 mt-1">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#006AFF]">50+</div>
                <div className="text-sm text-gray-600 mt-1">Facility Types</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#006AFF]">100%</div>
                <div className="text-sm text-gray-600 mt-1">Demo Data</div>
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
              <Button variant="outline" size="sm" className="border-gray-300">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Data Catalog Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <Card
                key={category.id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white border-gray-200 hover:border-[#006AFF]/30"
                onClick={() => setSelectedCategory(category.display_name)}
              >
                <CardContent className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-lg bg-[#006AFF]/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {getCategoryIcon(category.display_name)}
                    </div>
                    <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Demo
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
                      {category.description}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Facility Types: {category.facility_types_count}</span>
                      <span>Demo Data</span>
                    </div>
                  </div>

                  {/* Action */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 border-[#006AFF]/30 text-[#006AFF] hover:bg-[#006AFF] hover:text-white group-hover:border-[#006AFF]"
                    onClick={() => setSelectedCategory(category.display_name)}
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[#006AFF] to-[#0052CC] py-16 text-white">
        <div className="container text-center space-y-6">
          <h2 className="text-4xl font-bold">Ready to Access Premium Healthcare Data?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            This demo shows the complete Data Catalog functionality. Connect to your real PostgreSQL database to see live data.
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
              © 2025 HealthData AI | Demo Data Catalog - Connect to PostgreSQL for live data
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









