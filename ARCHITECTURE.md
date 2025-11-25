# Healthcare Intelligence Platform - Complete Architecture Documentation

## 📋 Executive Summary

This document provides a comprehensive analysis of the Healthcare Intelligence Platform, a full-stack Data-as-a-Service (DaaS) application that provides access to U.S. healthcare provider data. The platform combines a Next.js 15 frontend with a FastAPI backend, connecting to PostgreSQL and optionally Neo4j databases.

---

## 🎯 What Does This Project Do?

### Core Purpose
The Healthcare Intelligence Platform is a **healthcare data intelligence system** that:

1. **Provides Access to 6.5M+ Healthcare Records**: Browse and search healthcare providers across 12+ facility categories
2. **Enables Data Discovery**: Navigate hierarchical healthcare data (Categories → Facility Types → Individual Providers)
3. **Offers Advanced Search**: Filter and search providers by location, type, ownership, and other attributes
4. **Visualizes Relationships**: Display entity relationships using graph visualization (Neo4j integration)
5. **Delivers Insights**: Curated healthcare industry insights and trends
6. **Manages User Workflow**: Save searches, create alerts, and track notifications

### Primary Use Cases

1. **Healthcare Market Research**: Analyze healthcare facility distribution and characteristics
2. **Competitive Intelligence**: Track healthcare providers and market trends
3. **Sales Intelligence**: Identify target healthcare organizations
4. **Healthcare Analytics**: Understand patterns in healthcare provider data
5. **Due Diligence**: Access verified healthcare provider information

---

## 🏗️ System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Next.js 15 Frontend (Port 3001)                 │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│  │  │   Pages  │  │Components│  │  Stores  │  │   API    │   │   │
│  │  │  (RSC)   │  │   (UI)   │  │ (Zustand)│  │  Routes  │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │   │
│  │       │             │              │             │          │   │
│  │       └─────────────┴──────────────┴─────────────┘          │   │
│  │                          │                                   │   │
│  └──────────────────────────┼───────────────────────────────────┘   │
└─────────────────────────────┼────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   HTTP/REST       │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────┼────────────────────────────────────────┐
│                         API LAYER                                     │
│  ┌──────────────────────────┴────────────────────────────────────┐  │
│  │            FastAPI Backend (Port 8000)                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │  │
│  │  │ Endpoints│  │ Services │  │  Models  │  │  Config  │    │  │
│  │  │  (REST)  │  │ (Logic)  │  │(Pydantic)│  │ (Settings)│   │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │  │
│  │       │             │              │             │           │  │
│  │       └─────────────┴──────────────┴─────────────┘           │  │
│  │                          │                                    │  │
│  └──────────────────────────┼────────────────────────────────────┘  │
└─────────────────────────────┼─────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │  SQL Queries      │
                    │  (pg8 driver)     │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────┼────────────────────────────────────────┐
│                      DATABASE LAYER                                   │
│  ┌──────────────────────────┴────────────────────────────────────┐  │
│  │         PostgreSQL Database (Port 5433)                       │  │
│  │  Database: postgres                                           │  │
│  │  Schema: healthcare_production                                │  │
│  │                                                                │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │  │
│  │  │  healthcare_   │  │  facility_     │  │  facility_     │ │  │
│  │  │  providers     │  │  categories    │  │  types         │ │  │
│  │  │  (6.5M rows)   │  │  (12 rows)     │  │  (50+ rows)    │ │  │
│  │  └────────────────┘  └────────────────┘  └────────────────┘ │  │
│  │                                                                │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │  │
│  │  │  states        │  │  entity_types  │  │  taxonomy_     │ │  │
│  │  │  (50+ rows)    │  │  (10+ rows)    │  │  codes         │ │  │
│  │  └────────────────┘  └────────────────┘  └────────────────┘ │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘

                          OPTIONAL INTEGRATION
┌───────────────────────────────────────────────────────────────────────┐
│                      GRAPH DATABASE (OPTIONAL)                        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │           Neo4j Graph Database (Port 7687)                     │  │
│  │  Used for: Entity relationship visualization                   │  │
│  │  Status: Currently using mock data (not configured)            │  │
│  └────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 💾 Database Architecture

### Database System: **PostgreSQL 15+**

**Connection Details:**
- Host: `127.0.0.1`
- Port: `5433`
- Database: `postgres`
- Schema: `healthcare_production`
- User: `postgres`
- Password: `Platoon@1`

### Database Schema

#### Core Tables

##### 1. `healthcare_providers` (Main Entity Table)
**Purpose**: Stores individual healthcare provider records  
**Estimated Rows**: ~6,500,000  
**Key Columns**:
```sql
- id: SERIAL PRIMARY KEY
- npi_number: VARCHAR(10) -- National Provider Identifier
- entity_type_id: INTEGER -- FK to entity_types
- facility_category_id: INTEGER -- FK to facility_categories
- facility_type_id: INTEGER -- FK to facility_types
- provider_name: VARCHAR(255)
- provider_first_name: VARCHAR(100)
- provider_last_name: VARCHAR(100)
- provider_middle_name: VARCHAR(100)
- provider_credentials: VARCHAR(100)
- provider_sex: VARCHAR(1)
- is_sole_proprietor: BOOLEAN
- is_organization_subpart: BOOLEAN
- parent_organization_name: VARCHAR(255)
- ein: VARCHAR(20) -- Employer Identification Number
- business_address_line1: VARCHAR(255)
- business_address_line2: VARCHAR(255)
- business_city: VARCHAR(100)
- business_state_id: INTEGER -- FK to states
- business_zip_code: VARCHAR(10)
- mailing_address_line1: VARCHAR(255)
- mailing_address_line2: VARCHAR(255)
- mailing_city: VARCHAR(100)
- mailing_state_id: INTEGER -- FK to states
- mailing_zip_code: VARCHAR(10)
- business_phone: VARCHAR(20)
- business_fax: VARCHAR(20)
- mailing_phone: VARCHAR(20)
- mailing_fax: VARCHAR(20)
- authorized_official_phone: VARCHAR(20)
- all_phones: TEXT
- all_faxes: TEXT
- primary_taxonomy_code_id: INTEGER
- primary_license_number: VARCHAR(50)
- license_state_id: INTEGER
- authorized_official_first_name: VARCHAR(100)
- authorized_official_last_name: VARCHAR(100)
- authorized_official_title: VARCHAR(100)
- enumeration_date: TIMESTAMP
- last_update_date: TIMESTAMP
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()
- is_active: BOOLEAN DEFAULT TRUE
```

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `npi_number` (frequently queried)
- INDEX on `facility_category_id` (for category filtering)
- INDEX on `facility_type_id` (for type filtering)
- INDEX on `business_state_id` (for location filtering)
- INDEX on `is_active` (for active records filtering)
- INDEX on `provider_name` (for name searches)

##### 2. `facility_categories` (Taxonomy Table)
**Purpose**: Defines high-level healthcare facility categories  
**Estimated Rows**: ~12  
**Key Columns**:
```sql
- id: SERIAL PRIMARY KEY
- code: VARCHAR(50) UNIQUE -- Machine-readable code (e.g., 'hospitals')
- name: VARCHAR(100) -- Short name
- display_name: VARCHAR(255) -- Human-readable name
- description: TEXT
- is_active: BOOLEAN DEFAULT TRUE
- created_at: TIMESTAMP DEFAULT NOW()
```

**Sample Data**:
```
1. Hospitals
2. Clinics
3. Agencies
4. Assisted Living
5. Blood & Eye Banks
6. Custodial Facilities
7. Home Health Agency
8. Hospice
9. Laboratory
10. Mental Health Units
11. Pharmacy
12. SNF (Skilled Nursing)
```

##### 3. `facility_types` (Sub-Category Table)
**Purpose**: Specific types within each category  
**Estimated Rows**: ~50+  
**Key Columns**:
```sql
- id: SERIAL PRIMARY KEY
- code: VARCHAR(50) UNIQUE
- name: VARCHAR(100)
- display_name: VARCHAR(255)
- description: TEXT
- category_id: INTEGER -- FK to facility_categories
- is_active: BOOLEAN DEFAULT TRUE
- created_at: TIMESTAMP DEFAULT NOW()
```

**Relationship**: `facility_types.category_id → facility_categories.id`

**Sample Data** (for Hospitals category):
```
- Acute Care Hospital
- Critical Access Hospital
- General Medical Hospital
- Psychiatric Hospital
- Rehabilitation Hospital
- Children's Hospital
- Specialty Hospital
```

##### 4. `states` (Reference Table)
**Purpose**: U.S. state information  
**Estimated Rows**: ~50+  
**Key Columns**:
```sql
- id: SERIAL PRIMARY KEY
- code: VARCHAR(2) -- State code (e.g., 'CA', 'NY')
- name: VARCHAR(100) -- Full state name
- country: VARCHAR(2) DEFAULT 'US'
```

##### 5. `entity_types` (Reference Table)
**Purpose**: Legal entity type classification  
**Estimated Rows**: ~10+  
**Key Columns**:
```sql
- id: SERIAL PRIMARY KEY
- code: VARCHAR(50)
- name: VARCHAR(100)
- description: TEXT
```

**Sample Data**:
```
- Individual
- Organization
- Corporation
- Partnership
- Non-Profit
- Government
```

##### 6. `taxonomy_codes` (Reference Table)
**Purpose**: Healthcare provider taxonomy classification (HIPAA standard)  
**Estimated Rows**: ~1,000+  
**Key Columns**:
```sql
- id: SERIAL PRIMARY KEY
- code: VARCHAR(20) -- Taxonomy code
- classification: VARCHAR(255)
- specialization: VARCHAR(255)
- definition: TEXT
```

### Database Relationships

```
facility_categories (1)
         ↓
    has many
         ↓
facility_types (N)
         ↓
    has many
         ↓
healthcare_providers (N)
         ↓
    references
         ↓
  ┌──────┴──────────┬─────────────┐
  ↓                 ↓             ↓
states (N)    entity_types (N)  taxonomy_codes (N)
```

### Database Access Pattern

**Frontend → Backend → Database Flow**:

1. **Frontend** makes HTTP request to Next.js API route
2. **Next.js API Route** (`/api/v1/catalog/...`) connects to database via `lib/database.ts`
3. **Database Helper** uses `pg` (node-postgres) connection pool
4. **SQL Query** executed against PostgreSQL
5. **Results** formatted and returned to frontend

**Backend Direct Access**:

1. **FastAPI Endpoint** receives request
2. **Service Layer** (`catalog_service.py`) processes business logic
3. **SQLAlchemy** executes raw SQL queries
4. **PostgreSQL** returns results
5. **Pydantic Models** validate and serialize data
6. **JSON Response** returned to client

---

## 🎨 Frontend Architecture

### Technology Stack

**Framework**: Next.js 15 (App Router with React Server Components)  
**Language**: TypeScript 5  
**Styling**: TailwindCSS 3.4 + Radix UI  
**State Management**: Zustand + TanStack Query  
**Validation**: Zod 4.1  
**Animations**: Framer Motion 12  
**UI Components**: Shadcn UI (Radix primitives)  

### Project Structure

```
testing_ui-main/src/
├── app/                              # Next.js App Router pages
│   ├── page.tsx                      # Landing page
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Global styles
│   │
│   ├── login/                        # Authentication
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   ├── forgot-password/
│   │   └── page.tsx
│   │
│   ├── dashboard/                    # Main dashboard
│   │   └── page.tsx
│   │
│   ├── search/                       # Search interface
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── filtering/                    # Advanced filtering
│   │   └── page.tsx
│   │
│   ├── data-catalog/                 # Data catalog (MAIN FEATURE)
│   │   ├── page.tsx                  # Catalog overview
│   │   ├── [category]/               # Category pages
│   │   │   ├── page.tsx
│   │   │   └── [facilityType]/       # Facility type pages
│   │   │       └── page.tsx
│   │   └── hospitals/                # Hospital-specific routing
│   │       ├── page.tsx
│   │       └── [hospitalType]/
│   │           └── page.tsx
│   │
│   ├── graph-linkage/                # Graph visualization
│   │   └── page.tsx
│   │
│   ├── insights/                     # Industry insights
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── saved-searches/               # Saved searches
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── alerts/                       # Notifications/alerts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── account/                      # User account
│   │   └── page.tsx
│   │
│   └── api/                          # API routes (backend proxy)
│       ├── graph/
│       │   └── linkage/
│       │       └── route.ts          # Neo4j graph API
│       └── v1/
│           └── catalog/              # PostgreSQL catalog API
│               ├── overview/
│               │   └── route.ts
│               ├── categories/
│               │   ├── route.ts
│               │   └── [categoryId]/
│               │       └── types/
│               │           └── route.ts
│               ├── providers/
│               │   └── route.ts
│               └── hospitals/
│                   ├── types/
│                   │   └── route.ts
│                   └── [hospitalType]/
│                       └── data/
│                           └── route.ts
│
├── components/                       # React components
│   ├── ui/                          # Base UI components (Shadcn)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── tabs.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   ├── checkbox.tsx
│   │   └── textarea.tsx
│   │
│   ├── shared/                      # Shared business components
│   │   ├── navbar.tsx               # Main navigation
│   │   ├── ai-assistant.tsx         # AI chat drawer
│   │   ├── notification-center.tsx  # Notification dropdown
│   │   ├── facility-card.tsx        # Facility display card
│   │   └── insight-card.tsx         # Insight display card
│   │
│   ├── three/                       # Three.js visualizations
│   │   ├── dna-helix.tsx
│   │   ├── floating-sphere.tsx
│   │   ├── loading-cube.tsx
│   │   ├── neural-network.tsx
│   │   └── particle-background.tsx
│   │
│   ├── graph-visualization.tsx      # Force-directed graph
│   ├── call-button.tsx              # Call functionality
│   ├── call-modal.tsx
│   └── providers.tsx                # App-wide providers
│
├── stores/                          # Zustand state stores
│   ├── auth-store.ts                # Authentication state
│   ├── filters-store.ts             # Search filters state
│   ├── ai-store.ts                  # AI assistant state
│   ├── notifications-store.ts       # Notifications state
│   └── saved-searches-store.ts      # Saved searches state
│
├── lib/                             # Utility libraries
│   ├── database.ts                  # PostgreSQL connection helper
│   ├── utils.ts                     # General utilities
│   └── store/                       # Additional stores
│       ├── call-store.ts
│       ├── graph-store.ts
│       └── intent-store.ts
│
└── types/                           # TypeScript types
    └── index.ts                     # Shared type definitions
```

### Component Architecture

#### 1. Page Components (Server Components by default)

**Data Catalog Page** (`/data-catalog/page.tsx`):
- **Type**: Client Component (uses `useQuery`)
- **Data Fetching**: TanStack Query with 5-minute cache
- **API Endpoint**: `/api/v1/catalog/overview`
- **Purpose**: Display all healthcare categories with counts
- **Features**:
  - Real-time provider counts
  - Category filtering
  - Search functionality
  - Loading skeletons
  - Error boundaries

**Category Page** (`/data-catalog/[category]/page.tsx`):
- **Type**: Client Component
- **Dynamic Route**: Slug-based category routing
- **API Endpoint**: `/api/v1/catalog/categories/{categoryId}/types`
- **Purpose**: Show facility types within a category
- **Features**:
  - Breadcrumb navigation
  - Facility type cards
  - Provider counts per type

**Facility Type Page** (`/data-catalog/[category]/[facilityType]/page.tsx`):
- **Type**: Client Component
- **Dynamic Route**: Nested slug routing
- **API Endpoint**: `/api/v1/catalog/providers`
- **Purpose**: Display actual provider records
- **Features**:
  - Paginated table
  - Search/filter
  - Export functionality
  - Detail views

#### 2. State Management

**Zustand Stores**:

```typescript
// auth-store.ts
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

// filters-store.ts
interface FiltersState {
  filters: SearchFilters
  updateFilters: (filters: Partial<SearchFilters>) => void
  resetFilters: () => void
}

// notifications-store.ts
interface NotificationsState {
  alerts: Alert[]
  unreadCount: number
  preferences: AlertPreferences
  addAlert: (alert: Alert) => void
  markAsRead: (id: string) => void
  deleteAlert: (id: string) => void
}

// saved-searches-store.ts
interface SavedSearchesState {
  searches: SavedSearch[]
  lists: FacilityList[]
  createSearch: (search: SavedSearch) => void
  deleteSearch: (id: string) => void
  exportList: (id: string, format: 'csv' | 'json') => void
}
```

**TanStack Query**:
- **Cache Duration**: 5 minutes default
- **Refetch on Window Focus**: Disabled
- **Retry Logic**: 3 attempts with exponential backoff
- **Query Keys**: Structured hierarchically

```typescript
// Query key structure
['catalog-overview']
['catalog-categories']
['catalog-category', categoryId]
['catalog-providers', { categoryId, facilityTypeId, page }]
```

#### 3. API Route Architecture

**Next.js API Routes** act as a proxy to PostgreSQL:

```typescript
// /api/v1/catalog/overview/route.ts
export async function GET(request: NextRequest) {
  // 1. Check cache
  if (overviewCache && cacheValid) {
    return NextResponse.json(overviewCache)
  }
  
  // 2. Connect to PostgreSQL via lib/database.ts
  const catalogData = await getCatalogOverview()
  
  // 3. Cache results
  overviewCache = catalogData
  cacheTimestamp = Date.now()
  
  // 4. Return JSON
  return NextResponse.json(catalogData)
}
```

**Database Helper** (`lib/database.ts`):

```typescript
import { Pool } from 'pg'

const pool = new Pool({
  host: '127.0.0.1',
  port: 5433,
  database: 'postgres',
  user: 'postgres',
  password: 'Platoon@1',
  max: 10,
  idleTimeoutMillis: 10000,
})

export async function getCatalogOverview() {
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT 
        fc.id,
        fc.code as name,
        fc.name as display_name,
        fc.description,
        COUNT(hp.id) as provider_count
      FROM healthcare_production.facility_categories fc
      LEFT JOIN healthcare_production.healthcare_providers hp 
        ON hp.facility_category_id = fc.id 
        AND hp.is_active = true
      GROUP BY fc.id, fc.code, fc.name, fc.description
      ORDER BY provider_count DESC
    `)
    
    return {
      total_providers: 6500000,
      total_categories: result.rows.length,
      categories: result.rows,
      last_updated: new Date().toISOString()
    }
  } finally {
    client.release()
  }
}
```

---

## 🔧 Backend Architecture

### Technology Stack

**Framework**: FastAPI 0.104  
**Language**: Python 3.9+  
**Web Server**: Uvicorn (ASGI)  
**Database ORM**: SQLAlchemy 2.0 (raw SQL)  
**Database Driver**: psycopg2-binary  
**Validation**: Pydantic 2.5  
**Configuration**: pydantic-settings  

### Project Structure

```
testing_ui-main/backend/
├── app/
│   ├── __init__.py
│   ├── main.py                      # FastAPI application entry
│   │
│   ├── core/                        # Core configuration
│   │   ├── __init__.py
│   │   ├── config.py                # Settings & environment
│   │   └── database.py              # Database connection
│   │
│   ├── api/                         # API endpoints
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── api.py               # Router aggregation
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           ├── health.py        # Health check
│   │           ├── catalog.py       # Catalog endpoints
│   │           └── schema.py        # Schema introspection
│   │
│   ├── services/                    # Business logic
│   │   ├── __init__.py
│   │   ├── catalog_service.py       # Catalog operations
│   │   └── schema_service.py        # Schema operations
│   │
│   └── models/                      # Pydantic models
│       ├── __init__.py
│       ├── catalog.py               # Catalog data models
│       └── schema.py                # Schema data models
│
├── requirements.txt                 # Python dependencies
├── run.py                          # Development server runner
└── test_connection.py              # DB connection tester
```

### Backend Components

#### 1. FastAPI Application (`main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Healthcare Data Catalog API",
    version="1.0.0",
    description="Schema metadata inspection for PostgreSQL database"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router, prefix="/api/v1")
```

#### 2. Database Connection (`core/database.py`)

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### 3. Service Layer (`services/catalog_service.py`)

**Purpose**: Encapsulate business logic and database queries

Key Methods:

```python
class CatalogService:
    async def get_catalog_overview(self) -> DataCatalogOverview:
        # Returns overview with all categories and counts
        
    async def get_categories(self) -> List[CategoryInfo]:
        # Returns all facility categories
        
    async def get_facility_types_by_category(
        self, category_id: int
    ) -> List[FacilityTypeInfo]:
        # Returns facility types for a specific category
        
    async def get_providers(
        self,
        category_id: Optional[int] = None,
        facility_type_id: Optional[int] = None,
        state: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[ProviderInfo]:
        # Returns filtered provider records
        
    async def search_providers(
        self,
        query: str,
        category_id: Optional[int] = None,
        state: Optional[str] = None,
        limit: int = 20
    ) -> List[ProviderInfo]:
        # Full-text search across providers
```

#### 4. API Endpoints (`api/v1/endpoints/catalog.py`)

**RESTful API Design**:

```
GET  /api/v1/catalog/overview          # Catalog overview
GET  /api/v1/catalog/categories        # All categories
GET  /api/v1/catalog/categories/{id}/types  # Types in category
GET  /api/v1/catalog/providers         # Providers (with filters)
GET  /api/v1/catalog/providers/{id}    # Provider details
GET  /api/v1/catalog/search            # Search providers
GET  /api/v1/catalog/statistics        # Catalog statistics
```

**Example Endpoint**:

```python
@router.get("/overview", response_model=DataCatalogOverview)
async def get_catalog_overview() -> DataCatalogOverview:
    try:
        service = CatalogService()
        return await service.get_catalog_overview()
    except Exception as e:
        logger.error(f"Catalog overview endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

#### 5. Pydantic Models (`models/catalog.py`)

**Data Validation & Serialization**:

```python
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
    facility_category_id: int
    facility_category_name: str
    facility_type_id: int
    facility_type_name: str
    business_city: Optional[str] = None
    business_state: Optional[str] = None
    business_phone: Optional[str] = None
    is_active: bool
```

---

## 🔄 Data Flow & Component Interactions

### Complete Request Flow

#### Example: Loading Data Catalog Overview

```
1. USER ACTION
   ↓
   User navigates to /data-catalog
   
2. NEXT.JS PAGE LOAD
   ↓
   App Router loads page.tsx (Client Component)
   ↓
   useQuery hook initiates data fetch
   
3. TANSTACK QUERY
   ↓
   Check cache (5-minute stale time)
   ↓
   If cache miss or stale: fetch('/api/v1/catalog/overview')
   
4. NEXT.JS API ROUTE
   ↓
   /api/v1/catalog/overview/route.ts
   ↓
   Check in-memory cache
   ↓
   If cache miss: Call getCatalogOverview() from lib/database.ts
   
5. DATABASE CONNECTION
   ↓
   lib/database.ts connects to PostgreSQL using pg Pool
   ↓
   Connection: 127.0.0.1:5433/postgres/healthcare_production
   
6. SQL QUERY EXECUTION
   ↓
   SELECT fc.id, fc.code, fc.display_name, COUNT(hp.id)
   FROM healthcare_production.facility_categories fc
   LEFT JOIN healthcare_production.healthcare_providers hp
   ON hp.facility_category_id = fc.id AND hp.is_active = true
   GROUP BY fc.id
   
7. DATABASE RESPONSE
   ↓
   PostgreSQL returns result set
   ↓
   ~12 rows (one per category)
   
8. DATA TRANSFORMATION
   ↓
   lib/database.ts formats data:
   {
     total_providers: 6500000,
     total_categories: 12,
     categories: [...],
     last_updated: "2025-01-20T..."
   }
   
9. API RESPONSE
   ↓
   Next.js API route returns JSON response
   ↓
   Sets cache with 5-minute TTL
   
10. TANSTACK QUERY CACHE
    ↓
    Stores response in React Query cache
    ↓
    Cache key: ['catalog-overview']
    
11. COMPONENT RENDER
    ↓
    Data available via useQuery hook
    ↓
    Component updates from loading → success state
    
12. UI DISPLAY
    ↓
    Categories rendered as cards
    ↓
    Provider counts displayed
    ↓
    User sees data
```

### Alternative Flow: FastAPI Backend (Direct)

```
1. CLIENT REQUEST
   ↓
   fetch('http://localhost:8000/api/v1/catalog/overview')
   
2. FASTAPI ROUTING
   ↓
   FastAPI matches route to endpoint
   ↓
   /api/v1/catalog/overview → get_catalog_overview()
   
3. SERVICE LAYER
   ↓
   CatalogService.get_catalog_overview()
   ↓
   Business logic & SQL query construction
   
4. SQLALCHEMY EXECUTION
   ↓
   engine.connect() → SQLAlchemy connection
   ↓
   Execute raw SQL query
   
5. POSTGRESQL
   ↓
   Query execution on healthcare_production schema
   ↓
   Return rows
   
6. PYDANTIC VALIDATION
   ↓
   Results mapped to DataCatalogOverview model
   ↓
   Validation & serialization
   
7. JSON RESPONSE
   ↓
   FastAPI returns JSON
   ↓
   Status 200 with structured data
```

---

## 🔐 Security & Configuration

### Environment Variables

**Frontend** (`.env.local`):
```bash
# PostgreSQL (used by Next.js API routes)
DB_HOST=127.0.0.1
DB_PORT=5433
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=Platoon@1
DB_SCHEMA=healthcare_production

# Neo4j (optional)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password

# API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend** (`.env` or direct config):
```python
# backend/app/core/config.py
class Settings(BaseSettings):
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 5433
    DB_NAME: str = "postgres"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "Platoon@1"
    TARGET_SCHEMA: str = "healthcare_production"
    
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]
```

### Authentication & Authorization

**Current State**: Mock authentication (Phase 1 MVP)

**Authentication Flow**:
```typescript
// stores/auth-store.ts
login: async (email: string, password: string) => {
  // Mock login - no actual backend validation
  const mockUser: User = {
    id: "1",
    email,
    name: "John Doe",
    role: "Analyst",
    plan: "Pro",
  }
  set({ user: mockUser, isAuthenticated: true })
}
```

**Planned** (Phase 2):
- JWT token-based authentication
- OAuth 2.0 integration (Google, GitHub)
- Role-based access control (RBAC)
- API key management
- Session management

---

## 📊 Key Features Implementation

### 1. Data Catalog (Primary Feature)

**User Flow**:
```
/data-catalog
   ↓
   [User sees 12 categories]
   ↓
   Click "Hospitals"
   ↓
/data-catalog/hospitals
   ↓
   [User sees hospital facility types: Acute Care, Critical Access, etc.]
   ↓
   Click "Acute Care Hospital"
   ↓
/data-catalog/hospitals/acute-care-hospital
   ↓
   [User sees paginated table of actual hospitals]
   ↓
   Can search, filter, export data
```

**Technical Implementation**:
- Dynamic routing with Next.js App Router
- Server-side data fetching with TanStack Query
- PostgreSQL queries with JOIN optimization
- Client-side pagination and filtering
- CSV/JSON export functionality

### 2. Advanced Search & Filtering

**Features**:
- Multi-criteria filtering
- Real-time search
- Location-based filtering (state, city, zip)
- Facility type filtering
- Ownership filtering
- Range filters (bed count, ratings)

**State Management**:
```typescript
// stores/filters-store.ts
interface SearchFilters {
  facilityType: string[]
  ownership: string[]
  accreditation: string[]
  bedCountRange: [number, number]
  ratingRange: [number, number]
  states: string[]
  cities: string[]
}
```

### 3. Saved Searches & Alerts

**Features**:
- Save search criteria
- Create custom facility lists
- Auto-refresh saved searches
- Email notifications for new results
- Alert preferences by type
- Priority-based alert management

**Persistence**:
- Browser localStorage (current)
- Zustand persist middleware
- Future: Backend API + database

### 4. Graph Visualization

**Neo4j Integration** (Optional):
- Entity relationship visualization
- Force-directed graph layout
- Interactive node exploration
- Color-coded entity types

**Current Status**:
- Mock data (Neo4j not configured)
- Environment variables required
- Fallback to mock data

### 5. Insights Feed

**Features**:
- Healthcare industry news
- M&A activity tracking
- Policy updates
- Facility expansion announcements
- Bookmark and share functionality

**Data Source**:
- Mock data (`/public/mock-data/insights.json`)
- Future: Real-time API integration

---

## 🚀 Performance Optimizations

### Frontend Optimizations

1. **React Query Caching**:
   - 5-minute stale time for catalog data
   - Background refetching
   - Optimistic updates

2. **Code Splitting**:
   - Route-based splitting (Next.js automatic)
   - Dynamic imports for heavy components
   - Lazy loading for non-critical features

3. **Image Optimization**:
   - Next.js Image component
   - WebP format
   - Lazy loading
   - Responsive sizes

4. **Bundle Optimization**:
   - Tree shaking
   - Minification
   - Compression (gzip/brotli)

### Backend Optimizations

1. **Database Connection Pooling**:
   ```python
   # Backend: SQLAlchemy pool
   pool_size=10
   pool_recycle=300
   pool_pre_ping=True
   ```
   
   ```typescript
   // Frontend: pg Pool
   max: 10
   min: 2
   idleTimeoutMillis: 10000
   ```

2. **Query Optimization**:
   - Indexed columns
   - LIMIT clauses for pagination
   - Efficient JOINs
   - Aggregate queries for counts

3. **Caching Strategy**:
   - In-memory cache (5-minute TTL)
   - React Query client-side cache
   - Future: Redis for distributed cache

### Database Optimizations

**Indexes**:
```sql
CREATE INDEX idx_providers_category 
  ON healthcare_providers(facility_category_id);
CREATE INDEX idx_providers_type 
  ON healthcare_providers(facility_type_id);
CREATE INDEX idx_providers_state 
  ON healthcare_providers(business_state_id);
CREATE INDEX idx_providers_active 
  ON healthcare_providers(is_active);
CREATE INDEX idx_providers_name 
  ON healthcare_providers(provider_name);
```

---

## 📦 Dependencies

### Frontend Dependencies

**Core**:
- `next@15.5.4` - React framework
- `react@19.1.0` - UI library
- `typescript@5` - Type safety

**State Management**:
- `zustand@5.0.8` - Lightweight state
- `@tanstack/react-query@5.90.2` - Server state

**UI Components**:
- `@radix-ui/*` - Accessible primitives
- `tailwindcss@3.4.18` - Utility CSS
- `lucide-react@0.545.0` - Icons
- `framer-motion@12.23.23` - Animations

**Data Visualization**:
- `react-force-graph-3d@1.29.0` - Graph viz
- `three@0.180.0` - 3D graphics
- `recharts@3.2.1` - Charts

**Database**:
- `pg@8.16.3` - PostgreSQL client
- `neo4j-driver@6.0.0` - Neo4j client

**Forms & Validation**:
- `react-hook-form@7.64.0` - Form management
- `zod@4.1.12` - Schema validation
- `@hookform/resolvers@5.2.2` - Integrations

### Backend Dependencies

**Core**:
- `fastapi==0.104.1` - Web framework
- `uvicorn[standard]==0.24.0` - ASGI server
- `python-dotenv==1.0.0` - Environment management

**Database**:
- `sqlalchemy==2.0.23` - ORM/query builder
- `psycopg2-binary==2.9.9` - PostgreSQL driver
- `alembic==1.12.1` - Migrations

**Validation**:
- `pydantic==2.5.0` - Data validation
- `pydantic-settings==2.1.0` - Settings management

---

## 🧪 Testing & Development

### Development Servers

**Frontend** (Port 3001):
```bash
cd testing_ui-main
npm install
$env:PORT=3001; npm run dev
```

**Backend** (Port 8000):
```bash
cd testing_ui-main/backend
pip install -r requirements.txt
python run.py
```

**Database** (Port 5433):
```bash
# PostgreSQL already running
psql -h 127.0.0.1 -p 5433 -U postgres -d postgres
```

### Testing Database Connection

**Backend Test**:
```bash
cd testing_ui-main/backend
python test_connection.py
```

**Frontend Test**:
```bash
cd testing_ui-main
node test-server-connection.js
```

### API Testing

**FastAPI Docs**:
- Swagger UI: `http://localhost:8000/api/v1/docs`
- ReDoc: `http://localhost:8000/api/v1/redoc`

**Next.js API Routes**:
- Catalog Overview: `http://localhost:3001/api/v1/catalog/overview`
- Categories: `http://localhost:3001/api/v1/catalog/categories`
- Providers: `http://localhost:3001/api/v1/catalog/providers`

---

## 🎯 User Workflows

### Workflow 1: Browse Healthcare Facilities

```
1. User lands on /data-catalog
2. Views 12 facility categories with live counts
3. Clicks "Hospitals" category
4. Sees hospital facility types (Acute Care, Critical Access, etc.)
5. Clicks "Acute Care Hospital"
6. Views paginated table of hospitals
7. Filters by state (e.g., California)
8. Searches for specific hospital name
9. Exports results to CSV
```

### Workflow 2: Save and Monitor Search

```
1. User performs search on /search page
2. Applies multiple filters (type, location, ownership)
3. Clicks "Save Search" button
4. Names the search "CA Acute Care Hospitals"
5. Enables auto-refresh and email notifications
6. Search saved to localStorage
7. User navigates to /saved-searches
8. Views all saved searches
9. Clicks saved search to re-run
10. Receives alert when new results match criteria
```

### Workflow 3: Explore Entity Relationships

```
1. User navigates to /graph-linkage
2. Interactive graph loads (mock data)
3. Nodes represent: States, Counties, Zipcodes, Hospitals, Drugs
4. User clicks node to expand connections
5. Hover shows node details
6. Color-coded by entity type
7. Force-directed layout shows relationships
```

---

## 🔮 Future Enhancements

### Phase 2 - Authentication & API

- [ ] JWT token-based authentication
- [ ] User registration with email verification
- [ ] OAuth integration (Google, GitHub, Microsoft)
- [ ] API key generation and management
- [ ] Rate limiting per user/plan
- [ ] Usage tracking and billing

### Phase 3 - Advanced Features

- [ ] Real-time WebSocket updates
- [ ] Advanced analytics dashboard
- [ ] Geographic mapping (Mapbox integration)
- [ ] PDF report generation
- [ ] Bulk data export (>10k records)
- [ ] Custom data views and dashboards
- [ ] Team collaboration features
- [ ] Data lineage and audit trails

### Phase 4 - Scale & Performance

- [ ] Redis caching layer
- [ ] CDN for static assets
- [ ] Database read replicas
- [ ] Elasticsearch for full-text search
- [ ] GraphQL API
- [ ] Microservices architecture
- [ ] Kubernetes deployment
- [ ] Multi-region deployment

---

## 📚 Documentation References

### Internal Documentation

- `README.md` - Project overview
- `PROJECT_SUMMARY.md` - Feature summary
- `QUICKSTART.md` - Getting started guide
- `DATA_CATALOG_GUIDE.md` - Data catalog usage
- `NEO4J_SETUP.md` - Neo4j integration guide
- `FEATURES_SUMMARY.md` - Feature descriptions
- `SAVED_SEARCHES_AND_ALERTS_GUIDE.md` - Saved searches documentation

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 🤔 Clarifying Questions & Answers

### Q1: Is this a production-ready system?

**A**: This is a **Phase 1 MVP** with:
- ✅ Full UI implementation
- ✅ Working database integration
- ✅ Real healthcare data (6.5M records)
- ⚠️ Mock authentication (no real user management)
- ⚠️ No payment/billing system
- ⚠️ No production deployment configuration

### Q2: What data sources power this platform?

**A**: 
- **Primary**: PostgreSQL database with `healthcare_production` schema
- **Contains**: ~6.5M healthcare provider records from NPI (National Provider Identifier) registry
- **Structure**: Hierarchical taxonomy (Categories → Types → Providers)
- **Supplemental**: Mock data for insights and graph visualization

### Q3: How does the frontend connect to the database?

**A**: Two pathways exist:

1. **Next.js API Routes** (Primary):
   - Frontend → `/api/v1/catalog/*` → `lib/database.ts` → PostgreSQL
   - Uses `pg` (node-postgres) connection pool
   - Server-side execution (secure, no credentials exposed)

2. **FastAPI Backend** (Alternative):
   - Frontend → `http://localhost:8000/api/v1/*` → FastAPI → PostgreSQL
   - Uses SQLAlchemy with psycopg2
   - Separate backend service

**Current Usage**: Primarily Next.js API routes (option 1)

### Q4: What's the purpose of the FastAPI backend if Next.js has API routes?

**A**: 
- **Historical**: Backend was developed first as standalone API
- **Current**: Next.js API routes provide better integration
- **Future**: FastAPI could serve as microservice for complex operations
- **Benefit**: Provides flexibility - can use either approach

### Q5: Is the data real or mock?

**A**: 
- **Healthcare Provider Data**: ✅ REAL (6.5M records from PostgreSQL)
- **Categories & Types**: ✅ REAL (from database taxonomy)
- **User Authentication**: ❌ MOCK
- **Insights Feed**: ❌ MOCK (JSON files)
- **Graph Visualization**: ❌ MOCK (Neo4j not configured)
- **Saved Searches**: ⚠️ LOCAL (browser storage only)

---

## 🏁 Summary

### Architecture Patterns Used

1. **Monorepo Structure**: Frontend and backend in single repository
2. **Microservices Ready**: Separated concerns (UI, API, Database)
3. **Layered Architecture**: Presentation → Business Logic → Data Access
4. **RESTful API**: Standard HTTP methods and resource-based routing
5. **Client-Side State**: Zustand for global, TanStack Query for server state
6. **Server Components**: Next.js RSC for performance
7. **Connection Pooling**: Efficient database connections
8. **Caching Strategy**: Multi-level (browser, API, database)

### Key Architectural Decisions

1. **Next.js 15 App Router**: Modern React framework with RSC
2. **Dual API Approach**: Next.js API routes + optional FastAPI backend
3. **PostgreSQL Primary**: Relational data for structured healthcare records
4. **Neo4j Optional**: Graph database for relationship visualization
5. **Zustand Over Redux**: Lightweight state management
6. **TanStack Query**: Server state management with caching
7. **Tailwind CSS**: Utility-first styling for rapid development
8. **TypeScript**: Type safety across entire frontend

### Critical Success Factors

1. ✅ **Database Connection**: Working PostgreSQL connection is essential
2. ✅ **Schema Understanding**: Proper JOIN relationships for accurate queries
3. ✅ **Performance**: Connection pooling and query optimization
4. ✅ **Caching**: Multi-level caching reduces database load
5. ⚠️ **Authentication**: Currently mocked, needs real implementation
6. ⚠️ **Scalability**: Single PostgreSQL instance, needs replication for scale

---

## 📞 Contact & Support

For questions about this architecture:
- Review inline code comments
- Check existing documentation in project root
- Examine database query patterns in `lib/database.ts` and `services/catalog_service.py`
- Test API endpoints using Swagger UI at `/api/v1/docs`

---

**Document Version**: 1.0  
**Last Updated**: January 20, 2025  
**Author**: Architecture Analysis & Documentation  
**Status**: Complete & Comprehensive





