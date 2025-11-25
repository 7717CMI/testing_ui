import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

/**
 * Twilio Voice Webhook - Handles call instructions
 * 
 * This endpoint receives TwiML instructions when a call is initiated
 * It tells Twilio what to do with the call (connect, play message, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const to = formData.get('To') as string
    const from = formData.get('From') as string
    const callSid = formData.get('CallSid') as string

    // Create TwiML response
    const twiml = new twilio.twiml.VoiceResponse()

    // Connect the call - dial the destination number
    const dial = twiml.dial({
      callerId: '+18163076282', // Hardcoded Twilio phone number
      record: 'record-from-answer',
      recordingStatusCallback: 'http://localhost:3010/api/phone-crm/webhook/recording',
    })

    dial.number(to)

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  } catch (error: any) {
    console.error('[Phone CRM Voice Webhook] Error:', error)
    const twiml = new twilio.twiml.VoiceResponse()
    twiml.say('Sorry, an error occurred. Please try again later.')
    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  }
}

