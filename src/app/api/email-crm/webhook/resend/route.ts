import { NextRequest, NextResponse } from 'next/server'
import { useEmailCRMStore } from '@/stores/email-crm-store'

/**
 * Resend Webhook Endpoint
 * 
 * Receives webhook events from Resend for email tracking
 * 
 * To set up webhook in Resend:
 * 1. Go to API Keys > Webhooks
 * 2. Add webhook URL: https://yourdomain.com/api/email-crm/webhook/resend
 * 3. Select events: email.sent, email.delivered, email.opened, email.clicked, email.bounced, email.complained
 * 4. Save
 */

interface ResendWebhookEvent {
  type: 'email.sent' | 'email.delivered' | 'email.opened' | 'email.clicked' | 'email.bounced' | 'email.complained'
  created_at: string
  data: {
    email_id: string
    to: string[]
    from: string
    subject: string
    // For click events
    link?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (implement in production)
    // const signature = request.headers.get('resend-signature')
    // if (!verifyResendSignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    const event: ResendWebhookEvent = await request.json()

    if (!event || !event.type) {
      return NextResponse.json({ error: 'Invalid webhook format' }, { status: 400 })
    }

    const store = useEmailCRMStore.getState()
    const timestamp = new Date(event.created_at)

    // Extract tracking ID from email_id or custom headers
    // In Resend, you'd need to pass trackingId in custom headers when sending
    const emailId = event.data.email_id

    switch (event.type) {
      case 'email.opened':
        store.updateEmailStatus(emailId, 'opened', timestamp)
        break

      case 'email.clicked':
        store.updateEmailStatus(emailId, 'clicked', timestamp)
        break

      case 'email.bounced':
      case 'email.complained':
        store.updateEmailStatus(emailId, 'bounced', timestamp)
        break

      case 'email.delivered':
        // Email was successfully delivered
        break

      default:
        console.log('[Resend Webhook] Unhandled event:', event.type)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Resend Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Verify Resend webhook signature (implement in production)
function verifyResendSignature(signature: string | null, body: string): boolean {
  // TODO: Implement Resend signature verification
  // See: https://resend.com/docs/dashboard/webhooks
  return true // For now, skip verification in development
}


