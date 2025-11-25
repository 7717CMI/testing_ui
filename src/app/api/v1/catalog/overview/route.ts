import { NextRequest, NextResponse } from 'next/server'
import { getCatalogOverview, testConnection } from '@/lib/database'

// Fallback mock data when database is unavailable
const mockCatalogData = {
  total_providers: 6500000,
  total_categories: 12,
  categories: [
    { 
      id: 1,
      display_name: 'Hospitals', 
      name: 'hospitals',
      count: 1200000,
      provider_count: 1200000, 
      percentage: 18.5,
      description: 'General and specialty hospitals providing comprehensive medical care'
    },
    { 
      id: 2,
      display_name: 'Clinics', 
      name: 'clinics',
      count: 1500000,
      provider_count: 1500000, 
      percentage: 23.1,
      description: 'Outpatient medical clinics and primary care facilities'
    },
    { 
      id: 3,
      display_name: 'Nursing Homes', 
      name: 'nursing-homes',
      count: 800000,
      provider_count: 800000, 
      percentage: 12.3,
      description: 'Long-term care facilities for elderly and disabled patients'
    },
    { 
      id: 4,
      display_name: 'Urgent Care', 
      name: 'urgent-care',
      count: 600000,
      provider_count: 600000, 
      percentage: 9.2,
      description: 'Walk-in urgent care centers for non-emergency medical needs'
    },
    { 
      id: 5,
      display_name: 'Surgery Centers', 
      name: 'surgery-centers',
      count: 400000,
      provider_count: 400000, 
      percentage: 6.2,
      description: 'Ambulatory surgery centers for outpatient procedures'
    },
    { 
      id: 6,
      display_name: 'Diagnostic Centers', 
      name: 'diagnostic-centers',
      count: 500000,
      provider_count: 500000, 
      percentage: 7.7,
      description: 'Medical imaging and diagnostic testing facilities'
    },
    { 
      id: 7,
      display_name: 'Mental Health', 
      name: 'mental-health',
      count: 300000,
      provider_count: 300000, 
      percentage: 4.6,
      description: 'Mental health facilities and psychiatric care centers'
    },
    { 
      id: 8,
      display_name: 'Rehabilitation', 
      name: 'rehabilitation',
      count: 350000,
      provider_count: 350000, 
      percentage: 5.4,
      description: 'Physical therapy and rehabilitation facilities'
    },
    { 
      id: 9,
      display_name: 'Home Health', 
      name: 'home-health',
      count: 250000,
      provider_count: 250000, 
      percentage: 3.8,
      description: 'In-home healthcare services and nursing care'
    },
    { 
      id: 10,
      display_name: 'Hospice', 
      name: 'hospice',
      count: 150000,
      provider_count: 150000, 
      percentage: 2.3,
      description: 'End-of-life care facilities and palliative care services'
    },
    { 
      id: 11,
      display_name: 'Laboratories', 
      name: 'laboratories',
      count: 200000,
      provider_count: 200000, 
      percentage: 3.1,
      description: 'Medical laboratories and testing facilities'
    },
    { 
      id: 12,
      display_name: 'Other', 
      name: 'other',
      count: 450000,
      provider_count: 450000, 
      percentage: 6.9,
      description: 'Other specialized healthcare facilities and services'
    }
  ],
  last_updated: new Date().toISOString()
}

// Cache for overview data (5 minutes)
let overviewCache: any = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const now = Date.now()
    if (overviewCache && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('✅ Returning cached overview data')
      return NextResponse.json(overviewCache)
    }

    // Get fresh data from PostgreSQL database
    console.log('🔄 Fetching fresh overview data from database...')
    const catalogData = await getCatalogOverview()
    
    // Update cache
    overviewCache = catalogData
    cacheTimestamp = now
    
    return NextResponse.json(catalogData)
  } catch (error) {
    console.log('Database connection failed, using mock data:', error.message)
    return NextResponse.json(mockCatalogData)
  }
}


