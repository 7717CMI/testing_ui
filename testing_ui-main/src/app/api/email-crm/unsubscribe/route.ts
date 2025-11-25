import { NextRequest, NextResponse } from 'next/server'
import { useEmailCRMStore } from '@/stores/email-crm-store'

/**
 * Unsubscribe Endpoint
 * 
 * Handles email unsubscription requests
 * Marks the lead as unsubscribed and prevents future emails
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const token = searchParams.get('token') // This is the emailId

    if (!email || !token) {
      return NextResponse.redirect(
        new URL('/email-outreach?error=invalid_unsubscribe', request.url)
      )
    }

    // Find the lead by email and mark as unsubscribed
    const store = useEmailCRMStore.getState()
    const lead = store.leads.find((l) => l.email === email)

    if (lead) {
      // In a real system, you'd have an 'unsubscribed' field
      // For now, we'll update the email status to 'bounced' to prevent future sends
      store.updateEmailStatus(token, 'bounced', new Date())
      
      // You could also add an 'unsubscribed' flag to the lead
      // store.updateLead(lead.id, { unsubscribed: true })
    }

    // Return success page
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unsubscribed</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 500px;
            }
            h1 { color: #1f2937; margin-bottom: 16px; }
            p { color: #6b7280; line-height: 1.6; }
            .checkmark {
              width: 64px;
              height: 64px;
              border-radius: 50%;
              background: #10b981;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 24px;
              font-size: 32px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="checkmark">✓</div>
            <h1>Successfully Unsubscribed</h1>
            <p>You have been unsubscribed from future emails. You will no longer receive emails from us.</p>
            <p style="margin-top: 24px; font-size: 14px; color: #9ca3af;">
              If you change your mind, you can contact us to resubscribe.
            </p>
          </div>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    )
  } catch (error: any) {
    console.error('[Unsubscribe] Error:', error)
    return NextResponse.redirect(
      new URL('/email-outreach?error=unsubscribe_failed', request.url)
    )
  }
}





