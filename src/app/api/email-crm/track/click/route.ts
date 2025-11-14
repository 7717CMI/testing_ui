import { NextRequest, NextResponse } from 'next/server'
import { useEmailCRMStore } from '@/stores/email-crm-store'

/**
 * Email Click Tracking Endpoint
 * 
 * This endpoint tracks when links in emails are clicked
 * Updates the email status to 'clicked' and redirects to the original URL
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token') // This is the emailId
    const url = searchParams.get('url') // The original URL to redirect to

    if (!token || !url) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Update email status to clicked
    const store = useEmailCRMStore.getState()
    store.updateEmailStatus(token, 'clicked', new Date())

    // Decode and redirect to original URL
    const decodedUrl = decodeURIComponent(url)
    
    // Validate URL to prevent open redirect attacks
    try {
      const urlObj = new URL(decodedUrl)
      // Only allow http/https protocols
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch {
      // Invalid URL, redirect to home
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.redirect(decodedUrl)
  } catch (error: any) {
    console.error('[Email Track Click] Error:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}

