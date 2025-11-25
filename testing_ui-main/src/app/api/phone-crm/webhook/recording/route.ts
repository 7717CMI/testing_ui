import { NextRequest, NextResponse } from 'next/server'

/**
 * Twilio Recording Status Callback Webhook
 * 
 * Receives recording URLs when a call recording is complete
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const callSid = formData.get('CallSid') as string
    const recordingSid = formData.get('RecordingSid') as string
    const recordingUrl = formData.get('RecordingUrl') as string
    const recordingStatus = formData.get('RecordingStatus') as string

    console.log('[Phone CRM Recording Webhook]', {
      callSid,
      recordingSid,
      recordingUrl,
      recordingStatus,
    })

    // Here you would typically:
    // 1. Find the call by callSid
    // 2. Update the call with recording URL
    // 3. Store the recording URL in your database

    return NextResponse.json({
      success: true,
      callSid,
      recordingSid,
      recordingUrl,
    })
  } catch (error: any) {
    console.error('[Phone CRM Recording Webhook] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to process recording',
      },
      { status: 500 }
    )
  }
}




