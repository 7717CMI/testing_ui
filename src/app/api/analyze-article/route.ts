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
    const analysisPrompt = `You are a healthcare industry analyst. Analyze the following healthcare article and provide structured insights.

Article Title: "${title}"
Category: ${category}
${sourceUrl ? `Source: ${sourceUrl}` : ''}

Article Content:
${content}

Provide a comprehensive analysis in the following format:

1. SUMMARY (2-3 sentences):
Provide a concise summary of the main points and key takeaways from this article.

2. ANALYSIS (4-6 paragraphs):
Analyze the significance of this development in the healthcare industry. Consider:
- Impact on healthcare delivery and patient care
- Market implications and competitive dynamics
- Regulatory and policy considerations
- Technology and innovation aspects (if applicable)
- Financial and business model implications
- Long-term trends and industry direction

3. RECOMMENDATIONS (5-7 specific action items):
Provide actionable recommendations for different stakeholders:
- Healthcare providers and facilities
- Healthcare administrators and executives
- Policy makers and regulators
- Investors and business leaders
- Patients and consumers

Format your response EXACTLY as follows:
SUMMARY:
[Your summary here]

ANALYSIS:
[Your detailed analysis here]

RECOMMENDATIONS:
- [Recommendation 1]
- [Recommendation 2]
- [Recommendation 3]
- [Recommendation 4]
- [Recommendation 5]
- [Recommendation 6]
- [Recommendation 7]`

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
            content: 'You are an expert healthcare industry analyst with deep knowledge of healthcare policy, market trends, technology adoption, and business strategy. Provide insightful, actionable analysis based on current industry dynamics and best practices. Be specific, data-driven, and practical in your recommendations.'
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
  const summaryMatch = text.match(/SUMMARY:?\s*([\s\S]*?)(?=\n\s*ANALYSIS:)/i)
  const analysisMatch = text.match(/ANALYSIS:?\s*([\s\S]*?)(?=\n\s*RECOMMENDATIONS:)/i)
  const recommendationsMatch = text.match(/RECOMMENDATIONS:?\s*([\s\S]*?)$/i)

  const summary = summaryMatch?.[1]?.trim() || 'Summary not available'
  const analysis = analysisMatch?.[1]?.trim() || 'Analysis not available'
  const recommendationsText = recommendationsMatch?.[1]?.trim() || ''

  // Parse recommendations (bullet points)
  const recommendations: string[] = []
  const lines = recommendationsText.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    // Match bullet points (-, *, •, or numbered)
    const match = trimmed.match(/^[-*•]\s*(.+)/) || trimmed.match(/^\d+\.\s*(.+)/)
    if (match && match[1]) {
      recommendations.push(match[1].trim())
    }
  }

  // Fallback: if no recommendations parsed, create generic ones
  if (recommendations.length === 0) {
    recommendations.push('Monitor this development closely for potential impact on operations')
    recommendations.push('Assess relevance to your organization\'s strategic goals')
    recommendations.push('Consider implications for compliance and regulatory requirements')
    recommendations.push('Evaluate opportunities for competitive advantage')
    recommendations.push('Stay informed of related industry trends and updates')
  }

  return {
    summary,
    analysis,
    recommendations
  }
}

