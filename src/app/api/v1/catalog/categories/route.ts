import { NextRequest, NextResponse } from 'next/server'
import { getCategories, testConnection } from '@/lib/database'

// Fallback mock data when database is unavailable
const mockCategoriesData = [
  { 
    id: 1, 
    display_name: 'Hospitals', 
    name: 'hospitals',
    count: 1200000,
    provider_count: 1200000, 
    description: 'General and specialty hospitals providing comprehensive medical care' 
  },
  { 
    id: 2, 
    display_name: 'Clinics', 
    name: 'clinics',
    count: 1500000,
    provider_count: 1500000, 
    description: 'Outpatient medical clinics and primary care facilities' 
  },
  { 
    id: 3, 
    display_name: 'Nursing Homes', 
    name: 'nursing-homes',
    count: 800000,
    provider_count: 800000, 
    description: 'Long-term care facilities for elderly and disabled patients' 
  },
  { 
    id: 4, 
    display_name: 'Urgent Care', 
    name: 'urgent-care',
    count: 600000,
    provider_count: 600000, 
    description: 'Walk-in urgent care centers for non-emergency medical needs' 
  },
  { 
    id: 5, 
    display_name: 'Surgery Centers', 
    name: 'surgery-centers',
    count: 400000,
    provider_count: 400000, 
    description: 'Ambulatory surgery centers for outpatient procedures' 
  },
  { 
    id: 6, 
    display_name: 'Diagnostic Centers', 
    name: 'diagnostic-centers',
    count: 500000,
    provider_count: 500000, 
    description: 'Medical imaging and diagnostic testing facilities' 
  },
  { 
    id: 7, 
    display_name: 'Mental Health', 
    name: 'mental-health',
    count: 300000,
    provider_count: 300000, 
    description: 'Mental health facilities and psychiatric care centers' 
  },
  { 
    id: 8, 
    display_name: 'Rehabilitation', 
    name: 'rehabilitation',
    count: 350000,
    provider_count: 350000, 
    description: 'Physical therapy and rehabilitation facilities' 
  },
  { 
    id: 9, 
    display_name: 'Home Health', 
    name: 'home-health',
    count: 250000,
    provider_count: 250000, 
    description: 'In-home healthcare services and nursing care' 
  },
  { 
    id: 10, 
    display_name: 'Hospice', 
    name: 'hospice',
    count: 150000,
    provider_count: 150000, 
    description: 'End-of-life care facilities and palliative care services' 
  },
  { 
    id: 11, 
    display_name: 'Laboratories', 
    name: 'laboratories',
    count: 200000,
    provider_count: 200000, 
    description: 'Medical laboratories and testing facilities' 
  },
  { 
    id: 12, 
    display_name: 'Other', 
    name: 'other',
    count: 450000,
    provider_count: 450000, 
    description: 'Other specialized healthcare facilities and services' 
  }
]

export async function GET(request: NextRequest) {
  try {
    // Get real data from PostgreSQL database
    const categoriesData = await getCategories()
    
    // Return in the expected format
    return NextResponse.json({
      success: true,
      message: `Found ${categoriesData.length} healthcare categories`,
      data: {
        categories: categoriesData,
        total_categories: categoriesData.length
      }
    })
  } catch (error) {
    console.log('Database connection failed, using mock data:', error.message)
    return NextResponse.json({
      success: true,
      message: `Found ${mockCategoriesData.length} healthcare categories (mock)`,
      data: {
        categories: mockCategoriesData,
        total_categories: mockCategoriesData.length
      }
    })
  }
}


