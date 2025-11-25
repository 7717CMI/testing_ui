import { getDbPool } from './db-config'
import { logger } from './logger'

// Use shared database pool from db-config
async function establishConnection() {
  try {
    const pool = getDbPool()
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    logger.debug('Database connection established successfully')
    return pool
  } catch (error: any) {
    logger.error(`Failed to connect to database: ${error.message}`)
    throw new Error(`Database connection failed: ${error.message}`)
  }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const workingPool = await establishConnection()
    const client = await workingPool.connect()
    await client.query('SELECT 1')
    client.release()
    return true
  } catch (error: any) {
    logger.error('Database connection test failed:', error.message)
    return false
  }
}

// Get catalog overview data
export async function getCatalogOverview() {
  let client
  try {
    const workingPool = await establishConnection()
    client = await workingPool.connect()
    
    logger.debug('Querying catalog overview from database...')
    
    // Optimized: Get total providers count with caching
    const totalProvidersResult = await client.query(`
      SELECT COUNT(*) as total_providers 
      FROM healthcare_production.healthcare_providers
      WHERE is_active = true
    `)
    
    logger.debug('Total providers count:', totalProvidersResult.rows[0].total_providers)
    
    // Optimized: Get categories with counts using more efficient query
    const categoriesResult = await client.query(`
      SELECT 
        fc.id,
        fc.code as name,
        fc.name as display_name,
        fc.description,
        COALESCE(provider_counts.count, 0) as provider_count,
        COALESCE(type_counts.count, 0) as facility_types_count,
        ROUND((COALESCE(provider_counts.count, 0) * 100.0 / $1), 2) as percentage
      FROM healthcare_production.facility_categories fc
      LEFT JOIN (
        SELECT 
          facility_category_id,
          COUNT(*) as count
        FROM healthcare_production.healthcare_providers
        WHERE is_active = true
        GROUP BY facility_category_id
      ) provider_counts ON fc.id = provider_counts.facility_category_id
      LEFT JOIN (
        SELECT 
          category_id,
          COUNT(*) as count
        FROM healthcare_production.facility_types
        GROUP BY category_id
      ) type_counts ON fc.id = type_counts.category_id
      ORDER BY provider_count DESC
      LIMIT 20
    `, [parseInt(totalProvidersResult.rows[0].total_providers)])
    
    const totalProviders = parseInt(totalProvidersResult.rows[0].total_providers)
    const categories = categoriesResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      display_name: row.display_name,
      description: row.description,
      provider_count: parseInt(row.provider_count),
      facility_types_count: parseInt(row.facility_types_count),
      count: parseInt(row.provider_count), // For backward compatibility
      percentage: parseFloat(row.percentage)
    }))
    
    logger.debug(`Successfully fetched ${categories.length} categories from database`)
    
    return {
      total_providers: totalProviders,
      total_categories: categories.length,
      total_facility_types: categories.reduce((sum, cat) => sum + cat.facility_types_count, 0),
      categories: categories,
      last_updated: new Date().toISOString()
    }
  } catch (error: any) {
    logger.error('Error fetching catalog overview:', error.message)
    throw error
  } finally {
    if (client) {
      client.release()
    }
  }
}

// Get categories data
export async function getCategories() {
  const workingPool = await establishConnection()
  const client = await workingPool.connect()
  try {
    const result = await client.query(`
      SELECT 
        fc.id,
        fc.code as name,
        fc.name as display_name,
        fc.description,
        COALESCE(provider_counts.count, 0) as provider_count,
        COALESCE(type_counts.count, 0) as facility_types_count
      FROM healthcare_production.facility_categories fc
      LEFT JOIN (
        SELECT 
          facility_category_id,
          COUNT(*) as count
        FROM healthcare_production.healthcare_providers
        WHERE is_active = true
        GROUP BY facility_category_id
      ) provider_counts ON fc.id = provider_counts.facility_category_id
      LEFT JOIN (
        SELECT 
          category_id,
          COUNT(*) as count
        FROM healthcare_production.facility_types
        GROUP BY category_id
      ) type_counts ON fc.id = type_counts.category_id
      ORDER BY fc.name
      LIMIT 50
    `)
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      display_name: row.display_name,
      description: row.description,
      provider_count: parseInt(row.provider_count),
      facility_types_count: parseInt(row.facility_types_count),
      count: parseInt(row.provider_count) // For backward compatibility
    }))
  } catch (error: any) {
    logger.error('Error fetching categories:', error.message)
    throw error
  } finally {
    client.release()
  }
}

// Get providers data with pagination and filtering
export async function getProviders(params: {
  page?: number
  limit?: number
  category?: string
  search?: string
}) {
  const workingPool = await establishConnection()
  const client = await workingPool.connect()
  try {
    const { page = 1, limit = 10, category, search } = params
    const offset = (page - 1) * limit
    
    let whereClause = ''
    const queryParams: any[] = []
    let paramIndex = 1
    
    if (category) {
      whereClause += ` AND fc.code = $${paramIndex}`
      queryParams.push(category)
      paramIndex++
    }
    
    if (search) {
      whereClause += ` AND (hp.provider_name ILIKE $${paramIndex} OR hp.business_city ILIKE $${paramIndex})`
      queryParams.push(`%${search}%`)
      paramIndex++
    }
    
    // Optimized: Get total count with better performance
    const countQuery = `
      SELECT COUNT(*) as total
      FROM healthcare_production.healthcare_providers hp
      JOIN healthcare_production.facility_categories fc ON hp.facility_category_id = fc.id
      WHERE hp.is_active = true ${whereClause}
    `
    
    const countResult = await client.query(countQuery, queryParams)
    const total = parseInt(countResult.rows[0].total)
    
    // Optimized: Get providers with better indexing and limited fields
    const providersQuery = `
      SELECT 
        hp.id,
        hp.provider_name as name,
        CASE 
          WHEN hp.business_address_line1 IS NOT NULL AND hp.business_city IS NOT NULL AND s.name IS NOT NULL 
          THEN CONCAT(hp.business_address_line1, ', ', hp.business_city, ', ', s.name)
          WHEN hp.business_city IS NOT NULL AND s.name IS NOT NULL 
          THEN CONCAT(hp.business_city, ', ', s.name)
          ELSE hp.business_city
        END as address,
        hp.business_phone as phone,
        NULL as beds,
        et.name as ownership,
        ARRAY[]::text[] as specialties,
        fc.code as category_name,
        fc.name as category_display_name
      FROM healthcare_production.healthcare_providers hp
      JOIN healthcare_production.facility_categories fc ON hp.facility_category_id = fc.id
      LEFT JOIN healthcare_production.states s ON hp.business_state_id = s.id
      LEFT JOIN healthcare_production.entity_types et ON hp.entity_type_id = et.id
      WHERE hp.is_active = true ${whereClause}
      ORDER BY hp.provider_name
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    
    queryParams.push(limit, offset)
    const providersResult = await client.query(providersQuery, queryParams)
    
    const providers = providersResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.category_display_name,
      category: row.category_name,
      address: row.address,
      phone: row.phone,
      beds: row.beds,
      ownership: row.ownership,
      specialties: row.specialties || []
    }))
    
    return {
      providers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  } catch (error: any) {
    logger.error('Error fetching providers:', error.message)
    throw error
  } finally {
    client.release()
  }
}

// Get hospital types data
export async function getHospitalTypes() {
  const workingPool = await establishConnection()
  const client = await workingPool.connect()
  try {
    const result = await client.query(`
      SELECT 
        ft.id,
        ft.code as name,
        ft.name as display_name,
        ft.description,
        'Building2' as icon,
        'bg-blue-500' as color,
        COALESCE(provider_counts.count, 0) as count,
        ROUND((COALESCE(provider_counts.count, 0) * 100.0 / (SELECT COUNT(*) FROM healthcare_production.healthcare_providers WHERE is_active = true)), 2) as percentage
      FROM healthcare_production.facility_types ft
      LEFT JOIN (
        SELECT 
          facility_type_id,
          COUNT(*) as count
        FROM healthcare_production.healthcare_providers
        WHERE is_active = true
        GROUP BY facility_type_id
      ) provider_counts ON ft.id = provider_counts.facility_type_id
      WHERE ft.is_active = true
      ORDER BY count DESC
      LIMIT 20
    `)
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      display_name: row.display_name,
      description: row.description,
      icon: row.icon,
      color: row.color,
      count: parseInt(row.count),
      percentage: parseFloat(row.percentage)
    }))
  } catch (error: any) {
    logger.error('Error fetching hospital types:', error.message)
    throw error
  } finally {
    client.release()
  }
}

// Get specific hospital type data
export async function getHospitalTypeData(hospitalType: string) {
  const workingPool = await establishConnection()
  const client = await workingPool.connect()
  try {
    const result = await client.query(`
      SELECT 
        hp.id,
        hp.provider_name as name,
        CONCAT(hp.business_address_line1, ', ', hp.business_city, ', ', s.name) as address,
        hp.business_phone as phone,
        NULL as beds,
        et.name as ownership,
        hp.enumeration_date as established,
        ARRAY[]::text[] as specialties,
        NULL as accreditation,
        NULL as trauma_level,
        ft.name as type_name
      FROM healthcare_production.healthcare_providers hp
      JOIN healthcare_production.facility_types ft ON hp.facility_type_id = ft.id
      LEFT JOIN healthcare_production.entity_types et ON hp.entity_type_id = et.id
      LEFT JOIN healthcare_production.states s ON hp.business_state_id = s.id
      WHERE ft.code = $1 AND hp.is_active = true
      ORDER BY hp.provider_name
    `, [hospitalType])
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      address: row.address,
      phone: row.phone,
      beds: row.beds,
      ownership: row.ownership,
      established: row.established,
      specialties: row.specialties || [],
      accreditation: row.accreditation,
      trauma_level: row.trauma_level,
      type: row.type_name
    }))
  } catch (error: any) {
    logger.error('Error fetching hospital type data:', error.message)
    throw error
  } finally {
    client.release()
  }
}

// Close the pool (delegates to db-config)
export async function closePool() {
  const { closeDbPool } = await import('./db-config')
  await closeDbPool()
}
