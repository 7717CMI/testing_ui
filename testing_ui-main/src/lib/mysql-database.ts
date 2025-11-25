import mysql from 'mysql2/promise'

// GCP Cloud SQL MySQL Configuration
// SSL is required for GCP Cloud SQL connections
const mysqlConfig = {
  host: process.env.MYSQL_HOST || '34.63.177.157',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  database: process.env.MYSQL_DATABASE || 'chat_history',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'Platoon@1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // GCP Cloud SQL requires SSL - enable it
  ssl: process.env.MYSQL_USE_SSL !== 'false' ? {
    rejectUnauthorized: false, // GCP uses self-signed certificates
  } : false,
  connectTimeout: 30000, // 30 seconds for GCP (increased from 10s)
  acquireTimeout: 30000, // 30 seconds
  // Additional GCP Cloud SQL optimizations
  timezone: 'Z', // UTC timezone
  dateStrings: false,
  supportBigNumbers: true,
  bigNumberStrings: true,
  // Enable keep-alive for long connections
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
}

let mysqlPool: mysql.Pool | null = null

/**
 * Get MySQL connection pool with retry logic
 */
export async function getMySQLPool(): Promise<mysql.Pool> {
  if (mysqlPool) {
    return mysqlPool
  }
  
  return connectWithRetry()
}

/**
 * Connect to MySQL with retry logic (3 attempts)
 */
async function connectWithRetry(maxRetries = 3): Promise<mysql.Pool> {
  let lastError: any = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      mysqlPool = mysql.createPool(mysqlConfig)
      
      // Test connection
      const connection = await mysqlPool.getConnection()
      await connection.ping()
      connection.release()
      
      console.log(`✅ Connected to MySQL database for chat history (attempt ${attempt})`)
      console.log(`   Host: ${mysqlConfig.host}:${mysqlConfig.port}`)
      console.log(`   Database: ${mysqlConfig.database}`)
      
      return mysqlPool
    } catch (error: any) {
      lastError = error
      console.error(`❌ MySQL connection attempt ${attempt}/${maxRetries} failed:`, {
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
        message: error.message,
        host: mysqlConfig.host,
        port: mysqlConfig.port,
        database: mysqlConfig.database,
      })
      
      // Clean up failed pool
      if (mysqlPool) {
        try {
          await mysqlPool.end()
        } catch (e) {
          // Ignore cleanup errors
        }
        mysqlPool = null
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        console.log(`   Retrying in ${waitTime}ms...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }
  
  // All retries failed - preserve error details
  console.error('❌ MySQL connection failed after all retries')
  console.error('   Final error details:', {
    code: lastError?.code,
    errno: lastError?.errno,
    sqlState: lastError?.sqlState,
    sqlMessage: lastError?.sqlMessage,
    message: lastError?.message,
    name: lastError?.name,
    host: mysqlConfig.host,
    port: mysqlConfig.port,
    database: mysqlConfig.database,
  })
  
  // Preserve error code and details for proper handling upstream
  const enhancedError = new Error(lastError?.message || 'MySQL connection failed')
  ;(enhancedError as any).code = lastError?.code
  ;(enhancedError as any).errno = lastError?.errno
  ;(enhancedError as any).sqlState = lastError?.sqlState
  ;(enhancedError as any).sqlMessage = lastError?.sqlMessage
  ;(enhancedError as any).host = mysqlConfig.host
  
  throw enhancedError
}

/**
 * Get connection without database (for creating database)
 * Uses same SSL configuration as main pool for GCP Cloud SQL
 */
export async function getMySQLConnectionWithoutDB(): Promise<mysql.Connection> {
  const configWithoutDB = {
    ...mysqlConfig,
    database: undefined, // Don't specify database
    // Ensure SSL is enabled for GCP Cloud SQL
    ssl: process.env.MYSQL_USE_SSL !== 'false' ? {
      rejectUnauthorized: false, // GCP uses self-signed certificates
    } : false,
    connectTimeout: 30000, // 30 seconds for GCP
  }
  
  try {
    const connection = await mysql.createConnection(configWithoutDB)
    return connection
  } catch (error: any) {
    console.error('❌ Failed to connect to MySQL (without database):', {
      code: error.code,
      message: error.message,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
    })
    throw error
  }
}

/**
 * Close MySQL pool
 */
export async function closeMySQLPool(): Promise<void> {
  if (mysqlPool) {
    try {
      await mysqlPool.end()
      mysqlPool = null
      console.log('✅ MySQL pool closed')
    } catch (error) {
      console.error('❌ Error closing MySQL pool:', error)
      mysqlPool = null
    }
  }
}

/**
 * Get MySQL configuration (for testing/debugging)
 */
export function getMySQLConfig() {
  return {
    host: mysqlConfig.host,
    port: mysqlConfig.port,
    database: mysqlConfig.database,
    user: mysqlConfig.user,
    // Don't expose password
  }
}
