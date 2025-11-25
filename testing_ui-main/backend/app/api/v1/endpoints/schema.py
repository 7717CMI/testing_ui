from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
import logging

from app.services.schema_service import SchemaService
from app.models.schema import (
    DatabaseOverview,
    SchemaDetails,
    TableDetails,
    TableInfo,
    ApiResponse
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/overview", response_model=DatabaseOverview)
async def get_database_overview() -> DatabaseOverview:
    """
    Get overview of the entire database including all schemas.
    """
    try:
        service = SchemaService()
        return await service.get_database_overview()
    except Exception as e:
        logger.error(f"Database overview endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/schemas", response_model=ApiResponse)
async def get_all_schemas() -> ApiResponse:
    """
    Get list of all schemas in the database.
    """
    try:
        service = SchemaService()
        overview = await service.get_database_overview()
        
        return ApiResponse(
            success=True,
            message=f"Found {overview.total_schemas} schemas",
            data={
                "schemas": [schema.dict() for schema in overview.schemas],
                "total_schemas": overview.total_schemas,
                "database_name": overview.database_name
            }
        )
    except Exception as e:
        logger.error(f"Get schemas endpoint error: {e}")
        return ApiResponse(
            success=False,
            message="Failed to retrieve schemas",
            error=str(e)
        )


@router.get("/schemas/{schema_name}", response_model=SchemaDetails)
async def get_schema_details(schema_name: str) -> SchemaDetails:
    """
    Get detailed information about a specific schema including all tables.
    """
    try:
        service = SchemaService()
        return await service.get_schema_details(schema_name)
    except ValueError as e:
        logger.error(f"Schema not found: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Schema details endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/schemas/{schema_name}/tables", response_model=ApiResponse)
async def get_schema_tables(schema_name: str) -> ApiResponse:
    """
    Get all tables in a specific schema.
    """
    try:
        service = SchemaService()
        schema_details = await service.get_schema_details(schema_name)
        
        return ApiResponse(
            success=True,
            message=f"Found {schema_details.total_tables} tables in schema '{schema_name}'",
            data={
                "schema_name": schema_name,
                "tables": [table.dict() for table in schema_details.tables],
                "total_tables": schema_details.total_tables
            }
        )
    except ValueError as e:
        logger.error(f"Schema not found: {e}")
        return ApiResponse(
            success=False,
            message="Schema not found",
            error=str(e)
        )
    except Exception as e:
        logger.error(f"Get schema tables endpoint error: {e}")
        return ApiResponse(
            success=False,
            message="Failed to retrieve schema tables",
            error=str(e)
        )


@router.get("/schemas/{schema_name}/tables/{table_name}", response_model=TableDetails)
async def get_table_details(schema_name: str, table_name: str) -> TableDetails:
    """
    Get detailed information about a specific table including columns, constraints, and indexes.
    """
    try:
        service = SchemaService()
        return await service.get_table_details(table_name, schema_name)
    except ValueError as e:
        logger.error(f"Table not found: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Table details endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/schemas/{schema_name}/search", response_model=ApiResponse)
async def search_tables(
    schema_name: str,
    q: str = Query(..., description="Search term for table names")
) -> ApiResponse:
    """
    Search for tables by name within a specific schema.
    """
    try:
        service = SchemaService()
        tables = await service.search_tables(q, schema_name)
        
        return ApiResponse(
            success=True,
            message=f"Found {len(tables)} tables matching '{q}' in schema '{schema_name}'",
            data={
                "search_term": q,
                "schema_name": schema_name,
                "tables": [table.dict() for table in tables],
                "total_matches": len(tables)
            }
        )
    except Exception as e:
        logger.error(f"Search tables endpoint error: {e}")
        return ApiResponse(
            success=False,
            message="Failed to search tables",
            error=str(e)
        )


@router.get("/schemas/{schema_name}/statistics", response_model=ApiResponse)
async def get_schema_statistics(schema_name: str) -> ApiResponse:
    """
    Get statistics about tables in a schema.
    """
    try:
        service = SchemaService()
        stats = await service.get_table_statistics(schema_name)
        
        return ApiResponse(
            success=True,
            message=f"Statistics for schema '{schema_name}'",
            data=stats
        )
    except Exception as e:
        logger.error(f"Schema statistics endpoint error: {e}")
        return ApiResponse(
            success=False,
            message="Failed to get schema statistics",
            error=str(e)
        )
