import { NextRequest, NextResponse } from 'next/server'
import { testConnection, getHospitalTypeData } from '@/lib/database'

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
  ],
  'rehabilitation': [
    {
      id: 1,
      name: 'Recovery & Rehabilitation Center',
      address: '123 Recovery Rd, Healville, ST 12345',
      phone: '(555) 777-8888',
      beds: 60,
      ownership: 'Non-profit',
      established: '1995',
      specialties: ['Physical Therapy', 'Occupational Therapy', 'Speech Therapy', 'Rehabilitation Medicine'],
      accreditation: 'Joint Commission',
      trauma_level: 'Specialized'
    }
  ],
  'psychiatric': [
    {
      id: 1,
      name: 'Mental Health & Wellness Center',
      address: '456 Wellness Way, Mindville, ST 67890',
      phone: '(555) 999-0000',
      beds: 80,
      ownership: 'Public',
      established: '1988',
      specialties: ['Psychiatry', 'Psychology', 'Mental Health Counseling', 'Substance Abuse Treatment'],
      accreditation: 'Joint Commission',
      trauma_level: 'Specialized'
    }
  ],
  'trauma': [
    {
      id: 1,
      name: 'Regional Trauma Center',
      address: '789 Emergency Blvd, Traumaville, ST 11111',
      phone: '(555) 111-3333',
      beds: 200,
      ownership: 'Public',
      established: '1990',
      specialties: ['Trauma Surgery', 'Emergency Medicine', 'Critical Care', 'Neurosurgery'],
      accreditation: 'Joint Commission',
      trauma_level: 'Level I'
    }
  ]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hospitalType: string }> }
) {
  try {
    const { hospitalType } = await params
    // Get real data from PostgreSQL database
    const hospitalData = await getHospitalTypeData(hospitalType)
    return NextResponse.json(hospitalData)
  } catch (error) {
    console.log('Database connection failed, using mock data:', error.message)
    const { hospitalType } = await params
    return NextResponse.json(mockHospitalData[hospitalType as keyof typeof mockHospitalData] || [])
  }
}
