import OpenAI from 'openai'

/**
 * Validated OpenAI client with proper error handling
 * This ensures API key is present and valid before making requests
 */
let openaiClient: OpenAI | null = null
let apiKeyStatus: 'valid' | 'missing' | 'invalid' | 'unknown' = 'unknown'

export function getOpenAIClient(): OpenAI {
  // Return existing client if already initialized
  if (openaiClient) {
    return openaiClient
  }

  const apiKey = process.env.OPENAI_API_KEY

  // Validate API key
  if (!apiKey) {
    apiKeyStatus = 'missing'
    throw new Error('OPENAI_API_KEY is not configured. Please add it to your .env.local file.')
  }

  if (!apiKey.startsWith('sk-')) {
    apiKeyStatus = 'invalid'
    throw new Error('OPENAI_API_KEY format is invalid. It should start with "sk-".')
  }

  // Initialize client
  try {
    openaiClient = new OpenAI({ apiKey })
    apiKeyStatus = 'valid'
    console.log('[OpenAI Client] ✅ Initialized successfully')
    return openaiClient
  } catch (error: any) {
    apiKeyStatus = 'invalid'
    console.error('[OpenAI Client] ❌ Initialization failed:', error.message)
    throw new Error(`Failed to initialize OpenAI client: ${error.message}`)
  }
}

export function getAPIKeyStatus(): typeof apiKeyStatus {
  return apiKeyStatus
}

export function resetClient(): void {
  openaiClient = null
  apiKeyStatus = 'unknown'
}

/**
 * Safe OpenAI API call wrapper with comprehensive error handling
 */
export async function safeOpenAICall<T>(
  operation: (client: OpenAI) => Promise<T>,
  fallback: T,
  operationName: string
): Promise<T> {
  try {
    const client = getOpenAIClient()
    return await operation(client)
  } catch (error: any) {
    console.error(`[OpenAI ${operationName}] Error:`, {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
      statusCode: error.statusCode,
    })

    // Handle specific error types
    if (error.status === 401 || error.statusCode === 401) {
      console.error(`[OpenAI ${operationName}] ❌ Authentication failed - Invalid API key`)
      throw new Error('OpenAI API authentication failed. Please check your API key in .env.local')
    }

    if (error.status === 429 || error.statusCode === 429) {
      console.error(`[OpenAI ${operationName}] ❌ Rate limit exceeded`)
      throw new Error('OpenAI API rate limit exceeded. Please try again in a moment.')
    }

    if (error.status === 500 || error.statusCode === 500) {
      console.error(`[OpenAI ${operationName}] ❌ OpenAI server error`)
      throw new Error('OpenAI API is temporarily unavailable. Please try again later.')
    }

    if (error.message?.includes('API key')) {
      throw new Error('OpenAI API key is invalid or missing. Please check your .env.local file.')
    }

    // Return fallback for other errors
    console.warn(`[OpenAI ${operationName}] Using fallback due to error`)
    return fallback
  }
}







