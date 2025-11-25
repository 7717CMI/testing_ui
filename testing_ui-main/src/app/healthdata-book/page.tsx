'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
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
  TrendingUp,
  Database,
  ArrowRight,
  Shield,
} from 'lucide-react'

const dataCategories = [
  {
    name: 'Hospitals',
    icon: '🏥',
    count: '850,000',
    verified: true,
    lastUpdated: 'Oct 2025',
    source: 'CMS',
    breakdown: { private: '420K', public: '230K', nonprofit: '200K' },
    description: 'Acute care hospitals, critical access hospitals, and general medical facilities',
  },
  {
    name: 'Clinics',
    icon: '⚕️',
    count: '1,200,000',
    verified: true,
    lastUpdated: 'Oct 2025',
    source: 'NPPES',
    breakdown: { private: '800K', public: '250K', nonprofit: '150K' },
    description: 'Outpatient clinics, urgent care centers, and specialty medical offices',
  },
  {
    name: 'Agencies',
    icon: '🏛️',
    count: '450,000',
    verified: true,
    lastUpdated: 'Oct 2025',
    source: 'CMS',
    breakdown: { federal: '150K', state: '180K', local: '120K' },
    description: 'Healthcare agencies, regulatory bodies, and administrative organizations',
  },
  {
    name: 'Assisted Living',
    icon: '🏡',
    count: '680,000',
    verified: true,
    lastUpdated: 'Oct 2025',
    source: 'NPPES',
    breakdown: { private: '420K', nonprofit: '180K', public: '80K' },
    description: 'Senior living communities, memory care facilities, and residential care homes',
  },
  {
    name: 'Blood & Eye Banks',
    icon: '🩸',
    count: '120,000',
    verified: true,
    lastUpdated: 'Oct 2025',
    source: 'FDA',
    breakdown: { blood: '70K', tissue: '30K', eye: '20K' },
    description: 'Blood banks, tissue repositories, and organ transplant centers',
  },
  {
    name: 'Custodial Facilities',
    icon: '🏢',
    count: '340,000',
    verified: true,
    lastUpdated: 'Oct 2025',
    source: 'CMS',
    breakdown: { nursing: '180K', rehab: '100K', palliative: '60K' },
    description: 'Custodial care facilities, nursing homes, and long-term care centers',
  },
  {
    name: 'Home Health Agency',
    icon: '🏠',
    count: '520,000',
    verified: true,
    lastUpdated: 'Oct 2025',
    source: 'CMS',
    breakdown: { certified: '320K', private: '150K', nonprofit: '50K' },
    description: 'Home healthcare providers, in-home nursing services, and mobile care units',
  },
  {
    name: 'Hospice',
    icon: '💚',
    count: '280,000',
    verified: true,
    lastUpdated: 'Oct 2025',
    source: 'CMS',
    breakdown: { inpatient: '120K', athome: '110K', respite: '50K' },
    description: 'Hospice care facilities, palliative care centers, and end-of-life services',
  },
  {
    name: 'Laboratory',
    icon: '🔬',
    count: '410,000',
    verified: true,
    lastUpdated: 'Oct 2025',
    source: 'CLIA',
    breakdown: { clinical: '220K', research: '120K', reference: '70K' },
    description: 'Clinical laboratories, diagnostic testing centers, and research facilities',
  },
  {
    name: 'Mental Health Units',
    icon: '🧠',
    count: '390,000',
    verified: true,
    lastUpdated: 'Oct 2025',
    source: 'SAMHSA',
    breakdown: { inpatient: '140K', outpatient: '180K', residential: '70K' },
    description: 'Psychiatric hospitals, behavioral health clinics, and addiction treatment centers',
  },
  {
    name: 'Pharmacy',
    icon: '💊',
    count: '620,000',
    verified: true,
    lastUpdated: 'Oct 2025',
    source: 'DEA',
    breakdown: { retail: '380K', hospital: '150K', specialty: '90K' },
    description: 'Retail pharmacies, hospital pharmacies, and specialty pharmaceutical services',
  },
  {
    name: 'SNF (Skilled Nursing)',
    icon: '🏥',
    count: '480,000',
    verified: true,
    lastUpdated: 'Oct 2025',
    source: 'CMS',
    breakdown: { certified: '280K', private: '140K', government: '60K' },
    description: 'Skilled nursing facilities, post-acute care centers, and rehabilitation hospitals',
  },
]

export default function HealthDataBookPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredCategories = dataCategories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalRecords = dataCategories.reduce((sum, cat) => sum + parseInt(cat.count.replace(/,/g, '')), 0)

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
            <Link href="/healthdata-book" className="text-sm font-medium text-[#006AFF]">
              Data Book
            </Link>
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-[#006AFF] transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-[#006AFF] transition-colors">
              Pricing
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
              Enterprise Healthcare Data Catalog
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
              HealthData AI Catalog
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Access {(totalRecords / 1000000).toFixed(1)}M+ verified healthcare records across 12 facility categories.
              Purchase exactly the data you need with flexible, credit-based pricing.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#006AFF]">{(totalRecords / 1000000).toFixed(1)}M+</div>
                <div className="text-sm text-gray-600 mt-1">Total Records</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#006AFF]">12</div>
                <div className="text-sm text-gray-600 mt-1">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#006AFF]">50+</div>
                <div className="text-sm text-gray-600 mt-1">Attributes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#006AFF]">100%</div>
                <div className="text-sm text-gray-600 mt-1">Verified</div>
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
            {filteredCategories.map((category, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white border-gray-200 hover:border-[#006AFF]/30"
                onClick={() => setSelectedCategory(category.name)}
              >
                <CardContent className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-lg bg-[#006AFF]/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {category.icon}
                    </div>
                    {category.verified && (
                      <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {/* Name & Count */}
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#006AFF] transition-colors">
                      {category.name}
                    </h3>
                    <div className="text-3xl font-bold text-[#006AFF] mt-2">
                      {category.count}+
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {category.description}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Source: {category.source}</span>
                      <span>Updated: {category.lastUpdated}</span>
                    </div>
                    
                    {/* Breakdown on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-xs text-gray-600 space-y-1">
                        {Object.entries(category.breakdown).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key}:</span>
                            <span className="font-semibold">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <Link href={`/category/${category.name.toLowerCase()}`}>
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
              © 2025 HealthData AI | Data verified by CMS, NPPES & FDA
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
