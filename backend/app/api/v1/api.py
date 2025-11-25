from fastapi import APIRouter

from .endpoints import health, schema, catalog

api_router = APIRouter()

# Include health endpoints
api_router.include_router(health.router, prefix="/health", tags=["health"])

# Include schema endpoints
api_router.include_router(schema.router, prefix="/schema", tags=["schema"])

# Include catalog endpoints
api_router.include_router(catalog.router, prefix="/catalog", tags=["catalog"])
