// Hybrid Search API - Database First + Web Search for Missing Data
// Cost-effective approach: Query DB first (free), web search only when needed

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'
import { analyzeQuery, getDataSourceExplanation, estimateQueryCost } from '@/lib/hybrid-search-checker'
import { 
  batchWebSearch, 
  batchCheckCache, 
  cacheWebSearchResults,
  createFacilityKey,
  type FacilityInfo 
} from '@/lib/hybrid-search-web'

export async function POST(request: NextRequest) {
  try {
    const { query, context } = await request.json()
    
    console.log('🔍 Hybrid search query:', query)
    console.log('📋 Context:', context)
    
    // STAGE 1: Analyze what data is needed
    const analysis = analyzeQuery(query)
    const costEstimate = estimateQueryCost(analysis)
    const dataSourceExplanation = getDataSourceExplanation(analysis)
    
    console.log('📊 Query analysis:', {
      complexity: analysis.complexity,
      needsHybridSearch: analysis.needsHybridSearch,
      databaseFields: analysis.databaseFields.length,
      webFields: analysis.webFields.length,
      estimatedCost: costEstimate.totalCost
    })
    console.log(dataSourceExplanation)
    
    // STAGE 2: Query YOUR database first (always free and fast)
    const startDbTime = Date.now()
    const client = await pool.connect()
    let dbResults: FacilityInfo[] = []
    
    try {
      let sql = `
        SELECT 
          hp.id,
          hp.provider_name as name,
          hp.business_city as city,
          s.abbreviation as state,
          hp.business_address_line1 as address,
          hp.business_phone as phone,
          hp.business_fax as fax,
          ft.name as facility_type,
          fc.name as category,
          et.name as entity_type
        FROM healthcare_production.healthcare_providers hp
        LEFT JOIN healthcare_production.states s ON hp.business_state_id = s.id
        LEFT JOIN healthcare_production.facility_types ft ON hp.facility_type_id = ft.id
        LEFT JOIN healthcare_production.facility_categories fc ON hp.facility_category_id = fc.id
        LEFT JOIN healthcare_production.entity_types et ON hp.entity_type_id = et.id
        WHERE hp.is_active = true
      `
      
      const params: any[] = []
      let paramIdx = 1
      
      // Apply database filters from analysis
      for (const dbField of analysis.databaseFields) {
        if (dbField.value) {
          if (dbField.field === 'state') {
            sql += ` AND s.abbreviation = $${paramIdx++}`
            params.push(dbField.value.toUpperCase())
          } else if (dbField.field === 'city') {
            sql += ` AND hp.business_city ILIKE $${paramIdx++}`
            params.push(`%${dbField.value}%`)
          } else if (dbField.field === 'zipcode' || dbField.field === 'zip') {
            sql += ` AND hp.business_postal_code LIKE $${paramIdx++}`
            params.push(`${dbField.value}%`)
          }
        }
      }
      
      // Add facility type filter if specified in context
      if (context?.facilityType) {
        sql += ` AND ft.name ILIKE $${paramIdx++}`
        params.push(`%${context.facilityType}%`)
      }
      
      sql += ` ORDER BY hp.provider_name LIMIT 200`
      
      console.log('🗄️ Querying database with filters:', params)
      const result = await client.query(sql, params)
      dbResults = result.rows
      
      const dbTime = Date.now() - startDbTime
      console.log(`✅ Found ${dbResults.length} facilities in database (${dbTime}ms)`)
      
    } finally {
      client.release()
    }
    
    // If no database results, return early
    if (dbResults.length === 0) {
      return NextResponse.json({
        success: true,
        query,
        analysis: {
          complexity: analysis.complexity,
          usedDatabase: true,
          usedWebSearch: false,
          dataSourceExplanation
        },
        results: [],
        resultCount: 0,
        message: 'No facilities found in database matching the criteria',
        cost: costEstimate,
        performanceMs: Date.now() - startDbTime
      })
    }
    
    // STAGE 3: If web search needed, check cache first then do batch search
    let enrichedResults = dbResults
    let webSearchPerformed = false
    let cacheHits = 0
    let cacheMisses = 0
    
    if (analysis.needsHybridSearch && dbResults.length > 0) {
      const webFields = analysis.webFields.map(f => f.field)
      console.log('🌐 Web search needed for fields:', webFields)
      
      const startWebTime = Date.now()
      
      // Check cache for all facilities (batch operation)
      const facilitiesWithNPI = dbResults.filter(f => f.id)
      const cacheMap = await batchCheckCache(facilitiesWithNPI, webFields)
      
      // Identify which facilities need web search
      const needsWebSearch: FacilityInfo[] = []
      const facilitiesWithCache = new Set<string>()
      
      for (const facility of dbResults.slice(0, 50)) { // Limit to 50 for cost control
        const facilityId = facility.id?.toString() || ''
        const cachedData = cacheMap.get(facilityId)
        
        if (cachedData) {
          // Check if all required fields are cached
          const hasAllFields = webFields.every(field => cachedData[field] !== undefined)
          if (hasAllFields) {
            facilitiesWithCache.add(facilityId)
            cacheHits++
          } else {
            needsWebSearch.push(facility)
            cacheMisses++
          }
        } else {
          needsWebSearch.push(facility)
          cacheMisses++
        }
      }
      
      console.log(`📦 Cache stats: ${cacheHits} hits, ${cacheMisses} misses`)
      
      // Only do web search for facilities without complete cache
      if (needsWebSearch.length > 0) {
        console.log(`🌐 Performing batch web search for ${needsWebSearch.length} facilities`)
        
        // Build search criteria from analysis
        const searchCriteria = analysis.webFields.map(wf => {
          if (wf.operator && wf.value !== undefined) {
            if (wf.operator === 'BETWEEN' && Array.isArray(wf.value)) {
              return `${wf.field} between ${wf.value[0]} and ${wf.value[1]}`
            } else {
              return `${wf.field} ${wf.operator} ${wf.value}`
            }
          }
          return wf.searchTerm
        }).join(', ')
        
        const webData = await batchWebSearch(
          needsWebSearch,
          webFields,
          searchCriteria
        )
        
        webSearchPerformed = webData.size > 0
        const webTime = Date.now() - startWebTime
        console.log(`✅ Web search completed in ${webTime}ms, found data for ${webData.size} facilities`)
        
        // Merge web data with DB data
        enrichedResults = dbResults.map(facility => {
          const facilityId = facility.id?.toString() || ''
          
          // First check cache
          const cachedData = cacheMap.get(facilityId)
          if (cachedData && facilitiesWithCache.has(facilityId)) {
            return {
              ...facility,
              ...cachedData,
              data_source: 'database + cached_web',
              cache_hit: true
            }
          }
          
          // Then check web search results
          const key = createFacilityKey(facility.name, facility.city, facility.state)
          const webInfo = webData.get(key)
          
          if (webInfo) {
            // Cache this data for future use
            if (facilityId) {
              for (const field of webFields) {
                if (webInfo[field] !== undefined) {
                  cacheWebSearchResults(
                    facilityId,
                    field,
                    webInfo[field],
                    webInfo.data_source || 'Perplexity web search'
                  ).catch(err => console.error('Cache error:', err))
                }
              }
            }
            
            return {
              ...facility,
              ...webInfo,
              data_source: 'database + web',
              cache_hit: false
            }
          }
          
          // No web data available
          return {
            ...facility,
            data_source: 'database_only',
            cache_hit: false
          }
        })
        
        // Filter by web search criteria if specified
        const criteriaField = analysis.webFields.find(wf => wf.operator && wf.value !== undefined)
        if (criteriaField) {
          enrichedResults = enrichedResults.filter(f => {
            const fieldValue = f[criteriaField.field]
            if (fieldValue === null || fieldValue === undefined) return false
            
            if (criteriaField.operator === '>=') {
              return fieldValue >= criteriaField.value
            } else if (criteriaField.operator === '<=') {
              return fieldValue <= criteriaField.value
            } else if (criteriaField.operator === '=') {
              return fieldValue === criteriaField.value
            } else if (criteriaField.operator === 'BETWEEN' && Array.isArray(criteriaField.value)) {
              return fieldValue >= criteriaField.value[0] && fieldValue <= criteriaField.value[1]
            }
            return true
          })
        }
      } else {
        console.log('✅ All data available in cache, no web search needed!')
        
        // Merge cached data
        enrichedResults = dbResults.map(facility => {
          const facilityId = facility.id?.toString() || ''
          const cachedData = cacheMap.get(facilityId)
          
          if (cachedData) {
            return {
              ...facility,
              ...cachedData,
              data_source: 'database + cached_web',
              cache_hit: true
            }
          }
          
          return {
            ...facility,
            data_source: 'database_only',
            cache_hit: false
          }
        })
      }
    }
    
    const totalTime = Date.now() - startDbTime
    
    // STAGE 4: Return comprehensive results
    return NextResponse.json({
      success: true,
      query,
      analysis: {
        complexity: analysis.complexity,
        confidence: analysis.confidence,
        usedDatabase: true,
        usedWebSearch: webSearchPerformed,
        webSearchFields: analysis.webFields.map(f => f.field),
        dataSourceExplanation,
        cacheStats: {
          hits: cacheHits,
          misses: cacheMisses,
          hitRate: cacheHits + cacheMisses > 0 
            ? Math.round((cacheHits / (cacheHits + cacheMisses)) * 100) 
            : 0
        }
      },
      results: enrichedResults,
      resultCount: enrichedResults.length,
      dataBreakdown: {
        totalFromDB: dbResults.length,
        enrichedWithWeb: enrichedResults.filter(r => r.data_source === 'database + web').length,
        enrichedWithCache: enrichedResults.filter(r => r.data_source === 'database + cached_web').length,
        dbOnly: enrichedResults.filter(r => r.data_source === 'database_only').length
      },
      cost: {
        ...costEstimate,
        actualCost: webSearchPerformed ? costEstimate.webSearchCost : 0,
        savedByCaching: cacheHits * 0.002 // Each cache hit saves ~$0.002
      },
      performance: {
        totalMs: totalTime,
        breakdown: webSearchPerformed 
          ? 'Database query + web search + cache check'
          : 'Database query + cache check only'
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ Hybrid search error:', error)
    console.error('Stack:', error.stack)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}












