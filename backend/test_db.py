import psycopg2

try:
    conn = psycopg2.connect(host="localhost", port=5433, database="cloudsqladmin", user="postgres", password="Platoon@1")
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    version = cursor.fetchone()
    print("✅ PostgreSQL Connection Successful!")
    print(f"📊 Version: {version[0]}")
    
    # Check healthcare_production schema
    cursor.execute("SELECT schema_name FROM information_schema.schemata WHERE schema_name = %s", ("healthcare_production",))
    schema = cursor.fetchone()
    if schema:
        print("✅ healthcare_production schema found!")
        
        # Get tables
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = %s ORDER BY table_name", ("healthcare_production",))
        tables = cursor.fetchall()
        print(f"📋 Found {len(tables)} tables:")
        for table in tables[:5]:
            print(f"  - {table[0]}")
        if len(tables) > 5:
            print(f"  ... and {len(tables) - 5} more tables")
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
    print("🎉 Connection test completed!")
except Exception as e:
    print(f"❌ Connection failed: {e}")











