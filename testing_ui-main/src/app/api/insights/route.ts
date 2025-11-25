import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'

// Cached function to fetch insights from Perplexity
const getCachedInsights = unstable_cache(
  async (facilityType: string, category: string) => {
    console.log(`🔍 Fetching fresh insights for: ${facilityType} / ${category}`)
    
    // Build contextual search query for Perplexity - explicitly request multiple categories
    const searchQuery = facilityType 
      ? `Search for at least 10-15 recent healthcare news articles about ${facilityType} facilities in the United States. MUST include:
- 3-4 articles about facility expansions, new openings, or capacity increases
- 3-4 articles about technology adoption, digital health, AI, or telehealth implementations
- 2-3 articles about policy changes, regulations, or compliance updates
- 2-3 articles about funding, investments, or market trends
Search multiple sources and dates to find diverse, recent articles from the last 30 days.`
      : `Search for at least 10-15 recent healthcare industry news articles in the United States. MUST include:
- 3-4 articles about hospital/clinic expansions, new facility openings, or capacity increases
- 3-4 articles about technology adoption, digital health, AI, telehealth, or health IT implementations
- 2-3 articles about healthcare policy changes, regulations, CMS updates, or compliance requirements
- 2-3 articles about healthcare funding, investments, mergers, or market trends
Search multiple sources (Modern Healthcare, Becker's, Healthcare Dive, etc.) and dates to find diverse, recent articles from the last 30 days.`

    const systemPrompt = `You are a healthcare industry news API. You MUST return ONLY valid JSON, no explanations.

Search the web for REAL news articles about "${facilityType || 'healthcare facilities'}" in the United States healthcare industry.

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON - NO markdown, NO explanations, NO text before or after JSON
2. Return EXACTLY 10-15 articles - this is MANDATORY. Search multiple sources, dates, and topics to find enough articles
3. CATEGORY DISTRIBUTION REQUIRED:
   - At least 3-4 articles with category "Expansion" (facility openings, expansions, new locations)
   - At least 3-4 articles with category "Technology" (AI, telehealth, digital health, health IT)
   - At least 2-3 articles with category "Policy" or "Regulation" (CMS updates, regulations, compliance)
   - Remaining articles can be "Funding", "M&A", or "Market Trend"
4. If you cannot find ANY articles, return empty arrays: {"articles": [], "trending": [], "marketInsights": {...}}
5. NEVER explain why you can't find articles - just return empty JSON structure
6. Extract COMPLETE article text when available from your search results
7. Use ACTUAL dates, sources, and URLs from real articles you find
8. Search multiple reputable sources: Modern Healthcare, Becker's Healthcare, Healthcare Dive, STAT News, Fierce Healthcare, etc.
9. Include articles from different dates within the last 30 days to ensure variety

REQUIRED JSON FORMAT (copy this structure exactly):
{
  "articles": [
    {
      "title": "Exact headline from source",
      "summary": "First 2-3 sentences from article",
      "fullContent": "Complete article text with all paragraphs...",
      "category": "Expansion",
      "date": "2025-10-20",
      "source": "Publication Name",
      "sourceUrl": "https://example.com/article",
      "views": 10000,
      "trending": true
    }
  ],
  "trending": [
    {"name": "Topic", "count": 100, "category": "Category", "trend": "up", "changePercent": 5}
  ],
  "marketInsights": {
    "total_facilities_mentioned": 100,
    "recent_expansions": 10,
    "technology_adoptions": 5,
    "policy_changes": 3
  },
  "lastUpdated": "2025-10-23T00:00:00Z"
}

CRITICAL: Return ONLY the JSON object above. NO explanations. NO apologies. NO markdown code blocks.

MANDATORY REQUIREMENTS:
- You MUST return EXACTLY 10-15 articles in the "articles" array
- You MUST include at least 3-4 "Expansion" category articles
- You MUST include at least 3-4 "Technology" category articles  
- You MUST include at least 2-3 "Policy" or "Regulation" category articles
- Search multiple sources and dates to meet these requirements
- If you find fewer than 10 articles, continue searching different sources and topics until you have at least 10

If no articles found, return: {"articles":[],"trending":[],"marketInsights":{"total_facilities_mentioned":0,"recent_expansions":0,"technology_adoptions":0,"policy_changes":0},"lastUpdated":"${new Date().toISOString()}"}`

    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: searchQuery }
        ],
        temperature: 0.2, // Lower temperature for more factual content
        max_tokens: 8000, // Increased to accommodate 10+ articles with full content
        return_citations: true,
        return_images: false,
        search_recency_filter: "month", // Only search recent articles (last month)
      })
    })

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text()
      console.error('❌ Perplexity API Error (Insights):', perplexityResponse.status, errorText)
      throw new Error(`Perplexity API Error: ${perplexityResponse.status} ${errorText}`)
    }

    const data = await perplexityResponse.json()
    console.log('✅ Perplexity API Success (Insights) - Got response')
    const aiResponse = data.choices[0].message.content

    // Parse the AI response
    let insights
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      
      // If response starts with explanatory text, try to extract JSON
      if (!cleanedResponse.startsWith('{')) {
        // Look for JSON object in the response
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          cleanedResponse = jsonMatch[0]
          console.log('⚠️ Extracted JSON from explanatory text')
        } else {
          throw new Error('No JSON object found in response')
        }
      }
      
      insights = JSON.parse(cleanedResponse)
      return {
        data: insights,
        citations: data.citations || []
      }
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError)
      console.log('❌ Raw response (first 500 chars):', aiResponse.substring(0, 500))
      throw parseError
    }
  },
  ['insights-cache-v1'], // Cache key prefix
  {
    revalidate: 7200, // Cache for 2 hours (3600 * 2)
    tags: ['insights']
  }
)

export async function POST(request: NextRequest) {
  try {
    const { facilityType, category } = await request.json()

    try {
      const result = await getCachedInsights(facilityType || '', category || '')
      
      return NextResponse.json({
        success: true,
        fallback: false,
        data: result.data,
        citations: result.citations,
        timestamp: new Date().toISOString()
      })
    } catch (error: any) {
      console.error('❌ Error fetching cached insights:', error)
      // Fallback to empty/error state if cache/fetch fails
      return NextResponse.json({
        success: true,
        fallback: true,
        data: {
          articles: [],
          trending: [],
          marketInsights: {
            total_facilities_mentioned: 0,
            recent_expansions: 0,
            technology_adoptions: 0,
            policy_changes: 0
          },
          lastUpdated: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      })
    }

  } catch (error: any) {
    console.error('❌ Insights API error:', error)
    console.error('❌ Error details:', error.message)
    return NextResponse.json({
      success: true,
      fallback: true,
      data: {
        articles: [],
        trending: [],
        marketInsights: {
          total_facilities_mentioned: 0,
          recent_expansions: 0,
          technology_adoptions: 0,
          policy_changes: 0
        },
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    })
  }
}

function generateFallbackInsights(facilityType?: string, category?: string) {
  const facilityName = facilityType || 'Healthcare'
  const categoryName = category || 'Healthcare'

  return {
    articles: [
      {
        id: 1,
        title: `${facilityName} Sector Shows Strong Growth in Q4 2025`,
        summary: `The ${facilityType?.toLowerCase() || 'healthcare'} sector continues to expand with new facilities opening across major metropolitan areas. Industry analysts report increased investment and patient demand.`,
        fullContent: `The ${facilityType?.toLowerCase() || 'healthcare'} sector continues to expand with new facilities opening across major metropolitan areas. Industry analysts report increased investment and patient demand.\n\nMarket research indicates that the sector is experiencing robust growth driven by demographic shifts, increased healthcare access, and technological innovations. Healthcare executives are optimistic about expansion opportunities in underserved markets.\n\nInvestment in infrastructure and staffing has increased by 15% compared to the previous quarter, with particular focus on expanding capacity in high-growth regions. This trend is expected to continue through 2025 as demand for healthcare services remains strong.`,
        category: "Market Trend",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        source: "Healthcare Industry News",
        sourceUrl: "https://www.healthcare-industry-news.com",
        views: 15420,
        trending: true
      },
      {
        id: 2,
        title: `Technology Adoption Accelerates in ${categoryName} Facilities`,
        summary: `Healthcare providers are increasingly adopting advanced technologies including telehealth platforms, AI-assisted diagnostics, and electronic health records to improve patient care and operational efficiency.`,
        fullContent: `Healthcare providers are increasingly adopting advanced technologies including telehealth platforms, AI-assisted diagnostics, and electronic health records to improve patient care and operational efficiency.\n\nThe digital transformation of healthcare continues to accelerate, with facilities investing heavily in modern IT infrastructure. Telehealth adoption has increased by 40% since 2024, making virtual care more accessible to patients in remote areas.\n\nArtificial intelligence tools are being deployed for diagnostic support, predictive analytics, and administrative automation. Early results show improved accuracy in diagnosis and significant time savings for healthcare professionals. Electronic health record systems are being upgraded to support better interoperability and data sharing between healthcare providers.`,
        category: "Technology",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        source: "Healthcare Technology Review",
        sourceUrl: "https://www.healthtech-review.com",
        views: 12890,
        trending: true
      },
      {
        id: 3,
        title: `New Regulations Impact ${categoryName} Operations`,
        summary: `Recent policy changes require healthcare facilities to implement enhanced data privacy measures and updated compliance protocols. Facilities have 90 days to meet new standards.`,
        fullContent: `Recent policy changes require healthcare facilities to implement enhanced data privacy measures and updated compliance protocols. Facilities have 90 days to meet new standards.\n\nThe new regulations, announced by federal healthcare authorities, mandate stricter data protection measures to safeguard patient information. Healthcare organizations must implement multi-factor authentication, encrypted data storage, and regular security audits.\n\nCompliance officers are working to ensure all systems meet the updated requirements within the 90-day implementation window. Non-compliance may result in penalties and potential restrictions on patient data access. Industry experts recommend proactive adoption of these security measures to protect patient privacy and maintain regulatory compliance.`,
        category: "Policy",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        source: "Healthcare Policy Journal",
        sourceUrl: "https://www.healthpolicy-journal.com",
        views: 9540,
        trending: false
      },
      {
        id: 4,
        title: `Major Healthcare System Announces ${facilityName} Expansion`,
        summary: `Leading healthcare network reveals plans to open multiple new facilities across underserved regions, adding capacity for thousands of additional patients annually.`,
        fullContent: `Leading healthcare network reveals plans to open multiple new facilities across underserved regions, adding capacity for thousands of additional patients annually.\n\nThe expansion project, valued at over $500 million, will bring modern healthcare facilities to communities that have historically lacked adequate medical infrastructure. The new facilities will include emergency departments, outpatient clinics, and specialized care centers.\n\nConstruction is scheduled to begin in early 2026, with the first facilities expected to open by late 2026. The healthcare system estimates the expansion will create over 2,000 jobs and serve an additional 50,000 patients per year. Community leaders have welcomed the announcement, noting the critical need for accessible healthcare services in their regions.`,
        category: "Expansion",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        source: "Healthcare Business News",
        sourceUrl: "https://www.healthcarebusiness-news.com",
        views: 18760,
        trending: true
      },
      {
        id: 5,
        title: `Value-Based Care Models Gain Traction in ${categoryName}`,
        summary: `Healthcare providers shift focus to outcome-based reimbursement models, emphasizing quality of care over volume of services. Early adopters report improved patient outcomes.`,
        fullContent: `Healthcare providers shift focus to outcome-based reimbursement models, emphasizing quality of care over volume of services. Early adopters report improved patient outcomes.\n\nValue-based care represents a fundamental shift in how healthcare services are delivered and compensated. Instead of fee-for-service models, providers are rewarded for achieving positive health outcomes and maintaining patient wellness.\n\nEarly data from facilities that have adopted value-based care show encouraging results: readmission rates have decreased by 20%, patient satisfaction scores have improved significantly, and overall healthcare costs have been reduced through preventive care and better chronic disease management. The model emphasizes care coordination, patient engagement, and evidence-based treatment protocols to achieve optimal outcomes while controlling costs.`,
        category: "Market Trend",
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        source: "Modern Healthcare",
        sourceUrl: "https://www.modernhealthcare.com",
        views: 11230,
        trending: false
      }
    ],
    trending: [
      { name: `${facilityName} Expansion`, count: 234, category: categoryName, trend: "up", changePercent: 15 },
      { name: "AI in Healthcare", count: 189, category: "Technology", trend: "up", changePercent: 23 },
      { name: "Telehealth Services", count: 156, category: "Technology", trend: "up", changePercent: 12 },
      { name: "Healthcare Funding", count: 142, category: "Finance", trend: "stable", changePercent: 3 },
      { name: "Regulatory Compliance", count: 128, category: "Policy", trend: "up", changePercent: 8 }
    ],
    marketInsights: {
      total_facilities_mentioned: 450,
      recent_expansions: 78,
      technology_adoptions: 134,
      policy_changes: 23
    },
    lastUpdated: new Date().toISOString()
  }
}

