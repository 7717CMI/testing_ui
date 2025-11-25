from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
import logging

from app.services.catalog_service import CatalogService
from app.models.catalog import (
    DataCatalogOverview,
    CategoryInfo,
    FacilityTypeInfo,
    ProviderInfo,
    CatalogResponse
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/overview", response_model=DataCatalogOverview)
async def get_catalog_overview() -> DataCatalogOverview:
    """
    Get overview of the healthcare data catalog with categories and counts.
    """
    try:
        service = CatalogService()
        return await service.get_catalog_overview()
    except Exception as e:
        logger.error(f"Catalog overview endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories", response_model=CatalogResponse)
async def get_categories() -> CatalogResponse:
    """
    Get all healthcare facility categories (Hospitals, Clinics, etc.).
    """
    try:
        service = CatalogService()
        categories = await service.get_categories()
        
        return CatalogResponse(
            success=True,
            message=f"Found {len(categories)} healthcare categories",
            data={
                "categories": [category.dict() for category in categories],
                "total_categories": len(categories)
            }
        )
    except Exception as e:
        logger.error(f"Get categories endpoint error: {e}")
        return CatalogResponse(
            success=False,
            message="Failed to retrieve categories",
            error=str(e)
        )


@router.get("/categories/{category_id}/types", response_model=CatalogResponse)
async def get_facility_types_by_category(category_id: int) -> CatalogResponse:
    """
    Get all facility types within a specific category.
    """
    try:
        service = CatalogService()
        facility_types = await service.get_facility_types_by_category(category_id)
        
        return CatalogResponse(
            success=True,
            message=f"Found {len(facility_types)} facility types in category {category_id}",
            data={
                "category_id": category_id,
                "facility_types": [ftype.dict() for ftype in facility_types],
                "total_types": len(facility_types)
            }
        )
    except Exception as e:
        logger.error(f"Get facility types endpoint error: {e}")
        return CatalogResponse(
            success=False,
            message="Failed to retrieve facility types",
            error=str(e)
        )


@router.get("/providers", response_model=CatalogResponse)
async def get_providers(
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    facility_type_id: Optional[int] = Query(None, description="Filter by facility type ID"),
    state: Optional[str] = Query(None, description="Filter by state"),
    limit: int = Query(50, description="Number of results to return"),
    offset: int = Query(0, description="Number of results to skip")
) -> CatalogResponse:
    """
    Get healthcare providers with optional filtering.
    """
    try:
        service = CatalogService()
        providers = await service.get_providers(
            category_id=category_id,
            facility_type_id=facility_type_id,
            state=state,
            limit=limit,
            offset=offset
        )
        
        total_count = await service.get_providers_count(
            category_id=category_id,
            facility_type_id=facility_type_id,
            state=state
        )
        
        return CatalogResponse(
            success=True,
            message=f"Found {len(providers)} providers",
            data={
                "providers": [provider.dict() for provider in providers],
                "total_count": total_count,
                "limit": limit,
                "offset": offset,
                "filters": {
                    "category_id": category_id,
                    "facility_type_id": facility_type_id,
                    "state": state
                }
            }
        )
    except Exception as e:
        logger.error(f"Get providers endpoint error: {e}")
        return CatalogResponse(
            success=False,
            message="Failed to retrieve providers",
            error=str(e)
        )


@router.get("/providers/{provider_id}", response_model=CatalogResponse)
async def get_provider_details(provider_id: int) -> CatalogResponse:
    """
    Get detailed information about a specific provider.
    """
    try:
        service = CatalogService()
        provider = await service.get_provider_details(provider_id)
        
        if not provider:
            return CatalogResponse(
                success=False,
                message="Provider not found",
                error="Provider with the specified ID does not exist"
            )
        
        return CatalogResponse(
            success=True,
            message="Provider details retrieved successfully",
            data={"provider": provider.dict()}
        )
    except Exception as e:
        logger.error(f"Get provider details endpoint error: {e}")
        return CatalogResponse(
            success=False,
            message="Failed to retrieve provider details",
            error=str(e)
        )


@router.get("/search", response_model=CatalogResponse)
async def search_providers(
    q: str = Query(..., description="Search query"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    state: Optional[str] = Query(None, description="Filter by state"),
    limit: int = Query(20, description="Number of results to return")
) -> CatalogResponse:
    """
    Search healthcare providers by name, location, or other criteria.
    """
    try:
        service = CatalogService()
        providers = await service.search_providers(
            query=q,
            category_id=category_id,
            state=state,
            limit=limit
        )
        
        return CatalogResponse(
            success=True,
            message=f"Found {len(providers)} providers matching '{q}'",
            data={
                "query": q,
                "providers": [provider.dict() for provider in providers],
                "total_results": len(providers),
                "filters": {
                    "category_id": category_id,
                    "state": state
                }
            }
        )
    except Exception as e:
        logger.error(f"Search providers endpoint error: {e}")
        return CatalogResponse(
            success=False,
            message="Failed to search providers",
            error=str(e)
        )


@router.get("/statistics", response_model=CatalogResponse)
async def get_catalog_statistics() -> CatalogResponse:
    """
    Get statistics about the healthcare data catalog.
    """
    try:
        service = CatalogService()
        stats = await service.get_catalog_statistics()
        
        return CatalogResponse(
            success=True,
            message="Catalog statistics retrieved successfully",
            data=stats
        )
    except Exception as e:
        logger.error(f"Get catalog statistics endpoint error: {e}")
        return CatalogResponse(
            success=False,
            message="Failed to retrieve catalog statistics",
            error=str(e)
        )


@router.get("/categories/{category_slug}", response_model=CatalogResponse)
async def get_category_by_slug(category_slug: str) -> CatalogResponse:
    """
    Get a specific category by its slug.
    """
    try:
        service = CatalogService()
        categories = await service.get_categories()
        
        # Find category by slug (convert display_name to slug format)
        def name_to_slug(name: str) -> str:
            return name.lower().replace(' ', '-').replace('(', '').replace(')', '').replace('&', '').replace('/', '-')
        
        category = next((cat for cat in categories if name_to_slug(cat.display_name) == category_slug), None)
        
        if not category:
            return CatalogResponse(
                success=False,
                message="Category not found",
                error=f"Category with slug '{category_slug}' does not exist"
            )
        
        return CatalogResponse(
            success=True,
            message="Category retrieved successfully",
            data={"category": category.dict()}
        )
    except Exception as e:
        logger.error(f"Get category by slug endpoint error: {e}")
        return CatalogResponse(
            success=False,
            message="Failed to retrieve category",
            error=str(e)
        )


@router.get("/categories/{category_slug}/types/{type_slug}", response_model=CatalogResponse)
async def get_facility_type_by_slug(category_slug: str, type_slug: str) -> CatalogResponse:
    """
    Get a specific facility type by its slug within a category.
    """
    try:
        service = CatalogService()
        categories = await service.get_categories()
        
        # Find category by slug
        def name_to_slug(name: str) -> str:
            return name.lower().replace(' ', '-').replace('(', '').replace(')', '').replace('&', '').replace('/', '-')
        
        category = next((cat for cat in categories if name_to_slug(cat.display_name) == category_slug), None)
        
        if not category:
            return CatalogResponse(
                success=False,
                message="Category not found",
                error=f"Category with slug '{category_slug}' does not exist"
            )
        
        # Get facility types for this category
        facility_types = await service.get_facility_types_by_category(category.id)
        
        # Find facility type by slug
        facility_type = next((ft for ft in facility_types if name_to_slug(ft.display_name) == type_slug), None)
        
        if not facility_type:
            return CatalogResponse(
                success=False,
                message="Facility type not found",
                error=f"Facility type with slug '{type_slug}' does not exist in category '{category_slug}'"
            )
        
        return CatalogResponse(
            success=True,
            message="Facility type retrieved successfully",
            data={"facility_type": facility_type.dict()}
        )
    except Exception as e:
        logger.error(f"Get facility type by slug endpoint error: {e}")
        return CatalogResponse(
            success=False,
            message="Failed to retrieve facility type",
            error=str(e)
        )
