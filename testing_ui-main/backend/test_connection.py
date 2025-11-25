#!/usr/bin/env python3
"""
Test script to verify PostgreSQL connection and data access
"""

import asyncio
from app.core.database import test_connection, get_schema_info, get_tables_in_schema
from app.core.config import settings
from app.services.catalog_service import CatalogService

async def test_database_connection():
    """Test the database connection and data access."""
    print("Testing PostgreSQL Connection...")
    print(f"Database: {settings.DB_NAME}")
    print(f"User: {settings.DB_USER}")
    print(f"Host: {settings.DB_HOST}:{settings.DB_PORT}")
    print(f"Schema: {settings.TARGET_SCHEMA}")
    print("-" * 50)
    
    # Test basic connection
    if test_connection():
        print("Database connection successful!")
    else:
        print("Database connection failed!")
        return
    
    try:
        # Test schema access
        print(f"\nTesting schema access: {settings.TARGET_SCHEMA}")
        tables = get_tables_in_schema(settings.TARGET_SCHEMA)
        print(f"Found {len(tables)} tables in schema:")
        for table in tables[:10]:  # Show first 10 tables
            print(f"  - {table['table_name']} ({table['table_type']})")
        if len(tables) > 10:
            print(f"  ... and {len(tables) - 10} more tables")
        
        # Test catalog service
        print(f"\nTesting Catalog Service...")
        service = CatalogService()
        
        # Test overview
        overview = await service.get_catalog_overview()
        print(f"Catalog Overview:")
        print(f"  - Total Providers: {overview.total_providers:,}")
        print(f"  - Total Categories: {overview.total_categories}")
        print(f"  - Total Facility Types: {overview.total_facility_types}")
        print(f"  - Categories found: {len(overview.categories)}")
        
        # Show first few categories
        print(f"\nSample Categories:")
        for category in overview.categories[:5]:
            print(f"  - {category.display_name}: {category.provider_count:,} providers, {category.facility_types_count} types")
        
        # Test facility types for first category
        if overview.categories:
            first_category = overview.categories[0]
            print(f"\nTesting facility types for: {first_category.display_name}")
            facility_types = await service.get_facility_types_by_category(first_category.id)
            print(f"  Found {len(facility_types)} facility types:")
            for ft in facility_types[:3]:
                print(f"    - {ft.display_name}: {ft.provider_count:,} providers")
        
        # Test providers
        print(f"\nTesting provider data...")
        providers = await service.get_providers(limit=5)
        print(f"  Found {len(providers)} sample providers:")
        for provider in providers[:3]:
            print(f"    - {provider.provider_name} ({provider.facility_type_name})")
            print(f"      Location: {provider.business_city}, {provider.business_state}")
        
        print(f"\nAll tests passed! Your PostgreSQL database is properly connected.")
        print(f"Data Catalog is ready to serve real healthcare data!")
        
    except Exception as e:
        print(f"Error testing database: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_database_connection())