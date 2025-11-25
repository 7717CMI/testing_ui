from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class CategoryInfo(BaseModel):
    id: int
    name: str
    display_name: str
    description: Optional[str] = None
    provider_count: int
    facility_types_count: int


class FacilityTypeInfo(BaseModel):
    id: int
    name: str
    display_name: str
    description: Optional[str] = None
    category_id: int
    category_name: str
    provider_count: int


class ProviderInfo(BaseModel):
    id: int
    npi_number: Optional[str] = None
    provider_name: str
    provider_first_name: Optional[str] = None
    provider_last_name: Optional[str] = None
    provider_credentials: Optional[str] = None
    facility_category_id: int
    facility_category_name: str
    facility_type_id: int
    facility_type_name: str
    business_city: Optional[str] = None
    business_state_id: Optional[int] = None
    business_state: Optional[str] = None
    business_zip_code: Optional[str] = None
    business_phone: Optional[str] = None
    business_fax: Optional[str] = None
    primary_taxonomy_code_id: Optional[int] = None
    enumeration_date: Optional[datetime] = None
    last_update_date: Optional[datetime] = None
    is_active: bool


class ProviderDetails(BaseModel):
    id: int
    npi_number: Optional[str] = None
    entity_type_id: Optional[int] = None
    facility_category_id: int
    facility_category_name: str
    facility_type_id: int
    facility_type_name: str
    provider_name: str
    provider_first_name: Optional[str] = None
    provider_last_name: Optional[str] = None
    provider_middle_name: Optional[str] = None
    provider_credentials: Optional[str] = None
    provider_sex: Optional[str] = None
    is_sole_proprietor: Optional[bool] = None
    is_organization_subpart: Optional[bool] = None
    parent_organization_name: Optional[str] = None
    ein: Optional[str] = None
    business_address_line1: Optional[str] = None
    business_address_line2: Optional[str] = None
    business_city: Optional[str] = None
    business_state_id: Optional[int] = None
    business_state: Optional[str] = None
    business_zip_code: Optional[str] = None
    mailing_address_line1: Optional[str] = None
    mailing_address_line2: Optional[str] = None
    mailing_city: Optional[str] = None
    mailing_state_id: Optional[int] = None
    mailing_state: Optional[str] = None
    mailing_zip_code: Optional[str] = None
    business_phone: Optional[str] = None
    business_fax: Optional[str] = None
    mailing_phone: Optional[str] = None
    mailing_fax: Optional[str] = None
    authorized_official_phone: Optional[str] = None
    all_phones: Optional[str] = None
    all_faxes: Optional[str] = None
    primary_taxonomy_code_id: Optional[int] = None
    primary_license_number: Optional[str] = None
    license_state_id: Optional[int] = None
    authorized_official_first_name: Optional[str] = None
    authorized_official_last_name: Optional[str] = None
    authorized_official_title: Optional[str] = None
    enumeration_date: Optional[datetime] = None
    last_update_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    is_active: bool


class DataCatalogOverview(BaseModel):
    total_providers: int
    total_categories: int
    total_facility_types: int
    categories: List[CategoryInfo]
    last_updated: datetime


class CatalogResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class CatalogStatistics(BaseModel):
    total_providers: int
    total_categories: int
    total_facility_types: int
    providers_by_category: Dict[str, int]
    providers_by_state: Dict[str, int]
    top_facility_types: List[Dict[str, Any]]
    recent_updates: int
    last_updated: datetime











