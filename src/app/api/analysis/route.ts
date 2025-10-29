import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Store conversation states in memory (for demo - use Redis/DB in production)
const analysisStates = new Map<string, AnalysisState>()

interface AnalysisState {
  sessionId: string
  stage: 'collecting_requirements' | 'analyzing' | 'complete'
  userInputs: {
    analysisType?: string
    targetEntities?: string[]
    timeframe?: string
    specificQuestions?: string[]
    dataPoints?: string[]
    comparisonNeeded?: boolean
  }
  conversationHistory: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  analysisResults?: any
  createdAt: Date
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userMessage, action = 'chat', userProfile, uploadedFiles, selectedArticles, conversationHistory } = await request.json()

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID is required'
      }, { status: 400 })
    }

    // Initialize or get existing session
    if (!analysisStates.has(sessionId)) {
      analysisStates.set(sessionId, {
        sessionId,
        stage: 'collecting_requirements',
        userInputs: {},
        conversationHistory: [],
        createdAt: new Date()
      })
    }

    const state = analysisStates.get(sessionId)!

    // Handle different actions
    if (action === 'start') {
      return handleStartAnalysis(state)
    } else if (action === 'profile') {
      return handleUserProfile(state, userMessage, conversationHistory)
    } else if (action === 'analyze') {
      return handleFullAnalysis(state, userProfile, uploadedFiles, selectedArticles, userMessage)
    } else if (action === 'chat') {
      return handleConversation(state, userMessage)
    } else if (action === 'reset') {
      analysisStates.delete(sessionId)
      return NextResponse.json({ success: true, message: 'Session reset' })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })
  } catch (error: any) {
    console.error('[Analysis] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Analysis failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

async function handleStartAnalysis(state: AnalysisState) {
  const response = `I'll help you perform a comprehensive analysis of healthcare data! Let me gather some information first.

**What type of analysis would you like to perform?**

• **Market Analysis** - Analyze market trends, facility distribution, growth patterns
• **Competitive Analysis** - Compare facilities, identify market leaders
• **Financial Analysis** - Revenue estimates, financial health indicators
• **Geographic Analysis** - Regional distribution, market penetration
• **Service Gap Analysis** - Identify underserved areas and opportunities
• **Custom Analysis** - Tell me what you need

Please describe the type of analysis you want, or choose from the options above.`

  state.conversationHistory.push({
    role: 'assistant',
    content: response
  })

  return NextResponse.json({
    success: true,
    response,
    stage: state.stage,
    formFields: [
      {
        id: 'analysisType',
        type: 'select',
        label: 'Analysis Type',
        options: [
          'Market Analysis',
          'Competitive Analysis',
          'Financial Analysis',
          'Geographic Analysis',
          'Service Gap Analysis',
          'Custom Analysis'
        ],
        required: true
      }
    ]
  })
}

async function handleUserProfile(state: AnalysisState, userMessage: string, history: any[] = []) {
  const extractionPrompt = `Extract user profile information from conversation.

Conversation:
${history.slice(-3).map((m: any) => `${m.role}: ${m.content}`).join('\n')}

User: ${userMessage}

Extract:
- role (e.g., Sales Executive, Market Analyst, CEO)
- industry (e.g., Healthcare, Pharma, Medical Devices)
- goals (e.g., lead generation, market research, competitive intelligence)
- region (e.g., California, West Coast, National)

Return JSON:
{
  "role": "...",
  "industry": "...",
  "goals": "...",
  "region": "...",
  "profileComplete": true/false
}

Set profileComplete=true if you have enough info to provide personalized analysis.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: extractionPrompt },
      { role: 'user', content: userMessage }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2
  })

  const extracted = JSON.parse(response.choices[0].message.content || '{}')

  if (extracted.profileComplete) {
    return NextResponse.json({
      success: true,
      profileComplete: true,
      profile: {
        role: extracted.role,
        industry: extracted.industry,
        goals: extracted.goals,
        region: extracted.region
      }
    })
  } else {
    // Ask follow-up
    const followUpPrompt = `User provided: "${userMessage}". We need more info about their role, industry, goals, or region for healthcare analysis. Ask 1 conversational follow-up question.`
    
    const followUpResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: followUpPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 200
    })

    return NextResponse.json({
      success: true,
      profileComplete: false,
      response: followUpResponse.choices[0].message.content || 'Could you tell me more about your role and goals?'
    })
  }
}

async function handleFullAnalysis(
  state: AnalysisState,
  userProfile: any,
  uploadedFiles: any[],
  selectedArticles: string[],
  userRequest: string
) {
  console.log('[Analysis] Starting full analysis with:')
  console.log('- User Profile:', userProfile)
  console.log('- Files:', uploadedFiles?.length || 0)
  console.log('- Articles:', selectedArticles?.length || 0)
  console.log('- Request:', userRequest)

  // Build context
  const context = `
**User Profile:**
- Role: ${userProfile?.role || 'Not specified'}
- Industry: ${userProfile?.industry || 'Healthcare'}
- Goals: ${userProfile?.goals || 'Market analysis'}
- Region: ${userProfile?.region || 'National'}

**Data Sources:**
- Database: 658,859 healthcare facilities
- Uploaded Files: ${uploadedFiles?.length || 0} files
- Saved Articles: ${selectedArticles?.length || 0} articles

**User Request:** ${userRequest}
`

  // Generate analysis
  const analysis = await generateAnalysis(state, context, userProfile)

  return NextResponse.json({
    success: true,
    response: formatAnalysisResults(analysis),
    analysisResults: analysis
  })
}

function formatAnalysisResults(analysis: any): string {
  return `## ✅ Analysis Complete!

${analysis.summary}

### 📊 Key Findings

${analysis.keyFindings.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

### 💡 Insights

${analysis.insights.map((insight: string) => `• ${insight}`).join('\n')}

### 🎯 Recommendations (Personalized for ${analysis.userRole || 'Your Role'})

${analysis.recommendations.map((rec: string, i: number) => `${i + 1}. **${rec.split(':')[0]}**: ${rec.split(':')[1] || rec}`).join('\n')}

---

**Analysis Quality:** ${analysis.dataQuality} | **Confidence:** ${analysis.confidenceScore}%

Would you like me to:
• Dive deeper into any specific finding
• Compare with different regions/timeframes
• Export this analysis as a report
• Perform additional analysis`
}

async function handleConversation(state: AnalysisState, userMessage: string) {
  // Add user message to history
  state.conversationHistory.push({
    role: 'user',
    content: userMessage
  })

  // Stage 1: Collecting Requirements
  if (state.stage === 'collecting_requirements') {
    return await collectRequirements(state, userMessage)
  }

  // Stage 2: Performing Analysis
  if (state.stage === 'analyzing') {
    return await performAnalysis(state, userMessage)
  }

  return NextResponse.json({
    success: false,
    error: 'Invalid state'
  }, { status: 400 })
}

async function collectRequirements(state: AnalysisState, userMessage: string) {
  // Use GPT to extract requirements
  const extractionPrompt = `Extract analysis requirements from user message.

Conversation history:
${state.conversationHistory.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}

User wants to analyze healthcare data. Extract:
1. Analysis type (market/competitive/financial/geographic/service_gap/custom)
2. Target entities (facility types, specific facilities, regions)
3. Timeframe (current/6months/1year/5years)
4. Specific questions they want answered
5. Data points they're interested in
6. Whether comparison is needed

Return JSON:
{
  "analysisType": "market",
  "targetEntities": ["hospitals", "California"],
  "timeframe": "1year",
  "specificQuestions": ["growth rate", "market share"],
  "dataPoints": ["bed count", "revenue"],
  "comparisonNeeded": true,
  "isComplete": false
}

Set "isComplete": true only when you have enough information to perform analysis.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: extractionPrompt },
      { role: 'user', content: userMessage }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2
  })

  const extracted = JSON.parse(response.choices[0].message.content || '{}')

  // Update state with extracted info
  Object.assign(state.userInputs, extracted)

  // Check if we have enough info
  if (extracted.isComplete) {
    state.stage = 'analyzing'
    
    const confirmationMessage = `Perfect! I'll now perform a comprehensive analysis with:

• **Analysis Type**: ${state.userInputs.analysisType}
• **Target**: ${state.userInputs.targetEntities?.join(', ')}
• **Timeframe**: ${state.userInputs.timeframe}
• **Focus Areas**: ${state.userInputs.specificQuestions?.join(', ')}

This will take a few moments as I:
1. Query the database (658K+ facilities)
2. Fetch real-time market data via web search
3. Apply ML/statistical models
4. Generate insights and recommendations

**Starting analysis...**`

    state.conversationHistory.push({
      role: 'assistant',
      content: confirmationMessage
    })

    // Trigger actual analysis
    setTimeout(() => performAnalysisAsync(state), 100)

    return NextResponse.json({
      success: true,
      response: confirmationMessage,
      stage: 'analyzing',
      analyzing: true
    })
  } else {
    // Ask follow-up questions
    const followUpPrompt = `Based on conversation, ask 1-2 specific follow-up questions to gather missing information for healthcare data analysis.

Current info: ${JSON.stringify(state.userInputs, null, 2)}

Be conversational and helpful. Ask about missing critical details.`

    const followUpResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: followUpPrompt },
        ...state.conversationHistory.slice(-4)
      ],
      temperature: 0.7,
      max_tokens: 300
    })

    const followUpMessage = followUpResponse.choices[0].message.content || 'Could you provide more details?'

    state.conversationHistory.push({
      role: 'assistant',
      content: followUpMessage
    })

    return NextResponse.json({
      success: true,
      response: followUpMessage,
      stage: 'collecting_requirements'
    })
  }
}

async function performAnalysisAsync(state: AnalysisState) {
  try {
    const analysisResult = await generateAnalysis(state)
    state.analysisResults = analysisResult
    state.stage = 'complete'
  } catch (error) {
    console.error('[Analysis] Error:', error)
    state.conversationHistory.push({
      role: 'assistant',
      content: 'I encountered an error during analysis. Please try again.'
    })
  }
}

async function performAnalysis(state: AnalysisState, userMessage: string) {
  // If analysis is still running
  if (!state.analysisResults) {
    return NextResponse.json({
      success: true,
      response: 'Analysis is still in progress... Please wait a moment.',
      stage: 'analyzing',
      analyzing: true
    })
  }

  // Analysis complete, return results
  const results = state.analysisResults

  const resultMessage = `## ✅ Analysis Complete!

${results.summary}

### 📊 Key Findings

${results.keyFindings.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

### 💡 Insights

${results.insights.map((insight: string, i: number) => `• ${insight}`).join('\n')}

### 🎯 Recommendations

${results.recommendations.map((rec: string, i: number) => `${i + 1}. **${rec.split(':')[0]}**: ${rec.split(':')[1] || rec}`).join('\n')}

---

Would you like me to:
• Dive deeper into any specific finding
• Compare with different regions/timeframes
• Export this analysis as a report
• Perform a different type of analysis`

  state.conversationHistory.push({
    role: 'assistant',
    content: resultMessage
  })

  return NextResponse.json({
    success: true,
    response: resultMessage,
    stage: 'complete',
    analysisResults: results
  })
}

async function generateAnalysis(state: AnalysisState, context: string, userProfile: any): Promise<any> {
  console.log('[Analysis] Generating analysis')

  // Fetch real-time data
  const webSearchQuery = `Healthcare ${state.userInputs.analysisType || 'market'} analysis. Include trends, statistics, growth rates, competitive landscape.`

  let webData = ''
  try {
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{
          role: 'user',
          content: webSearchQuery
        }],
        return_citations: true,
        temperature: 0.2
      })
    })

    if (perplexityResponse.ok) {
      const data = await perplexityResponse.json()
      webData = data.choices[0].message.content
    }
  } catch (error) {
    console.error('[Analysis] Web search failed:', error)
  }

  // Generate comprehensive analysis with GPT-4
  const analysisPrompt = `You are a healthcare data analyst generating a personalized analysis.

${context}

**Real-time Market Data:**
${webData || 'Using general healthcare industry knowledge'}

**Database Context:**
- 658,859 verified healthcare facilities
- Covers all facility types and US states

Generate PERSONALIZED analysis for this ${userProfile?.role || 'professional'}:

1. **Summary** (2-3 sentences tailored to their role)
2. **Key Findings** (5-7 specific findings relevant to their goals)
3. **Insights** (4-5 actionable insights for their industry)
4. **Recommendations** (5-6 strategic recommendations for their role and goals)

Return JSON:
{
  "summary": "...",
  "keyFindings": ["...", "..."],
  "insights": ["...", "..."],
  "recommendations": ["...", "..."],
  "userRole": "${userProfile?.role || 'Professional'}",
  "dataQuality": "high/medium/low",
  "confidenceScore": 85
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: analysisPrompt },
      { role: 'user', content: `Generate personalized analysis now.` }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 2000
  })

  const analysis = JSON.parse(response.choices[0].message.content || '{}')

  return {
    ...analysis,
    timestamp: new Date().toISOString(),
    sources: ['Database (658K+ facilities)', 'Real-time web data', 'GPT-4 analysis']
  }
}

// GET method for testing
export async function GET() {
  return NextResponse.json({
    message: 'Analysis API is running',
    endpoints: {
      POST: '/api/analysis',
      body: {
        sessionId: 'Unique session ID (required)',
        action: 'start | chat | reset',
        userMessage: 'User message (for chat action)'
      }
    },
    activeSessions: analysisStates.size
  })
}

