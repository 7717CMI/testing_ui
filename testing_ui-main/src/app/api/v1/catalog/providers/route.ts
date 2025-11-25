import { NextRequest, NextResponse } from 'next/server'
import { getProviders, testConnection } from '@/lib/database'

// Fallback mock data when database is unavailable
const mockProvidersData = {
  providers: [
    {
      id: 1,
      name: 'Memorial Hospital',
      type: 'Hospitals',
      category: 'hospitals',
      address: '123 Main St, Anytown, ST 12345',
      phone: '(555) 123-4567',
      beds: 250,
      ownership: 'Non-profit',
      specialties: ['Emergency Medicine', 'Cardiology', 'Orthopedics']
    },
    {
      id: 2,
      name: 'City Medical Center',
      type: 'Hospitals',
      category: 'hospitals',
      address: '456 Oak Ave, Cityville, ST 67890',
      phone: '(555) 987-6543',
      beds: 180,
      ownership: 'For-profit',
      specialties: ['Surgery', 'Pediatrics', 'Oncology']
    },
    {
      id: 3,
      name: 'Community Health Clinic',
      type: 'Clinics',
      category: 'clinics',
      address: '789 Pine St, Townsville, ST 11111',
      phone: '(555) 456-7890',
      beds: 0,
      ownership: 'Public',
      specialties: ['Primary Care', 'Family Medicine']
    },
    {
      id: 4,
      name: 'Sunset Nursing Home',
      type: 'Nursing Homes',
      category: 'nursing-homes',
      address: '321 Elm St, Sunset City, ST 22222',
      phone: '(555) 321-9876',
      beds: 120,
      ownership: 'Private',
      specialties: ['Long-term Care', 'Rehabilitation']
    },
    {
      id: 5,
      name: 'QuickCare Urgent Center',
      type: 'Urgent Care',
      category: 'urgent-care',
      address: '654 Maple Ave, Quicktown, ST 33333',
      phone: '(555) 654-3210',
      beds: 0,
      ownership: 'For-profit',
      specialties: ['Urgent Care', 'Minor Surgery']
    }
  ],
  total: 5,
  page: 1,
  limit: 10,
  totalPages: 1
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const facility_type_id = searchParams.get('facility_type_id')
    const category_id = searchParams.get('category_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')

    // Calculate page from offset
    const page = Math.floor(offset / limit) + 1

    // If querying by facility_type_id, use direct query
    if (facility_type_id) {
      const { getDbPool } = await import('@/lib/db-config')
      const pool = getDbPool()

      const client = await pool.connect()
      try {
        // Get total count
        const countResult = await client.query(`
          SELECT COUNT(*) as total
          FROM healthcare_production.healthcare_providers
          WHERE facility_type_id = $1 AND is_active = true
        `, [parseInt(facility_type_id)])

        const total_count = parseInt(countResult.rows[0].total)

        // Get providers with all important columns
        const result = await client.query(`
          SELECT 
            hp.id,
            hp.npi_number,
            hp.entity_type_id,
            et.name as entity_type_name,
            hp.facility_category_id,
            fc.name as facility_category_name,
            hp.facility_type_id,
            ft.name as facility_type_name,
            hp.provider_name,
            hp.provider_first_name,
            hp.provider_last_name,
            hp.provider_middle_name,
            hp.provider_credentials,
            hp.provider_sex,
            hp.is_sole_proprietor,
            hp.is_organization_subpart,
            hp.parent_organization_name,
            hp.ein,
            hp.business_address_line1,
            hp.business_address_line2,
            hp.business_city,
            hp.business_state_id,
            bs.name as business_state,
            bs.code as business_state_code,
            hp.business_zip_code,
            hp.business_phone,
            hp.business_fax,
            hp.mailing_address_line1,
            hp.mailing_address_line2,
            hp.mailing_city,
            hp.mailing_state_id,
            ms.name as mailing_state,
            ms.code as mailing_state_code,
            hp.mailing_zip_code,
            hp.mailing_phone,
            hp.mailing_fax,
            hp.authorized_official_phone,
            hp.all_phones,
            hp.all_faxes,
            hp.primary_taxonomy_code_id,
            tc.code as taxonomy_code,
            tc.classification as taxonomy_classification,
            tc.specialization as taxonomy_specialization,
            hp.primary_license_number,
            hp.license_state_id,
            ls.name as license_state,
            hp.authorized_official_first_name,
            hp.authorized_official_last_name,
            hp.authorized_official_title,
            hp.enumeration_date,
            hp.last_update_date,
            hp.source_folder,
            hp.source_file,
            hp.created_at,
            hp.updated_at,
            hp.is_active
          FROM healthcare_production.healthcare_providers hp
          LEFT JOIN healthcare_production.facility_categories fc ON hp.facility_category_id = fc.id
          LEFT JOIN healthcare_production.facility_types ft ON hp.facility_type_id = ft.id
          LEFT JOIN healthcare_production.entity_types et ON hp.entity_type_id = et.id
          LEFT JOIN healthcare_production.states bs ON hp.business_state_id = bs.id
          LEFT JOIN healthcare_production.states ms ON hp.mailing_state_id = ms.id
          LEFT JOIN healthcare_production.states ls ON hp.license_state_id = ls.id
          LEFT JOIN healthcare_production.taxonomy_codes tc ON hp.primary_taxonomy_code_id = tc.id
          WHERE hp.facility_type_id = $1 AND hp.is_active = true
          ORDER BY hp.provider_name
          LIMIT $2 OFFSET $3
        `, [parseInt(facility_type_id), limit, offset])

        return NextResponse.json({
          success: true,
          data: {
            providers: result.rows,
            total_count,
            limit,
            offset,
            page
          }
        })
      } finally {
        client.release()  // Return to pool, don't end it!
      }
    }

    // Otherwise use the existing getProviders function
    const providersData = await getProviders({
      page,
      limit,
      category: category_id || undefined,
      search: search || undefined
    })

    return NextResponse.json({
      success: true,
      data: providersData
    })
  } catch (error) {
    console.log('Database connection failed, using mock data:', error.message)
    return NextResponse.json({
      success: true,
      data: mockProvidersData
    })
  }
}


