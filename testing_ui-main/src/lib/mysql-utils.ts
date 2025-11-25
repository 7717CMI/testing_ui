import mysql from 'mysql2/promise'
import { getMySQLPool, getMySQLConnectionWithoutDB, getMySQLConfig } from './mysql-database'

export interface DatabaseStatus {
  connected: boolean
  databaseExists: boolean
  tablesExist: boolean
  tables: string[]
  error?: string
  errorCode?: string
}

/**
 * Test MySQL connection
 */
export async function testConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const pool = await getMySQLPool()
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()
    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Connection failed',
    }
  }
}

/**
 * Ensure database exists, create if it doesn't
 */
export async function ensureDatabase(): Promise<{ success: boolean; created: boolean; error?: string }> {
  try {
    const config = getMySQLConfig()
    const connection = await getMySQLConnectionWithoutDB()
    
    try {
      // Check if database exists
      const [databases] = await connection.execute(
        `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
        [config.database]
      )
      
      const dbExists = Array.isArray(databases) && databases.length > 0
      
      if (dbExists) {
        await connection.end()
        return { success: true, created: false }
      }
      
      // Create database
      await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``)
      await connection.end()
      
      console.log(`✅ Created database: ${config.database}`)
      return { success: true, created: true }
    } catch (error: any) {
      await connection.end()
      throw error
    }
  } catch (error: any) {
    console.error('❌ Failed to ensure database:', error.message)
    return {
      success: false,
      created: false,
      error: error.message || 'Failed to create database',
    }
  }
}

/**
 * Ensure all required tables exist, create if they don't
 */
export async function ensureTables(): Promise<{ success: boolean; created: string[]; error?: string }> {
  try {
    const pool = await getMySQLPool()
    const createdTables: string[] = []
    
    // Table 1: chat_sessions
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id CHAR(36) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          title VARCHAR(500) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NULL,
          
          INDEX idx_user_id (user_id),
          INDEX idx_updated_at (updated_at DESC),
          INDEX idx_user_updated (user_id, updated_at DESC),
          INDEX idx_expires_at (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      createdTables.push('chat_sessions')
      console.log('✅ Table chat_sessions ready')
    } catch (error: any) {
      console.error('❌ Failed to create chat_sessions:', error.message)
      throw error
    }
    
    // Table 2: chat_messages
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id CHAR(36) PRIMARY KEY,
          session_id CHAR(36) NOT NULL,
          role ENUM('user', 'assistant') NOT NULL,
          content TEXT NOT NULL,
          message_order INT NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
          INDEX idx_session_id (session_id),
          INDEX idx_session_order (session_id, message_order),
          INDEX idx_timestamp (timestamp)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      createdTables.push('chat_messages')
      console.log('✅ Table chat_messages ready')
    } catch (error: any) {
      console.error('❌ Failed to create chat_messages:', error.message)
      throw error
    }
    
    // Table 3: chat_message_metadata (optional)
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS chat_message_metadata (
          id CHAR(36) PRIMARY KEY,
          message_id CHAR(36) NOT NULL,
          metadata_type VARCHAR(50) NOT NULL,
          metadata_value JSON NOT NULL,
          
          FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
          INDEX idx_message_id (message_id),
          INDEX idx_metadata_type (metadata_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      createdTables.push('chat_message_metadata')
      console.log('✅ Table chat_message_metadata ready')
    } catch (error: any) {
      console.error('❌ Failed to create chat_message_metadata:', error.message)
      // Don't throw - this table is optional
    }
    
    // Create stored procedure: limit_user_chat_sessions
    try {
      await pool.execute(`
        DROP PROCEDURE IF EXISTS limit_user_chat_sessions
      `)
      await pool.execute(`
        CREATE PROCEDURE limit_user_chat_sessions(IN p_user_id VARCHAR(255))
        BEGIN
          DECLARE chat_count INT;
          SELECT COUNT(*) INTO chat_count FROM chat_sessions WHERE user_id = p_user_id;
          
          IF chat_count > 10 THEN
            DELETE FROM chat_sessions
            WHERE id IN (
              SELECT id FROM (
                SELECT id FROM chat_sessions 
                WHERE user_id = p_user_id 
                ORDER BY updated_at ASC 
                LIMIT (chat_count - 10)
              ) AS temp
            );
          END IF;
        END
      `)
      console.log('✅ Stored procedure limit_user_chat_sessions ready')
    } catch (error: any) {
      console.warn('⚠️ Failed to create stored procedure (non-critical):', error.message)
    }
    
    return { success: true, created: createdTables }
  } catch (error: any) {
    console.error('❌ Failed to ensure tables:', error.message)
    return {
      success: false,
      created: [],
      error: error.message || 'Failed to create tables',
    }
  }
}

/**
 * Get comprehensive database status
 */
export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  const status: DatabaseStatus = {
    connected: false,
    databaseExists: false,
    tablesExist: false,
    tables: [],
  }
  
  try {
    // Test connection
    const connectionTest = await testConnection()
    if (!connectionTest.success) {
      status.error = connectionTest.error
      return status
    }
    status.connected = true
    
    // Check database
    const dbCheck = await ensureDatabase()
    if (!dbCheck.success) {
      status.error = dbCheck.error
      return status
    }
    status.databaseExists = true
    
    // Check tables
    try {
      const pool = await getMySQLPool()
      const [tables] = await pool.execute(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME IN ('chat_sessions', 'chat_messages', 'chat_message_metadata')
      `, [getMySQLConfig().database])
      
      const tableNames = (tables as any[]).map((t: any) => t.TABLE_NAME)
      status.tables = tableNames
      status.tablesExist = tableNames.length >= 2 // At least 2 required tables
    } catch (error: any) {
      status.error = error.message
      status.errorCode = error.code
    }
    
    return status
  } catch (error: any) {
    status.error = error.message || 'Unknown error'
    status.errorCode = error.code
    return status
  }
}

/**
 * Initialize database and tables (idempotent)
 */
export async function initializeDatabase(): Promise<{
  success: boolean
  databaseCreated: boolean
  tablesCreated: string[]
  error?: string
}> {
  try {
    // Step 1: Ensure database exists
    const dbResult = await ensureDatabase()
    if (!dbResult.success) {
      return {
        success: false,
        databaseCreated: false,
        tablesCreated: [],
        error: dbResult.error,
      }
    }
    
    // Step 2: Ensure tables exist
    const tablesResult = await ensureTables()
    if (!tablesResult.success) {
      return {
        success: false,
        databaseCreated: dbResult.created,
        tablesCreated: [],
        error: tablesResult.error,
      }
    }
    
    return {
      success: true,
      databaseCreated: dbResult.created,
      tablesCreated: tablesResult.created,
    }
  } catch (error: any) {
    return {
      success: false,
      databaseCreated: false,
      tablesCreated: [],
      error: error.message || 'Initialization failed',
    }
  }
}







