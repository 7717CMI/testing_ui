import { Pool } from 'pg'
import { ParsedQuery } from './query-parser'

const pool = new Pool({
  host: process.env.DB_HOST || '34.26.64.219',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Platoon@1',
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000
})

export interface DatabaseResult {
  facilities: Facility[]
  totalCount: number
  availableFields: string[]
  missingFields: string[]
  queryExecutionTime: number
}

export interface Facility {
  id: number
  npi: string
  name: string
  similarityScore?: number
  address: string
  city: string
  state: string
  stateCode: string
  zipCode: string
  phone: string
  fax: string
  type: string
  category: string
  ownership: string
  enumerationDate: string | null
  lastUpdate: string | null
}

export async function queryDatabase(parsed: ParsedQuery): Promise<DatabaseResult> {
  const startTime = Date.now()
  const client = await pool.connect()
  
  try {
    const whereConditions: string[] = ['hp.is_active = true']
    const params: any[] = []
    let paramIndex = 1

    // FUZZY NAME SEARCH (handles typos!)
    if (parsed.entity?.name) {
      whereConditions.push(`
        (
          hp.provider_name ILIKE $${paramIndex} 
          OR hp.provider_name ILIKE $${paramIndex + 1}
        )
      `)
      params.push(`%${parsed.entity.name}%`)
      params.push(`%${parsed.entity.name.split(' ')[0]}%`) // First word fallback
      paramIndex += 2
    }

    // EXACT NPI SEARCH
    if (parsed.entity?.npi) {
      whereConditions.push(`hp.npi_number = $${paramIndex}`)
      params.push(parsed.entity.npi)
      paramIndex++
    }

    // CITY SEARCH (with fallback for New York boroughs)
    if (parsed.location?.city) {
      const city = parsed.location.city.trim()
      // For New York, also search for common borough names
      if (city.toLowerCase() === 'new york') {
        whereConditions.push(`(
          hp.business_city ILIKE $${paramIndex} 
          OR hp.business_city ILIKE $${paramIndex + 1}
          OR hp.business_city ILIKE $${paramIndex + 2}
          OR hp.business_city ILIKE $${paramIndex + 3}
          OR hp.business_city ILIKE $${paramIndex + 4}
        )`)
        params.push(`%${city}%`)
        params.push('%Manhattan%')
        params.push('%Brooklyn%')
        params.push('%Queens%')
        params.push('%Bronx%')
        paramIndex += 5
      } else {
        whereConditions.push(`hp.business_city ILIKE $${paramIndex}`)
        params.push(`%${city}%`)
        paramIndex++
      }
    }

    // STATE SEARCH
    if (parsed.location?.state) {
      whereConditions.push(`
        (s.name ILIKE $${paramIndex} OR s.code = $${paramIndex + 1})
      `)
      params.push(`%${parsed.location.state}%`)
      params.push(parsed.location.state.toUpperCase().substring(0, 2))
      paramIndex += 2
    }

    // FACILITY TYPE FILTER (fuzzy matching)
    if (parsed.filters?.facilityType && parsed.filters.facilityType.length > 0) {
      const conditions = []
      
      for (const type of parsed.filters.facilityType) {
        // Match if the facility type name contains the search term
        conditions.push(`ft.name ILIKE $${paramIndex}`)
        params.push(`%${type}%`)
        paramIndex++
      }
      
      whereConditions.push(`(${conditions.join(' OR ')})`)
    }

    // OWNERSHIP FILTER
    if (parsed.filters?.ownership && parsed.filters.ownership.length > 0) {
      whereConditions.push(`
        et.name = ANY($${paramIndex}::text[])
      `)
      params.push(parsed.filters.ownership)
      paramIndex++
    }

    const whereClause = whereConditions.join(' AND ')
    const limit = Math.min(parsed.limit || 10, 100) // Max 100 results

    // MAIN QUERY
    const query = `
      SELECT 
        hp.id,
        hp.npi_number,
        hp.provider_name,
        hp.business_address_line1,
        hp.business_city,
        s.name as business_state,
        s.code as business_state_code,
        hp.business_zip_code,
        hp.business_phone,
        hp.business_fax,
        ft.name as facility_type_name,
        fc.name as facility_category_name,
        et.name as entity_type_name,
        hp.enumeration_date,
        hp.last_update_date
      FROM healthcare_production.healthcare_providers hp
      LEFT JOIN healthcare_production.facility_types ft ON hp.facility_type_id = ft.id
      LEFT JOIN healthcare_production.facility_categories fc ON hp.facility_category_id = fc.id
      LEFT JOIN healthcare_production.states s ON hp.business_state_id = s.id
      LEFT JOIN healthcare_production.entity_types et ON hp.entity_type_id = et.id
      WHERE ${whereClause}
      ORDER BY hp.provider_name
      LIMIT $${paramIndex}
    `

    params.push(limit)

    console.log('[DB Query] ==================')
    console.log('[DB Query] Parsed Query:', JSON.stringify({
      intent: parsed.intent,
      entity: parsed.entity,
      location: parsed.location,
      filters: parsed.filters,
      limit: parsed.limit
    }, null, 2))
    console.log('[DB Query] SQL:', query.replace(/\s+/g, ' ').substring(0, 500))
    console.log('[DB Query] Params:', params)
    console.log('[DB Query] ==================')

    const result = await client.query(query, params)

    // Detect missing fields
    const databaseFields = [
      'id', 'npi', 'name', 'address', 'city', 'state', 'stateCode', 'zipCode',
      'phone', 'fax', 'type', 'category', 'ownership', 'enumerationDate', 'lastUpdate'
    ]
    const missingFields = parsed.requestedFields.filter(
      field => !databaseFields.includes(field) && 
               !['beds', 'bed_count', 'capacity', 'specialties', 'services', 'ratings', 'emergency'].includes(field)
    )

    const executionTime = Date.now() - startTime

    return {
      facilities: result.rows.map(row => ({
        id: row.id,
        npi: row.npi_number || '',
        name: row.provider_name || '',
        similarityScore: 1.0,
        address: row.business_address_line1 || '',
        city: row.business_city || '',
        state: row.business_state || '',
        stateCode: row.business_state_code || '',
        zipCode: row.business_zip_code || '',
        phone: row.business_phone || '',
        fax: row.business_fax || '',
        type: row.facility_type_name || '',
        category: row.facility_category_name || '',
        ownership: row.entity_type_name || '',
        enumerationDate: row.enumeration_date,
        lastUpdate: row.last_update_date
      })),
      totalCount: result.rows.length,
      availableFields: databaseFields,
      missingFields,
      queryExecutionTime: executionTime
    }
  } catch (error) {
    console.error('[DB Query] Error:', error)
    throw error
  } finally {
    client.release()
  }
}

