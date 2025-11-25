from pydantic_settings import BaseSettings
from typing import Optional
from urllib.parse import quote_plus
import os


class Settings(BaseSettings):
    # Database Configuration - GCP PostgreSQL
    # All sensitive values now loaded from environment variables
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "5432"))
    DB_NAME: str = os.getenv("DB_NAME", "postgres")
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    
    # Schema Configuration
    TARGET_SCHEMA: str = os.getenv("TARGET_SCHEMA", "healthcare_production")
    
    # API Configuration
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Healthcare Data Catalog API")
    VERSION: str = os.getenv("VERSION", "1.0.0")
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]
    
    @property
    def database_url(self) -> str:
        # Properly escape password for URL
        escaped_password = quote_plus(self.DB_PASSWORD)
        return f"postgresql://{self.DB_USER}:{escaped_password}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    class Config:
        env_file = ".env"


settings = Settings()
