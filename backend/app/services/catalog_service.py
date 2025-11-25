from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from app.core.database import engine
from sqlalchemy import text
from app.models.catalog import (
    CategoryInfo,
    FacilityTypeInfo,
    ProviderInfo,
    ProviderDetails,
    DataCatalogOverview,
    CatalogStatistics
)
from app.core.config import settings

logger = logging.getLogger(__name__)


class CatalogService:
    """Service class for handling healthcare data catalog operations."""
    
    def __init__(self):
        self.schema = settings.TARGET_SCHEMA
    
    async def get_catalog_overview(self) -> DataCatalogOverview:
        """Get overview of the healthcare data catalog."""
        try:
            with engine.connect() as connection:
                # Get total counts
                total_providers_query = text(f"""
                    SELECT COUNT(*) FROM {self.schema}.healthcare_providers WHERE is_active = true
                """)
                total_providers = connection.execute(total_providers_query).scalar()
                
                total_categories_query = text(f"""
                    SELECT COUNT(*) FROM {self.schema}.facility_categories
                """)
                total_categories = connection.execute(total_categories_query).scalar()
                
                total_types_query = text(f"""
                    SELECT COUNT(*) FROM {self.schema}.facility_types
                """)
                total_facility_types = connection.execute(total_types_query).scalar()
                
                # Get categories with counts
                categories_query = text(f"""
                    SELECT 
                        fc.id,
                        fc.name,
                        fc.display_name,
                        fc.description,
                        COUNT(DISTINCT hp.id) as provider_count,
                        COUNT(DISTINCT ft.id) as facility_types_count
                    FROM {self.schema}.facility_categories fc
                    LEFT JOIN {self.schema}.facility_types ft ON ft.category_id = fc.id
                    LEFT JOIN {self.schema}.healthcare_providers hp ON hp.facility_category_id = fc.id AND hp.is_active = true
                    GROUP BY fc.id, fc.name, fc.display_name, fc.description
                    ORDER BY fc.display_name
                """)
                
                categories_result = connection.execute(categories_query)
                categories = []
                for row in categories_result:
                    categories.append(CategoryInfo(
                        id=row[0],
                        name=row[1],
                        display_name=row[2],
                        description=row[3],
                        provider_count=row[4] or 0,
                        facility_types_count=row[5] or 0
                    ))
                
                return DataCatalogOverview(
                    total_providers=total_providers or 0,
                    total_categories=total_categories or 0,
                    total_facility_types=total_facility_types or 0,
                    categories=categories,
                    last_updated=datetime.now()
                )
        except Exception as e:
            logger.error(f"Error getting catalog overview: {e}")
            raise
    
    async def get_categories(self) -> List[CategoryInfo]:
        """Get all healthcare facility categories."""
        try:
            with engine.connect() as connection:
                query = text(f"""
                    SELECT 
                        fc.id,
                        fc.name,
                        fc.display_name,
                        fc.description,
                        COUNT(DISTINCT hp.id) as provider_count,
                        COUNT(DISTINCT ft.id) as facility_types_count
                    FROM {self.schema}.facility_categories fc
                    LEFT JOIN {self.schema}.facility_types ft ON ft.category_id = fc.id
                    LEFT JOIN {self.schema}.healthcare_providers hp ON hp.facility_category_id = fc.id AND hp.is_active = true
                    GROUP BY fc.id, fc.name, fc.display_name, fc.description
                    ORDER BY fc.display_name
                """)
                
                result = connection.execute(query)
                categories = []
                for row in result:
                    categories.append(CategoryInfo(
                        id=row[0],
                        name=row[1],
                        display_name=row[2],
                        description=row[3],
                        provider_count=row[4] or 0,
                        facility_types_count=row[5] or 0
                    ))
                
                return categories
        except Exception as e:
            logger.error(f"Error getting categories: {e}")
            raise
    
    async def get_facility_types_by_category(self, category_id: int) -> List[FacilityTypeInfo]:
        """Get all facility types within a specific category."""
        try:
            with engine.connect() as connection:
                query = text(f"""
                    SELECT 
                        ft.id,
                        ft.name,
                        ft.display_name,
                        ft.description,
                        ft.category_id,
                        fc.display_name as category_name,
                        COUNT(DISTINCT hp.id) as provider_count
                    FROM {self.schema}.facility_types ft
                    JOIN {self.schema}.facility_categories fc ON fc.id = ft.category_id
                    LEFT JOIN {self.schema}.healthcare_providers hp ON hp.facility_type_id = ft.id AND hp.is_active = true
                    WHERE ft.category_id = :category_id
                    GROUP BY ft.id, ft.name, ft.display_name, ft.description, ft.category_id, fc.display_name
                    ORDER BY ft.display_name
                """)
                
                result = connection.execute(query, {"category_id": category_id})
                facility_types = []
                for row in result:
                    facility_types.append(FacilityTypeInfo(
                        id=row[0],
                        name=row[1],
                        display_name=row[2],
                        description=row[3],
                        category_id=row[4],
                        category_name=row[5],
                        provider_count=row[6] or 0
                    ))
                
                return facility_types
        except Exception as e:
            logger.error(f"Error getting facility types by category: {e}")
            raise
    
    async def get_providers(
        self,
        category_id: Optional[int] = None,
        facility_type_id: Optional[int] = None,
        state: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[ProviderInfo]:
        """Get healthcare providers with optional filtering."""
        try:
            with engine.connect() as connection:
                where_conditions = ["hp.is_active = true"]
                params = {"limit": limit, "offset": offset}
                
                if category_id:
                    where_conditions.append("hp.facility_category_id = :category_id")
                    params["category_id"] = category_id
                
                if facility_type_id:
                    where_conditions.append("hp.facility_type_id = :facility_type_id")
                    params["facility_type_id"] = facility_type_id
                
                if state:
                    where_conditions.append("hp.business_state_id = :state")
                    params["state"] = state
                
                where_clause = " AND ".join(where_conditions)
                
                query = text(f"""
                    SELECT 
                        hp.id,
                        hp.npi_number,
                        hp.provider_name,
                        hp.provider_first_name,
                        hp.provider_last_name,
                        hp.provider_credentials,
                        hp.facility_category_id,
                        fc.display_name as facility_category_name,
                        hp.facility_type_id,
                        ft.display_name as facility_type_name,
                        hp.business_city,
                        hp.business_state_id,
                        s.name as business_state,
                        hp.business_zip_code,
                        hp.business_phone,
                        hp.business_fax,
                        hp.primary_taxonomy_code_id,
                        hp.enumeration_date,
                        hp.last_update_date,
                        hp.is_active
                    FROM {self.schema}.healthcare_providers hp
                    JOIN {self.schema}.facility_categories fc ON fc.id = hp.facility_category_id
                    JOIN {self.schema}.facility_types ft ON ft.id = hp.facility_type_id
                    LEFT JOIN {self.schema}.states s ON s.id = hp.business_state_id
                    WHERE {where_clause}
                    ORDER BY hp.provider_name
                    LIMIT :limit OFFSET :offset
                """)
                
                result = connection.execute(query, params)
                providers = []
                for row in result:
                    providers.append(ProviderInfo(
                        id=row[0],
                        npi_number=row[1],
                        provider_name=row[2],
                        provider_first_name=row[3],
                        provider_last_name=row[4],
                        provider_credentials=row[5],
                        facility_category_id=row[6],
                        facility_category_name=row[7],
                        facility_type_id=row[8],
                        facility_type_name=row[9],
                        business_city=row[10],
                        business_state_id=row[11],
                        business_state=row[12],
                        business_zip_code=row[13],
                        business_phone=row[14],
                        business_fax=row[15],
                        primary_taxonomy_code_id=row[16],
                        enumeration_date=row[17],
                        last_update_date=row[18],
                        is_active=row[19]
                    ))
                
                return providers
        except Exception as e:
            logger.error(f"Error getting providers: {e}")
            raise
    
    async def get_providers_count(
        self,
        category_id: Optional[int] = None,
        facility_type_id: Optional[int] = None,
        state: Optional[str] = None
    ) -> int:
        """Get count of providers with optional filtering."""
        try:
            with engine.connect() as connection:
                where_conditions = ["hp.is_active = true"]
                params = {}
                
                if category_id:
                    where_conditions.append("hp.facility_category_id = :category_id")
                    params["category_id"] = category_id
                
                if facility_type_id:
                    where_conditions.append("hp.facility_type_id = :facility_type_id")
                    params["facility_type_id"] = facility_type_id
                
                if state:
                    where_conditions.append("hp.business_state_id = :state")
                    params["state"] = state
                
                where_clause = " AND ".join(where_conditions)
                
                query = text(f"""
                    SELECT COUNT(*)
                    FROM {self.schema}.healthcare_providers hp
                    WHERE {where_clause}
                """)
                
                result = connection.execute(query, params)
                return result.scalar() or 0
        except Exception as e:
            logger.error(f"Error getting providers count: {e}")
            raise
    
    async def get_provider_details(self, provider_id: int) -> Optional[ProviderDetails]:
        """Get detailed information about a specific provider."""
        try:
            with engine.connect() as connection:
                query = text(f"""
                    SELECT 
                        hp.*,
                        fc.display_name as facility_category_name,
                        ft.display_name as facility_type_name,
                        s.name as business_state,
                        ms.name as mailing_state
                    FROM {self.schema}.healthcare_providers hp
                    JOIN {self.schema}.facility_categories fc ON fc.id = hp.facility_category_id
                    JOIN {self.schema}.facility_types ft ON ft.id = hp.facility_type_id
                    LEFT JOIN {self.schema}.states s ON s.id = hp.business_state_id
                    LEFT JOIN {self.schema}.states ms ON ms.id = hp.mailing_state_id
                    WHERE hp.id = :provider_id
                """)
                
                result = connection.execute(query, {"provider_id": provider_id})
                row = result.fetchone()
                
                if not row:
                    return None
                
                return ProviderDetails(
                    id=row[0],
                    npi_number=row[1],
                    entity_type_id=row[2],
                    facility_category_id=row[3],
                    facility_category_name=row[46],  # fc.display_name
                    facility_type_id=row[4],
                    facility_type_name=row[47],  # ft.display_name
                    provider_name=row[5],
                    provider_first_name=row[6],
                    provider_last_name=row[7],
                    provider_middle_name=row[8],
                    provider_credentials=row[9],
                    provider_sex=row[10],
                    is_sole_proprietor=row[11],
                    is_organization_subpart=row[12],
                    parent_organization_name=row[13],
                    ein=row[14],
                    business_address_line1=row[15],
                    business_address_line2=row[16],
                    business_city=row[17],
                    business_state_id=row[18],
                    business_state=row[48],  # s.name
                    business_zip_code=row[19],
                    mailing_address_line1=row[20],
                    mailing_address_line2=row[21],
                    mailing_city=row[22],
                    mailing_state_id=row[23],
                    mailing_state=row[49],  # ms.name
                    mailing_zip_code=row[24],
                    business_phone=row[25],
                    business_fax=row[26],
                    mailing_phone=row[27],
                    mailing_fax=row[28],
                    authorized_official_phone=row[29],
                    all_phones=row[30],
                    all_faxes=row[31],
                    primary_taxonomy_code_id=row[32],
                    primary_license_number=row[33],
                    license_state_id=row[34],
                    authorized_official_first_name=row[35],
                    authorized_official_last_name=row[36],
                    authorized_official_title=row[37],
                    enumeration_date=row[38],
                    last_update_date=row[39],
                    created_at=row[42],
                    updated_at=row[43],
                    is_active=row[44]
                )
        except Exception as e:
            logger.error(f"Error getting provider details: {e}")
            raise
    
    async def search_providers(
        self,
        query: str,
        category_id: Optional[int] = None,
        state: Optional[str] = None,
        limit: int = 20
    ) -> List[ProviderInfo]:
        """Search healthcare providers by name, location, or other criteria."""
        try:
            with engine.connect() as connection:
                where_conditions = [
                    "hp.is_active = true",
                    "(hp.provider_name ILIKE :query OR hp.business_city ILIKE :query OR hp.provider_credentials ILIKE :query)"
                ]
                params = {"query": f"%{query}%", "limit": limit}
                
                if category_id:
                    where_conditions.append("hp.facility_category_id = :category_id")
                    params["category_id"] = category_id
                
                if state:
                    where_conditions.append("hp.business_state_id = :state")
                    params["state"] = state
                
                where_clause = " AND ".join(where_conditions)
                
                search_query = text(f"""
                    SELECT 
                        hp.id,
                        hp.npi_number,
                        hp.provider_name,
                        hp.provider_first_name,
                        hp.provider_last_name,
                        hp.provider_credentials,
                        hp.facility_category_id,
                        fc.display_name as facility_category_name,
                        hp.facility_type_id,
                        ft.display_name as facility_type_name,
                        hp.business_city,
                        hp.business_state_id,
                        s.name as business_state,
                        hp.business_zip_code,
                        hp.business_phone,
                        hp.business_fax,
                        hp.primary_taxonomy_code_id,
                        hp.enumeration_date,
                        hp.last_update_date,
                        hp.is_active
                    FROM {self.schema}.healthcare_providers hp
                    JOIN {self.schema}.facility_categories fc ON fc.id = hp.facility_category_id
                    JOIN {self.schema}.facility_types ft ON ft.id = hp.facility_type_id
                    LEFT JOIN {self.schema}.states s ON s.id = hp.business_state_id
                    WHERE {where_clause}
                    ORDER BY hp.provider_name
                    LIMIT :limit
                """)
                
                result = connection.execute(search_query, params)
                providers = []
                for row in result:
                    providers.append(ProviderInfo(
                        id=row[0],
                        npi_number=row[1],
                        provider_name=row[2],
                        provider_first_name=row[3],
                        provider_last_name=row[4],
                        provider_credentials=row[5],
                        facility_category_id=row[6],
                        facility_category_name=row[7],
                        facility_type_id=row[8],
                        facility_type_name=row[9],
                        business_city=row[10],
                        business_state_id=row[11],
                        business_state=row[12],
                        business_zip_code=row[13],
                        business_phone=row[14],
                        business_fax=row[15],
                        primary_taxonomy_code_id=row[16],
                        enumeration_date=row[17],
                        last_update_date=row[18],
                        is_active=row[19]
                    ))
                
                return providers
        except Exception as e:
            logger.error(f"Error searching providers: {e}")
            raise
    
    async def get_catalog_statistics(self) -> Dict[str, Any]:
        """Get statistics about the healthcare data catalog."""
        try:
            with engine.connect() as connection:
                # Total counts
                total_providers_query = text(f"""
                    SELECT COUNT(*) FROM {self.schema}.healthcare_providers WHERE is_active = true
                """)
                total_providers = connection.execute(total_providers_query).scalar() or 0
                
                total_categories_query = text(f"""
                    SELECT COUNT(*) FROM {self.schema}.facility_categories
                """)
                total_categories = connection.execute(total_categories_query).scalar() or 0
                
                total_types_query = text(f"""
                    SELECT COUNT(*) FROM {self.schema}.facility_types
                """)
                total_facility_types = connection.execute(total_types_query).scalar() or 0
                
                # Providers by category
                category_stats_query = text(f"""
                    SELECT 
                        fc.display_name,
                        COUNT(hp.id) as provider_count
                    FROM {self.schema}.facility_categories fc
                    LEFT JOIN {self.schema}.healthcare_providers hp ON hp.facility_category_id = fc.id AND hp.is_active = true
                    GROUP BY fc.id, fc.display_name
                    ORDER BY provider_count DESC
                """)
                
                category_result = connection.execute(category_stats_query)
                providers_by_category = {}
                for row in category_result:
                    providers_by_category[row[0]] = row[1] or 0
                
                # Providers by state (top 10)
                state_stats_query = text(f"""
                    SELECT 
                        s.name,
                        COUNT(hp.id) as provider_count
                    FROM {self.schema}.states s
                    LEFT JOIN {self.schema}.healthcare_providers hp ON hp.business_state_id = s.id AND hp.is_active = true
                    WHERE s.name IS NOT NULL
                    GROUP BY s.id, s.name
                    HAVING COUNT(hp.id) > 0
                    ORDER BY provider_count DESC
                    LIMIT 10
                """)
                
                state_result = connection.execute(state_stats_query)
                providers_by_state = {}
                for row in state_result:
                    providers_by_state[row[0]] = row[1] or 0
                
                # Top facility types
                top_types_query = text(f"""
                    SELECT 
                        ft.display_name,
                        fc.display_name as category_name,
                        COUNT(hp.id) as provider_count
                    FROM {self.schema}.facility_types ft
                    JOIN {self.schema}.facility_categories fc ON fc.id = ft.category_id
                    LEFT JOIN {self.schema}.healthcare_providers hp ON hp.facility_type_id = ft.id AND hp.is_active = true
                    GROUP BY ft.id, ft.display_name, fc.display_name
                    HAVING COUNT(hp.id) > 0
                    ORDER BY provider_count DESC
                    LIMIT 10
                """)
                
                top_types_result = connection.execute(top_types_query)
                top_facility_types = []
                for row in top_types_result:
                    top_facility_types.append({
                        "facility_type": row[0],
                        "category": row[1],
                        "provider_count": row[2] or 0
                    })
                
                # Recent updates (last 30 days)
                recent_updates_query = text(f"""
                    SELECT COUNT(*)
                    FROM {self.schema}.healthcare_providers
                    WHERE updated_at >= NOW() - INTERVAL '30 days'
                """)
                recent_updates = connection.execute(recent_updates_query).scalar() or 0
                
                return {
                    "total_providers": total_providers,
                    "total_categories": total_categories,
                    "total_facility_types": total_facility_types,
                    "providers_by_category": providers_by_category,
                    "providers_by_state": providers_by_state,
                    "top_facility_types": top_facility_types,
                    "recent_updates": recent_updates,
                    "last_updated": datetime.now()
                }
        except Exception as e:
            logger.error(f"Error getting catalog statistics: {e}")
            raise
