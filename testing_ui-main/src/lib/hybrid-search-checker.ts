// Data availability checker for hybrid search system
// Determines which fields are in database vs need web search

export interface DataAvailability {
  field: string
  availableInDB: boolean
  requiresWebSearch: boolean
  estimatedCost: number
}

// Fields that exist in your PostgreSQL database
export const DATABASE_FIELDS_MAP: Record<string, string[]> = {
  // Basic info
  'name': ['provider_name', 'organization_name'],
  'organization': ['provider_name'],
  'provider': ['provider_name'],
  'facility': ['provider_name'],
  
  // Location
  'address': ['business_address_line1', 'business_city', 'business_state'],
  'city': ['business_city'],
  'state': ['business_state'],
  'zipcode': ['business_postal_code'],
  'zip': ['business_postal_code'],
  'location': ['business_city', 'business_state'],
  
  // Contact
  'phone': ['business_phone'],
  'telephone': ['business_phone'],
  'fax': ['business_fax'],
  'contact': ['business_phone', 'business_fax'],
  
  // Classification
  'type': ['facility_type_id', 'taxonomy_code'],
  'category': ['facility_category_id'],
  'specialty': ['taxonomy_code'],
  'entity': ['entity_type_id'],
  
  // Status
  'active': ['is_active'],
  'status': ['is_active'],
}

// Fields that require web search (not in your database)
export const WEB_SEARCH_FIELDS = [
  'bed_count',
  'beds',
  'capacity',
  'bed capacity',
  'number of beds',
  'rating',
  'reviews',
  'stars',
  'accreditation',
  'certified',
  'certification',
  'emergency_services',
  'emergency room',
  'er',
  'trauma level',
  'trauma center',
  'specialties',
  'services offered',
  'accepting_patients',
  'accepting new patients',
  'insurance_accepted',
  'insurance',
  'parking',
  'parking_available',
  'languages',
  'languages_spoken',
  'bilingual',
  'weekend_hours',
  'hours',
  'open hours',
  'patient_satisfaction',
  'patient reviews',
  'wait time',
  'surgery count',
  'procedures',
  'physicians',
  'doctors',
  'staff count',
]

export interface QueryAnalysis {
  databaseFields: Array<{
    field: string
    dbColumn: string
    value?: string
  }>
  webFields: Array<{
    field: string
    searchTerm: string
    operator?: string
    value?: any
  }>
  needsHybridSearch: boolean
  complexity: 'simple' | 'moderate' | 'complex'
  estimatedWebSearchCost: number
  confidence: number
}

/**
 * Analyze a user query to determine what data is available in DB vs needs web search
 */
export function analyzeQuery(query: string): QueryAnalysis {
  const lowerQuery = query.toLowerCase()
  
  const analysis: QueryAnalysis = {
    databaseFields: [],
    webFields: [],
    needsHybridSearch: false,
    complexity: 'simple',
    estimatedWebSearchCost: 0,
    confidence: 0.8
  }
  
  // Check for database fields
  for (const [keyword, dbColumns] of Object.entries(DATABASE_FIELDS_MAP)) {
    if (lowerQuery.includes(keyword)) {
      // Extract potential value
      const value = extractValueForField(query, keyword)
      analysis.databaseFields.push({
        field: keyword,
        dbColumn: dbColumns[0], // Use primary column
        value
      })
    }
  }
  
  // Check for web search fields
  for (const webField of WEB_SEARCH_FIELDS) {
    if (lowerQuery.includes(webField.toLowerCase())) {
      // Extract operator and value
      const { operator, value, searchTerm } = extractWebSearchCriteria(query, webField)
      
      analysis.webFields.push({
        field: webField,
        searchTerm,
        operator,
        value
      })
      analysis.needsHybridSearch = true
    }
  }
  
  // Determine complexity
  if (analysis.webFields.length > 2 || (analysis.databaseFields.length > 3 && analysis.webFields.length > 0)) {
    analysis.complexity = 'complex'
  } else if (analysis.webFields.length > 0) {
    analysis.complexity = 'moderate'
  }
  
  // Estimate cost (batch search = 1 call regardless of result count)
  if (analysis.needsHybridSearch) {
    analysis.estimatedWebSearchCost = 0.002 // Single batch call ~$0.002
  }
  
  return analysis
}

/**
 * Extract value for a specific field from query
 */
function extractValueForField(query: string, field: string): string | undefined {
  // State patterns
  const statePatterns = [
    /in\s+([A-Z]{2})\b/i,
    /state\s+(?:of\s+)?([A-Z]{2})\b/i,
    /(California|Texas|Florida|New York|Illinois|Pennsylvania)/i,
  ]
  
  // City patterns
  const cityPatterns = [
    /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*([A-Z]{2})?/i,
    /city\s+(?:of\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
  ]
  
  // Zipcode patterns
  const zipcodePatterns = [
    /(?:zip\s*code?|in)\s*(\d{5})/i,
    /(\d{5})\s*-\s*(\d{5})/i, // Zip range
  ]
  
  if (field === 'state' || field === 'location') {
    for (const pattern of statePatterns) {
      const match = query.match(pattern)
      if (match) return match[1]
    }
  }
  
  if (field === 'city') {
    for (const pattern of cityPatterns) {
      const match = query.match(pattern)
      if (match) return match[1]
    }
  }
  
  if (field === 'zipcode' || field === 'zip') {
    for (const pattern of zipcodePatterns) {
      const match = query.match(pattern)
      if (match) return match[0]
    }
  }
  
  return undefined
}

/**
 * Extract web search criteria (operator, value, search term)
 */
function extractWebSearchCriteria(query: string, field: string): {
  operator?: string
  value?: any
  searchTerm: string
} {
  const lowerQuery = query.toLowerCase()
  
  // Numeric comparisons
  const numericPatterns = {
    greaterThan: new RegExp(`(more than|above|over|greater than|\\+)\\s*(\\d+)\\s*${field}`, 'i'),
    lessThan: new RegExp(`(less than|below|under|fewer than)\\s*(\\d+)\\s*${field}`, 'i'),
    exactly: new RegExp(`(exactly|equal to|=)\\s*(\\d+)\\s*${field}`, 'i'),
    range: new RegExp(`(\\d+)\\s*-\\s*(\\d+)\\s*${field}`, 'i'),
  }
  
  // Try to find numeric criteria
  for (const [operator, pattern] of Object.entries(numericPatterns)) {
    const match = query.match(pattern)
    if (match) {
      if (operator === 'range') {
        return {
          operator: 'BETWEEN',
          value: [parseInt(match[1]), parseInt(match[2])],
          searchTerm: `${field} between ${match[1]} and ${match[2]}`
        }
      } else {
        return {
          operator: operator === 'greaterThan' ? '>=' : operator === 'lessThan' ? '<=' : '=',
          value: parseInt(match[2]),
          searchTerm: `${field} ${match[1]} ${match[2]}`
        }
      }
    }
  }
  
  // Boolean fields
  if (lowerQuery.includes(`with ${field}`) || lowerQuery.includes(`has ${field}`)) {
    return {
      operator: '=',
      value: true,
      searchTerm: `has ${field}`
    }
  }
  
  if (lowerQuery.includes(`without ${field}`) || lowerQuery.includes(`no ${field}`)) {
    return {
      operator: '=',
      value: false,
      searchTerm: `without ${field}`
    }
  }
  
  // Default: just search for the field
  return {
    searchTerm: field
  }
}

/**
 * Get cost estimate for a query
 */
export function estimateQueryCost(analysis: QueryAnalysis): {
  databaseCost: number
  webSearchCost: number
  totalCost: number
  breakdown: string
} {
  return {
    databaseCost: 0, // Always free
    webSearchCost: analysis.estimatedWebSearchCost,
    totalCost: analysis.estimatedWebSearchCost,
    breakdown: analysis.needsHybridSearch 
      ? `Database query (free) + 1 batch web search ($${analysis.estimatedWebSearchCost.toFixed(3)})`
      : 'Database query only (free)'
  }
}

/**
 * Check if a specific field requires web search
 */
export function requiresWebSearch(field: string): boolean {
  return WEB_SEARCH_FIELDS.some(webField => 
    field.toLowerCase().includes(webField.toLowerCase())
  )
}

/**
 * Get human-readable explanation of what data will be used
 */
export function getDataSourceExplanation(analysis: QueryAnalysis): string {
  if (!analysis.needsHybridSearch) {
    return `✅ All data available in database (instant, no cost)`
  }
  
  const dbFields = analysis.databaseFields.map(f => f.field).join(', ')
  const webFields = analysis.webFields.map(f => f.field).join(', ')
  
  return `🔄 Hybrid search:\n` +
         `  • Database: ${dbFields || 'location filters'}\n` +
         `  • Web search: ${webFields}\n` +
         `  • Cost: $${analysis.estimatedWebSearchCost.toFixed(3)} (1 batch call)`
}
















