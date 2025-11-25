from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class SchemaInfo(BaseModel):
    schema_name: str
    schema_owner: str
    exists: bool = True


class TableInfo(BaseModel):
    table_name: str
    table_type: str
    table_schema: str
    row_count: Optional[int] = None


class ColumnInfo(BaseModel):
    column_name: str
    data_type: str
    is_nullable: bool
    column_default: Optional[str] = None
    character_maximum_length: Optional[int] = None
    numeric_precision: Optional[int] = None
    numeric_scale: Optional[int] = None
    ordinal_position: int


class ConstraintInfo(BaseModel):
    constraint_name: str
    constraint_type: str
    column_name: str


class IndexInfo(BaseModel):
    index_name: str
    index_definition: str


class TableDetails(BaseModel):
    table_info: TableInfo
    columns: List[ColumnInfo]
    constraints: List[ConstraintInfo]
    indexes: List[IndexInfo]
    row_count: int


class SchemaDetails(BaseModel):
    schema_info: SchemaInfo
    tables: List[TableInfo]
    total_tables: int


class DatabaseOverview(BaseModel):
    database_name: str
    schemas: List[SchemaInfo]
    total_schemas: int
    connection_status: str
    last_updated: datetime


class HealthCheck(BaseModel):
    status: str
    database_connected: bool
    message: str
    timestamp: datetime


class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None











