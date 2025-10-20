#!/usr/bin/env python3
"""
Comprehensive Server Connection Test - Python Version
Tests GCP PostgreSQL connection and all API endpoints
"""

import asyncio
import aiohttp
import psycopg2
import sys
import json
import time
from datetime import datetime
from typing import Dict, List, Any, Optional
import traceback

# Configuration
CONFIG = {
    'database': {
        'host': '127.0.0.1',
        'port': 5433,
        'database': 'healthdata',
        'user': 'cloudadminsql',
        'password': 'Platoon@1',
        'schema': 'public'
    },
    'endpoints': {
        'backend': 'http://localhost:8000',
        'frontend': 'http://localhost:3001'
    },
    'timeout': 10
}

# Colors for console output
class Colors:
    RESET = '\033[0m'
    BRIGHT = '\033[1m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    MAGENTA = '\033[35m'
    CYAN = '\033[36m'

# Test results storage
test_results = {
    'database': {'passed': 0, 'failed': 0, 'tests': []},
    'backend': {'passed': 0, 'failed': 0, 'tests': []},
    'frontend': {'passed': 0, 'failed': 0, 'tests': []},
    'network': {'passed': 0, 'failed': 0, 'tests': []}
}

def log(message: str, color: str = Colors.RESET) -> None:
    """Log a message with color"""
    print(f"{color}{message}{Colors.RESET}")

def log_header(title: str) -> None:
    """Log a section header"""
    log(f"\n{'=' * 60}", Colors.CYAN)
    log(f"{title}", Colors.BRIGHT + Colors.CYAN)
    log(f"{'=' * 60}", Colors.CYAN)

def log_test(test_name: str, passed: bool, details: str = '') -> None:
    """Log a test result"""
    status = 'PASS' if passed else 'FAIL'
    color = Colors.GREEN if passed else Colors.RED
    icon = '✓' if passed else '✗'
    
    log(f"{icon} {test_name}: {status}", color)
    if details:
        log(f"   {details}", Colors.YELLOW)
    
    # Store result
    category = 'database' if 'Database' in test_name else \
               'backend' if 'Backend' in test_name else \
               'frontend' if 'Frontend' in test_name else \
               'network' if 'Network' in test_name else 'other'
    
    if category in test_results:
        test_results[category]['tests'].append({
            'name': test_name,
            'passed': passed,
            'details': details
        })
        if passed:
            test_results[category]['passed'] += 1
        else:
            test_results[category]['failed'] += 1

async def test_database_connection() -> None:
    """Test PostgreSQL database connection and functionality"""
    log_header('DATABASE CONNECTION TESTS')
    
    try:
        # Test 1: Basic connection
        try:
            conn = psycopg2.connect(
                host=CONFIG['database']['host'],
                port=CONFIG['database']['port'],
                database=CONFIG['database']['database'],
                user=CONFIG['database']['user'],
                password=CONFIG['database']['password'],
                connect_timeout=CONFIG['timeout']
            )
            log_test('Database Connection', True, 'Successfully connected to PostgreSQL')
            
            cursor = conn.cursor()
            
            # Test 2: Schema access
            cursor.execute("""
                SELECT schema_name 
                FROM information_schema.schemata 
                WHERE schema_name = %s
            """, (CONFIG['database']['schema'],))
            
            schema_exists = cursor.fetchone() is not None
            log_test('Database Schema Access', schema_exists,
                    f"Schema '{CONFIG['database']['schema']}' {'exists' if schema_exists else 'not found'}")
            
            # Test 3: Table existence
            tables = ['healthcare_providers', 'facility_categories', 'facility_types', 'states']
            for table in tables:
                try:
                    cursor.execute("""
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = %s AND table_name = %s
                    """, (CONFIG['database']['schema'], table))
                    
                    table_exists = cursor.fetchone() is not None
                    log_test(f'Database Table: {table}', table_exists,
                            'Table exists' if table_exists else 'Table not found')
                except Exception as e:
                    log_test(f'Database Table: {table}', False, str(e))
            
            # Test 4: Data counts
            try:
                cursor.execute(f"""
                    SELECT 
                        (SELECT COUNT(*) FROM {CONFIG['database']['schema']}.healthcare_providers WHERE is_active = true) as providers,
                        (SELECT COUNT(*) FROM {CONFIG['database']['schema']}.facility_categories) as categories,
                        (SELECT COUNT(*) FROM {CONFIG['database']['schema']}.facility_types) as facility_types
                """)
                
                counts = cursor.fetchone()
                log_test('Database Data Counts', True,
                        f"Providers: {counts[0]}, Categories: {counts[1]}, Facility Types: {counts[2]}")
            except Exception as e:
                log_test('Database Data Counts', False, str(e))
            
            # Test 5: Sample data query
            try:
                cursor.execute(f"""
                    SELECT provider_name, business_city, business_state 
                    FROM {CONFIG['database']['schema']}.healthcare_providers 
                    WHERE is_active = true 
                    LIMIT 3
                """)
                
                samples = cursor.fetchall()
                log_test('Database Sample Data', len(samples) > 0,
                        f"Retrieved {len(samples)} sample records")
                
                if samples:
                    log('   Sample records:', Colors.BLUE)
                    for i, (name, city, state) in enumerate(samples, 1):
                        log(f"   {i}. {name} - {city}, {state}", Colors.BLUE)
            except Exception as e:
                log_test('Database Sample Data', False, str(e))
            
            # Test 6: Complex queries (catalog service functionality)
            try:
                cursor.execute(f"""
                    SELECT 
                        fc.id,
                        fc.name,
                        fc.display_name,
                        fc.description,
                        COUNT(DISTINCT hp.id) as provider_count,
                        COUNT(DISTINCT ft.id) as facility_types_count
                    FROM {CONFIG['database']['schema']}.facility_categories fc
                    LEFT JOIN {CONFIG['database']['schema']}.facility_types ft ON ft.category_id = fc.id
                    LEFT JOIN {CONFIG['database']['schema']}.healthcare_providers hp ON hp.facility_category_id = fc.id AND hp.is_active = true
                    GROUP BY fc.id, fc.name, fc.display_name, fc.description
                    ORDER BY fc.display_name
                    LIMIT 5
                """)
                
                categories = cursor.fetchall()
                log_test('Database Complex Query', len(categories) > 0,
                        f"Retrieved {len(categories)} categories with counts")
                
                if categories:
                    log('   Sample categories:', Colors.BLUE)
                    for cat in categories:
                        log(f"   - {cat[2]}: {cat[4]} providers, {cat[5]} types", Colors.BLUE)
            except Exception as e:
                log_test('Database Complex Query', False, str(e))
            
            cursor.close()
            conn.close()
            
        except Exception as e:
            log_test('Database Connection', False, str(e))
    
    except ImportError:
        log_test('Database Module', False, 'psycopg2 not installed. Run: pip install psycopg2-binary')

async def test_backend_api() -> None:
    """Test FastAPI backend endpoints"""
    log_header('BACKEND API TESTS')
    
    endpoints = [
        {'path': '/api/v1/health', 'name': 'Health Check'},
        {'path': '/api/v1/catalog/overview', 'name': 'Catalog Overview'},
        {'path': '/api/v1/catalog/categories', 'name': 'Categories List'},
        {'path': '/api/v1/catalog/statistics', 'name': 'Catalog Statistics'},
        {'path': '/api/v1/catalog/providers?limit=5', 'name': 'Providers List'},
        {'path': '/api/v1/catalog/search?q=hospital&limit=3', 'name': 'Search Providers'}
    ]
    
    async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=CONFIG['timeout'])) as session:
        for endpoint in endpoints:
            try:
                url = f"{CONFIG['endpoints']['backend']}{endpoint['path']}"
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        log_test(f"Backend API: {endpoint['name']}", True,
                                f"Status: {response.status}, Response size: {len(str(data))} bytes")
                        
                        # Log sample response data
                        if isinstance(data, dict):
                            if 'total_providers' in data:
                                log(f"   Total providers: {data['total_providers']}", Colors.BLUE)
                            if 'categories' in data:
                                log(f"   Categories found: {len(data['categories'])}", Colors.BLUE)
                            if 'providers' in data:
                                log(f"   Providers returned: {len(data['providers'])}", Colors.BLUE)
                    else:
                        text = await response.text()
                        log_test(f"Backend API: {endpoint['name']}", False,
                                f"Status: {response.status}, Response: {text[:100]}")
            except Exception as e:
                log_test(f"Backend API: {endpoint['name']}", False, str(e))

async def test_frontend() -> None:
    """Test Next.js frontend pages"""
    log_header('FRONTEND TESTS')
    
    pages = [
        {'path': '/', 'name': 'Home Page'},
        {'path': '/data-catalog-demo', 'name': 'Data Catalog Demo'},
        {'path': '/search', 'name': 'Search Page'},
        {'path': '/insights', 'name': 'Insights Page'},
        {'path': '/api/v1/catalog/overview', 'name': 'Frontend API Proxy'}
    ]
    
    async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=CONFIG['timeout'])) as session:
        for page in pages:
            try:
                url = f"{CONFIG['endpoints']['frontend']}{page['path']}"
                async with session.get(url) as response:
                    if response.status == 200:
                        text = await response.text()
                        content_type = response.headers.get('content-type', '')
                        
                        is_html = 'text/html' in content_type
                        is_json = 'application/json' in content_type
                        
                        log_test(f"Frontend: {page['name']}", True,
                                f"Status: {response.status}, Type: {'HTML' if is_html else 'JSON' if is_json else 'Other'}, Size: {len(text)} bytes")
                        
                        if is_html:
                            has_title = '<title>' in text
                            has_react = '__NEXT_DATA__' in text or 'react' in text.lower()
                            log(f"   Has title: {has_title}, Has React: {has_react}", Colors.BLUE)
                    else:
                        log_test(f"Frontend: {page['name']}", False,
                                f"Status: {response.status}")
            except Exception as e:
                log_test(f"Frontend: {page['name']}", False, str(e))

async def test_network_connectivity() -> None:
    """Test network connectivity to various hosts"""
    log_header('NETWORK CONNECTIVITY TESTS')
    
    hosts = [
        {'host': 'google.com', 'port': 443, 'name': 'Internet Connectivity'},
        {'host': CONFIG['database']['host'], 'port': CONFIG['database']['port'], 'name': 'PostgreSQL Server'},
        {'host': 'localhost', 'port': 8000, 'name': 'Backend Server'},
        {'host': 'localhost', 'port': 3001, 'name': 'Frontend Server'}
    ]
    
    for host_info in hosts:
        try:
            # Use asyncio to test TCP connection
            try:
                reader, writer = await asyncio.wait_for(
                    asyncio.open_connection(host_info['host'], host_info['port']),
                    timeout=5.0
                )
                writer.close()
                await writer.wait_closed()
                log_test(f"Network: {host_info['name']}", True,
                        f"{host_info['host']}:{host_info['port']} is reachable")
            except asyncio.TimeoutError:
                log_test(f"Network: {host_info['name']}", False,
                        f"{host_info['host']}:{host_info['port']} - Connection timeout")
            except Exception as e:
                log_test(f"Network: {host_info['name']}", False,
                        f"{host_info['host']}:{host_info['port']} - {str(e)}")
        except Exception as e:
            log_test(f"Network: {host_info['name']}", False, str(e))

def log_system_info() -> None:
    """Log system information"""
    log_header('SYSTEM INFORMATION')
    
    log(f"Python Version: {sys.version}", Colors.BLUE)
    log(f"Platform: {sys.platform}", Colors.BLUE)
    log(f"Current Directory: {sys.path[0]}", Colors.BLUE)
    
    # Check for required modules
    modules = ['psycopg2', 'aiohttp', 'asyncio']
    for module in modules:
        try:
            __import__(module)
            log(f"Module {module}: Available", Colors.GREEN)
        except ImportError:
            log(f"Module {module}: Not found", Colors.RED)

def generate_summary() -> None:
    """Generate test summary report"""
    log_header('TEST SUMMARY REPORT')
    
    total_tests = sum(category['passed'] + category['failed'] for category in test_results.values())
    total_passed = sum(category['passed'] for category in test_results.values())
    total_failed = sum(category['failed'] for category in test_results.values())
    
    log(f"Total Tests: {total_tests}", Colors.BRIGHT)
    log(f"Passed: {total_passed}", Colors.GREEN)
    log(f"Failed: {total_failed}", Colors.RED)
    log(f"Success Rate: {(total_passed / total_tests * 100):.1f}%" if total_tests > 0 else "Success Rate: 0%",
        Colors.GREEN if total_failed == 0 else Colors.YELLOW)
    
    # Category breakdown
    for category, results in test_results.items():
        category_total = results['passed'] + results['failed']
        category_rate = (results['passed'] / category_total * 100) if category_total > 0 else 0
        
        log(f"\n{category.upper()}:", Colors.CYAN)
        log(f"  Tests: {category_total}, Passed: {results['passed']}, Failed: {results['failed']}",
            Colors.GREEN if results['failed'] == 0 else Colors.YELLOW)
        log(f"  Success Rate: {category_rate:.1f}%",
            Colors.GREEN if results['failed'] == 0 else Colors.YELLOW)
    
    # Recommendations
    log_header('RECOMMENDATIONS')
    
    if test_results['database']['failed'] > 0:
        log('• Install PostgreSQL client: pip install psycopg2-binary', Colors.YELLOW)
        log('• Verify database credentials and connection', Colors.YELLOW)
        log('• Check if PostgreSQL server is running on port 5433', Colors.YELLOW)
    
    if test_results['backend']['failed'] > 0:
        log('• Start backend server: cd backend && python run.py', Colors.YELLOW)
        log('• Check FastAPI dependencies: pip install -r requirements.txt', Colors.YELLOW)
    
    if test_results['frontend']['failed'] > 0:
        log('• Start frontend server: npm run dev', Colors.YELLOW)
        log('• Install dependencies: npm install', Colors.YELLOW)
    
    if total_failed == 0:
        log('🎉 All tests passed! Your system is fully operational.', Colors.GREEN)

async def run_all_tests() -> None:
    """Run all tests"""
    log('🚀 Starting Comprehensive Server Connection Tests...', Colors.BRIGHT + Colors.CYAN)
    log(f"Timestamp: {datetime.now().isoformat()}", Colors.BLUE)
    
    try:
        log_system_info()
        await test_network_connectivity()
        await test_database_connection()
        await test_backend_api()
        await test_frontend()
        generate_summary()
    except Exception as error:
        log(f"\n❌ Test suite failed: {str(error)}", Colors.RED)
        traceback.print_exc()
        sys.exit(1)

def main() -> None:
    """Main function"""
    if len(sys.argv) > 1:
        if '--help' in sys.argv or '-h' in sys.argv:
            log('HealthData Server Connection Test - Python Version', Colors.BRIGHT + Colors.CYAN)
            log('Usage: python test-server-connection.py [options]', Colors.BLUE)
            log('Options:', Colors.BLUE)
            log('  --help, -h     Show this help message', Colors.BLUE)
            log('  --database     Test database connection only', Colors.BLUE)
            log('  --backend      Test backend API only', Colors.BLUE)
            log('  --frontend     Test frontend only', Colors.BLUE)
            log('  --network      Test network connectivity only', Colors.BLUE)
            sys.exit(0)
        
        if '--database' in sys.argv:
            asyncio.run(test_database_connection())
        elif '--backend' in sys.argv:
            asyncio.run(test_backend_api())
        elif '--frontend' in sys.argv:
            asyncio.run(test_frontend())
        elif '--network' in sys.argv:
            asyncio.run(test_network_connectivity())
        else:
            asyncio.run(run_all_tests())
    else:
        asyncio.run(run_all_tests())

if __name__ == '__main__':
    main()









