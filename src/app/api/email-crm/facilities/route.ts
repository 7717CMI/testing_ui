import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST || '34.26.64.219',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Platoon@1',
  ssl: false,
  max: 10,
  connectionTimeoutMillis: 10000,
})

export interface Facility {
  id: number
  npi_number: string
  provider_name: string
  facility_type: string
  category: string
  business_address_line1: string
  business_city: string
  business_state: string
  business_postal_code: string
  business_phone: string | null
  business_fax: string | null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const facilityType = searchParams.get('facilityType') || ''
    const state = searchParams.get('state') || ''
    const city = searchParams.get('city') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let client
    try {
      client = await pool.connect()
    } catch (connectionError: any) {
      console.error('[Facilities API] Connection error:', connectionError)
      throw new Error(`Database connection failed: ${connectionError.message}`)
    }

    try {
      let sql = `
        SELECT 
          hp.id,
          hp.npi_number,
          hp.provider_name,
          ft.name as facility_type,
          fc.name as category,
          hp.business_address_line1,
          hp.business_city,
          s.code as business_state,
          hp.business_zip_code as business_postal_code,
          hp.business_phone,
          hp.business_fax
        FROM healthcare_production.healthcare_providers hp
        LEFT JOIN healthcare_production.facility_types ft ON hp.facility_type_id = ft.id
        LEFT JOIN healthcare_production.facility_categories fc ON hp.facility_category_id = fc.id
        LEFT JOIN healthcare_production.states s ON hp.business_state_id = s.id
        WHERE hp.is_active = true
      `

      const params: any[] = []
      let paramIdx = 1

      if (search) {
        sql += ` AND (hp.provider_name ILIKE $${paramIdx++} OR hp.npi_number ILIKE $${paramIdx++})`
        params.push(`%${search}%`, `%${search}%`)
      }

      if (category) {
        sql += ` AND fc.name ILIKE $${paramIdx++}`
        params.push(`%${category}%`)
      }

      if (facilityType) {
        sql += ` AND ft.name ILIKE $${paramIdx++}`
        params.push(`%${facilityType}%`)
      }

      if (state) {
        sql += ` AND s.code = $${paramIdx++}`
        params.push(state.toUpperCase())
      }

      if (city) {
        sql += ` AND hp.business_city ILIKE $${paramIdx++}`
        params.push(`%${city}%`)
      }

      // Get total count - build count query separately to avoid regex issues
      let countSql = `
        SELECT COUNT(*) as total
        FROM healthcare_production.healthcare_providers hp
        LEFT JOIN healthcare_production.facility_types ft ON hp.facility_type_id = ft.id
        LEFT JOIN healthcare_production.facility_categories fc ON hp.facility_category_id = fc.id
        LEFT JOIN healthcare_production.states s ON hp.business_state_id = s.id
        WHERE hp.is_active = true
      `
      
      const countParams: any[] = []
      let countParamIdx = 1
      
      if (search) {
        countSql += ` AND (hp.provider_name ILIKE $${countParamIdx++} OR hp.npi_number ILIKE $${countParamIdx++})`
        countParams.push(`%${search}%`, `%${search}%`)
      }
      
      if (category) {
        countSql += ` AND fc.name ILIKE $${countParamIdx++}`
        countParams.push(`%${category}%`)
      }
      
      if (facilityType) {
        countSql += ` AND ft.name ILIKE $${countParamIdx++}`
        countParams.push(`%${facilityType}%`)
      }
      
      if (state) {
        countSql += ` AND s.code = $${countParamIdx++}`
        countParams.push(state.toUpperCase())
      }
      
      if (city) {
        countSql += ` AND hp.business_city ILIKE $${countParamIdx++}`
        countParams.push(`%${city}%`)
      }
      
      const countResult = await client.query(countSql, countParams)
      const total = parseInt(countResult.rows[0]?.total || '0')

      // Get paginated results
      sql += ` ORDER BY hp.provider_name LIMIT $${paramIdx++} OFFSET $${paramIdx++}`
      params.push(limit, offset)

      const result = await client.query(sql, params)

      const facilities: Facility[] = result.rows.map((row) => ({
        id: row.id,
        npi_number: row.npi_number || '',
        provider_name: row.provider_name || '',
        facility_type: row.facility_type || '',
        category: row.category || '',
        business_address_line1: row.business_address_line1 || '',
        business_city: row.business_city || '',
        business_state: row.business_state || '',
        business_postal_code: row.business_postal_code || '',
        business_phone: row.business_phone,
        business_fax: row.business_fax,
      }))

      return NextResponse.json({
        success: true,
        data: {
          facilities,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      })
    } finally {
      if (client) {
        client.release()
      }
    }
  } catch (error: any) {
    // Enhanced error logging - ensure all error properties are captured
    const errorDetails: any = {
      message: error?.message || String(error),
      code: error?.code,
      detail: error?.detail,
      hint: error?.hint,
      position: error?.position,
      internalPosition: error?.internalPosition,
      internalQuery: error?.internalQuery,
      where: error?.where,
      schema: error?.schema,
      table: error?.table,
      column: error?.column,
      dataType: error?.dataType,
      constraint: error?.constraint,
      file: error?.file,
      line: error?.line,
      routine: error?.routine,
      stack: error?.stack,
      name: error?.name,
      errno: error?.errno,
      syscall: error?.syscall,
      address: error?.address,
      port: error?.port,
    }
    
    // Remove undefined values for cleaner logging
    Object.keys(errorDetails).forEach(key => {
      if (errorDetails[key] === undefined) {
        delete errorDetails[key]
      }
    })
    
    console.error('[Facilities API] Full Error Details:', errorDetails)
    console.error('[Facilities API] Raw Error Object:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to fetch facilities'
    
    // PostgreSQL error codes
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT') {
      errorMessage = 'Database connection failed. Please check your database settings and ensure the database server is running.'
    } else if (error?.code === '28P01') {
      errorMessage = 'Database authentication failed. Please check your credentials in .env.local'
    } else if (error?.code === '3D000') {
      errorMessage = 'Database does not exist. Please check your database name.'
    } else if (error?.code === '42P01') {
      errorMessage = `Table or view does not exist: ${error?.table || 'unknown'}. Please check your database schema.`
    } else if (error?.code === '42703') {
      errorMessage = `Column does not exist: ${error?.column || 'unknown'}. Please check your database schema.`
    } else if (error?.code === '42P07') {
      errorMessage = `Schema already exists: ${error?.schema || 'unknown'}.`
    } else if (error?.detail) {
      errorMessage = `${error?.message || 'Database error'}. ${error.detail}`
    } else if (error?.message) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    } else {
      errorMessage = 'An unexpected error occurred while fetching facilities'
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        errorCode: error?.code || 'UNKNOWN',
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
      },
      { status: 500 }
    )
  }
}

