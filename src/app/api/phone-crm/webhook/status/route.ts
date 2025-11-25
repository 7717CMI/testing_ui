import { NextRequest, NextResponse } from 'next/server'

/**
 * Twilio Status Callback Webhook
 * 
 * Receives call status updates from Twilio:
 * - initiated, ringing, answered, completed, failed, busy, no-answer
 * 
 * This can be used to update call status in your database
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const callSid = formData.get('CallSid') as string
    const callStatus = formData.get('CallStatus') as string
    const callDuration = formData.get('CallDuration') as string
    const from = formData.get('From') as string
    const to = formData.get('To') as string

    // Map Twilio status to our internal status
    const statusMap: Record<string, string> = {
      queued: 'initiated',
      ringing: 'ringing',
      'in-progress': 'in-progress',
      completed: 'completed',
      busy: 'busy',
      failed: 'failed',
      'no-answer': 'no-answer',
      canceled: 'canceled',
    }

    const mappedStatus = statusMap[callStatus] || callStatus

    // Log the status update
    console.log('[Phone CRM Status Webhook]', {
      callSid,
      status: mappedStatus,
      duration: callDuration,
      from,
      to,
    })

    // Here you would typically update your database with the call status
    // For now, we'll just return success
    // In production, you might want to:
    // 1. Find the call by callSid
    // 2. Update its status in the database
    // 3. Update duration if completed
    // 4. Send real-time update to client via WebSocket (optional)

    return NextResponse.json({
      success: true,
      callSid,
      status: mappedStatus,
    })
  } catch (error: any) {
    console.error('[Phone CRM Status Webhook] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to process status update',
      },
      { status: 500 }
    )
  }
}


