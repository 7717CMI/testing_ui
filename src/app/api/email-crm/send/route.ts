import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'
import { useEmailCRMStore } from '@/stores/email-crm-store'

/**
 * Production Email Sending API Route
 * 
 * Handles real email sending with tracking and unsubscribe support
 * 
 * Environment Variables Required:
 * - EMAIL_ESP_PROVIDER: 'sendgrid' | 'resend' | 'smtp' | 'professional' | 'mock'
 * - SENDGRID_API_KEY: (if using SendGrid)
 * - RESEND_API_KEY: (if using Resend)
 * - PROFESSIONAL_EMAIL_API_KEY: (if using Professional Email Service)
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS: (if using SMTP)
 * - EMAIL_FROM_ADDRESS: Sender email address
 * - NEXT_PUBLIC_APP_URL: Your app URL for tracking links
 * 
 * Rate Limiting: 10 emails per minute per user
 */

interface SendEmailRequest {
  emailId: string
  leadId: string
  subject: string
  body: string
  to: string
  from?: string
  cc?: string
  bcc?: string
  scheduledFor?: string
  templateId?: string
}

// In-memory rate limiter (use Redis in production for distributed systems)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(userId)

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60000 }) // 1 minute window
    return true
  }

  if (limit.count >= 10) {
    return false
  }

  limit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Get user ID from headers (in production, use auth token)
    const userId = request.headers.get('x-user-id') || 'anonymous'

    // Rate limiting
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Maximum 10 emails per minute.',
        },
        { status: 429 }
      )
    }

    const body: SendEmailRequest = await request.json()
    const { emailId, leadId, subject, body: emailBody, to, from, cc, bcc, scheduledFor } = body

    // Validation
    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: to, subject, body',
        },
        { status: 400 }
      )
    }

    // Validate email address
    if (!emailService.validateEmail(to)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email address',
        },
        { status: 400 }
      )
    }

    // Generate tracking ID and unsubscribe URL
    const trackingId = emailId
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const unsubscribeUrl = `${appUrl}/api/email-crm/unsubscribe?email=${encodeURIComponent(to)}&token=${emailId}`

    // Create HTML email with tracking
    const htmlBody = emailService.createEmailTemplate(emailBody, {
      trackingId,
      unsubscribeUrl,
      footerText: 'You\'re receiving this email because you were contacted through our platform.',
    })

    // Send email via email service
    const result = await emailService.send({
      to,
      from: from || undefined,
      subject,
      html: htmlBody,
      cc: cc ? (cc.includes(',') ? cc.split(',').map((e: string) => e.trim()) : cc) : undefined,
      bcc: bcc ? (bcc.includes(',') ? bcc.split(',').map((e: string) => e.trim()) : bcc) : undefined,
      trackingId,
      unsubscribeUrl,
      headers: {
        'X-Email-ID': emailId,
        'X-Lead-ID': leadId,
      },
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        emailId,
        provider: result.provider,
        sentAt: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send email',
          provider: result.provider,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('[Email Send] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send email',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
