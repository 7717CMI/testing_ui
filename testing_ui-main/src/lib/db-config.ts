import { Pool, PoolClient } from 'pg'

let pool: Pool | null = null

/**
 * Get or create a shared database connection pool
 * This prevents creating multiple pools and improves performance
 */
export function getDbPool(): Pool {
  if (!pool) {
    // Warn if using fallback values
    if (!process.env.DB_HOST) {
      console.warn('⚠️  DB_HOST not set, using fallback. Please configure .env.local')
    }
    if (!process.env.DB_PASSWORD) {
      console.warn('⚠️  DB_PASSWORD not set, using fallback. Please configure .env.local')
    }

    pool = new Pool({
      host: process.env.DB_HOST || '34.26.64.219',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'postgres',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'Platoon@1',
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : false,
      max: 20, // Maximum pool size
      min: 5, // Minimum pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      acquireTimeoutMillis: 10000,
      allowExitOnIdle: false,
    })

    // Handle pool errors gracefully
    pool.on('error', (err) => {
      console.error('[Database Pool] Unexpected error on idle client:', err)
      // Don't exit the application, just log the error
    })

    pool.on('connect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Database Pool] New client connected')
      }
    })

    console.log('✅ Database pool initialized')
  }

  return pool
}

/**
 * Execute a query using the shared pool
 */
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const pool = getDbPool()
  const client = await pool.connect()

  try {
    const result = await client.query(text, params)
    return result.rows
  } finally {
    client.release()
  }
}

/**
 * Get a client from the pool for multiple queries
 * Remember to call client.release() when done!
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getDbPool()
  return pool.connect()
}

/**
 * Close the database pool (useful for cleanup in tests or shutdown)
 */
export async function closeDbPool() {
  if (pool) {
    await pool.end()
    pool = null
    console.log('✅ Database pool closed')
  }
}

