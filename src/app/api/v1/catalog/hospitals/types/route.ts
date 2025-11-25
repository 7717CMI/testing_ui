import { NextRequest, NextResponse } from 'next/server'
import { testConnection, getHospitalTypes } from '@/lib/database'

// Mock hospital types data
const mockHospitalTypes = [
  {
    id: 'acute-care',
    name: 'Acute Care Hospitals',
    display_name: 'Acute Care Hospitals',
    description: 'General hospitals providing comprehensive medical and surgical care',
    icon: 'Hospital',
    color: 'bg-blue-500',
    count: 2847,
    percentage: 23.7
  },
  {
    id: 'children',
    name: 'Children\'s Hospitals',
    display_name: 'Children\'s Hospitals',
    description: 'Specialized hospitals providing care for pediatric patients',
    icon: 'Baby',
    color: 'bg-pink-500',
    count: 142,
    percentage: 1.2
  },
  {
    id: 'cardiac',
    name: 'Cardiac Hospitals',
    display_name: 'Cardiac Hospitals',
    description: 'Specialized hospitals focusing on heart and cardiovascular care',
    icon: 'Heart',
    color: 'bg-red-500',
    count: 89,
    percentage: 0.7
  },
  {
    id: 'rehabilitation',
    name: 'Rehabilitation Hospitals',
    display_name: 'Rehabilitation Hospitals',
    description: 'Hospitals specializing in physical and occupational therapy',
    icon: 'Activity',
    color: 'bg-green-500',
    count: 156,
    percentage: 1.3
  },
  {
    id: 'psychiatric',
    name: 'Psychiatric Hospitals',
    display_name: 'Psychiatric Hospitals',
    description: 'Hospitals specializing in mental health and psychiatric care',
    icon: 'Stethoscope',
    color: 'bg-purple-500',
    count: 234,
    percentage: 2.0
  },
  {
    id: 'trauma',
    name: 'Trauma Centers',
    display_name: 'Trauma Centers',
    description: 'Level I, II, and III trauma centers for emergency care',
    icon: 'Shield',
    color: 'bg-orange-500',
    count: 567,
    percentage: 4.7
  }
]

export async function GET(request: NextRequest) {
  try {
    // Get real data from PostgreSQL database
    const hospitalTypesData = await getHospitalTypes()
    return NextResponse.json(hospitalTypesData)
  } catch (error) {
    console.log('Database connection failed, using mock data:', error.message)
    return NextResponse.json(mockHospitalTypes)
  }
}
