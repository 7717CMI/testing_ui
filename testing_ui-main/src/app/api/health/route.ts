import { NextRequest, NextResponse } from 'next/server'

/**
 * Health check endpoint to diagnose configuration issues
 */
export async function GET(request: NextRequest) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasPerplexityKey: !!process.env.PERPLEXITY_API_KEY,
      openAIKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 7) || 'missing',
      perplexityKeyPrefix: process.env.PERPLEXITY_API_KEY?.substring(0, 7) || 'missing',
    },
    database: {
      hasDbHost: !!process.env.DB_HOST,
      hasDbPort: !!process.env.DB_PORT,
      hasDbName: !!process.env.DB_NAME,
      hasDbUser: !!process.env.DB_USER,
      hasDbPassword: !!process.env.DB_PASSWORD,
    },
    status: 'ok'
  }

  // Test database connection
  try {
    const { testConnection } = await import('@/lib/database')
    const dbConnected = await testConnection()
    diagnostics.database = {
      ...diagnostics.database,
      connected: dbConnected
    }
  } catch (error: any) {
    diagnostics.database = {
      ...diagnostics.database,
      connected: false,
      error: error.message
    }
  }

  // Test OpenAI client
  try {
    if (process.env.OPENAI_API_KEY) {
      const { getOpenAIClient } = await import('@/lib/smart-search/openai-client')
      const client = getOpenAIClient()
      diagnostics.environment = {
        ...diagnostics.environment,
        openAIClientInitialized: !!client
      }
    }
  } catch (error: any) {
    diagnostics.environment = {
      ...diagnostics.environment,
      openAIClientError: error.message
    }
  }

  return NextResponse.json(diagnostics, { status: 200 })
}


