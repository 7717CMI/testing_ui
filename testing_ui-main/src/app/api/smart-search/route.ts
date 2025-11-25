import { NextRequest, NextResponse } from 'next/server'
import { parseQuery } from '@/lib/smart-search/query-parser'
import { queryDatabase } from '@/lib/smart-search/db-query-builder'
import { detectGaps, fillGapsWithWebSearch } from '@/lib/smart-search/gap-detector'
import { mergeData } from '@/lib/smart-search/response-merger'
import { formatResponse } from '@/lib/smart-search/response-formatter'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Validate OpenAI API key at the start
    const { getAPIKeyStatus } = await import('@/lib/smart-search/openai-client')
    const apiKeyStatus = getAPIKeyStatus()
    
    if (apiKeyStatus === 'missing' || apiKeyStatus === 'invalid') {
      console.error('[Smart Search] ❌ OpenAI API key issue:', apiKeyStatus)
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key is not configured or invalid. Please check your .env.local file and ensure OPENAI_API_KEY is set correctly.',
        details: process.env.NODE_ENV === 'development' 
          ? `Status: ${apiKeyStatus}. Make sure your .env.local file contains: OPENAI_API_KEY=sk-...`
          : undefined
      }, { status: 500 })
    }

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
    console.log(`[Smart Search] API Key Status: ${apiKeyStatus}`)

    // STEP 1: Parse user query (with spell correction and context)
    console.log('[Smart Search] Step 1: Parsing query with conversation context...')
    const parsedQuery = await parseQuery(query, conversationHistory)
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

    // STEP 3: Handle email requests specially (emails are not in database)
    const requestedEmail = parsedQuery.requestedFields.some(f => 
      ['email', 'emails', 'email_address', 'contact_email'].includes(f.toLowerCase())
    )
    
    if (requestedEmail && dbResult.totalCount > 0) {
      console.log('[Smart Search] Email requested - providing helpful message')
      return NextResponse.json({
        success: true,
        response: `I found ${dbResult.totalCount} facilities matching your query. However, email addresses are not available in our database for privacy and data protection reasons.

Here are the facilities I found:
${dbResult.facilities.slice(0, 5).map((f: any, i: number) => 
  `${i + 1}. ${f.name || f.provider_name || 'Unknown'}
   Location: ${f.city || f.business_city || 'N/A'}, ${f.state || f.business_state || 'N/A'}
   Phone: ${f.phone || f.business_phone || 'Not available'}`
).join('\n\n')}${dbResult.totalCount > 5 ? `\n\n...and ${dbResult.totalCount - 5} more facilities.` : ''}

To contact these facilities, I recommend:
• Calling the phone number provided
• Visiting their official website (if available)
• Using the facility's contact form on their website

Would you like me to search for their websites or provide more details about any specific facility?`,
        facilities: dbResult.facilities.map((f: any) => {
          const { _meta, ...publicData } = f
          return publicData
        }),
        metadata: {
          resultsCount: dbResult.totalCount,
          gapsFilled: 0,
          intent: parsedQuery.intent,
          executionTime: Date.now() - startTime,
          dbQueryTime: dbResult.queryExecutionTime,
          emailRequested: true
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
    console.error('[Smart Search] ❌ Error:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.constructor.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
    
    // Handle specific error types
    if (error.message?.includes('API key') || error.message?.includes('OPENAI_API_KEY')) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key is missing or invalid. Please check your .env.local file.',
        details: process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'Make sure OPENAI_API_KEY is set in your .env.local file'
      }, { status: 500 })
    }

    if (error.message?.includes('rate limit')) {
      return NextResponse.json({
        success: false,
        error: 'API rate limit exceeded. Please try again in a moment.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 429 })
    }

    if (error.message?.includes('authentication')) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API authentication failed. Please check your API key.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 401 })
    }

    // Generic error response
    return NextResponse.json({
      success: false,
      error: 'Search failed. Please try rephrasing your question.',
      details: process.env.NODE_ENV === 'development' 
        ? {
            message: error.message,
            status: error.status,
            code: error.code
          }
        : undefined
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
