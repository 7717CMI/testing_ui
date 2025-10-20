# Healthcare Data Catalog API

A FastAPI backend that connects to PostgreSQL database and provides schema metadata inspection for data catalog functionality.

## 🎯 Purpose

This API **only connects and reflects** the existing PostgreSQL database - no schema changes, no table alterations, no migrations. It's designed to read schema metadata for data catalog purposes.

## 🗄️ Database Connection

- **Host**: localhost
- **Port**: 5433
- **Database**: cloudsqladmin
- **Username**: postgres
- **Password**: Platoon@1
- **Target Schema**: healthcare_production

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the API

```bash
# Option 1: Using the startup script
python run.py

# Option 2: Using uvicorn directly
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Access the API

- **API Base URL**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc

## 📚 API Endpoints

### Health Check
- `GET /api/v1/health/health` - Database connection health check
- `GET /api/v1/health/status` - API status information

### Schema Metadata
- `GET /api/v1/schema/overview` - Database overview with all schemas
- `GET /api/v1/schema/schemas` - List all schemas
- `GET /api/v1/schema/schemas/{schema_name}` - Get schema details with tables
- `GET /api/v1/schema/schemas/{schema_name}/tables` - Get all tables in schema
- `GET /api/v1/schema/schemas/{schema_name}/tables/{table_name}` - Get table details
- `GET /api/v1/schema/schemas/{schema_name}/search?q={search_term}` - Search tables
- `GET /api/v1/schema/schemas/{schema_name}/statistics` - Get schema statistics

## 🔍 Example Usage

### Check Database Connection
```bash
curl http://localhost:8000/api/v1/health/health
```

### Get Healthcare Production Schema Details
```bash
curl http://localhost:8000/api/v1/schema/schemas/healthcare_production
```

### Get Table Details
```bash
curl http://localhost:8000/api/v1/schema/schemas/healthcare_production/tables/your_table_name
```

### Search Tables
```bash
curl "http://localhost:8000/api/v1/schema/schemas/healthcare_production/search?q=patient"
```

## 📊 Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "error": null
}
```

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── health.py
│   │       │   └── schema.py
│   │       └── api.py
│   ├── core/
│   │   ├── config.py
│   │   └── database.py
│   ├── models/
│   │   └── schema.py
│   ├── services/
│   │   └── schema_service.py
│   └── main.py
├── requirements.txt
├── run.py
└── README.md
```

## 🔧 Configuration

Configuration is managed through `app/core/config.py`. Key settings:

- Database connection parameters
- Target schema name
- CORS origins
- API versioning

## 🛡️ Security Notes

- This API is designed for **read-only** database access
- No write operations are implemented
- Database credentials are configured in the application
- CORS is configured for local development

## 🐛 Troubleshooting

### Connection Issues
1. Verify PostgreSQL is running on port 5433
2. Check database credentials
3. Ensure the `healthcare_production` schema exists
4. Check firewall settings

### Common Errors
- **Connection refused**: PostgreSQL not running or wrong port
- **Authentication failed**: Wrong username/password
- **Schema not found**: Target schema doesn't exist

## 📝 Logging

The API provides comprehensive logging:
- Request/response logging
- Database connection status
- Error tracking
- Performance metrics

## 🔄 Integration with Frontend

This API is designed to work with the existing Next.js frontend. The frontend can consume these endpoints to:

1. Display database schema information
2. Show table structures and metadata
3. Provide search functionality
4. Generate data catalog views

## 📈 Future Enhancements

- Add caching for frequently accessed metadata
- Implement pagination for large result sets
- Add more detailed table statistics
- Support for multiple database connections
- Real-time schema change notifications











