import { getOpenAIClient, safeOpenAICall } from './openai-client'

export interface ParsedQuery {
  intent: 'facility_lookup' | 'list_facilities' | 'comparison' | 'analysis'
  entity?: {
    name?: string
    type?: string
    npi?: string
  }
  requestedFields: string[]
  location?: {
    city?: string
    state?: string
    zipCode?: string
  }
  filters?: {
    facilityType?: string[]
    ownership?: string[]
    bedCountMin?: number
    bedCountMax?: number
    revenueMin?: number // in millions
    revenueMax?: number // in millions
  }
  limit?: number
  originalQuery: string
  correctedQuery: string
}

// 1. Spell correction function with proper error handling
async function correctSpelling(query: string): Promise<string> {
  return safeOpenAICall(
    async (client) => {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a spell checker for healthcare facility searches.
Correct typos and misspellings in queries about healthcare facilities, cities, and states.

Common corrections:
- "Mayo Clnic" → "Mayo Clinic"
- "Cleaveland" → "Cleveland"
- "Nwe York" → "New York"
- "hopital" → "hospital"
- "cilinic" → "clinic"
- "Rocester" → "Rochester"
- "Minesota" → "Minnesota"

If the query has no errors, return it unchanged.
Return ONLY the corrected query text, nothing else.`
          },
          { role: 'user', content: query }
        ],
        temperature: 0.1,
        max_tokens: 200
      })

      return response.choices[0].message.content?.trim() || query
    },
    query, // Fallback: return original query
    'Spell Correction'
  )
}

// 2. Main parser function
export async function parseQuery(
  userQuery: string,
  conversationHistory: any[] = []
): Promise<ParsedQuery> {
  try {
    // Step 1: Correct spelling
    const correctedQuery = await correctSpelling(userQuery)
    
    // Step 2: Build context from recent conversation
    const recentContext = conversationHistory
      .slice(-4)  // Last 2 exchanges (user + assistant)
      .map(m => `${m.role}: ${m.content.substring(0, 200)}`)  // Limit to 200 chars each
      .join('\n')
    
    // Step 3: Extract structured data WITH CONTEXT
    const systemPrompt = `Parse healthcare search queries into JSON.

CRITICAL: Use conversation context to resolve references like "these", "those", "them", "it", "their".

${recentContext ? `Previous conversation:\n${recentContext}\n` : ''}
Current query: "${correctedQuery}"

Instructions:
- If query references previous results (e.g., "how many beds", "show their phone numbers", "these clinics"), 
  extract facility type/location from the previous conversation
- Merge context with current query to build complete search parameters

IMPORTANT CITY NAME MAPPINGS (use these for location.city):
- "Manhattan" → "New York" (Manhattan is a borough of New York City)
- "Brooklyn" → "New York"
- "Queens" → "New York"
- "Bronx" → "New York"
- "Staten Island" → "New York"
- "NYC" → "New York"
- "LA" → "Los Angeles"
- "SF" → "San Francisco"
- "DC" → "Washington"

FACILITY TYPE MAPPINGS (use these for filters.facilityType):
- "urgent care" → ["Urgent Care", "Urgent Care Center"]
- "hospital" → ["Hospital", "Acute Care Hospital", "General Medical Hospital"]
- "clinic" → ["Clinic", "Outpatient Clinic", "Community Health Clinic"]
- "mental health" → ["Mental Health", "Mental Health Clinic", "Psychiatric"]
- "nursing home" → ["Nursing Home", "Skilled Nursing Facility", "SNF"]
- "pharmacy" → ["Pharmacy", "Drug Store"]

Database fields available:
- provider_name, npi_number
- business_address, business_city, business_state, business_zip_code
- business_phone, business_fax
- facility_category_name, facility_type_name
- entity_type_name (ownership)

Fields NOT in database (need web search):
- beds, bed_count, capacity
- specialties, services
- ratings, reviews
- emergency_services
- trauma_level
- revenue, income, sales (annual revenue in millions)

Return JSON with this exact structure:
{
  "intent": "list_facilities",
  "entity": {"name": "Mayo Clinic"},
  "requestedFields": ["name", "address", "phone"],
  "location": {"city": "Rochester", "state": "Minnesota"},
  "filters": {
    "facilityType": ["Urgent Care", "Urgent Care Center"]
  },
  "limit": 10
}

Intent types:
- "facility_lookup": Looking for specific facility by name
- "list_facilities": List facilities matching criteria (USE THIS for "find", "show me", "list")
- "comparison": Compare multiple facilities
- "analysis": Need analysis or insights

CONTEXT EXAMPLES:
1. Query: "Find urgent care in Manhattan"
   → Extract: {intent: "list_facilities", filters: {facilityType: ["Urgent Care", "Urgent Care Center"]}, location: {city: "New York", state: "New York"}}

2. Query: "Show me hospitals in California"
   → Extract: {intent: "list_facilities", filters: {facilityType: ["Hospital"]}, location: {state: "California"}}

3. Previous: "mental health clinics in California"
   Current: "how many beds do these clinics have"
   → Extract: {filters: {facilityType: ["Mental Health Clinic"]}, location: {state: "California"}, requestedFields: ["beds"]}

4. Previous: "hospitals in Texas"
   Current: "show me their phone numbers"
   → Extract: {filters: {facilityType: ["Hospital"]}, location: {state: "Texas"}, requestedFields: ["phone"]}`

    // Use safe OpenAI call with fallback
    const responseContent = await safeOpenAICall(
      async (client) => {
        const response = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: correctedQuery }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
          max_tokens: 1000
        })
        return response.choices[0].message.content || '{}'
      },
      '{}', // Fallback: empty JSON
      'Query Parsing'
    )

    let parsed: any
    try {
      parsed = JSON.parse(responseContent)
    } catch (parseError) {
      console.error('[Query Parser] JSON parse error:', parseError)
      console.error('[Query Parser] Response content:', responseContent.substring(0, 200))
      parsed = {}
    }
    
    // Normalize city names
    if (parsed.location?.city) {
      const cityMappings: Record<string, string> = {
        'manhattan': 'New York',
        'brooklyn': 'New York',
        'queens': 'New York',
        'bronx': 'New York',
        'staten island': 'New York',
        'nyc': 'New York',
        'la': 'Los Angeles',
        'sf': 'San Francisco',
        'dc': 'Washington'
      }
      const originalCity = parsed.location.city.toLowerCase()
      const normalizedCity = cityMappings[originalCity]
      if (normalizedCity) {
        parsed.location.city = normalizedCity
        // If Manhattan/Brooklyn/etc., also set state to NY
        if (['manhattan', 'brooklyn', 'queens', 'bronx', 'staten island', 'nyc'].includes(originalCity)) {
          parsed.location.state = 'New York'
        }
      }
    }
    
    // Normalize facility types
    if (parsed.filters?.facilityType) {
      const typeMappings: Record<string, string[]> = {
        'urgent care': ['Urgent Care', 'Urgent Care Center'],
        'hospital': ['Hospital', 'Acute Care Hospital', 'General Medical Hospital'],
        'clinic': ['Clinic', 'Outpatient Clinic', 'Community Health Clinic'],
        'mental health': ['Mental Health', 'Mental Health Clinic', 'Psychiatric'],
        'nursing home': ['Nursing Home', 'Skilled Nursing Facility', 'SNF'],
        'pharmacy': ['Pharmacy', 'Drug Store']
      }
      
      const normalizedTypes: string[] = []
      for (const type of parsed.filters.facilityType) {
        const lowerType = type.toLowerCase()
        if (typeMappings[lowerType]) {
          normalizedTypes.push(...typeMappings[lowerType])
        } else {
          normalizedTypes.push(type)
        }
      }
      parsed.filters.facilityType = [...new Set(normalizedTypes)] // Remove duplicates
    }
    
    console.log('[Query Parser] Parsed result:', JSON.stringify(parsed, null, 2))
    
    return {
      intent: parsed.intent || 'list_facilities',
      entity: parsed.entity,
      requestedFields: parsed.requestedFields || ['name', 'address', 'phone'],
      location: parsed.location,
      filters: parsed.filters,
      limit: parsed.limit || 10,
      originalQuery: userQuery,
      correctedQuery
    }
  } catch (error: any) {
    console.error('[Query Parser] ❌ Parsing failed:', {
      message: error.message,
      stack: error.stack,
      userQuery
    })
    
    // Enhanced fallback: Try to extract basic info from query
    const lowerQuery = userQuery.toLowerCase()
    const intent = lowerQuery.includes('find') || lowerQuery.includes('show') || lowerQuery.includes('list')
      ? 'list_facilities'
      : 'facility_lookup'
    
    // Extract location hints
    const stateMatch = userQuery.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g)
    const location = stateMatch && stateMatch.length > 0
      ? { state: stateMatch[stateMatch.length - 1] }
      : undefined
    
    // Extract facility type hints
    let facilityType: string[] | undefined
    if (lowerQuery.includes('hospital')) facilityType = ['Hospital']
    else if (lowerQuery.includes('clinic')) facilityType = ['Clinic']
    else if (lowerQuery.includes('urgent care')) facilityType = ['Urgent Care', 'Urgent Care Center']
    else if (lowerQuery.includes('pharmacy')) facilityType = ['Pharmacy']
    
    // Extract requested fields
    const requestedFields: string[] = ['name', 'address', 'phone']
    if (lowerQuery.includes('email') || lowerQuery.includes('mail')) {
      requestedFields.push('email')
    }
    if (lowerQuery.includes('bed')) {
      requestedFields.push('beds')
    }
    if (lowerQuery.includes('phone') || lowerQuery.includes('contact')) {
      requestedFields.push('phone')
    }
    
    return {
      intent,
      entity: { name: userQuery },
      requestedFields,
      location,
      filters: facilityType ? { facilityType } : undefined,
      limit: 10,
      originalQuery: userQuery,
      correctedQuery: userQuery
    }
  }
}

