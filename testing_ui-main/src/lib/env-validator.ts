/**
 * Validate that all required environment variables are present
 * Throws an error with helpful message if any are missing
 */
export function validateEnv() {
  const required = [
    'DB_HOST',
    'DB_PASSWORD',
    'DB_NAME',
    'DB_USER'
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env.local file and ensure all required variables are set.`
    )
  }

  // Optional but recommended variables
  const recommended = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'NEXT_PUBLIC_FIREBASE_API_KEY'
  ]

  const missingRecommended = recommended.filter(key => !process.env[key])
  
  if (missingRecommended.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn(
      `[Env Validator] Missing recommended environment variables: ${missingRecommended.join(', ')}\n` +
      `Some features may not work correctly without these variables.`
    )
  }
}



