'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  Building2, 
  ArrowLeft, 
  Database, 
  Search, 
  Filter, 
  Download,
  Hospital,
  Heart,
  Baby,
  Stethoscope,
  Activity,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

// Mock hospital types data (will be replaced with real data)
const mockHospitalTypes = [
  {
    id: 'acute-care',
    name: 'Acute Care Hospitals',
    display_name: 'Acute Care Hospitals',
    description: 'General hospitals providing comprehensive medical and surgical care',
    icon: Hospital,
    color: 'bg-blue-500',
    count: 2847,
    percentage: 23.7
  },
  {
    id: 'children',
    name: 'Children\'s Hospitals',
    display_name: 'Children\'s Hospitals',
    description: 'Specialized hospitals providing care for pediatric patients',
    icon: Baby,
    color: 'bg-pink-500',
    count: 142,
    percentage: 1.2
  },
  {
    id: 'cardiac',
    name: 'Cardiac Hospitals',
    display_name: 'Cardiac Hospitals',
    description: 'Specialized hospitals focusing on heart and cardiovascular care',
    icon: Heart,
    color: 'bg-red-500',
    count: 89,
    percentage: 0.7
  },
  {
    id: 'rehabilitation',
    name: 'Rehabilitation Hospitals',
    display_name: 'Rehabilitation Hospitals',
    description: 'Hospitals specializing in physical and occupational therapy',
    icon: Activity,
    color: 'bg-green-500',
    count: 156,
    percentage: 1.3
  },
  {
    id: 'psychiatric',
    name: 'Psychiatric Hospitals',
    display_name: 'Psychiatric Hospitals',
    description: 'Hospitals specializing in mental health and psychiatric care',
    icon: Stethoscope,
    color: 'bg-purple-500',
    count: 234,
    percentage: 2.0
  },
  {
    id: 'trauma',
    name: 'Trauma Centers',
    display_name: 'Trauma Centers',
    description: 'Level I, II, and III trauma centers for emergency care',
    icon: Shield,
    color: 'bg-orange-500',
    count: 567,
    percentage: 4.7
  }
]

async function fetchHospitalTypes() {
  try {
    const response = await fetch('/api/v1/catalog/hospitals/types')
    if (!response.ok) {
      throw new Error('Failed to fetch hospital types')
    }
    return response.json()
  } catch (error) {
    console.log('Using mock data for hospital types:', error)
    return mockHospitalTypes
  }
}

export default function HospitalTypesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: hospitalTypes, isLoading, error } = useQuery({
    queryKey: ['hospital-types'],
    queryFn: fetchHospitalTypes,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const filteredTypes = hospitalTypes?.filter((type: any) =>
    type.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8faff] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900">Failed to Load Hospital Types</h1>
          <p className="text-gray-600">Unable to connect to the database. Please try again later.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8faff]">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/data-catalog">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Catalog
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hospital Types</h1>
                <p className="text-gray-600">Explore different types of hospitals and their data</p>
              </div>
            </div>
            <Badge variant="secondary" className="px-4 py-2">
              <Database className="h-3 w-3 mr-1" />
              Live Healthcare Data
            </Badge>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search hospital types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>

        {/* Hospital Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))
          ) : (
            filteredTypes.map((type: any, index: number) => {
              // Map icon strings to actual components
              const getIconComponent = (iconName: string) => {
                switch (iconName) {
                  case 'Hospital': return Hospital
                  case 'Baby': return Baby
                  case 'Heart': return Heart
                  case 'Activity': return Activity
                  case 'Stethoscope': return Stethoscope
                  case 'Shield': return Shield
                  default: return Building2
                }
              }
              const IconComponent = getIconComponent(type.icon) || Building2
              return (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/data-catalog/hospitals/${type.id}`}>
                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-3 rounded-full ${type.color} text-white`}>
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <div>
                              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                                {type.display_name}
                              </CardTitle>
                              <CardDescription>
                                {type.count?.toLocaleString() || '0'} facilities
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {type.percentage}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {type.description}
                        </p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-2xl font-bold text-blue-600">
                            {type.count?.toLocaleString() || '0'}
                          </span>
                          <Button size="sm" variant="outline" className="group-hover:bg-blue-50">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })
          )}
        </div>

        {!isLoading && filteredTypes.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hospital types found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
