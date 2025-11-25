import { NextRequest, NextResponse } from 'next/server'
import { initiateCall } from '@/lib/twilio-service'

/**
 * Initiate an outbound call via Twilio
 * 
 * POST /api/phone-crm/call
 * Body: { to: string, from?: string, leadId?: string, record?: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const { to, from, leadId, record } = await request.json()

    if (!to) {
      return NextResponse.json(
        { success: false, error: 'Phone number (to) is required' },
        { status: 400 }
      )
    }

    // Credentials are hardcoded in twilio-service.ts
    // (Previously validated environment variables)

    const result = await initiateCall({
      to,
      from: from || undefined, // Will use default from twilio-service.ts
      leadId,
      record: record || false,
    })

    return NextResponse.json({
      success: true,
      callSid: result.callSid,
      status: result.status,
      direction: result.direction,
    })
  } catch (error: any) {
    console.error('[Phone CRM Call API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to initiate call',
      },
      { status: 500 }
    )
  }
}

