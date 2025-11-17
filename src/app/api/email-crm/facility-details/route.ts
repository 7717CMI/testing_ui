import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// Use shared database pool configuration
let pool: Pool | null = null

async function getPool(): Promise<Pool> {
  if (pool && !pool.ended) {
    try {
      const testClient = await pool.connect()
      await testClient.query('SELECT 1')
      testClient.release()
      return pool
    } catch (error) {
      console.warn('[Facility Details API] Pool unhealthy, recreating...')
      try {
        await pool.end()
      } catch (e) {
        // Ignore errors when ending unhealthy pool
      }
      pool = null
    }
  }

  const poolConfig = {
    host: process.env.DB_HOST || '34.26.64.219',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Platoon@1',
    ssl: false,
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 20000,
    acquireTimeoutMillis: 20000,
    allowExitOnIdle: false,
  }

  pool = new Pool(poolConfig)

  pool.on('error', (err, client) => {
    console.error('[Facility Details API] Unexpected error on idle client:', err)
  })

  return pool
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const npi = searchParams.get('npi')

    if (!npi) {
      return NextResponse.json(
        { success: false, error: 'NPI parameter is required' },
        { status: 400 }
      )
    }

    const workingPool = await getPool()
    let client

    try {
      client = await Promise.race([
        workingPool.connect(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout after 20 seconds')), 20000)
        ),
      ])
    } catch (connectionError: any) {
      console.error('[Facility Details API] Connection error:', connectionError)
      return NextResponse.json(
        { success: false, error: `Database connection failed: ${connectionError.message}` },
        { status: 500 }
      )
    }

    try {
      const sql = `
        SELECT 
          hp.npi_number,
          CASE 
            WHEN hp.authorized_official_first_name IS NOT NULL OR hp.authorized_official_last_name IS NOT NULL
            THEN TRIM(CONCAT(COALESCE(hp.authorized_official_first_name, ''), ' ', COALESCE(hp.authorized_official_last_name, '')))
            ELSE NULL
          END as authorized_person_name,
          hp.authorized_official_title as authorized_person_designation,
          hp.authorized_official_phone as authorized_person_phone
        FROM healthcare_production.healthcare_providers hp
        WHERE hp.npi_number = $1 AND hp.is_active = true
        LIMIT 1
      `

      const result = await client.query(sql, [npi])

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Facility not found' },
          { status: 404 }
        )
      }

      const row = result.rows[0]

      return NextResponse.json({
        success: true,
        data: {
          npi_number: row.npi_number,
          authorized_person_name: row.authorized_person_name || null,
          authorized_person_designation: row.authorized_person_designation || null,
          authorized_person_phone: row.authorized_person_phone || null,
        },
      })
    } finally {
      if (client) {
        client.release()
      }
    }
  } catch (error: any) {
    console.error('[Facility Details API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch facility details',
      },
      { status: 500 }
    )
  }
}

