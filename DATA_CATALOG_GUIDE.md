# Healthcare Data Catalog - Implementation Guide

## 🎯 Overview

The Healthcare Data Catalog is a comprehensive feature that provides dynamic access to healthcare facility data stored in PostgreSQL. It offers a hierarchical navigation system from categories → facility types → actual data records.

## 🏗️ Architecture

### Frontend Structure
```
/data-catalog/
├── page.tsx                           # Main catalog overview
├── [category]/
│   ├── page.tsx                       # Category-specific facility types
│   └── [facilityType]/
│       └── page.tsx                   # Actual data records
```

### Backend API Endpoints
```
GET /api/v1/catalog/overview           # Catalog overview with stats
GET /api/v1/catalog/categories         # All categories
GET /api/v1/catalog/categories/{id}/types  # Facility types in category
GET /api/v1/catalog/providers          # Provider data with filtering
GET /api/v1/catalog/search             # Search providers
GET /api/v1/catalog/statistics         # Catalog statistics
```

## 🚀 Getting Started

### 1. Start the Backend Server
```bash
cd testing_ui-main/backend
python run.py
```
The backend will start on `http://localhost:8000`

### 2. Start the Frontend
```bash
cd testing_ui-main
npm run dev
```
The frontend will start on `http://localhost:3001` (as per your memory)

### 3. Access the Data Catalog
Navigate to `http://localhost:3001/data-catalog`

## 📊 Data Flow

### 1. Catalog Overview (`/data-catalog`)
- Fetches all healthcare categories from PostgreSQL
- Shows total counts and statistics
- Displays category cards with provider counts
- Each card links to category-specific pages

### 2. Category Pages (`/data-catalog/[category]`)
- Shows facility types within a specific category
- Examples: `/data-catalog/hospitals`, `/data-catalog/clinics`
- Displays facility type cards with provider counts
- Each card links to actual data records

### 3. Facility Type Pages (`/data-catalog/[category]/[facilityType]`)
- Shows actual healthcare provider records
- Examples: `/data-catalog/hospitals/acute-care-hospital`
- Displays paginated table of providers
- Includes search and filtering capabilities

## 🗄️ Database Schema

The system connects to PostgreSQL with the following key tables:

### Core Tables
- `healthcare_providers` - Main provider records
- `facility_categories` - Category definitions (Hospitals, Clinics, etc.)
- `facility_types` - Specific facility types within categories
- `states` - State information for location data

### Key Relationships
- `healthcare_providers.facility_category_id` → `facility_categories.id`
- `healthcare_providers.facility_type_id` → `facility_types.id`
- `healthcare_providers.business_state_id` → `states.id`

## 🔧 Configuration

### Backend Configuration
```python
# backend/app/core/config.py
DB_HOST: str = "127.0.0.1"
DB_PORT: int = 5433
DB_NAME: str = "healthdata"  # Your PostgreSQL database
DB_USER: str = "cloudadminsql"  # Your database user
DB_PASSWORD: str = "Platoon@1"  # Your database password
TARGET_SCHEMA: str = "public"  # Schema containing healthcare tables
```

### Frontend Configuration
```typescript
// API proxy configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'
```

## 🎨 UI Features

### 1. Responsive Design
- Mobile-first approach with Tailwind CSS
- Grid layouts that adapt to screen size
- Touch-friendly interface elements

### 2. Loading States
- Skeleton loaders for better UX
- Progressive data loading
- Error boundaries with retry functionality

### 3. Search & Filtering
- Real-time search across provider names, cities, states
- Category and facility type filtering
- Pagination for large datasets

### 4. Data Visualization
- Provider count statistics
- Category breakdowns
- Live data indicators

## 🔍 Navigation Flow

```
Data Catalog Overview
├── Hospitals (850K+ facilities)
│   ├── Acute Care Hospital
│   ├── Critical Access Hospital
│   └── General Medical Hospital
├── Clinics (1.2M+ facilities)
│   ├── Outpatient Clinic
│   ├── Urgent Care Center
│   └── Specialty Medical Office
└── [Other Categories...]
```

## 🛠️ Technical Implementation

### React Query Integration
- Automatic caching and background updates
- Optimistic updates for better performance
- Error handling and retry logic

### Dynamic Routing
- Next.js 14 App Router with dynamic segments
- Slug-based URLs for SEO-friendly navigation
- Automatic breadcrumb generation

### State Management
- React Query for server state
- Local state for UI interactions
- Zustand for global application state

## 📈 Performance Optimizations

### 1. Data Fetching
- Pagination to limit data transfer
- Selective field loading
- Background data prefetching

### 2. Caching Strategy
- React Query with 5-minute stale time
- Automatic background refetching
- Optimistic updates for better UX

### 3. Bundle Optimization
- Code splitting for route-based chunks
- Lazy loading of non-critical components
- Tree shaking for unused code elimination

## 🔒 Security Considerations

### 1. Data Access
- Read-only database connections
- No sensitive data exposure
- Proper error handling without data leaks

### 2. API Security
- CORS configuration for allowed origins
- Input validation and sanitization
- Rate limiting for API endpoints

## 🧪 Testing

### Backend Testing
```bash
cd testing_ui-main/backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd testing_ui-main
npm test
```

## 🚀 Deployment

### Backend Deployment
- FastAPI with Uvicorn ASGI server
- PostgreSQL connection pooling
- Environment-based configuration

### Frontend Deployment
- Next.js static export or SSR
- API route proxying for backend communication
- CDN optimization for static assets

## 📝 Future Enhancements

### 1. Advanced Filtering
- Date range filters
- Geographic radius search
- Multi-criteria filtering

### 2. Data Export
- CSV export functionality
- PDF report generation
- API access for external integrations

### 3. Analytics
- User interaction tracking
- Popular search terms
- Data access patterns

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Check PostgreSQL server status
   - Verify database credentials
   - Ensure schema exists

2. **Frontend API Errors**
   - Check backend server status
   - Verify CORS configuration
   - Check network connectivity

3. **Data Not Loading**
   - Check database connection
   - Verify table permissions
   - Check API endpoint responses

### Debug Commands
```bash
# Check backend logs
cd testing_ui-main/backend
python run.py --log-level debug

# Check frontend logs
cd testing_ui-main
npm run dev -- --verbose
```

## 📞 Support

For technical support or questions about the Data Catalog implementation, please refer to the main project documentation or contact the development team.

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Compatibility:** Next.js 14+, FastAPI, PostgreSQL

