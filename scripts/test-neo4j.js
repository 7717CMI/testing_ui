// Test Neo4j connection
// Run with: node scripts/test-neo4j.js

require('dotenv').config({ path: '.env.local' })

const neo4j = require('neo4j-driver')

async function testNeo4jConnection() {
  const uri = process.env.NEO4J_URI || 'bolt://localhost:7687'
  const user = process.env.NEO4J_USER || 'neo4j'
  const password = process.env.NEO4J_PASSWORD || 'password'

  console.log('🔍 Testing Neo4j connection...')
  console.log(`URI: ${uri}`)
  console.log(`User: ${user}`)
  console.log(`Password: ${password ? '***' : 'NOT SET'}`)

  if (!password || password === 'password' || password === 'your_password_here') {
    console.error('❌ Please set NEO4J_PASSWORD in .env.local')
    return
  }

  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
  const session = driver.session()

  try {
    // Test basic connection
    const result = await session.run('RETURN 1 as test')
    console.log('✅ Neo4j connection successful!')
    
    // Test database info
    const dbResult = await session.run('CALL dbms.components() YIELD name, versions')
    console.log('📊 Database components:', dbResult.records.map(r => r.get('name')))
    
    // Test node count
    const countResult = await session.run('MATCH (n) RETURN count(n) as nodeCount')
    const nodeCount = countResult.records[0].get('nodeCount')
    console.log(`📈 Total nodes in database: ${nodeCount}`)
    
    if (nodeCount === 0) {
      console.log('💡 Database is empty. Consider adding sample data.')
    }

  } catch (error) {
    console.error('❌ Neo4j connection failed:', error.message)
    
    if (error.message.includes('Authentication failed')) {
      console.log('💡 Check your username and password')
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Make sure Neo4j is running on', uri)
    }
  } finally {
    await session.close()
    await driver.close()
  }
}

testNeo4jConnection()
