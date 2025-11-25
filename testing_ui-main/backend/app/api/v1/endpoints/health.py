from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging

from app.services.schema_service import SchemaService
from app.models.schema import HealthCheck, ApiResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health", response_model=HealthCheck)
async def health_check() -> HealthCheck:
    """
    Health check endpoint to verify database connection.
    """
    try:
        service = SchemaService()
        return await service.get_health_check()
    except Exception as e:
        logger.error(f"Health check endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status", response_model=ApiResponse)
async def get_status() -> ApiResponse:
    """
    Get API status information.
    """
    try:
        service = SchemaService()
        health = await service.get_health_check()
        
        return ApiResponse(
            success=True,
            message="API is running",
            data={
                "status": health.status,
                "database_connected": health.database_connected,
                "timestamp": health.timestamp.isoformat()
            }
        )
    except Exception as e:
        logger.error(f"Status endpoint error: {e}")
        return ApiResponse(
            success=False,
            message="API status check failed",
            error=str(e)
        )
