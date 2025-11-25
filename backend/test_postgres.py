#!/usr/bin/env python3
"""
Test PostgreSQL Connection to cloudsqladmin database
"""

import psycopg2
import sys

def test_connection():
    try:
        print("🔌 Testing PostgreSQL connection to cloudsqladmin...")
        
        # Try connecting directly to cloudsqladmin
        conn = psycopg2.connect(
            host="127.0.0.1",
            port=5433,
            database="cloudsqladmin",
            user="postgres",
            password="Platoon@1"
        )
        
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print("✅ SUCCESS: Connected to cloudsqladmin database!")
        print(f"📊 PostgreSQL Version: {version[0][:60]}...")
        
        # Check healthcare_production schema
        cursor.execute("SELECT schema_name FROM information_schema.schemata WHERE schema_name = %s", ("healthcare_production",))
        schema = cursor.fetchone()
        
        if schema:
            print("✅ SUCCESS: healthcare_production schema found!")
            
            # Get tables
            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = %s ORDER BY table_name", ("healthcare_production",))
            tables = cursor.fetchall()
            print(f"📋 Found {len(tables)} tables in healthcare_production:")
            for i, table in enumerate(tables[:10], 1):
                print(f"  {i:2d}. {table[0]}")
            if len(tables) > 10:
                print(f"  ... and {len(tables) - 10} more tables")
        else:
            print("❌ healthcare_production schema not found")
            
            # List available schemas
            cursor.execute("SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN (%s, %s, %s) ORDER BY schema_name", ("information_schema", "pg_catalog", "pg_toast"))
            schemas = cursor.fetchall()
            print(f"📋 Available schemas ({len(schemas)}):")
            for schema in schemas:
                print(f"  - {schema[0]}")
        
        cursor.close()
        conn.close()
        print("🎉 Connection test completed successfully!")
        return True
        
    except psycopg2.OperationalError as e:
        print(f"❌ Connection failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)











