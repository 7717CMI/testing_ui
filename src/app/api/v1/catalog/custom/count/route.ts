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
        whereConditions.push(`s.code = ANY($${paramIndex})`)
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
        SELECT COUNT(*) as count
        FROM healthcare_production.healthcare_providers hp
        LEFT JOIN healthcare_production.states s ON hp.business_state_id = s.id
        WHERE ${whereConditions.join(' AND ')}
      `

      const result = await client.query(query, queryParams)
      const count = parseInt(result.rows[0].count)

      client.release()
      await pool.end()

      return NextResponse.json({ count })
    } catch (error) {
      client.release()
      await pool.end()
      throw error
    }
  } catch (error) {
    console.error('Error counting custom dataset:', error)
    return NextResponse.json(
      { error: 'Failed to count records', message: error.message },
      { status: 500 }
    )
  }
}



