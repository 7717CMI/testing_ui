# Neo4j Integration Setup

## Why Mock Data is Being Used

Your app is currently using mock data because:

1. **Missing API Route**: The `/api/graph/linkage` endpoint didn't exist
2. **No Neo4j Driver**: The `neo4j-driver` package wasn't installed
3. **Missing Environment Variables**: Neo4j connection details aren't configured

## ✅ What I Fixed

### 1. Created API Route
- Added `src/app/api/graph/linkage/route.ts`
- Handles Neo4j connection and querying
- Falls back to mock data if Neo4j isn't available

### 2. Installed Neo4j Driver
- Added `neo4j-driver` package to your project
- Enables connection to your Neo4j database

### 3. Environment Configuration
You need to create a `.env.local` file with your Neo4j credentials:

```bash
# Create .env.local file
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_actual_password
```

## 🔧 Next Steps

### 1. Create Environment File
Create a `.env.local` file in your project root:

```bash
# .env.local
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_neo4j_password
```

### 2. Update Neo4j Credentials
Replace `your_neo4j_password` with your actual Neo4j password.

### 3. Restart Development Server
```bash
npm run dev
```

### 4. Test the Connection
Visit `http://localhost:3001/graph-linkage` to see if it connects to Neo4j.

## 🗄️ Neo4j Database Setup

### Sample Data Structure
The API expects nodes with these properties:
- `name` or `title` - Node display name
- Labels - Node types (State, County, Hospital, etc.)

### Sample Cypher Queries
To populate your Neo4j database with sample healthcare data:

```cypher
// Create States
CREATE (ca:State {name: 'California', population: 39538223})
CREATE (ny:State {name: 'New York', population: 20201249})
CREATE (tx:State {name: 'Texas', population: 29145505})

// Create Counties
CREATE (la:County {name: 'Los Angeles County', population: 10014009})
CREATE (sd:County {name: 'San Diego County', population: 3298634})
CREATE (nyc:County {name: 'New York County', population: 1694251})

// Create Hospitals
CREATE (h1:Hospital {name: 'Memorial Hospital', beds: 500, type: 'General'})
CREATE (h2:Hospital {name: 'General Medical Center', beds: 300, type: 'General'})
CREATE (h3:Hospital {name: 'St. Mary Medical', beds: 400, type: 'General'})

// Create Relationships
CREATE (ca)-[:CONTAINS]->(la)
CREATE (ca)-[:CONTAINS]->(sd)
CREATE (ny)-[:CONTAINS]->(nyc)
CREATE (la)-[:HAS_HOSPITAL]->(h1)
CREATE (la)-[:HAS_HOSPITAL]->(h2)
CREATE (sd)-[:HAS_HOSPITAL]->(h3)
```

## 🔍 Troubleshooting

### Still Seeing Mock Data?

1. **Check Environment Variables**
   ```bash
   # Make sure .env.local exists and has correct values
   cat .env.local
   ```

2. **Verify Neo4j is Running**
   ```bash
   # Check if Neo4j is running on port 7687
   netstat -an | grep 7687
   ```

3. **Test Neo4j Connection**
   ```bash
   # Try connecting with cypher-shell
   cypher-shell -u neo4j -p your_password
   ```

4. **Check Browser Console**
   - Open Developer Tools
   - Look for errors in Console tab
   - Check Network tab for API calls

### Common Issues

**"Connection refused"**
- Neo4j isn't running
- Wrong port (should be 7687 for bolt)
- Firewall blocking connection

**"Authentication failed"**
- Wrong username/password
- User doesn't exist
- Database not accessible

**"Database not found"**
- Database name incorrect
- Database doesn't exist
- User doesn't have access

## 📊 API Response Format

The API returns data in this format:

```json
{
  "nodes": [
    {
      "id": "node_id",
      "name": "Node Name",
      "type": "NodeType",
      "value": 100,
      "color": "#2563EB"
    }
  ],
  "links": [
    {
      "source": "source_node_id",
      "target": "target_node_id",
      "value": 5,
      "type": "RELATIONSHIP_TYPE"
    }
  ]
}
```

## 🚀 Production Considerations

For production deployment:

1. **Use Neo4j AuraDB** (cloud) or **Neo4j Enterprise**
2. **Set up proper authentication** and roles
3. **Use connection pooling** for better performance
4. **Add query optimization** and indexing
5. **Implement caching** for frequently accessed data
6. **Add monitoring** and logging

## 📚 Resources

- [Neo4j JavaScript Driver Documentation](https://neo4j.com/docs/javascript-manual/current/)
- [Neo4j Cypher Manual](https://neo4j.com/docs/cypher-manual/current/)
- [Neo4j Desktop](https://neo4j.com/download/) - Easy local setup
- [Neo4j AuraDB](https://neo4j.com/cloud/aura/) - Cloud database

---

**Once you configure the environment variables, your app will connect to Neo4j instead of using mock data!** 🎉
