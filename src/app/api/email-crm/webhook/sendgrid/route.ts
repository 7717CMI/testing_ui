import { NextRequest, NextResponse } from 'next/server'
import { useEmailCRMStore } from '@/stores/email-crm-store'

/**
 * SendGrid Webhook Endpoint
 * 
 * Receives webhook events from SendGrid for email tracking:
 * - opened: Email was opened
 * - clicked: Link in email was clicked
 * - bounced: Email bounced
 * - dropped: Email was dropped
 * - spamreport: Email was marked as spam
 * - unsubscribe: User unsubscribed
 * 
 * To set up webhook in SendGrid:
 * 1. Go to Settings > Mail Settings > Event Webhook
 * 2. Add HTTP POST URL: https://yourdomain.com/api/email-crm/webhook/sendgrid
 * 3. Select events: opened, clicked, bounced, dropped, spamreport, unsubscribe
 * 4. Save
 */

interface SendGridWebhookEvent {
  email: string
  timestamp: number
  event: 'open' | 'click' | 'bounce' | 'dropped' | 'spamreport' | 'unsubscribe' | 'delivered'
  sg_message_id?: string
  sg_event_id?: string
  custom_args?: {
    trackingId?: string
  }
  url?: string // For click events
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook (in production, verify SendGrid signature)
    // const signature = request.headers.get('x-twilio-email-event-webhook-signature')
    // if (!verifySendGridSignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    const events: SendGridWebhookEvent[] = await request.json()

    if (!Array.isArray(events)) {
      return NextResponse.json({ error: 'Invalid webhook format' }, { status: 400 })
    }

    const store = useEmailCRMStore.getState()

    for (const event of events) {
      const trackingId = event.custom_args?.trackingId
      if (!trackingId) continue

      const timestamp = new Date(event.timestamp * 1000)

      switch (event.event) {
        case 'open':
          store.updateEmailStatus(trackingId, 'opened', timestamp)
          break

        case 'click':
          store.updateEmailStatus(trackingId, 'clicked', timestamp)
          break

        case 'bounce':
        case 'dropped':
          store.updateEmailStatus(trackingId, 'bounced', timestamp)
          break

        case 'spamreport':
          // Mark as bounced to prevent future sends
          store.updateEmailStatus(trackingId, 'bounced', timestamp)
          break

        case 'unsubscribe':
          // Mark as bounced to prevent future sends
          store.updateEmailStatus(trackingId, 'bounced', timestamp)
          // You could also mark the lead as unsubscribed
          break

        case 'delivered':
          // Email was successfully delivered
          // Status is already 'sent', no change needed
          break

        default:
          console.log('[SendGrid Webhook] Unhandled event:', event.event)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[SendGrid Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Verify SendGrid webhook signature (implement in production)
function verifySendGridSignature(signature: string | null, body: string): boolean {
  // TODO: Implement SendGrid signature verification
  // See: https://docs.sendgrid.com/for-developers/tracking-events/getting-started-event-webhook-security-features
  return true // For now, skip verification in development
}


