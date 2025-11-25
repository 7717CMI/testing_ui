import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const facility_type_ids = searchParams.get('facility_type_ids')?.split(',').map(Number) || []
    const states = searchParams.get('states')?.split(',') || []
    const cities = searchParams.get('cities')?.split(',') || []
    const zip_codes = searchParams.get('zip_codes')?.split(',') || []
    const has_phone = searchParams.get('has_phone') === 'true'
    const has_fax = searchParams.get('has_fax') === 'true'

    const pool = new Pool({
      host: '34.26.64.219',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'Platoon@1',
      ssl: false,
      max: 10,
      connectionTimeoutMillis: 10000,
    })

    const client = await pool.connect()

    try {
      let whereConditions = ['hp.is_active = true']
      const queryParams: any[] = []
      let paramIndex = 1

      if (facility_type_ids.length > 0) {
        whereConditions.push(`hp.facility_type_id = ANY($${paramIndex})`)
        queryParams.push(facility_type_ids)
        paramIndex++
      }

      if (states.length > 0) {
        whereConditions.push(`bs.code = ANY($${paramIndex})`)
        queryParams.push(states)
        paramIndex++
      }

      if (cities.length > 0) {
        whereConditions.push(`hp.business_city = ANY($${paramIndex})`)
        queryParams.push(cities)
        paramIndex++
      }

      if (zip_codes.length > 0) {
        whereConditions.push(`hp.business_zip_code = ANY($${paramIndex})`)
        queryParams.push(zip_codes)
        paramIndex++
      }

      if (has_phone) {
        whereConditions.push('hp.business_phone IS NOT NULL AND hp.business_phone != \'\'')
      }

      if (has_fax) {
        whereConditions.push('hp.business_fax IS NOT NULL AND hp.business_fax != \'\'')
      }

      const query = `
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
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY hp.provider_name
        LIMIT 10000
      `

      const result = await client.query(query, queryParams)
      const providers = result.rows

      client.release()
      await pool.end()

      // Generate CSV
      const headers = [
        'ID', 'NPI Number', 'Entity Type', 'Category', 'Facility Type',
        'Provider Name', 'First Name', 'Middle Name', 'Last Name', 'Credentials', 'Sex',
        'Is Sole Proprietor', 'Is Organization Subpart', 'Parent Organization', 'EIN',
        'Business Address Line 1', 'Business Address Line 2', 'Business City', 'Business State',
        'Business State Code', 'Business ZIP', 'Business Phone', 'Business Fax',
        'Mailing Address Line 1', 'Mailing Address Line 2', 'Mailing City', 'Mailing State',
        'Mailing State Code', 'Mailing ZIP', 'Mailing Phone', 'Mailing Fax',
        'Authorized Official Phone', 'All Phones', 'All Faxes',
        'Taxonomy Code', 'Taxonomy Classification', 'Taxonomy Specialization',
        'Primary License Number', 'License State',
        'Authorized Official First Name', 'Authorized Official Last Name', 'Authorized Official Title',
        'Enumeration Date', 'Last Update Date', 'Source Folder', 'Source File',
        'Created At', 'Updated At', 'Active'
      ]

      const csvRows = [
        headers.join(','),
        ...providers.map(p => [
          p.id || '',
          p.npi_number || '',
          `"${(p.entity_type_name || '').replace(/"/g, '""')}"`,
          `"${(p.facility_category_name || '').replace(/"/g, '""')}"`,
          `"${(p.facility_type_name || '').replace(/"/g, '""')}"`,
          `"${(p.provider_name || '').replace(/"/g, '""')}"`,
          `"${(p.provider_first_name || '').replace(/"/g, '""')}"`,
          `"${(p.provider_middle_name || '').replace(/"/g, '""')}"`,
          `"${(p.provider_last_name || '').replace(/"/g, '""')}"`,
          `"${(p.provider_credentials || '').replace(/"/g, '""')}"`,
          `"${(p.provider_sex || '').replace(/"/g, '""')}"`,
          p.is_sole_proprietor === true ? 'Yes' : p.is_sole_proprietor === false ? 'No' : '',
          p.is_organization_subpart === true ? 'Yes' : p.is_organization_subpart === false ? 'No' : '',
          `"${(p.parent_organization_name || '').replace(/"/g, '""')}"`,
          p.ein || '',
          `"${(p.business_address_line1 || '').replace(/"/g, '""')}"`,
          `"${(p.business_address_line2 || '').replace(/"/g, '""')}"`,
          `"${(p.business_city || '').replace(/"/g, '""')}"`,
          `"${(p.business_state || '').replace(/"/g, '""')}"`,
          `"${(p.business_state_code || '').replace(/"/g, '""')}"`,
          p.business_zip_code || '',
          p.business_phone || '',
          p.business_fax || '',
          `"${(p.mailing_address_line1 || '').replace(/"/g, '""')}"`,
          `"${(p.mailing_address_line2 || '').replace(/"/g, '""')}"`,
          `"${(p.mailing_city || '').replace(/"/g, '""')}"`,
          `"${(p.mailing_state || '').replace(/"/g, '""')}"`,
          `"${(p.mailing_state_code || '').replace(/"/g, '""')}"`,
          p.mailing_zip_code || '',
          p.mailing_phone || '',
          p.mailing_fax || '',
          p.authorized_official_phone || '',
          `"${(p.all_phones || '').replace(/"/g, '""')}"`,
          `"${(p.all_faxes || '').replace(/"/g, '""')}"`,
          `"${(p.taxonomy_code || '').replace(/"/g, '""')}"`,
          `"${(p.taxonomy_classification || '').replace(/"/g, '""')}"`,
          `"${(p.taxonomy_specialization || '').replace(/"/g, '""')}"`,
          p.primary_license_number || '',
          `"${(p.license_state || '').replace(/"/g, '""')}"`,
          `"${(p.authorized_official_first_name || '').replace(/"/g, '""')}"`,
          `"${(p.authorized_official_last_name || '').replace(/"/g, '""')}"`,
          `"${(p.authorized_official_title || '').replace(/"/g, '""')}"`,
          p.enumeration_date || '',
          p.last_update_date || '',
          `"${(p.source_folder || '').replace(/"/g, '""')}"`,
          `"${(p.source_file || '').replace(/"/g, '""')}"`,
          p.created_at || '',
          p.updated_at || '',
          p.is_active ? 'Yes' : 'No'
        ].join(','))
      ]

      const csv = csvRows.join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="custom-dataset-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } catch (error) {
      client.release()
      await pool.end()
      throw error
    }
  } catch (error) {
    console.error('Error exporting custom dataset:', error)
    return NextResponse.json(
      { error: 'Failed to export dataset', message: error.message },
      { status: 500 }
    )
  }
}



