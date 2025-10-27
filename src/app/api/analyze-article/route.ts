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

1. DETAILED SUMMARY (4-6 paragraphs):
Provide a thorough summary covering:
- What happened (key events, announcements, or developments)
- Who is involved (organizations, key decision-makers, stakeholders)
- When and where (timeline, locations, scope)
- Why it matters (significance, context, background)
- What changed (before/after, new developments, shifts)
- Key statistics, numbers, or metrics mentioned

2. DETAILED ANALYSIS (6-8 paragraphs):
Analyze the business and market implications:
- Market opportunity analysis: New markets, expansion opportunities, gaps
- Competitive landscape: Who benefits, who's affected, competitive positioning
- Decision-maker insights: Who makes purchasing decisions, budget holders
- Pain points and needs: What problems exist, what solutions are needed
- Timing and urgency: Why now, time-sensitive factors, windows of opportunity
- Financial implications: Budgets, funding, ROI considerations
- Technology and innovation impact: New tools, systems, modernization needs
- Regulatory and compliance factors: Requirements, constraints, obligations

3. SALES-FOCUSED RECOMMENDATIONS (8-12 specific action items):
Provide actionable steps for sales professionals:

A. IMMEDIATE ACTIONS (What to do now):
- Specific prospects to target (types of organizations, roles, departments)
- Key talking points and value propositions
- Urgency drivers (why they should act now)

B. OUTREACH STRATEGY (How to engage):
- Best channels and timing for outreach
- Stakeholders to contact (specific roles/titles)
- Questions to ask prospects
- How to position your solution

C. OPPORTUNITY QUALIFICATION (How to prioritize):
- Signals that indicate a qualified lead
- Red flags or disqualifiers
- Budget and timeline indicators

D. COMPETITIVE POSITIONING (How to win):
- Your competitive advantages to emphasize
- Common objections and how to address them
- Differentiation points

Format your response EXACTLY as follows:

DETAILED SUMMARY:
[Your comprehensive 4-6 paragraph summary here - be thorough and specific]

DETAILED ANALYSIS:
[Your in-depth 6-8 paragraph analysis here - focus on business implications and opportunities]

SALES-FOCUSED RECOMMENDATIONS:

IMMEDIATE ACTIONS:
- [Specific action 1 with clear next steps]
- [Specific action 2 with clear next steps]
- [Specific action 3 with clear next steps]

OUTREACH STRATEGY:
- [Specific outreach tactic 1]
- [Specific outreach tactic 2]
- [Specific outreach tactic 3]

OPPORTUNITY QUALIFICATION:
- [Qualification criterion 1]
- [Qualification criterion 2]
- [Qualification criterion 3]

COMPETITIVE POSITIONING:
- [Positioning strategy 1]
- [Positioning strategy 2]
- [Positioning strategy 3]`

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

  // Parse recommendations from all subsections
  const recommendations: string[] = []
  const lines = recommendationsText.split('\n')
  
  let currentSection = ''
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Check if it's a section header
    if (trimmed.match(/^(IMMEDIATE ACTIONS|OUTREACH STRATEGY|OPPORTUNITY QUALIFICATION|COMPETITIVE POSITIONING):/i)) {
      currentSection = trimmed.replace(':', '')
      continue
    }
    
    // Match bullet points (-, *, •, or numbered) or lettered items
    const match = trimmed.match(/^[-*•]\s*(.+)/) || 
                  trimmed.match(/^\d+\.\s*(.+)/) ||
                  trimmed.match(/^[A-D]\.\s*(.+)/i)
    
    if (match && match[1]) {
      const recommendation = match[1].trim()
      // Add section context to recommendation for clarity
      if (currentSection) {
        recommendations.push(`${recommendation}`)
      } else {
        recommendations.push(recommendation)
      }
    }
  }

  // If no recommendations parsed, create sales-focused fallbacks
  if (recommendations.length === 0) {
    recommendations.push('Target decision-makers at organizations mentioned in this article')
    recommendations.push('Use this development as a conversation starter in outreach')
    recommendations.push('Identify prospects facing similar challenges or opportunities')
    recommendations.push('Position your solution in context of these industry trends')
    recommendations.push('Follow up with existing prospects to discuss relevance')
    recommendations.push('Qualify leads based on alignment with these market dynamics')
    recommendations.push('Prepare objection handling for common concerns raised')
    recommendations.push('Update sales materials to reference this development')
  }

  return {
    summary,
    analysis,
    recommendations
  }
}

