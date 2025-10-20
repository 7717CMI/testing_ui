#!/usr/bin/env python3
"""
Analyze Healthcare Production Schema Data Structure
"""

import psycopg2

def analyze_healthcare_data():
    try:
        conn = psycopg2.connect(host='127.0.0.1', port=5433, database='postgres', user='postgres', password='Platoon@1')
        cursor = conn.cursor()
        
        print("=== Healthcare Production Schema Analysis ===")
        print()
        
        # Get all tables in healthcare_production schema
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = %s ORDER BY table_name", ('healthcare_production',))
        tables = cursor.fetchall()
        
        print("📋 ALL TABLES IN HEALTHCARE_PRODUCTION SCHEMA:")
        for i, table in enumerate(tables, 1):
            print(f"   {i:2d}. {table[0]}")
        print()
        
        # Analyze key tables to understand data structure
        key_tables = ['healthcare_providers', 'facility_types', 'facility_categories', 'entity_types']
        
        for table_name in key_tables:
            if any(table[0] == table_name for table in tables):
                print(f"📊 ANALYZING TABLE: {table_name}")
                print("-" * 50)
                
                # Get column information
                cursor.execute("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = %s AND table_name = %s ORDER BY ordinal_position", ('healthcare_production', table_name))
                columns = cursor.fetchall()
                
                print("Columns:")
                for col in columns:
                    nullable = "NULL" if col[2] == "YES" else "NOT NULL"
                    print(f"   - {col[0]} ({col[1]}) {nullable}")
                
                # Get sample data (first 3 rows)
                try:
                    cursor.execute(f"SELECT * FROM healthcare_production.{table_name} LIMIT 3")
                    sample_data = cursor.fetchall()
                    if sample_data:
                        print(f"Sample data ({len(sample_data)} rows):")
                        for i, row in enumerate(sample_data, 1):
                            print(f"   Row {i}: {row}")
                    else:
                        print("No data found")
                except Exception as e:
                    print(f"Error getting sample data: {e}")
                
                # Get row count
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM healthcare_production.{table_name}")
                    count = cursor.fetchone()[0]
                    print(f"Total rows: {count}")
                except Exception as e:
                    print(f"Error getting row count: {e}")
                
                print()
            else:
                print(f"❌ Table {table_name} not found")
        
        # Analyze facility types and categories for data catalog structure
        print("🏥 FACILITY TYPES AND CATEGORIES ANALYSIS:")
        print("-" * 50)
        
        # Check facility_types table
        try:
            cursor.execute("SELECT DISTINCT facility_type FROM healthcare_production.facility_types ORDER BY facility_type")
            facility_types = cursor.fetchall()
            if facility_types:
                print("Available Facility Types:")
                for i, ftype in enumerate(facility_types, 1):
                    print(f"   {i}. {ftype[0]}")
            else:
                print("No facility types found")
        except Exception as e:
            print(f"Error getting facility types: {e}")
        
        print()
        
        # Check facility_categories table
        try:
            cursor.execute("SELECT DISTINCT category FROM healthcare_production.facility_categories ORDER BY category")
            categories = cursor.fetchall()
            if categories:
                print("Available Categories:")
                for i, cat in enumerate(categories, 1):
                    print(f"   {i}. {cat[0]}")
            else:
                print("No categories found")
        except Exception as e:
            print(f"Error getting categories: {e}")
        
        print()
        
        # Check healthcare_providers table structure
        try:
            cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_schema = %s AND table_name = %s ORDER BY ordinal_position", ('healthcare_production', 'healthcare_providers'))
            provider_columns = cursor.fetchall()
            print("Healthcare Providers Table Columns:")
            for i, col in enumerate(provider_columns, 1):
                print(f"   {i:2d}. {col[0]}")
        except Exception as e:
            print(f"Error getting provider columns: {e}")
        
        cursor.close()
        conn.close()
        
        print()
        print("=== ANALYSIS COMPLETE ===")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    analyze_healthcare_data()











