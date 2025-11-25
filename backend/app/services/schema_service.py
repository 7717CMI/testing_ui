from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from app.core.database import (
    get_schema_info,
    get_tables_in_schema,
    get_table_columns,
    get_table_constraints,
    get_table_indexes,
    get_table_row_count,
    test_connection
)
from app.models.schema import (
    SchemaInfo,
    TableInfo,
    TableDetails,
    SchemaDetails,
    DatabaseOverview,
    HealthCheck,
    ColumnInfo,
    ConstraintInfo,
    IndexInfo
)
from app.core.config import settings

logger = logging.getLogger(__name__)


class SchemaService:
    """Service class for handling schema metadata operations."""
    
    def __init__(self):
        self.target_schema = settings.TARGET_SCHEMA
    
    async def get_health_check(self) -> HealthCheck:
        """Get health check status of the database connection."""
        try:
            is_connected = test_connection()
            return HealthCheck(
                status="healthy" if is_connected else "unhealthy",
                database_connected=is_connected,
                message="Database connection successful" if is_connected else "Database connection failed",
                timestamp=datetime.now()
            )
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return HealthCheck(
                status="unhealthy",
                database_connected=False,
                message=f"Health check failed: {str(e)}",
                timestamp=datetime.now()
            )
    
    async def get_database_overview(self) -> DatabaseOverview:
        """Get overview of the entire database."""
        try:
            # Get all schemas
            schemas_data = get_schema_info()
            schemas = [
                SchemaInfo(
                    schema_name=schema["schema_name"],
                    schema_owner=schema["schema_owner"]
                )
                for schema in schemas_data["schemas"]
            ]
            
            return DatabaseOverview(
                database_name=settings.DB_NAME,
                schemas=schemas,
                total_schemas=len(schemas),
                connection_status="connected",
                last_updated=datetime.now()
            )
        except Exception as e:
            logger.error(f"Error getting database overview: {e}")
            raise
    
    async def get_schema_details(self, schema_name: Optional[str] = None) -> SchemaDetails:
        """Get detailed information about a specific schema."""
        try:
            target_schema = schema_name or self.target_schema
            
            # Get schema info
            schema_data = get_schema_info(target_schema)
            if not schema_data.get("exists", False):
                raise ValueError(f"Schema '{target_schema}' does not exist")
            
            schema_info = SchemaInfo(
                schema_name=schema_data["schema_name"],
                schema_owner=schema_data["schema_owner"]
            )
            
            # Get tables in schema
            tables_data = get_tables_in_schema(target_schema)
            tables = []
            
            for table_data in tables_data:
                # Get row count for each table
                row_count = get_table_row_count(target_schema, table_data["table_name"])
                
                table_info = TableInfo(
                    table_name=table_data["table_name"],
                    table_type=table_data["table_type"],
                    table_schema=table_data["table_schema"],
                    row_count=row_count
                )
                tables.append(table_info)
            
            return SchemaDetails(
                schema_info=schema_info,
                tables=tables,
                total_tables=len(tables)
            )
        except Exception as e:
            logger.error(f"Error getting schema details for {schema_name}: {e}")
            raise
    
    async def get_table_details(self, table_name: str, schema_name: Optional[str] = None) -> TableDetails:
        """Get detailed information about a specific table."""
        try:
            target_schema = schema_name or self.target_schema
            
            # Get table info
            tables_data = get_tables_in_schema(target_schema)
            table_data = next(
                (t for t in tables_data if t["table_name"] == table_name),
                None
            )
            
            if not table_data:
                raise ValueError(f"Table '{table_name}' does not exist in schema '{target_schema}'")
            
            # Get row count
            row_count = get_table_row_count(target_schema, table_name)
            
            table_info = TableInfo(
                table_name=table_data["table_name"],
                table_type=table_data["table_type"],
                table_schema=table_data["table_schema"],
                row_count=row_count
            )
            
            # Get columns
            columns_data = get_table_columns(target_schema, table_name)
            columns = [
                ColumnInfo(
                    column_name=col["column_name"],
                    data_type=col["data_type"],
                    is_nullable=col["is_nullable"],
                    column_default=col["column_default"],
                    character_maximum_length=col["character_maximum_length"],
                    numeric_precision=col["numeric_precision"],
                    numeric_scale=col["numeric_scale"],
                    ordinal_position=col["ordinal_position"]
                )
                for col in columns_data
            ]
            
            # Get constraints
            constraints_data = get_table_constraints(target_schema, table_name)
            constraints = [
                ConstraintInfo(
                    constraint_name=constraint["constraint_name"],
                    constraint_type=constraint["constraint_type"],
                    column_name=constraint["column_name"]
                )
                for constraint in constraints_data
            ]
            
            # Get indexes
            indexes_data = get_table_indexes(target_schema, table_name)
            indexes = [
                IndexInfo(
                    index_name=index["index_name"],
                    index_definition=index["index_definition"]
                )
                for index in indexes_data
            ]
            
            return TableDetails(
                table_info=table_info,
                columns=columns,
                constraints=constraints,
                indexes=indexes,
                row_count=row_count
            )
        except Exception as e:
            logger.error(f"Error getting table details for {target_schema}.{table_name}: {e}")
            raise
    
    async def search_tables(self, search_term: str, schema_name: Optional[str] = None) -> List[TableInfo]:
        """Search for tables by name."""
        try:
            target_schema = schema_name or self.target_schema
            tables_data = get_tables_in_schema(target_schema)
            
            # Filter tables by search term
            filtered_tables = [
                table for table in tables_data
                if search_term.lower() in table["table_name"].lower()
            ]
            
            tables = []
            for table_data in filtered_tables:
                row_count = get_table_row_count(target_schema, table_data["table_name"])
                table_info = TableInfo(
                    table_name=table_data["table_name"],
                    table_type=table_data["table_type"],
                    table_schema=table_data["table_schema"],
                    row_count=row_count
                )
                tables.append(table_info)
            
            return tables
        except Exception as e:
            logger.error(f"Error searching tables: {e}")
            raise
    
    async def get_table_statistics(self, schema_name: Optional[str] = None) -> Dict[str, Any]:
        """Get statistics about tables in a schema."""
        try:
            target_schema = schema_name or self.target_schema
            tables_data = get_tables_in_schema(target_schema)
            
            total_tables = len(tables_data)
            total_rows = 0
            table_types = {}
            
            for table_data in tables_data:
                row_count = get_table_row_count(target_schema, table_data["table_name"])
                total_rows += row_count
                
                table_type = table_data["table_type"]
                if table_type not in table_types:
                    table_types[table_type] = 0
                table_types[table_type] += 1
            
            return {
                "schema_name": target_schema,
                "total_tables": total_tables,
                "total_rows": total_rows,
                "table_types": table_types,
                "average_rows_per_table": total_rows / total_tables if total_tables > 0 else 0
            }
        except Exception as e:
            logger.error(f"Error getting table statistics: {e}")
            raise
