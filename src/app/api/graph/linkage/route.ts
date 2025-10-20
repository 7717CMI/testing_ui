import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Neo4j connection configuration
    const neo4jUri = process.env.NEO4J_URI || 'bolt://localhost:7687'
    const neo4jUser = process.env.NEO4J_USER || 'neo4j'
    const neo4jPassword = process.env.NEO4J_PASSWORD || 'password'

    // Check if Neo4j environment variables are configured
    if (!process.env.NEO4J_URI || !process.env.NEO4J_USER || !process.env.NEO4J_PASSWORD) {
      console.warn('Neo4j environment variables not configured, returning mock data')
      return NextResponse.json({
        nodes: [
          // States
          { id: 'state-ca', name: 'California', type: 'state', value: 1200, color: '#2563EB' },
          { id: 'state-ny', name: 'New York', type: 'state', value: 980, color: '#2563EB' },
          { id: 'state-tx', name: 'Texas', type: 'state', value: 850, color: '#2563EB' },
          
          // Counties
          { id: 'county-la', name: 'Los Angeles County', type: 'county', value: 450, color: '#10B981' },
          { id: 'county-sd', name: 'San Diego County', type: 'county', value: 320, color: '#10B981' },
          { id: 'county-ny', name: 'New York County', type: 'county', value: 520, color: '#10B981' },
          { id: 'county-harris', name: 'Harris County', type: 'county', value: 380, color: '#10B981' },
          
          // Zipcodes
          { id: 'zip-90001', name: '90001', type: 'zipcode', value: 120, color: '#FACC15' },
          { id: 'zip-92101', name: '92101', type: 'zipcode', value: 95, color: '#FACC15' },
          { id: 'zip-10001', name: '10001', type: 'zipcode', value: 180, color: '#FACC15' },
          { id: 'zip-77001', name: '77001', type: 'zipcode', value: 140, color: '#FACC15' },
          
          // Hospitals
          { id: 'hosp-1', name: 'Memorial Hospital', type: 'hospital', value: 45, color: '#8B5CF6' },
          { id: 'hosp-2', name: 'General Medical Center', type: 'hospital', value: 38, color: '#8B5CF6' },
          { id: 'hosp-3', name: 'St. Mary Medical', type: 'hospital', value: 52, color: '#8B5CF6' },
          { id: 'hosp-4', name: 'City Hospital', type: 'hospital', value: 41, color: '#8B5CF6' },
          { id: 'hosp-5', name: 'Regional Healthcare', type: 'hospital', value: 36, color: '#8B5CF6' },
          
          // Drugs
          { id: 'drug-1', name: 'Lipitor', type: 'drug', value: 850, color: '#EC4899' },
          { id: 'drug-2', name: 'Metformin', type: 'drug', value: 720, color: '#EC4899' },
          { id: 'drug-3', name: 'Lisinopril', type: 'drug', value: 680, color: '#EC4899' },
          { id: 'drug-4', name: 'Amlodipine', type: 'drug', value: 590, color: '#EC4899' },
        ],
        links: [
          // State to County connections
          { source: 'state-ca', target: 'county-la', value: 12 },
          { source: 'state-ca', target: 'county-sd', value: 8 },
          { source: 'state-ny', target: 'county-ny', value: 15 },
          { source: 'state-tx', target: 'county-harris', value: 10 },
          
          // County to Zipcode connections
          { source: 'county-la', target: 'zip-90001', value: 6 },
          { source: 'county-sd', target: 'zip-92101', value: 4 },
          { source: 'county-ny', target: 'zip-10001', value: 8 },
          { source: 'county-harris', target: 'zip-77001', value: 5 },
          
          // Zipcode to Hospital connections
          { source: 'zip-90001', target: 'hosp-1', value: 3 },
          { source: 'zip-90001', target: 'hosp-2', value: 2 },
          { source: 'zip-92101', target: 'hosp-3', value: 4 },
          { source: 'zip-10001', target: 'hosp-4', value: 3 },
          { source: 'zip-77001', target: 'hosp-5', value: 2 },
          
          // Hospital to Drug connections
          { source: 'hosp-1', target: 'drug-1', value: 15 },
          { source: 'hosp-1', target: 'drug-2', value: 12 },
          { source: 'hosp-2', target: 'drug-1', value: 8 },
          { source: 'hosp-2', target: 'drug-3', value: 10 },
          { source: 'hosp-3', target: 'drug-2', value: 14 },
          { source: 'hosp-3', target: 'drug-4', value: 7 },
          { source: 'hosp-4', target: 'drug-1', value: 11 },
          { source: 'hosp-4', target: 'drug-3', value: 9 },
          { source: 'hosp-5', target: 'drug-2', value: 9 },
          { source: 'hosp-5', target: 'drug-4', value: 6 },
        ],
      })
    }

    // Try to connect to Neo4j
    const neo4j = require('neo4j-driver')
    const driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword))
    
    const session = driver.session()
    
    try {
      // Query Neo4j for graph data
      const result = await session.run(`
        MATCH (n)-[r]->(m)
        RETURN n, r, m
        LIMIT 100
      `)
      
      const nodes: any[] = []
      const links: any[] = []
      const nodeMap = new Map()
      
      // Process Neo4j results
      result.records.forEach((record: any) => {
        // Add source node
        if (record.get('n')) {
          const node = record.get('n')
          const nodeId = node.identity.toString()
          if (!nodeMap.has(nodeId)) {
            nodes.push({
              id: nodeId,
              name: node.properties.name || node.properties.title || `Node ${nodeId}`,
              type: node.labels[0] || 'unknown',
              value: Math.floor(Math.random() * 1000) + 100, // Random value for demo
              color: getNodeColor(node.labels[0] || 'unknown')
            })
            nodeMap.set(nodeId, true)
          }
        }
        
        // Add target node
        if (record.get('m')) {
          const node = record.get('m')
          const nodeId = node.identity.toString()
          if (!nodeMap.has(nodeId)) {
            nodes.push({
              id: nodeId,
              name: node.properties.name || node.properties.title || `Node ${nodeId}`,
              type: node.labels[0] || 'unknown',
              value: Math.floor(Math.random() * 1000) + 100,
              color: getNodeColor(node.labels[0] || 'unknown')
            })
            nodeMap.set(nodeId, true)
          }
        }
        
        // Add relationship
        if (record.get('r')) {
          const rel = record.get('r')
          links.push({
            source: rel.start.toString(),
            target: rel.end.toString(),
            value: Math.floor(Math.random() * 20) + 1,
            type: rel.type
          })
        }
      })
      
      await session.close()
      await driver.close()
      
      return NextResponse.json({
        nodes,
        links
      })
      
    } catch (neo4jError) {
      console.error('Neo4j query error:', neo4jError)
      await session.close()
      await driver.close()
      
      // Return mock data on Neo4j error
      return NextResponse.json({
        nodes: [
          { id: 'mock-1', name: 'Mock Node 1', type: 'mock', value: 100, color: '#999' },
          { id: 'mock-2', name: 'Mock Node 2', type: 'mock', value: 200, color: '#999' },
        ],
        links: [
          { source: 'mock-1', target: 'mock-2', value: 5 }
        ]
      })
    }
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch graph data' },
      { status: 500 }
    )
  }
}

function getNodeColor(label: string): string {
  const colors: Record<string, string> = {
    'State': '#2563EB',
    'County': '#10B981',
    'Zipcode': '#FACC15',
    'Hospital': '#8B5CF6',
    'Drug': '#EC4899',
    'Person': '#F59E0B',
    'Organization': '#EF4444',
    'Location': '#06B6D4',
    'unknown': '#999999'
  }
  return colors[label] || '#999999'
}
