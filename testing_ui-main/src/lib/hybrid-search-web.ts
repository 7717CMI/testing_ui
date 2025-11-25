// Batch web search module for hybrid search system
// Handles efficient web searches when database doesn't have required data

import { pool } from './database'

export interface FacilityInfo {
  npi?: string
  name: string
  city: string
  state: string
  address?: string
}

export interface WebSearchResult {
  name: string
  city: string
  state: string
  [key: string]: any // Dynamic fields from web search
}

/**
 * Perform batch web search for multiple facilities
 * This is cost-effective because it's ONE API call for many facilities
 */
export async function batchWebSearch(
  facilities: FacilityInfo[],
  searchFields: string[],
  searchCriteria: string
): Promise<Map<string, WebSearchResult>> {
  
  if (!process.env.PERPLEXITY_API_KEY) {
    console.warn('⚠️ PERPLEXITY_API_KEY not configured, skipping web search')
    return new Map()
  }
  
  // Limit to top 50 to keep prompt size manageable and costs low
  const topFacilities = facilities.slice(0, 50)
  
  console.log(`🌐 Batch web search for [${searchFields.join(', ')}] across ${topFacilities.length} facilities`)
  
  // Build efficient batch prompt
  const facilityList = topFacilities
    .map((f, i) => `${i+1}. ${f.name}, ${f.city}, ${f.state}`)
    .join('\n')
  
  const fieldsToSearch = searchFields.join(', ')
  
  const prompt = `You are a healthcare data researcher with access to real-time web data. I have ${topFacilities.length} healthcare facilities from my database.

FACILITIES LIST:
${facilityList}

TASK: Find the following information for these facilities:
Fields needed: ${fieldsToSearch}
Search criteria: ${searchCriteria}

IMPORTANT:
- Search for REAL, current data (2024-2025)
- Use official sources: CMS.gov, hospital websites, state health departments
- If data is unavailable, set field to null (don't guess!)

Return ONLY valid JSON array (no markdown, no code blocks, no explanations):
[
  {
    "name": "Exact facility name",
    "city": "City",
    "state": "State",
    ${searchFields.map(f => `"${f}": <value or null>`).join(',\n    ')},
    "matches_criteria": true/false,
    "data_source": "Source URL or name",
    "last_updated": "2024 or 2025"
  }
]

Return data for ALL ${topFacilities.length} facilities in the list above.
CRITICAL: Return ONLY the JSON array, no other text.`

  try {
    const startTime = Date.now()
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar', // Sonar model has web search capability
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1, // Very precise, factual responses
        max_tokens: 4000, // Enough for 50 facilities with multiple fields
        return_citations: true, // Get sources for verification
        search_recency_filter: 'month', // Recent data only
      })
    })
    
    const elapsed = Date.now() - startTime
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Perplexity API error (${response.status}):`, errorText)
      return new Map()
    }
    
    const data = await response.json()
    const content = data.choices[0].message.content
    
    console.log(`✅ Web search completed in ${elapsed}ms`)
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = content
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                     content.match(/```\n([\s\S]*?)\n```/) ||
                     content.match(/\[[\s\S]*\]/)
    
    if (jsonMatch) {
      jsonText = jsonMatch[1] || jsonMatch[0]
    }
    
    // Parse results
    const results: WebSearchResult[] = JSON.parse(jsonText)
    console.log(`✅ Parsed ${results.length} results from web search`)
    
    // Create map: "facility-name-city-state" -> data
    const dataMap = new Map<string, WebSearchResult>()
    
    for (const result of results) {
      const key = createFacilityKey(result.name, result.city, result.state)
      dataMap.set(key, result)
    }
    
    console.log(`✅ Created lookup map with ${dataMap.size} entries`)
    
    return dataMap
    
  } catch (error: any) {
    console.error('❌ Batch web search failed:', error.message)
    console.error('Stack:', error.stack)
    return new Map()
  }
}

/**
 * Create a consistent key for facility lookup
 */
export function createFacilityKey(name: string, city: string, state: string): string {
  return `${name}-${city}-${state}`.toLowerCase().replace(/[^a-z0-9-]/g, '')
}

/**
 * Cache web search results to avoid repeated API calls
 * Saves to PostgreSQL for 90-day persistence
 */
export async function cacheWebSearchResults(
  facilityIdentifier: string, // NPI or unique ID
  field: string,
  value: any,
  source: string
): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query(`
      INSERT INTO web_search_cache (
        facility_identifier, 
        field_name, 
        field_value, 
        source, 
        cached_at,
        expires_at
      ) VALUES ($1, $2, $3, $4, NOW(), NOW() + INTERVAL '90 days')
      ON CONFLICT (facility_identifier, field_name) 
      DO UPDATE SET 
        field_value = EXCLUDED.field_value,
        source = EXCLUDED.source,
        cached_at = NOW(),
        expires_at = NOW() + INTERVAL '90 days'
    `, [
      facilityIdentifier, 
      field, 
      JSON.stringify(value), 
      source
    ])
    
    console.log(`💾 Cached ${field} for facility ${facilityIdentifier}`)
  } catch (error: any) {
    // Don't fail if cache table doesn't exist yet
    if (error.message.includes('relation "web_search_cache" does not exist')) {
      console.warn('⚠️ Cache table not created yet, skipping cache')
    } else {
      console.error('❌ Error caching web search result:', error.message)
    }
  } finally {
    client.release()
  }
}

/**
 * Check cache before making expensive web search
 * Returns cached data if available and not expired
 */
export async function checkWebSearchCache(
  facilityIdentifier: string,
  field: string
): Promise<any | null> {
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT 
        field_value, 
        source, 
        cached_at,
        expires_at
      FROM web_search_cache
      WHERE facility_identifier = $1 
        AND field_name = $2
        AND expires_at > NOW()
      LIMIT 1
    `, [facilityIdentifier, field])
    
    if (result.rows.length > 0) {
      const row = result.rows[0]
      console.log(`✅ Cache HIT for ${field} (facility: ${facilityIdentifier})`)
      console.log(`   Cached: ${row.cached_at}, Expires: ${row.expires_at}`)
      
      return JSON.parse(row.field_value)
    }
    
    console.log(`❌ Cache MISS for ${field} (facility: ${facilityIdentifier})`)
    return null
    
  } catch (error: any) {
    // Don't fail if cache table doesn't exist yet
    if (error.message.includes('relation "web_search_cache" does not exist')) {
      return null
    }
    console.error('❌ Error checking cache:', error.message)
    return null
  } finally {
    client.release()
  }
}

/**
 * Batch check cache for multiple facilities
 * More efficient than checking one by one
 */
export async function batchCheckCache(
  facilities: FacilityInfo[],
  fields: string[]
): Promise<Map<string, Record<string, any>>> {
  const client = await pool.connect()
  const cacheMap = new Map<string, Record<string, any>>()
  
  try {
    const facilityIds = facilities
      .map(f => f.npi)
      .filter(Boolean) as string[]
    
    if (facilityIds.length === 0) {
      return cacheMap
    }
    
    const result = await client.query(`
      SELECT 
        facility_identifier,
        field_name,
        field_value,
        source
      FROM web_search_cache
      WHERE facility_identifier = ANY($1)
        AND field_name = ANY($2)
        AND expires_at > NOW()
    `, [facilityIds, fields])
    
    // Organize by facility
    for (const row of result.rows) {
      const facilityId = row.facility_identifier
      if (!cacheMap.has(facilityId)) {
        cacheMap.set(facilityId, {})
      }
      const facilityCache = cacheMap.get(facilityId)!
      facilityCache[row.field_name] = JSON.parse(row.field_value)
      facilityCache[`${row.field_name}_source`] = row.source
    }
    
    console.log(`✅ Batch cache check: ${cacheMap.size} facilities with cached data`)
    
    return cacheMap
    
  } catch (error: any) {
    if (error.message.includes('relation "web_search_cache" does not exist')) {
      console.warn('⚠️ Cache table not created yet')
      return cacheMap
    }
    console.error('❌ Error in batch cache check:', error.message)
    return cacheMap
  } finally {
    client.release()
  }
}

/**
 * Get cache statistics for monitoring
 */
export async function getCacheStats(): Promise<{
  totalEntries: number
  fieldBreakdown: Record<string, number>
  oldestEntry: Date | null
  newestEntry: Date | null
  hitRate?: number
}> {
  const client = await pool.connect()
  try {
    const statsResult = await client.query(`
      SELECT 
        COUNT(*) as total_entries,
        MIN(cached_at) as oldest_entry,
        MAX(cached_at) as newest_entry
      FROM web_search_cache
      WHERE expires_at > NOW()
    `)
    
    const fieldResult = await client.query(`
      SELECT 
        field_name,
        COUNT(*) as count
      FROM web_search_cache
      WHERE expires_at > NOW()
      GROUP BY field_name
      ORDER BY count DESC
    `)
    
    const fieldBreakdown: Record<string, number> = {}
    for (const row of fieldResult.rows) {
      fieldBreakdown[row.field_name] = parseInt(row.count)
    }
    
    return {
      totalEntries: parseInt(statsResult.rows[0].total_entries),
      fieldBreakdown,
      oldestEntry: statsResult.rows[0].oldest_entry,
      newestEntry: statsResult.rows[0].newest_entry
    }
    
  } catch (error: any) {
    console.error('❌ Error getting cache stats:', error.message)
    return {
      totalEntries: 0,
      fieldBreakdown: {},
      oldestEntry: null,
      newestEntry: null
    }
  } finally {
    client.release()
  }
}
















