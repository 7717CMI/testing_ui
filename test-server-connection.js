#!/usr/bin/env node

/**
 * Comprehensive Server Connection Test
 * Tests GCP PostgreSQL connection and all API endpoints
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const CONFIG = {
  // Database connection details
  database: {
    host: '127.0.0.1',
    port: 5433,
    database: 'healthdata',
    user: 'cloudadminsql',
    password: 'Platoon@1',
    schema: 'public'
  },
  
  // API endpoints to test
  endpoints: {
    backend: 'http://localhost:8000',
    frontend: 'http://localhost:3001'
  },
  
  // Test timeouts
  timeout: 10000
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results storage
const testResults = {
  database: { passed: 0, failed: 0, tests: [] },
  backend: { passed: 0, failed: 0, tests: [] },
  frontend: { passed: 0, failed: 0, tests: [] }
};

// Utility functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(title) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(`${title}`, colors.bright + colors.cyan);
  log(`${'='.repeat(60)}`, colors.cyan);
}

function logTest(testName, passed, details = '') {
  const status = passed ? 'PASS' : 'FAIL';
  const color = passed ? colors.green : colors.red;
  const icon = passed ? '✓' : '✗';
  
  log(`${icon} ${testName}: ${status}`, color);
  if (details) {
    log(`   ${details}`, colors.yellow);
  }
  
  // Store result
  const category = testName.includes('Database') ? 'database' : 
                   testName.includes('Backend') ? 'backend' : 'frontend';
  
  testResults[category].tests.push({ name: testName, passed, details });
  if (passed) {
    testResults[category].passed++;
  } else {
    testResults[category].failed++;
  }
}

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'HealthData-Test-Script/1.0',
        ...options.headers
      },
      timeout: CONFIG.timeout
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData,
            rawData: data
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: null,
            rawData: data
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Database connection test using pg (if available)
async function testDatabaseConnection() {
  logHeader('DATABASE CONNECTION TESTS');
  
  try {
    // Try to require pg module
    const { Client } = require('pg');
    
    const client = new Client({
      host: CONFIG.database.host,
      port: CONFIG.database.port,
      database: CONFIG.database.database,
      user: CONFIG.database.user,
      password: CONFIG.database.password,
      ssl: false,
      connectionTimeoutMillis: CONFIG.timeout
    });

    // Test 1: Basic connection
    try {
      await client.connect();
      logTest('Database Connection', true, 'Successfully connected to PostgreSQL');
      
      // Test 2: Schema access
      const schemaResult = await client.query(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = $1
      `, [CONFIG.database.schema]);
      
      logTest('Database Schema Access', schemaResult.rows.length > 0, 
        `Schema '${CONFIG.database.schema}' ${schemaResult.rows.length > 0 ? 'exists' : 'not found'}`);
      
      // Test 3: Table existence
      const tables = ['healthcare_providers', 'facility_categories', 'facility_types', 'states'];
      for (const table of tables) {
        try {
          const tableResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = $1 AND table_name = $2
          `, [CONFIG.database.schema, table]);
          
          logTest(`Database Table: ${table}`, tableResult.rows.length > 0,
            tableResult.rows.length > 0 ? 'Table exists' : 'Table not found');
        } catch (e) {
          logTest(`Database Table: ${table}`, false, e.message);
        }
      }
      
      // Test 4: Data counts
      try {
        const countResult = await client.query(`
          SELECT 
            (SELECT COUNT(*) FROM ${CONFIG.database.schema}.healthcare_providers WHERE is_active = true) as providers,
            (SELECT COUNT(*) FROM ${CONFIG.database.schema}.facility_categories) as categories,
            (SELECT COUNT(*) FROM ${CONFIG.database.schema}.facility_types) as facility_types
        `);
        
        const counts = countResult.rows[0];
        logTest('Database Data Counts', true, 
          `Providers: ${counts.providers}, Categories: ${counts.categories}, Facility Types: ${counts.facility_types}`);
      } catch (e) {
        logTest('Database Data Counts', false, e.message);
      }
      
      // Test 5: Sample data query
      try {
        const sampleResult = await client.query(`
          SELECT provider_name, business_city, business_state 
          FROM ${CONFIG.database.schema}.healthcare_providers 
          WHERE is_active = true 
          LIMIT 3
        `);
        
        logTest('Database Sample Data', sampleResult.rows.length > 0,
          `Retrieved ${sampleResult.rows.length} sample records`);
          
        if (sampleResult.rows.length > 0) {
          log('   Sample records:', colors.blue);
          sampleResult.rows.forEach((row, i) => {
            log(`   ${i + 1}. ${row.provider_name} - ${row.business_city}, ${row.business_state}`, colors.blue);
          });
        }
      } catch (e) {
        logTest('Database Sample Data', false, e.message);
      }
      
      await client.end();
      
    } catch (e) {
      logTest('Database Connection', false, e.message);
    }
    
  } catch (e) {
    logTest('Database Module', false, 'pg module not installed. Run: npm install pg');
  }
}

// Backend API tests
async function testBackendAPI() {
  logHeader('BACKEND API TESTS');
  
  const endpoints = [
    { path: '/api/v1/health', name: 'Health Check' },
    { path: '/api/v1/catalog/overview', name: 'Catalog Overview' },
    { path: '/api/v1/catalog/categories', name: 'Categories List' },
    { path: '/api/v1/catalog/statistics', name: 'Catalog Statistics' },
    { path: '/api/v1/catalog/providers?limit=5', name: 'Providers List' },
    { path: '/api/v1/catalog/search?q=hospital&limit=3', name: 'Search Providers' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${CONFIG.endpoints.backend}${endpoint.path}`);
      
      if (response.statusCode === 200) {
        logTest(`Backend API: ${endpoint.name}`, true, 
          `Status: ${response.statusCode}, Response size: ${response.rawData.length} bytes`);
        
        // Log sample response data
        if (response.data && typeof response.data === 'object') {
          if (response.data.total_providers) {
            log(`   Total providers: ${response.data.total_providers}`, colors.blue);
          }
          if (response.data.categories) {
            log(`   Categories found: ${response.data.categories.length}`, colors.blue);
          }
          if (response.data.providers) {
            log(`   Providers returned: ${response.data.providers.length}`, colors.blue);
          }
        }
      } else {
        logTest(`Backend API: ${endpoint.name}`, false, 
          `Status: ${response.statusCode}, Response: ${response.rawData.substring(0, 100)}`);
      }
    } catch (e) {
      logTest(`Backend API: ${endpoint.name}`, false, e.message);
    }
  }
}

// Frontend tests
async function testFrontend() {
  logHeader('FRONTEND TESTS');
  
  const pages = [
    { path: '/', name: 'Home Page' },
    { path: '/data-catalog-demo', name: 'Data Catalog Demo' },
    { path: '/search', name: 'Search Page' },
    { path: '/insights', name: 'Insights Page' },
    { path: '/api/v1/catalog/overview', name: 'Frontend API Proxy' }
  ];
  
  for (const page of pages) {
    try {
      const response = await makeRequest(`${CONFIG.endpoints.frontend}${page.path}`);
      
      if (response.statusCode === 200) {
        const isHtml = response.headers['content-type']?.includes('text/html');
        const isJson = response.headers['content-type']?.includes('application/json');
        
        logTest(`Frontend: ${page.name}`, true, 
          `Status: ${response.statusCode}, Type: ${isHtml ? 'HTML' : isJson ? 'JSON' : 'Other'}, Size: ${response.rawData.length} bytes`);
        
        if (isHtml) {
          // Check for key elements in HTML
          const hasTitle = response.rawData.includes('<title>');
          const hasReact = response.rawData.includes('__NEXT_DATA__') || response.rawData.includes('react');
          log(`   Has title: ${hasTitle}, Has React: ${hasReact}`, colors.blue);
        }
      } else {
        logTest(`Frontend: ${page.name}`, false, 
          `Status: ${response.statusCode}`);
      }
    } catch (e) {
      logTest(`Frontend: ${page.name}`, false, e.message);
    }
  }
}

// System information
function logSystemInfo() {
  logHeader('SYSTEM INFORMATION');
  
  log(`Node.js Version: ${process.version}`, colors.blue);
  log(`Platform: ${process.platform}`, colors.blue);
  log(`Architecture: ${process.arch}`, colors.blue);
  log(`Current Directory: ${process.cwd()}`, colors.blue);
  
  // Check for required modules
  const modules = ['pg', 'next', 'react', 'fastapi'];
  modules.forEach(module => {
    try {
      require.resolve(module);
      log(`Module ${module}: Available`, colors.green);
    } catch (e) {
      log(`Module ${module}: Not found`, colors.red);
    }
  });
}

// Network connectivity test
async function testNetworkConnectivity() {
  logHeader('NETWORK CONNECTIVITY TESTS');
  
  const hosts = [
    { host: 'google.com', port: 443, name: 'Internet Connectivity' },
    { host: CONFIG.database.host, port: CONFIG.database.port, name: 'PostgreSQL Server' },
    { host: 'localhost', port: 8000, name: 'Backend Server' },
    { host: 'localhost', port: 3001, name: 'Frontend Server' }
  ];
  
  for (const host of hosts) {
    try {
      await new Promise((resolve, reject) => {
        const client = require('net').createConnection(host.port, host.host);
        client.setTimeout(5000);
        
        client.on('connect', () => {
          client.destroy();
          resolve();
        });
        
        client.on('timeout', () => {
          client.destroy();
          reject(new Error('Connection timeout'));
        });
        
        client.on('error', reject);
      });
      
      logTest(`Network: ${host.name}`, true, `${host.host}:${host.port} is reachable`);
    } catch (e) {
      logTest(`Network: ${host.name}`, false, `${host.host}:${host.port} - ${e.message}`);
    }
  }
}

// Generate summary report
function generateSummary() {
  logHeader('TEST SUMMARY REPORT');
  
  const totalTests = Object.values(testResults).reduce((sum, category) => sum + category.passed + category.failed, 0);
  const totalPassed = Object.values(testResults).reduce((sum, category) => sum + category.passed, 0);
  const totalFailed = Object.values(testResults).reduce((sum, category) => sum + category.failed, 0);
  
  log(`Total Tests: ${totalTests}`, colors.bright);
  log(`Passed: ${totalPassed}`, colors.green);
  log(`Failed: ${totalFailed}`, colors.red);
  log(`Success Rate: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0}%`, 
      totalFailed === 0 ? colors.green : colors.yellow);
  
  // Category breakdown
  Object.entries(testResults).forEach(([category, results]) => {
    const categoryTotal = results.passed + results.failed;
    const categoryRate = categoryTotal > 0 ? ((results.passed / categoryTotal) * 100).toFixed(1) : 0;
    
    log(`\n${category.toUpperCase()}:`, colors.cyan);
    log(`  Tests: ${categoryTotal}, Passed: ${results.passed}, Failed: ${results.failed}`, 
        results.failed === 0 ? colors.green : colors.yellow);
    log(`  Success Rate: ${categoryRate}%`, 
        results.failed === 0 ? colors.green : colors.yellow);
  });
  
  // Recommendations
  logHeader('RECOMMENDATIONS');
  
  if (testResults.database.failed > 0) {
    log('• Install PostgreSQL client: npm install pg', colors.yellow);
    log('• Verify database credentials and connection', colors.yellow);
    log('• Check if PostgreSQL server is running on port 5433', colors.yellow);
  }
  
  if (testResults.backend.failed > 0) {
    log('• Start backend server: cd backend && python run.py', colors.yellow);
    log('• Check FastAPI dependencies: pip install -r requirements.txt', colors.yellow);
  }
  
  if (testResults.frontend.failed > 0) {
    log('• Start frontend server: npm run dev', colors.yellow);
    log('• Install dependencies: npm install', colors.yellow);
  }
  
  if (totalFailed === 0) {
    log('🎉 All tests passed! Your system is fully operational.', colors.green);
  }
}

// Main test runner
async function runAllTests() {
  log('🚀 Starting Comprehensive Server Connection Tests...', colors.bright + colors.cyan);
  log(`Timestamp: ${new Date().toISOString()}`, colors.blue);
  
  try {
    await logSystemInfo();
    await testNetworkConnectivity();
    await testDatabaseConnection();
    await testBackendAPI();
    await testFrontend();
    generateSummary();
  } catch (error) {
    log(`\n❌ Test suite failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Handle command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    log('HealthData Server Connection Test', colors.bright + colors.cyan);
    log('Usage: node test-server-connection.js [options]', colors.blue);
    log('Options:', colors.blue);
    log('  --help, -h     Show this help message', colors.blue);
    log('  --database     Test database connection only', colors.blue);
    log('  --backend      Test backend API only', colors.blue);
    log('  --frontend     Test frontend only', colors.blue);
    log('  --network      Test network connectivity only', colors.blue);
    process.exit(0);
  }
  
  if (args.includes('--database')) {
    testDatabaseConnection().then(() => process.exit(0));
  } else if (args.includes('--backend')) {
    testBackendAPI().then(() => process.exit(0));
  } else if (args.includes('--frontend')) {
    testFrontend().then(() => process.exit(0));
  } else if (args.includes('--network')) {
    testNetworkConnectivity().then(() => process.exit(0));
  } else {
    runAllTests();
  }
}

module.exports = {
  testDatabaseConnection,
  testBackendAPI,
  testFrontend,
  testNetworkConnectivity,
  runAllTests
};












