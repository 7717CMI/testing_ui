'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Database, 
  Search, 
  Filter, 
  Download,
  Building2,
  Phone,
  MapPin,
  Users,
  Calendar,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

// Mock hospital data for different types
const mockHospitalData = {
  'acute-care': [
    {
      id: 1,
      name: 'Memorial General Hospital',
      address: '123 Main St, Anytown, ST 12345',
      phone: '(555) 123-4567',
      beds: 250,
      ownership: 'Non-profit',
      established: '1985',
      specialties: ['Emergency Medicine', 'Cardiology', 'Orthopedics', 'General Surgery'],
      accreditation: 'Joint Commission',
      trauma_level: 'Level II'
    },
    {
      id: 2,
      name: 'City Medical Center',
      address: '456 Oak Ave, Cityville, ST 67890',
      phone: '(555) 987-6543',
      beds: 180,
      ownership: 'For-profit',
      established: '1992',
      specialties: ['Surgery', 'Pediatrics', 'Oncology', 'Neurology'],
      accreditation: 'Joint Commission',
      trauma_level: 'Level I'
    },
    {
      id: 3,
      name: 'Regional Health Hospital',
      address: '789 Pine St, Townsville, ST 11111',
      phone: '(555) 456-7890',
      beds: 320,
      ownership: 'Public',
      established: '1978',
      specialties: ['Emergency Medicine', 'Cardiology', 'Orthopedics', 'Pulmonology'],
      accreditation: 'Joint Commission',
      trauma_level: 'Level II'
    },
    {
      id: 4,
      name: 'Community Care Hospital',
      address: '321 Elm St, Sunset City, ST 22222',
      phone: '(555) 321-9876',
      beds: 95,
      ownership: 'Non-profit',
      established: '2001',
      specialties: ['Family Medicine', 'Internal Medicine', 'Emergency Medicine'],
      accreditation: 'Joint Commission',
      trauma_level: 'Level III'
    },
    {
      id: 5,
      name: 'Metropolitan General',
      address: '654 Maple Ave, Metrotown, ST 33333',
      phone: '(555) 654-3210',
      beds: 450,
      ownership: 'For-profit',
      established: '1965',
      specialties: ['Emergency Medicine', 'Cardiology', 'Orthopedics', 'Neurosurgery', 'Transplant'],
      accreditation: 'Joint Commission',
      trauma_level: 'Level I'
    }
  ],
  'children': [
    {
      id: 1,
      name: 'Children\'s Hospital of Hope',
      address: '123 Pediatric Way, Childtown, ST 12345',
      phone: '(555) 111-2222',
      beds: 120,
      ownership: 'Non-profit',
      established: '1990',
      specialties: ['Pediatric Cardiology', 'Pediatric Surgery', 'Neonatology', 'Pediatric Oncology'],
      accreditation: 'Joint Commission',
      trauma_level: 'Level I Pediatric'
    },
    {
      id: 2,
      name: 'Little Angels Medical Center',
      address: '456 Kids Blvd, Youngville, ST 67890',
      phone: '(555) 333-4444',
      beds: 85,
      ownership: 'Non-profit',
      established: '1985',
      specialties: ['Pediatric Emergency', 'Pediatric Neurology', 'Pediatric Orthopedics'],
      accreditation: 'Joint Commission',
      trauma_level: 'Level II Pediatric'
    }
  ],
  'cardiac': [
    {
      id: 1,
      name: 'Heart & Vascular Institute',
      address: '789 Cardiac Center Dr, Heartville, ST 11111',
      phone: '(555) 555-6666',
      beds: 75,
      ownership: 'For-profit',
      established: '2000',
      specialties: ['Cardiac Surgery', 'Interventional Cardiology', 'Heart Transplant', 'Cardiac Rehabilitation'],
      accreditation: 'Joint Commission',
      trauma_level: 'Specialized'
    }
  ]
}

const hospitalTypeNames = {
  'acute-care': 'Acute Care Hospitals',
  'children': 'Children\'s Hospitals',
  'cardiac': 'Cardiac Hospitals',
  'rehabilitation': 'Rehabilitation Hospitals',
  'psychiatric': 'Psychiatric Hospitals',
  'trauma': 'Trauma Centers'
}

async function fetchHospitalData(hospitalType: string) {
  try {
    const response = await fetch(`/api/v1/catalog/hospitals/${hospitalType}/data`)
    if (!response.ok) {
      throw new Error('Failed to fetch hospital data')
    }
    return response.json()
  } catch (error) {
    console.log('Using mock data for hospital data:', error)
    return mockHospitalData[hospitalType as keyof typeof mockHospitalData] || []
  }
}

function exportToCSV(data: any[], hospitalType: string) {
  const headers = ['Name', 'Address', 'Phone', 'Beds', 'Ownership', 'Established', 'Specialties', 'Accreditation', 'Trauma Level']
  const csvContent = [
    headers.join(','),
    ...data.map(hospital => [
      `"${hospital.name}"`,
      `"${hospital.address}"`,
      `"${hospital.phone}"`,
      hospital.beds,
      `"${hospital.ownership}"`,
      hospital.established,
      `"${hospital.specialties.join('; ')}"`,
      `"${hospital.accreditation}"`,
      `"${hospital.trauma_level}"`
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${hospitalType}-hospitals.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function HospitalTypeDetailPage({ params }: { params: Promise<{ hospitalType: string }> }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedHospital, setSelectedHospital] = useState<any>(null)
  const [resolvedParams, setResolvedParams] = useState<{ hospitalType: string } | null>(null)

  // Resolve params Promise
  React.useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  const { data: hospitalData, isLoading, error } = useQuery({
    queryKey: ['hospital-data', resolvedParams?.hospitalType],
    queryFn: () => fetchHospitalData(resolvedParams?.hospitalType || ''),
    enabled: !!resolvedParams?.hospitalType,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const filteredData = hospitalData?.filter((hospital: any) =>
    hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hospital.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hospital.specialties.some((spec: string) => 
      spec.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ) || []

  const hospitalTypeName = hospitalTypeNames[resolvedParams?.hospitalType as keyof typeof hospitalTypeNames] || 'Hospital Type'

  // Show loading while params are being resolved
  if (!resolvedParams) {
    return (
      <div className="min-h-screen bg-[#f8faff] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading hospital data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8faff] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900">Failed to Load Hospital Data</h1>
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
              <Link href="/data-catalog/hospitals">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Hospital Types
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{hospitalTypeName}</h1>
                <p className="text-gray-600">Detailed data for {hospitalTypeName.toLowerCase()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-4 py-2">
                <Database className="h-3 w-3 mr-1" />
                Live Healthcare Data
              </Badge>
              <Button 
                onClick={() => exportToCSV(filteredData, params.hospitalType)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
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
                placeholder="Search hospitals..."
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
          <div className="text-sm text-gray-600">
            Showing {filteredData.length} of {hospitalData?.length || 0} hospitals
          </div>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {hospitalTypeName} Data
            </CardTitle>
            <CardDescription>
              Complete listing of {hospitalTypeName.toLowerCase()} with detailed information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold">Hospital Name</th>
                      <th className="text-left p-4 font-semibold">Address</th>
                      <th className="text-left p-4 font-semibold">Phone</th>
                      <th className="text-left p-4 font-semibold">Beds</th>
                      <th className="text-left p-4 font-semibold">Ownership</th>
                      <th className="text-left p-4 font-semibold">Established</th>
                      <th className="text-left p-4 font-semibold">Specialties</th>
                      <th className="text-left p-4 font-semibold">Trauma Level</th>
                      <th className="text-left p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((hospital: any, index: number) => (
                      <motion.tr
                        key={hospital.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-4">
                          <div className="font-semibold text-gray-900">{hospital.name}</div>
                          <div className="text-sm text-gray-500">{hospital.accreditation}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{hospital.address}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{hospital.phone}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="font-semibold">{hospital.beds}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="text-xs">
                            {hospital.ownership}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{hospital.established}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {hospital.specialties.slice(0, 2).map((specialty: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                            {hospital.specialties.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{hospital.specialties.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant={hospital.trauma_level.includes('Level I') ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {hospital.trauma_level}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedHospital(hospital)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!isLoading && filteredData.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hospitals found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hospital Detail Modal */}
      {selectedHospital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{selectedHospital.name}</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedHospital(null)}
              >
                ×
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <p><strong>Address:</strong> {selectedHospital.address}</p>
                <p><strong>Phone:</strong> {selectedHospital.phone}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Hospital Details</h3>
                <p><strong>Beds:</strong> {selectedHospital.beds}</p>
                <p><strong>Ownership:</strong> {selectedHospital.ownership}</p>
                <p><strong>Established:</strong> {selectedHospital.established}</p>
                <p><strong>Accreditation:</strong> {selectedHospital.accreditation}</p>
                <p><strong>Trauma Level:</strong> {selectedHospital.trauma_level}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedHospital.specialties.map((specialty: string, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
