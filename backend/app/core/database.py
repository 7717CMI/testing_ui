from sqlalchemy import create_engine, text, MetaData, inspect
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from typing import Generator, Dict, List, Any
import logging

from .config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create engine - connect to postgres database where healthcare_production schema exists
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False  # Set to True for SQL debugging
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models (we won't use this for table creation, just for type hints)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency to get database session.
    This function provides a database session that will be automatically closed.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def test_connection() -> bool:
    """
    Test database connection.
    Returns True if connection is successful, False otherwise.
    """
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            result.fetchone()
            logger.info("Database connection successful")
            return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False


def get_schema_info(schema_name: str = None) -> Dict[str, Any]:
    """
    Get information about database schemas in cloudsqladmin database.
    If schema_name is provided, returns detailed info about that schema.
    Otherwise, returns list of all schemas.
    """
    try:
        with engine.connect() as connection:
            if schema_name:
                # Get detailed info about specific schema in cloudsqladmin database
                query = text("""
                    SELECT 
                        schema_name,
                        schema_owner
                    FROM cloudsqladmin.information_schema.schemata 
                    WHERE schema_name = :schema_name
                """)
                result = connection.execute(query, {"schema_name": schema_name})
                schema_info = result.fetchone()
                
                if schema_info:
                    return {
                        "schema_name": schema_info[0],
                        "schema_owner": schema_info[1],
                        "exists": True
                    }
                else:
                    return {"exists": False, "schema_name": schema_name}
            else:
                # Get list of all schemas in cloudsqladmin database
                query = text("""
                    SELECT 
                        schema_name,
                        schema_owner
                    FROM cloudsqladmin.information_schema.schemata 
                    WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
                    ORDER BY schema_name
                """)
                result = connection.execute(query)
                schemas = []
                for row in result:
                    schemas.append({
                        "schema_name": row[0],
                        "schema_owner": row[1]
                    })
                return {"schemas": schemas}
    except Exception as e:
        logger.error(f"Error getting schema info: {e}")
        raise


def get_tables_in_schema(schema_name: str) -> List[Dict[str, Any]]:
    """
    Get all tables in a specific schema.
    """
    try:
        with engine.connect() as connection:
            query = text("""
                SELECT 
                    table_name,
                    table_type,
                    table_schema
                FROM information_schema.tables 
                WHERE table_schema = :schema_name
                ORDER BY table_name
            """)
            result = connection.execute(query, {"schema_name": schema_name})
            tables = []
            for row in result:
                tables.append({
                    "table_name": row[0],
                    "table_type": row[1],
                    "table_schema": row[2]
                })
            return tables
    except Exception as e:
        logger.error(f"Error getting tables in schema {schema_name}: {e}")
        raise


def get_table_columns(schema_name: str, table_name: str) -> List[Dict[str, Any]]:
    """
    Get all columns for a specific table.
    """
    try:
        with engine.connect() as connection:
            query = text("""
                SELECT 
                    column_name,
                    data_type,
                    is_nullable,
                    column_default,
                    character_maximum_length,
                    numeric_precision,
                    numeric_scale,
                    ordinal_position
                FROM information_schema.columns 
                WHERE table_schema = :schema_name AND table_name = :table_name
                ORDER BY ordinal_position
            """)
            result = connection.execute(query, {
                "schema_name": schema_name,
                "table_name": table_name
            })
            columns = []
            for row in result:
                columns.append({
                    "column_name": row[0],
                    "data_type": row[1],
                    "is_nullable": row[2] == "YES",
                    "column_default": row[3],
                    "character_maximum_length": row[4],
                    "numeric_precision": row[5],
                    "numeric_scale": row[6],
                    "ordinal_position": row[7]
                })
            return columns
    except Exception as e:
        logger.error(f"Error getting columns for table {schema_name}.{table_name}: {e}")
        raise


def get_table_constraints(schema_name: str, table_name: str) -> List[Dict[str, Any]]:
    """
    Get all constraints for a specific table.
    """
    try:
        with engine.connect() as connection:
            query = text("""
                SELECT 
                    constraint_name,
                    constraint_type,
                    column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.constraint_column_usage ccu 
                    ON tc.constraint_name = ccu.constraint_name
                WHERE tc.table_schema = :schema_name AND tc.table_name = :table_name
                ORDER BY constraint_name, column_name
            """)
            result = connection.execute(query, {
                "schema_name": schema_name,
                "table_name": table_name
            })
            constraints = []
            for row in result:
                constraints.append({
                    "constraint_name": row[0],
                    "constraint_type": row[1],
                    "column_name": row[2]
                })
            return constraints
    except Exception as e:
        logger.error(f"Error getting constraints for table {schema_name}.{table_name}: {e}")
        raise


def get_table_indexes(schema_name: str, table_name: str) -> List[Dict[str, Any]]:
    """
    Get all indexes for a specific table.
    """
    try:
        with engine.connect() as connection:
            query = text("""
                SELECT 
                    indexname,
                    indexdef
                FROM pg_indexes 
                WHERE schemaname = :schema_name AND tablename = :table_name
                ORDER BY indexname
            """)
            result = connection.execute(query, {
                "schema_name": schema_name,
                "table_name": table_name
            })
            indexes = []
            for row in result:
                indexes.append({
                    "index_name": row[0],
                    "index_definition": row[1]
                })
            return indexes
    except Exception as e:
        logger.error(f"Error getting indexes for table {schema_name}.{table_name}: {e}")
        raise


def get_table_row_count(schema_name: str, table_name: str) -> int:
    """
    Get the approximate row count for a table.
    """
    try:
        with engine.connect() as connection:
            query = text(f'SELECT COUNT(*) FROM "{schema_name}"."{table_name}"')
            result = connection.execute(query)
            return result.scalar()
    except Exception as e:
        logger.error(f"Error getting row count for table {schema_name}.{table_name}: {e}")
        return 0
