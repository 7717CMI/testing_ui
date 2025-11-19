import { NextRequest, NextResponse } from 'next/server'
import { generateAccessToken } from '@/lib/twilio-service'

/**
 * Generate Twilio Access Token for client-side calling
 * 
 * This endpoint generates a JWT token that allows the browser
 * to make calls using Twilio Client SDK
 * 
 * POST /api/phone-crm/token
 * Body: { identity: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { identity } = await request.json()

    if (!identity) {
      return NextResponse.json(
        { success: false, error: 'Identity is required' },
        { status: 400 }
      )
    }

    // Credentials are hardcoded, so validation always passes
    // (Previously checked environment variables)

    const token = generateAccessToken(identity)

    return NextResponse.json({
      success: true,
      token,
      identity,
    })
  } catch (error: any) {
    console.error('[Phone CRM Token API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to generate access token',
      },
      { status: 500 }
    )
  }
}

