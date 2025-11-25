// Quick test to verify GCP database connection
const { Pool } = require('pg')

const pool = new Pool({
  host: '34.26.64.219',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Platoon@1',
  ssl: false,
  connectionTimeoutMillis: 10000,
})

async function testConnection() {
  console.log('\nðŸ” Testing GCP Database Connection...\n')
  console.log('Host: 34.26.64.219:5432')
  console.log('Database: postgres')
  console.log('Schema: healthcare_production\n')

  try {
    const client = await pool.connect()
    console.log('âœ… Connection successful!\n')

    const result = await client.query(
      SELECT 
        schemaname,
        COUNT(*) as table_count
      FROM pg_tables 
      WHERE schemaname = 'healthcare_production'
      GROUP BY schemaname
    )

    if (result.rows.length > 0) {
      console.log('ðŸ“Š Schema verification:')
      console.log(   Schema: )
      console.log(   Tables: )
      console.log('\nâœ… GCP database is working correctly!')
    } else {
      console.log('âš ï¸  Schema "healthcare_production" not found')
    }

    client.release()
  } catch (error) {
    console.log('âŒ Connection failed!')
    console.log(   Error: )
    console.log('\nðŸ”§ Solution:')
    console.log('   1. Go to GCP Console â†’ SQL â†’ Your Instance')
    console.log('   2. Navigate to Connections â†’ Networking')
    console.log('   3. Add authorized network: 203.109.86.202/32')
    console.log('   4. Save and wait 30 seconds')
    console.log('   5. Run this test again: node test-gcp-connection.js')
  } finally {
    await pool.end()
  }
}

testConnection()
