import twilio from 'twilio'
import { logger } from './logger'

// Twilio credentials from environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER
const TWILIO_API_KEY_SID = process.env.TWILIO_API_KEY_SID
const TWILIO_API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET
const TWILIO_APP_SID = process.env.TWILIO_APP_SID
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010'

// Validate required Twilio credentials
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  logger.warn('Twilio credentials are missing. Phone features may not work correctly.')
}

// Twilio client for server-side operations
export const twilioClient = TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN
  ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  : null

/**
 * Generate Twilio Access Token for client-side calling
 * This token allows the browser to make calls using Twilio Client SDK
 */
export function generateAccessToken(identity: string): string {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_API_KEY_SID || !TWILIO_API_KEY_SECRET || !TWILIO_APP_SID) {
    throw new Error('Twilio credentials are not configured. Please check your environment variables.')
  }

  const AccessToken = twilio.jwt.AccessToken
  const VoiceGrant = AccessToken.VoiceGrant

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: TWILIO_APP_SID,
    incomingAllow: true,
  })

  const token = new AccessToken(
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY_SID,
    TWILIO_API_KEY_SECRET,
    { identity }
  )

  token.addGrant(voiceGrant)
  return token.toJwt()
}

/**
 * Initiate an outbound call via Twilio API
 */
export async function initiateCall(params: {
  to: string
  from?: string
  leadId?: string
  record?: boolean
}) {
  if (!twilioClient) {
    throw new Error('Twilio client is not initialized. Please check your environment variables.')
  }
  if (!TWILIO_PHONE_NUMBER) {
    throw new Error('TWILIO_PHONE_NUMBER is not configured.')
  }

  const call = await twilioClient.calls.create({
    to: params.to,
    from: params.from || TWILIO_PHONE_NUMBER,
    url: `${NEXT_PUBLIC_APP_URL}/api/phone-crm/webhook/voice`,
    statusCallback: `${NEXT_PUBLIC_APP_URL}/api/phone-crm/webhook/status`,
    statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    statusCallbackMethod: 'POST',
    record: params.record || false,
  })

  return {
    callSid: call.sid,
    status: call.status,
    direction: call.direction,
  }
}

/**
 * Get call details by SID
 */
export async function getCallDetails(callSid: string) {
  if (!twilioClient) {
    throw new Error('Twilio client is not initialized. Please check your environment variables.')
  }

  const call = await twilioClient.calls(callSid).fetch()
  return {
    sid: call.sid,
    status: call.status,
    direction: call.direction,
    duration: call.duration,
    startTime: call.startTime,
    endTime: call.endTime,
    from: call.from,
    to: call.to,
    price: call.price,
    priceUnit: call.priceUnit,
  }
}

/**
 * Get call recordings
 */
export async function getCallRecordings(callSid: string) {
  if (!twilioClient) {
    throw new Error('Twilio client is not initialized. Please check your environment variables.')
  }

  const recordings = await twilioClient.recordings.list({
    callSid,
  })
  return recordings.map((recording) => ({
    sid: recording.sid,
    duration: recording.duration,
    dateCreated: recording.dateCreated,
    uri: recording.uri,
    url: `https://api.twilio.com${recording.uri.replace('.json', '')}`,
  }))
}

