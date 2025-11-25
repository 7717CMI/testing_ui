#!/usr/bin/env python3
"""
Check PostgreSQL Database Structure
"""

import psycopg2

def check_database_structure():
    try:
        # Connect to postgres database
        conn = psycopg2.connect(host='127.0.0.1', port=5433, database='postgres', user='postgres', password='Platoon@1')
        cursor = conn.cursor()
        
        print("=== PostgreSQL Database Structure Analysis ===")
        print()
        
        # 1. List all databases
        print("1. ALL DATABASES:")
        cursor.execute("SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname")
        databases = cursor.fetchall()
        for i, db in enumerate(databases, 1):
            print(f"   {i}. {db[0]}")
        print()
        
        # 2. List all schemas in postgres database
        print("2. SCHEMAS IN POSTGRES DATABASE:")
        cursor.execute("SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN (%s, %s, %s) ORDER BY schema_name", ('information_schema', 'pg_catalog', 'pg_toast'))
        schemas = cursor.fetchall()
        for i, schema in enumerate(schemas, 1):
            print(f"   {i}. {schema[0]}")
        print()
        
        # 3. Check tables in public schema of postgres
        print("3. TABLES IN POSTGRES.PUBLIC SCHEMA:")
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = %s ORDER BY table_name", ('public',))
        tables = cursor.fetchall()
        if tables:
            for i, table in enumerate(tables, 1):
                print(f"   {i}. {table[0]}")
        else:
            print("   No tables found in public schema")
        print()
        
        # 4. Check for healthcare_production schema in postgres
        print("4. CHECKING FOR HEALTHCARE_PRODUCTION SCHEMA:")
        cursor.execute("SELECT schema_name FROM information_schema.schemata WHERE schema_name = %s", ('healthcare_production',))
        healthcare_schema = cursor.fetchone()
        if healthcare_schema:
            print("   ✅ healthcare_production schema found in postgres database!")
            
            # Get tables in healthcare_production schema
            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = %s ORDER BY table_name", ('healthcare_production',))
            healthcare_tables = cursor.fetchall()
            print(f"   📋 Found {len(healthcare_tables)} tables:")
            for i, table in enumerate(healthcare_tables[:10], 1):
                print(f"      {i}. {table[0]}")
            if len(healthcare_tables) > 10:
                print(f"      ... and {len(healthcare_tables) - 10} more tables")
        else:
            print("   ❌ healthcare_production schema not found in postgres database")
        print()
        
        # 5. Check PostgreSQL version and configuration
        print("5. POSTGRESQL INFORMATION:")
        cursor.execute("SELECT version()")
        version = cursor.fetchone()
        print(f"   Version: {version[0]}")
        
        try:
            cursor.execute("SHOW hba_file")
            hba_file = cursor.fetchone()
            print(f"   pg_hba.conf location: {hba_file[0]}")
        except:
            print("   pg_hba.conf location: Not accessible")
        
        cursor.close()
        conn.close()
        
        print()
        print("=== ANALYSIS COMPLETE ===")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_database_structure()











