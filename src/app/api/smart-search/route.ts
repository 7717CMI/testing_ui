import { NextRequest, NextResponse } from 'next/server'
import { parseQuery } from '@/lib/smart-search/query-parser'
import { queryDatabase } from '@/lib/smart-search/db-query-builder'
import { detectGaps, fillGapsWithWebSearch } from '@/lib/smart-search/gap-detector'
import { mergeData } from '@/lib/smart-search/response-merger'
import { formatResponse } from '@/lib/smart-search/response-formatter'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { query, conversationHistory = [], sessionId } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Please provide a search query.'
      }, { status: 400 })
    }

    console.log(`\n[Smart Search] ==================`)
    console.log(`[Smart Search] Session: ${sessionId}`)
    console.log(`[Smart Search] Query: "${query}"`)

    // STEP 1: Parse user query (with spell correction)
    console.log('[Smart Search] Step 1: Parsing query...')
    const parsedQuery = await parseQuery(query)
    console.log(`[Smart Search] Parsed intent: ${parsedQuery.intent}`)
    console.log(`[Smart Search] Corrected query: "${parsedQuery.correctedQuery}"`)
    console.log(`[Smart Search] Requested fields: ${parsedQuery.requestedFields.join(', ')}`)

    // STEP 2: Query database with fuzzy matching
    console.log('[Smart Search] Step 2: Querying database...')
    const dbResult = await queryDatabase(parsedQuery)
    console.log(`[Smart Search] Found ${dbResult.totalCount} facilities in ${dbResult.queryExecutionTime}ms`)

    if (dbResult.totalCount === 0) {
      return NextResponse.json({
        success: true,
        response: `I couldn't find any facilities matching "${query}". Here are some suggestions:

• Check the spelling of the facility name
• Try a broader search (e.g., just the city or state)
• Search by facility type (e.g., "hospitals in California")

Would you like to try a different search?`,
        facilities: [],
        metadata: {
          resultsCount: 0,
          gapsFilled: 0,
          intent: parsedQuery.intent,
          executionTime: Date.now() - startTime,
          correctedQuery: parsedQuery.correctedQuery !== parsedQuery.originalQuery 
            ? parsedQuery.correctedQuery 
            : null
        }
      })
    }

    // STEP 3: Detect missing fields
    console.log('[Smart Search] Step 3: Detecting data gaps...')
    const gaps = detectGaps(
      dbResult.facilities,
      parsedQuery.requestedFields,
      dbResult.availableFields
    )
    console.log(`[Smart Search] Detected ${gaps.length} facilities with missing data`)

    // STEP 4: Fill gaps with web search (if needed)
    let webData = new Map()
    if (gaps.length > 0 && process.env.PERPLEXITY_API_KEY) {
      console.log('[Smart Search] Step 4: Filling gaps with web search...')
      try {
        webData = await fillGapsWithWebSearch(gaps)
        console.log(`[Smart Search] Enriched ${webData.size} facilities`)
      } catch (error) {
        console.error('[Smart Search] Web search failed:', error)
        // Continue without web enrichment
      }
    } else if (gaps.length > 0) {
      console.log('[Smart Search] Step 4: Skipping web search (no API key)')
    }

    // STEP 5: Merge data seamlessly
    console.log('[Smart Search] Step 5: Merging data...')
    const mergedFacilities = mergeData(dbResult.facilities, webData)

    // STEP 6: Format response with LLM
    console.log('[Smart Search] Step 6: Formatting response...')
    const formattedResponse = await formatResponse(
      query,
      mergedFacilities,
      conversationHistory
    )

    const totalTime = Date.now() - startTime
    console.log(`[Smart Search] Total execution time: ${totalTime}ms`)
    console.log(`[Smart Search] ==================\n`)

    return NextResponse.json({
      success: true,
      response: formattedResponse,
      facilities: mergedFacilities.map(f => {
        const { _meta, ...publicData } = f
        return publicData
      }),
      metadata: {
        resultsCount: dbResult.totalCount,
        gapsFilled: webData.size,
        intent: parsedQuery.intent,
        executionTime: totalTime,
        dbQueryTime: dbResult.queryExecutionTime,
        correctedQuery: parsedQuery.correctedQuery !== parsedQuery.originalQuery 
          ? parsedQuery.correctedQuery 
          : null
      }
    })
  } catch (error: any) {
    console.error('[Smart Search] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Search failed. Please try rephrasing your question.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// GET method for testing
export async function GET() {
  return NextResponse.json({
    message: 'Smart Search API is running',
    endpoints: {
      POST: '/api/smart-search',
      body: {
        query: 'Your search query (required)',
        conversationHistory: 'Array of previous messages (optional)',
        sessionId: 'Unique session ID (optional)'
      }
    },
    example: {
      query: 'Tell me about Mayo Clinic',
      conversationHistory: [],
      sessionId: 'session-123'
    }
  })
}
