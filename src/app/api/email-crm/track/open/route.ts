import { NextRequest, NextResponse } from 'next/server'
import { useEmailCRMStore } from '@/stores/email-crm-store'

/**
 * Email Open Tracking Endpoint
 * 
 * This endpoint is called when an email is opened (via tracking pixel)
 * Updates the email status to 'opened' and records the timestamp
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token') // This is the emailId

    if (!token) {
      // Return 1x1 transparent pixel even if no token (to prevent broken images)
      return new NextResponse(
        Buffer.from(
          'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
          'base64'
        ),
        {
          headers: {
            'Content-Type': 'image/gif',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        }
      )
    }

    // Update email status to opened
    // Note: In a real implementation, you'd query your database
    // For now, we'll use the store (which persists to localStorage)
    const store = useEmailCRMStore.getState()
    store.updateEmailStatus(token, 'opened', new Date())

    // Return 1x1 transparent GIF pixel
    return new NextResponse(
      Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
      ),
      {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )
  } catch (error: any) {
    console.error('[Email Track Open] Error:', error)
    // Still return pixel to prevent broken images
    return new NextResponse(
      Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
      ),
      {
        headers: {
          'Content-Type': 'image/gif',
        },
      }
    )
  }
}

