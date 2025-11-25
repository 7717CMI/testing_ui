/**
 * Diagnostic script to test MySQL connection
 * Run with: node test-mysql-connection.js
 */

const mysql = require('mysql2/promise')

// GCP Cloud SQL MySQL Configuration
const config = {
  host: process.env.MYSQL_HOST || '34.63.177.157',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  database: process.env.MYSQL_DATABASE || 'chat_history',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'Platoon@1',
  // GCP Cloud SQL requires SSL
  ssl: process.env.MYSQL_USE_SSL !== 'false' ? {
    rejectUnauthorized: false, // GCP uses self-signed certificates
  } : false,
  connectTimeout: 30000, // 30 seconds for GCP
}

async function testConnection() {
  console.log('🔍 Testing MySQL Connection...\n')
  console.log('Configuration:')
  console.log(`  Host: ${config.host}`)
  console.log(`  Port: ${config.port}`)
  console.log(`  Database: ${config.database}`)
  console.log(`  User: ${config.user}`)
  console.log(`  Password: ${config.password ? '***' : 'NOT SET'}\n`)

  // Test 1: Try to connect without database
  console.log('Test 1: Connecting without database...')
  try {
    const connectionWithoutDB = await mysql.createConnection({
      ...config,
      database: undefined,
      ssl: config.ssl, // Use SSL for GCP
    })
    await connectionWithoutDB.ping()
    console.log('✅ Successfully connected to MySQL server (GCP Cloud SQL)\n')
    await connectionWithoutDB.end()
  } catch (error) {
    console.error('❌ Failed to connect to MySQL server:')
    console.error(`   Code: ${error.code}`)
    console.error(`   Errno: ${error.errno}`)
    console.error(`   Message: ${error.message}`)
    console.error(`   SQL State: ${error.sqlState}`)
    console.error(`   SQL Message: ${error.sqlMessage}`)
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.code === 'ER_ACCESS_DENIED') {
      console.error('\n💡 AUTHENTICATION ERROR:')
      console.error('   - Check MySQL user credentials in GCP Console')
      console.error('   - Ensure user has permission from your IP address')
      console.error('   - Verify password is correct')
      console.error('   - User host should be "%" or your IP: 122.170.193.59\n')
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('\n💡 CONNECTION ERROR:')
      console.error('   - Check firewall rules in GCP Console')
      console.error('   - Ensure your IP is in Authorized networks')
      console.error('   - Verify MySQL instance is running\n')
    } else {
      console.error('\n💡 This indicates a connection problem (firewall, network, or server down)\n')
    }
    return
  }

  // Test 2: Check if database exists
  console.log('Test 2: Checking if database exists...')
  try {
    const connection = await mysql.createConnection({
      ...config,
      database: undefined,
      ssl: config.ssl, // Use SSL for GCP
    })
    
    const [databases] = await connection.execute(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [config.database]
    )
    
    if (Array.isArray(databases) && databases.length > 0) {
      console.log(`✅ Database '${config.database}' exists\n`)
    } else {
      console.log(`❌ Database '${config.database}' does NOT exist`)
      console.log('💡 You need to initialize the database\n')
    }
    
    await connection.end()
  } catch (error) {
    console.error('❌ Error checking database:')
    console.error(`   Code: ${error.code}`)
    console.error(`   Message: ${error.message}\n`)
  }

  // Test 3: Try to connect with database
  console.log('Test 3: Connecting with database...')
  try {
    const connection = await mysql.createConnection({
      ...config,
      ssl: config.ssl, // Ensure SSL is used
    })
    await connection.ping()
    console.log(`✅ Successfully connected to database '${config.database}'\n`)
    
    // Test 4: Check if tables exist
    console.log('Test 4: Checking if tables exist...')
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME IN ('chat_sessions', 'chat_messages', 'chat_message_metadata')`,
      [config.database]
    )
    
    if (Array.isArray(tables) && tables.length > 0) {
      console.log(`✅ Found ${tables.length} table(s):`)
      tables.forEach((table) => {
        console.log(`   - ${table.TABLE_NAME}`)
      })
      console.log('\n✅ Database is ready!\n')
    } else {
      console.log('❌ Required tables do NOT exist')
      console.log('💡 You need to initialize the database tables\n')
    }
    
    await connection.end()
  } catch (error) {
    console.error('❌ Failed to connect to database:')
    console.error(`   Code: ${error.code}`)
    console.error(`   Errno: ${error.errno}`)
    console.error(`   SQL State: ${error.sqlState}`)
    console.error(`   SQL Message: ${error.sqlMessage}`)
    console.error(`   Message: ${error.message}`)
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Database does not exist. You need to initialize it.\n')
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.code === 'ER_ACCESS_DENIED') {
      console.error('\n💡 AUTHENTICATION ERROR:')
      console.error('   - Check MySQL user credentials in GCP Console')
      console.error('   - Ensure user has permission from your IP address')
      console.error('   - Verify password is correct')
      console.error('   - User host should be "%" or your IP: 122.170.193.59')
      console.error('   - Go to GCP Console → SQL → Your Instance → Users\n')
    } else {
      console.error('\n💡 Unexpected error. Check the details above.\n')
    }
  }
}

testConnection().catch(console.error)

