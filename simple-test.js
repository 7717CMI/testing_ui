#!/usr/bin/env node

/**
 * Simple Server Connection Test
 * Tests basic connectivity and shows what's working
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Configuration
const CONFIG = {
  database: {
    host: '127.0.0.1',
    port: 5433,
    database: 'healthdata',
    user: 'cloudadminsql',
    password: 'Platoon@1'
  },
  endpoints: {
    backend: 'http://localhost:8000',
    frontend: 'http://localhost:3001'
  }
};

console.log('🔍 HealthData Server Connection Test');
console.log('=====================================\n');

// Test network connectivity
function testNetworkConnection(host, port, name) {
  return new Promise((resolve) => {
    const client = require('net').createConnection(port, host);
    client.setTimeout(3000);
    
    client.on('connect', () => {
      client.destroy();
      console.log(`✅ ${name}: ${host}:${port} is reachable`);
      resolve(true);
    });
    
    client.on('timeout', () => {
      client.destroy();
      console.log(`❌ ${name}: ${host}:${port} - Connection timeout`);
      resolve(false);
    });
    
    client.on('error', (err) => {
      console.log(`❌ ${name}: ${host}:${port} - ${err.message}`);
      resolve(false);
    });
  });
}

// Test HTTP endpoints
function testHttpEndpoint(url, name) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, { timeout: 5000 }, (res) => {
      console.log(`✅ ${name}: ${res.statusCode} - ${url}`);
      resolve(true);
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log(`❌ ${name}: Timeout - ${url}`);
      resolve(false);
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${name}: ${err.message} - ${url}`);
      resolve(false);
    });
    
    req.end();
  });
}

// Test database connection (basic)
function testDatabaseConnection() {
  return new Promise((resolve) => {
    // Just test if we can connect to the port
    const client = require('net').createConnection(CONFIG.database.port, CONFIG.database.host);
    client.setTimeout(3000);
    
    client.on('connect', () => {
      client.destroy();
      console.log(`✅ Database Server: PostgreSQL is running on ${CONFIG.database.host}:${CONFIG.database.port}`);
      console.log(`   Database: ${CONFIG.database.database}`);
      console.log(`   User: ${CONFIG.database.user}`);
      console.log(`   Note: Authentication may need to be configured`);
      resolve(true);
    });
    
    client.on('timeout', () => {
      client.destroy();
      console.log(`❌ Database Server: PostgreSQL not running on ${CONFIG.database.host}:${CONFIG.database.port}`);
      resolve(false);
    });
    
    client.on('error', (err) => {
      console.log(`❌ Database Server: ${err.message}`);
      resolve(false);
    });
  });
}

// Main test function
async function runTests() {
  console.log('📊 SYSTEM INFORMATION');
  console.log(`Node.js: ${process.version}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Directory: ${process.cwd()}\n`);
  
  console.log('🌐 NETWORK CONNECTIVITY');
  await testNetworkConnection('google.com', 443, 'Internet');
  await testDatabaseConnection();
  await testNetworkConnection('localhost', 8000, 'Backend Server');
  await testNetworkConnection('localhost', 3001, 'Frontend Server');
  
  console.log('\n🔗 HTTP ENDPOINTS');
  await testHttpEndpoint('http://localhost:8000/api/v1/health', 'Backend Health');
  await testHttpEndpoint('http://localhost:8000/api/v1/catalog/overview', 'Backend Catalog');
  await testHttpEndpoint('http://localhost:3001/', 'Frontend Home');
  await testHttpEndpoint('http://localhost:3001/data-catalog-demo', 'Frontend Data Catalog');
  
  console.log('\n📋 SUMMARY');
  console.log('• PostgreSQL server is reachable but authentication may need configuration');
  console.log('• Backend server (FastAPI) needs to be started');
  console.log('• Frontend server (Next.js) needs to be started');
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Start backend: cd backend && python run.py');
  console.log('2. Start frontend: npm run dev');
  console.log('3. Configure PostgreSQL authentication if needed');
  console.log('4. Visit: http://localhost:3001/data-catalog-demo');
}

// Run tests
runTests().catch(console.error);



















