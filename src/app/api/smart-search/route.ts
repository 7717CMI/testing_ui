import { NextRequest, NextResponse } from 'next/server'
import { analyzeQuery, requiresWebSearch } from '@/lib/hybrid-search-checker'

interface SmartSearchRequest {
  query: string
  mode: 'search' | 'question' | 'autocomplete' | 'insights' | 'recommendations'
  context: {
    facilityType?: string
    category?: string
    currentFilters?: any
    currentResults?: number
    userSearchHistory?: string[]
  }
}

export async function POST(request: NextRequest) {
  let query = ''
  let mode: 'search' | 'question' | 'autocomplete' | 'insights' | 'recommendations' = 'search'
  let context: any = {}
  
  try {
    const requestData: SmartSearchRequest = await request.json()
    query = requestData.query
    mode = requestData.mode
    context = requestData.context
    
    // 🔍 CHECK IF HYBRID SEARCH IS NEEDED
    // If query mentions fields not in database (bed_count, ratings, etc), use hybrid search
    if (mode === 'search' && requiresWebSearch(query)) {
      console.log('🔄 Delegating to hybrid search (query requires web data)')
      
      try {
        // Call hybrid search API internally
        const hybridResponse = await fetch(new URL('/api/hybrid-search', request.url).toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, context })
        })
        
        if (hybridResponse.ok) {
          const hybridData = await hybridResponse.json()
          
          // Return in smart-search format
          return NextResponse.json({
            success: true,
            mode: 'search',
            answer: `Found ${hybridData.resultCount} facilities matching your criteria. ${hybridData.analysis.dataSourceExplanation}`,
            extractedFilters: {}, // Filters handled by hybrid search
            appliedFilters: hybridData.analysis.webSearchFields || [],
            suggestions: [
              `Try narrowing by specific location`,
              `Filter by additional criteria`,
              `View detailed facility information`
            ],
            results: hybridData.results,
            resultCount: hybridData.resultCount,
            hybridSearch: true,
            cost: hybridData.cost,
            performance: hybridData.performance,
            timestamp: new Date().toISOString()
          })
        }
      } catch (hybridError) {
        console.error('❌ Hybrid search failed, falling back to standard search:', hybridError)
        // Continue with standard search as fallback
      }
    }
    
    // Build system prompt based on mode
    let systemPrompt = ''
    let maxTokens = 500
    
    switch (mode) {
      case 'search':
        systemPrompt = `You are a healthcare facility search assistant. Extract search intent from natural language queries and return structured filters.

Context: User is viewing ${context.facilityType || 'facilities'} in ${context.category || 'healthcare'} category.
Current filters: ${JSON.stringify(context.currentFilters || {})}

Analyze the query and return a JSON object with:
{
  "extractedFilters": {
    "state": "string or null",
    "city": "string or null", 
    "hasPhone": boolean,
    "hasFax": boolean,
    "zipcode": "string or null"
  },
  "answer": "Brief explanation of what you understood (1-2 sentences)",
  "appliedFilters": ["list of filter names you applied"],
  "suggestions": ["3 related follow-up queries"]
}

Be precise and only extract filters that are clearly mentioned. Don't mention AI or technology names.`
        break
        
      case 'question':
        systemPrompt = `You are a healthcare data expert answering questions about facilities.

Context: ${context.facilityType || 'Facilities'} - ${context.currentResults || 0} results currently showing.
Filters applied: ${JSON.stringify(context.currentFilters || {})}

Answer the user's question concisely and factually. Return JSON:
{
  "answer": "Your detailed answer (2-4 sentences)",
  "keyPoints": ["3-4 bullet points summarizing key information"],
  "relatedQuestions": ["3 related questions users might ask"]
}

Base answers on healthcare industry knowledge. Be helpful and specific.`
        maxTokens = 800
        break
        
      case 'autocomplete':
        systemPrompt = `You are a search suggestion generator for healthcare facility searches.

Context: ${context.facilityType || 'facilities'} in ${context.category || 'healthcare'}
User is typing: "${query}"

Return JSON with predicted search completions:
{
  "suggestions": [
    "5-7 relevant search query completions",
    "Mix of: specific locations, facility features, common searches",
    "Order by relevance"
  ],
  "trending": ["2-3 popular searches in this category"]
}

Make suggestions natural and useful. Don't repeat the input exactly.`
        maxTokens = 300
        break
        
      case 'insights':
        systemPrompt = `You are a healthcare data analyst providing insights about facility search results.

Context: ${context.currentResults || 0} ${context.facilityType || 'facilities'} found
Category: ${context.category || 'healthcare'}
Filters: ${JSON.stringify(context.currentFilters || {})}

Provide data insights in JSON format:
{
  "mainInsight": "Key observation about the results (1 sentence)",
  "statistics": [
    "2-3 interesting statistics or patterns",
    "Focus on: distribution, concentration, common features"
  ],
  "recommendations": [
    "2-3 actionable suggestions based on the data",
    "Help users refine their search"
  ],
  "trends": "Brief note about trends in this category (1 sentence)"
}

Be analytical and helpful. Use healthcare industry knowledge.`
        maxTokens = 600
        break
        
      case 'recommendations':
        systemPrompt = `You are a recommendation engine for healthcare facilities.

Context: User searched for ${context.facilityType || 'facilities'}
Search history: ${JSON.stringify(context.userSearchHistory || [])}
Current location: ${context.currentFilters?.state || 'not specified'}

Generate recommendations in JSON:
{
  "similarFacilities": [
    "3-4 related facility types users might be interested in",
    "Explain why (brief reason for each)"
  ],
  "nearbyAreas": [
    "2-3 nearby cities/states worth exploring",
    "Brief reason for each"
  ],
  "relatedSearches": [
    "3-4 searches other users performed",
    "Make them relevant to current context"
  ],
  "tip": "One helpful tip for finding the right facility"
}

Be personalized and contextual. Focus on user needs.`
        maxTokens = 700
        break
    }

    // Call Perplexity API
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: mode === 'autocomplete' ? 0.7 : 0.3,
        max_tokens: maxTokens,
        return_citations: false,
        return_images: false,
      })
    })

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text()
      console.error('Perplexity API Error:', perplexityResponse.status, errorText)
      
      // Return fallback response instead of throwing error
      const fallbackResponse = getFallbackResponse(mode, query, context)
      return NextResponse.json({
        success: true,
        fallback: true,
        ...fallbackResponse,
        timestamp: new Date().toISOString()
      })
    }

    const data = await perplexityResponse.json()
    const aiResponse = data.choices[0].message.content
    
    // Parse AI response
    let parsedResponse
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                       aiResponse.match(/```\n([\s\S]*?)\n```/)
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse
      parsedResponse = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse)
      // Fallback response based on mode
      parsedResponse = getFallbackResponse(mode, query, context)
    }

    return NextResponse.json({
      success: true,
      mode,
      ...parsedResponse,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Smart search error:', error)
    
    // Return graceful fallback with success status
    const fallbackResponse = getFallbackResponse(mode, query, context)
    return NextResponse.json({
      success: true,
      fallback: true,
      ...fallbackResponse,
      timestamp: new Date().toISOString()
    })
  }
}

function getFallbackResponse(mode: string, query: string, context: any) {
  switch (mode) {
    case 'search':
      return {
        extractedFilters: {},
        answer: "I'll help you search for facilities. Try using the standard filters below.",
        appliedFilters: [],
        suggestions: [
          `Find ${context.facilityType || 'facilities'} with contact information`,
          `Show ${context.facilityType || 'facilities'} by state`,
          `Filter by specific cities`
        ]
      }
    case 'question':
      return {
        answer: "I'm having trouble processing your question right now. You can use the filters to narrow down results or export the data for detailed analysis.",
        keyPoints: [
          "Use the state and city filters to narrow results",
          "Export data to CSV for offline analysis",
          "Filter by phone availability for contact information"
        ],
        relatedQuestions: [
          "How do I filter by location?",
          "Can I export this data?",
          "What information is available for each facility?"
        ]
      }
    case 'autocomplete':
      return {
        suggestions: [
          `${context.facilityType || 'facilities'} in California`,
          `${context.facilityType || 'facilities'} with phone numbers`,
          `Top rated ${context.facilityType || 'facilities'}`,
          `${context.facilityType || 'facilities'} by city`
        ],
        trending: [
          "Search by state",
          "Filter by contact info"
        ]
      }
    case 'insights':
      return {
        mainInsight: `Currently showing ${context.currentResults || 0} ${context.facilityType || 'facilities'}`,
        statistics: [
          "Use filters to refine your search",
          "Export data for detailed analysis",
          "Bookmark facilities for later reference"
        ],
        recommendations: [
          "Try filtering by state or city",
          "Add phone filter to find contactable facilities"
        ],
        trends: "Healthcare facilities are distributed across all US states"
      }
    case 'recommendations':
      return {
        similarFacilities: [
          "Try exploring related facility categories",
          "Check different regions for more options"
        ],
        nearbyAreas: [
          "Expand search to neighboring states",
          "Consider metropolitan areas for more results"
        ],
        relatedSearches: [
          "Filter by availability",
          "Search by specialty",
          "Find facilities with specific services"
        ],
        tip: "Use multiple filters together to find exactly what you need"
      }
    default:
      return {}
  }
}

