import { NextRequest, NextResponse } from 'next/server'

interface AnalysisRequest {
  title: string
  content: string
  category: string
  sourceUrl?: string
}

interface ArticleAnalysis {
  summary: string
  analysis: string
  recommendations: string[]
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

    // Construct analysis prompt
    const analysisPrompt = `You are a healthcare industry analyst specializing in actionable intelligence for sales professionals. Analyze the following healthcare article and provide structured insights that help sales teams identify opportunities and take action.

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

CRITICAL: Keep summary SHORT (2-3 paragraphs max). Make recommendations SPECIFIC with real titles and roles.`

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
    const analysis = parseAnalysisResponse(analysisText)

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

function parseAnalysisResponse(text: string): ArticleAnalysis {
  // Extract sections using markers
  const summaryMatch = text.match(/DETAILED SUMMARY:?\s*([\s\S]*?)(?=\n\s*DETAILED ANALYSIS:)/i)
  const analysisMatch = text.match(/DETAILED ANALYSIS:?\s*([\s\S]*?)(?=\n\s*SALES-FOCUSED RECOMMENDATIONS:)/i)
  const recommendationsMatch = text.match(/SALES-FOCUSED RECOMMENDATIONS:?\s*([\s\S]*?)$/i)

  const summary = summaryMatch?.[1]?.trim() || 'Summary not available'
  const analysis = analysisMatch?.[1]?.trim() || 'Analysis not available'
  const recommendationsText = recommendationsMatch?.[1]?.trim() || ''

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

  return {
    summary,
    analysis,
    recommendations
  }
}

