import { NextRequest, NextResponse } from 'next/server'

interface AnalysisRequest {
  title: string
  content: string
  category: string
  sourceUrl?: string
}

interface StructuredData {
  events: Array<{
    date: string
    organization: string
    layoffs?: number
    closures?: number
    location: string
    type: string
  }>
  totals: {
    totalLayoffs?: number
    totalClosures?: number
    affectedOrganizations: number
    affectedStates: number
  }
  byOrganization: Array<{
    name: string
    layoffs?: number
    closures?: number
    location: string
  }>
  byLocation: Array<{
    state: string
    layoffs?: number
    closures?: number
    organizations: string[]
  }>
  timeline: Array<{
    date: string
    events: number
    totalLayoffs?: number
  }>
}

interface ArticleAnalysis {
  summary: string
  analysis: string
  recommendations: string[]
  structuredData?: StructuredData
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, category, sourceUrl }: AnalysisRequest = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const perplexityApiKey = process.env.PERPLEXITY_API_KEY

    if (!perplexityApiKey) {
      console.error('❌ PERPLEXITY_API_KEY not configured')
      return NextResponse.json(
        { success: false, error: 'API key not configured' },
        { status: 500 }
      )
    }

    console.log('🔍 Analyzing article:', title)

    // Construct analysis prompt with structured data extraction
    const analysisPrompt = `You are a healthcare industry analyst specializing in actionable intelligence for sales professionals. Analyze the following healthcare article and provide structured insights that help sales teams identify opportunities and take action.

IMPORTANT: Extract ALL numerical data, dates, organizations, and locations mentioned in the article. This data will be used for visualizations.

Article Title: "${title}"
Category: ${category}
${sourceUrl ? `Source: ${sourceUrl}` : ''}

Article Content:
${content}

Provide a comprehensive analysis in the following format:

1. DETAILED SUMMARY (2-3 crisp paragraphs MAXIMUM):
Provide a CONCISE but complete summary covering ONLY:
- What happened (key event/announcement in 2-3 sentences)
- Who is involved (organizations and key decision-makers)
- Key statistics or numbers (if mentioned)
- Why it matters (business impact in 1-2 sentences)

Keep it SHORT and CRISP. Do NOT write 4-6 paragraphs. MAXIMUM 3 paragraphs.

2. DETAILED ANALYSIS (4-5 paragraphs):
Analyze the business and market implications focusing on:
- Market opportunity: What new opportunities this creates
- Who benefits: Which organizations and why
- Decision-maker insights: Who holds the budget and makes decisions
- Pain points: What problems exist that can be solved
- Timing: Why this matters NOW and time-sensitive opportunities

3. SALES-FOCUSED RECOMMENDATIONS (EXACTLY 5-6 action items):
Provide SPECIFIC, ACTIONABLE steps with REAL outreach suggestions.

IMPORTANT: Include specific recommendations like:
- "Reach out to [Specific Role/Title like CEO Sam Thompson] at [Organization Type]"
- "Contact the VP of Operations at facilities implementing [specific technology]"
- "Schedule calls with CFOs at hospitals facing [specific challenge]"

Each recommendation should be:
✓ One clear action item
✓ Include specific titles/roles to contact (CEO, CFO, COO, VP, Director, etc.)
✓ Include the reason/value proposition
✓ Be immediately actionable

Format your response EXACTLY as follows:

DETAILED SUMMARY:
[Your SHORT 2-3 paragraph summary - keep it crisp and concise]

DETAILED ANALYSIS:
[Your 4-5 paragraph analysis - focus on actionable business insights]

SALES-FOCUSED RECOMMENDATIONS:
- Reach out to [Specific Role like CEO/CFO] at [Organization Type] about [Specific Value Proposition]. [Why now/urgency]
- Contact [Specific Title] at [Organization] to discuss [Specific Solution]. [Key benefit]
- Schedule meetings with [Decision Maker Role] at facilities [Specific Context]. [Opportunity]
- Connect with [Executive Title] at organizations [Specific Situation]. [Action item]
- Target [Specific Role] at [Organization Type] regarding [Specific Need]. [Value]
- Follow up with [Decision Maker] at [Context] to position [Solution]. [Benefit]

4. STRUCTURED DATA (JSON format):
Extract and provide ALL quantitative data in this EXACT JSON format:
{
  "events": [
    {
      "date": "YYYY-MM-DD or Month YYYY",
      "organization": "Organization Name",
      "layoffs": number (if mentioned),
      "closures": number (if mentioned),
      "location": "City, State or State",
      "type": "layoff" | "closure" | "expansion" | "merger" | "other"
    }
  ],
  "totals": {
    "totalLayoffs": number (sum of all layoffs),
    "totalClosures": number (sum of all closures),
    "affectedOrganizations": number (unique organizations),
    "affectedStates": number (unique states)
  },
  "byOrganization": [
    {
      "name": "Organization Name",
      "layoffs": number,
      "closures": number,
      "location": "State"
    }
  ],
  "byLocation": [
    {
      "state": "State Name",
      "layoffs": number,
      "closures": number,
      "organizations": ["Org1", "Org2"]
    }
  ],
  "timeline": [
    {
      "date": "YYYY-MM-DD or Month YYYY",
      "events": number (count of events on this date),
      "totalLayoffs": number (layoffs on this date)
    }
  ]
}

CRITICAL: 
- Keep summary SHORT (2-3 paragraphs max)
- Make recommendations SPECIFIC with real titles and roles
- Extract ALL numbers, dates, organizations, and locations from the article
- If no specific data is available, return empty arrays but include the structure
- Use "Unknown" for missing location/state data
- Format dates consistently (prefer YYYY-MM-DD or "Month YYYY")`

    // Call Perplexity API for analysis
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are an expert healthcare industry analyst and sales intelligence specialist. You help B2B sales professionals identify opportunities, understand market dynamics, and close deals. Your analysis is data-driven, actionable, and focused on revenue generation. You understand buyer psychology, organizational decision-making, and competitive positioning in healthcare markets. Provide detailed, specific insights that sales teams can immediately use in their outreach and qualification processes.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3, // Balanced for analytical content
        max_tokens: 2500,
      })
    })

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text()
      console.error('❌ Perplexity API Error:', perplexityResponse.status, errorText)
      return NextResponse.json({
        success: false,
        error: 'Failed to generate analysis'
      }, { status: 500 })
    }

    const perplexityData = await perplexityResponse.json()
    const analysisText = perplexityData.choices?.[0]?.message?.content || ''

    console.log('✅ Analysis generated, length:', analysisText.length)

    // Parse the structured response
    const analysis = parseAnalysisResponse(analysisText, content || '')

    return NextResponse.json({
      success: true,
      data: analysis
    })

  } catch (error: any) {
    console.error('❌ Article analysis error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to analyze article'
    }, { status: 500 })
  }
}

function parseAnalysisResponse(text: string, originalContent: string): ArticleAnalysis {
  // Extract sections using markers - improved regex to handle various formats
  const summaryMatch = text.match(/DETAILED SUMMARY:?\s*\n?([\s\S]*?)(?=\n\s*DETAILED ANALYSIS:|$)/i) ||
                      text.match(/1\.\s*DETAILED SUMMARY:?\s*\n?([\s\S]*?)(?=\n\s*2\.|DETAILED ANALYSIS:|$)/i)
  
  const analysisMatch = text.match(/DETAILED ANALYSIS:?\s*\n?([\s\S]*?)(?=\n\s*SALES-FOCUSED RECOMMENDATIONS:|3\.|$)/i) ||
                       text.match(/2\.\s*DETAILED ANALYSIS:?\s*\n?([\s\S]*?)(?=\n\s*3\.|SALES-FOCUSED RECOMMENDATIONS:|$)/i)
  
  const recommendationsMatch = text.match(/SALES-FOCUSED RECOMMENDATIONS:?\s*\n?([\s\S]*?)(?=\n\s*4\.|STRUCTURED DATA:|$)/i) ||
                              text.match(/3\.\s*SALES-FOCUSED RECOMMENDATIONS:?\s*\n?([\s\S]*?)(?=\n\s*4\.|STRUCTURED DATA:|$)/i)

  let summary = summaryMatch?.[1]?.trim() || ''
  let analysis = analysisMatch?.[1]?.trim() || ''
  const recommendationsText = recommendationsMatch?.[1]?.trim() || ''

  // If summary/analysis are empty, try to extract from the full text
  if (!summary || summary === '') {
    // Try to get first few paragraphs as summary
    const paragraphs = originalContent.split('\n\n').filter(p => p.trim().length > 50)
    if (paragraphs.length > 0) {
      summary = paragraphs.slice(0, 2).join('\n\n')
    } else {
      summary = 'Summary not available'
    }
  }

  if (!analysis || analysis === '') {
    // Try to get more paragraphs as analysis
    const paragraphs = originalContent.split('\n\n').filter(p => p.trim().length > 50)
    if (paragraphs.length > 2) {
      analysis = paragraphs.slice(2, 5).join('\n\n')
    } else {
      analysis = 'Analysis not available'
    }
  }

  // Parse recommendations - simpler format now
  const recommendations: string[] = []
  const lines = recommendationsText.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Skip empty lines and section headers
    if (!trimmed || trimmed.match(/^(IMMEDIATE ACTIONS|OUTREACH STRATEGY|OPPORTUNITY QUALIFICATION|COMPETITIVE POSITIONING):/i)) {
      continue
    }
    
    // Match bullet points (-, *, •, or numbered)
    const match = trimmed.match(/^[-*•]\s*(.+)/) || 
                  trimmed.match(/^\d+\.\s*(.+)/)
    
    if (match && match[1]) {
      const recommendation = match[1].trim()
      recommendations.push(recommendation)
    }
  }

  // If no recommendations parsed, create actionable fallbacks with specific roles
  if (recommendations.length === 0) {
    recommendations.push('Reach out to the CEO or VP of Operations at organizations mentioned in this article to discuss how these developments impact their strategy')
    recommendations.push('Contact CFOs at similar healthcare facilities to discuss budget planning for initiatives related to this trend')
    recommendations.push('Schedule meetings with Chief Medical Officers or Clinical Directors to understand their technology adoption plans')
    recommendations.push('Connect with procurement teams at hospital systems to position solutions aligned with these market shifts')
    recommendations.push('Target Healthcare IT Directors at facilities facing similar operational challenges mentioned in the article')
    recommendations.push('Follow up with existing prospects who fit this profile to share this relevant industry insight and reopen conversations')
  }

  // Limit to 6 recommendations maximum
  if (recommendations.length > 6) {
    recommendations.splice(6)
  }

  // Extract structured data
  const structuredData = extractStructuredData(text, originalContent)

  // Validate structured data - only include if it has meaningful values
  const validatedStructuredData = structuredData && (
    (structuredData.events && structuredData.events.some((e: any) => (e.layoffs && e.layoffs > 0) || (e.closures && e.closures > 0))) ||
    (structuredData.totals && ((structuredData.totals.totalLayoffs && structuredData.totals.totalLayoffs > 0) || (structuredData.totals.totalClosures && structuredData.totals.totalClosures > 0))) ||
    (structuredData.byOrganization && structuredData.byOrganization.some((org: any) => (org.layoffs && org.layoffs > 0) || (org.closures && org.closures > 0))) ||
    (structuredData.byLocation && structuredData.byLocation.some((loc: any) => (loc.layoffs && loc.layoffs > 0) || (loc.closures && loc.closures > 0))) ||
    (structuredData.timeline && structuredData.timeline.some((t: any) => (t.totalLayoffs && t.totalLayoffs > 0) || (t.events && t.events > 0)))
  ) ? structuredData : undefined

  return {
    summary,
    analysis,
    recommendations,
    structuredData: validatedStructuredData
  }
}

function extractStructuredData(text: string, originalContent: string): StructuredData {
  try {
    // Try to find JSON in the response
    const jsonMatch = text.match(/STRUCTURED DATA[:\s]*(\{[\s\S]*\})/i) || 
                     text.match(/\{[\s\S]*"events"[\s\S]*"timeline"[\s\S]*\}/)
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0]
      const parsed = JSON.parse(jsonStr)
      return parsed
    }
  } catch (error) {
    console.log('Could not parse structured data from AI response, extracting manually')
  }

  // Fallback: Extract data manually from content
  return extractDataManually(originalContent)
}

function extractDataManually(content: string): StructuredData {
  const events: StructuredData['events'] = []
  const organizations = new Set<string>()
  const states = new Set<string>()
  const byOrgMap = new Map<string, { layoffs?: number; closures?: number; location: string }>()
  const byLocationMap = new Map<string, { layoffs?: number; closures?: number; organizations: Set<string> }>()
  const timelineMap = new Map<string, { events: number; totalLayoffs?: number }>()

  // Extract numbers (layoffs, closures)
  const layoffPatterns = [
    /(\d+)\s*(?:positions?|jobs?|employees?|workers?)\s*(?:eliminated|laid off|cut|reduced)/gi,
    /layoffs?\s*(?:of|:)?\s*(\d+)/gi,
    /(\d+)\s*(?:people|employees?)\s*(?:lost|affected)/gi
  ]

  const closurePatterns = [
    /(\d+)\s*(?:facilities?|hospitals?|clinics?|centers?)\s*(?:closed|closing|closure)/gi,
    /closure\s*(?:of|:)?\s*(\d+)/gi
  ]

  // Extract organizations (common healthcare org patterns)
  const orgPatterns = [
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Health|Hospital|Medical|Center|System|Healthcare)/g,
    /(?:at|from|by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Health|Hospital|Medical)/g
  ]

  // Extract states
  const statePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z]{2}|[A-Z][a-z]+)\b/g

  // Extract dates
  const datePatterns = [
    /(?:in|on|by)\s+((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/gi,
    /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s+\d{4})/gi,
    /(\d{4})/g
  ]

  // Simple extraction (this is a basic implementation)
  // In production, you'd want more sophisticated NLP
  let eventCount = 0
  const lines = content.split('\n')
  
  for (const line of lines) {
    // Extract layoffs
    for (const pattern of layoffPatterns) {
      const matches = line.matchAll(pattern)
      for (const match of matches) {
        const count = parseInt(match[1])
        if (count > 0) {
          eventCount++
          events.push({
            date: new Date().toISOString().split('T')[0],
            organization: 'Unknown',
            layoffs: count,
            location: 'Unknown',
            type: 'layoff'
          })
        }
      }
    }

    // Extract closures
    for (const pattern of closurePatterns) {
      const matches = line.matchAll(pattern)
      for (const match of matches) {
        const count = parseInt(match[1])
        if (count > 0) {
          eventCount++
          events.push({
            date: new Date().toISOString().split('T')[0],
            organization: 'Unknown',
            closures: count,
            location: 'Unknown',
            type: 'closure'
          })
        }
      }
    }
  }

  // Calculate totals
  const totalLayoffs = events.reduce((sum, e) => sum + (e.layoffs || 0), 0)
  const totalClosures = events.reduce((sum, e) => sum + (e.closures || 0), 0)

  // Build byOrganization
  const byOrganization: StructuredData['byOrganization'] = []
  byOrgMap.forEach((data, org) => {
    byOrganization.push({
      name: org,
      ...data
    })
  })

  // Build byLocation
  const byLocation: StructuredData['byLocation'] = []
  byLocationMap.forEach((data, state) => {
    byLocation.push({
      state,
      layoffs: data.layoffs,
      closures: data.closures,
      organizations: Array.from(data.organizations)
    })
  })

  // Build timeline
  const timeline: StructuredData['timeline'] = []
  timelineMap.forEach((data, date) => {
    timeline.push({
      date,
      ...data
    })
  })

  // Sort timeline by date
  timeline.sort((a, b) => a.date.localeCompare(b.date))

  // Only return totals if we have actual numeric values
  const totals: any = {
    affectedOrganizations: organizations.size || 0,
    affectedStates: states.size || 0
  }
  
  if (totalLayoffs > 0) {
    totals.totalLayoffs = totalLayoffs
  }
  
  if (totalClosures > 0) {
    totals.totalClosures = totalClosures
  }

  // Filter out zero values from arrays
  const validEvents = events.filter(e => (e.layoffs && e.layoffs > 0) || (e.closures && e.closures > 0))
  const validByOrg = byOrganization.filter(org => (org.layoffs && org.layoffs > 0) || (org.closures && org.closures > 0))
  const validByLocation = byLocation.filter(loc => (loc.layoffs && loc.layoffs > 0) || (loc.closures && loc.closures > 0))
  const validTimeline = timeline.filter(t => (t.totalLayoffs && t.totalLayoffs > 0) || (t.events && t.events > 0))

  return {
    events: validEvents.slice(0, 20), // Limit to 20 events
    totals,
    byOrganization: validByOrg.slice(0, 10), // Top 10
    byLocation: validByLocation.slice(0, 10), // Top 10
    timeline: validTimeline.slice(0, 12) // Last 12 months
  }
}

