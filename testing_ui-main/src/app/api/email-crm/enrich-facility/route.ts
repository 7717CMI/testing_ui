import { NextRequest, NextResponse } from 'next/server'

/**
 * Facility Contact Enrichment API
 * 
 * Uses Perplexity AI to search for email addresses and phone numbers
 * for healthcare facilities
 */

interface EnrichmentRequest {
  facilityId: number
  facilityName: string
  address: string
  city: string
  state: string
  zipCode?: string
  phone?: string | null
  websiteUrl?: string
}

interface EnrichmentResult {
  emails: string[]
  phones: string[]
  contacts: Array<{
    name: string
    title: string
    email: string | null
    phone: string | null
  }>
  source: string
  confidence: 'high' | 'medium' | 'low'
}

export async function POST(request: NextRequest) {
  try {
    const body: EnrichmentRequest = await request.json()
    const { facilityName, address, city, state, zipCode, phone, websiteUrl } = body

    if (!facilityName || !city || !state) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: facilityName, city, state',
        },
        { status: 400 }
      )
    }

    // Check if Perplexity API key is available
    const apiKey = process.env.PERPLEXITY_API_KEY
    if (!apiKey) {
      console.error('[Enrichment] PERPLEXITY_API_KEY is not set in environment variables')
      return NextResponse.json(
        {
          success: false,
          error: 'Perplexity API key not configured. Please check your .env.local file and restart the server.',
        },
        { status: 500 }
      )
    }
    
    console.log('[Enrichment] API key found:', apiKey.substring(0, 10) + '...')

    // Build search query with website URL if available
    const location = zipCode 
      ? `${address}, ${city}, ${state} ${zipCode}`
      : `${address}, ${city}, ${state}`
    
    // Extract website from facility name or construct search query
    const facilityWebsiteUrl = websiteUrl || ''
    
    const searchQuery = `Find all contact email addresses for ${facilityName} healthcare facility.

${facilityWebsiteUrl ? `Website: ${facilityWebsiteUrl}` : `Location: ${location}`}

Search the following pages on their website:
1. Contact page (${facilityWebsiteUrl ? `${facilityWebsiteUrl}/contact` : 'contact page'})
2. About page (${facilityWebsiteUrl ? `${facilityWebsiteUrl}/about` : 'about page'})
3. Team/Leadership page (${facilityWebsiteUrl ? `${facilityWebsiteUrl}/team` : 'team page'})
4. Any other pages that might contain contact information

Extract:
- Email addresses (only from ${facilityName} domain)
- Person's full name (if available)
- Job title/position (if available)
- Department (if available)
- Source URL where email was found

Return ONLY a JSON array in this exact format (no markdown, no explanation):

[
  {
    "email": "john.doe@company.com",
    "name": "John Doe",
    "title": "CEO",
    "department": "Executive",
    "source_url": "https://company.com/about"
  },
  {
    "email": "contact@company.com",
    "name": null,
    "title": "General Inquiry",
    "department": null,
    "source_url": "https://company.com/contact"
  }
]

If no emails found, return: []

Important: 
- Only include emails that belong to ${facilityName}
- Skip generic emails from other websites or directories
- Verify the email domain matches the company website
- Include the source URL where you found each email`

    console.log('[Enrichment] Searching for:', facilityName, location, facilityWebsiteUrl)

    // Call Perplexity API with better model
    const apiUrl = 'https://api.perplexity.ai/chat/completions'
    console.log('[Enrichment] Calling Perplexity API:', apiUrl)
    
    const perplexityResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar', // Updated from deprecated 'llama-3.1-sonar-small-128k-online' to current 'sonar' model
        messages: [
          {
            role: 'system',
            content: 'You are an expert at finding business contact information from websites. Your goal is to extract email addresses, names, titles, and any other relevant contact information. Always return data in a structured JSON format. Only return verified information that you find on the website. If you cannot find information, return an empty array.',
          },
          {
            role: 'user',
            content: searchQuery,
          },
        ],
        temperature: 0.1, // Low temperature for factual extraction
        max_tokens: 2000,
        return_citations: true,
        search_recency_filter: 'month', // Prefer recent results
      }),
    })

    if (!perplexityResponse.ok) {
      let errorText = ''
      let errorData: any = null
      
      try {
        errorText = await perplexityResponse.text()
        errorData = JSON.parse(errorText)
      } catch (e) {
        // If parsing fails, use text as is
      }
      
      console.error('[Enrichment] Perplexity API error:', {
        status: perplexityResponse.status,
        statusText: perplexityResponse.statusText,
        error: errorData || errorText,
      })
      
      // Provide more specific error messages
      let errorMessage = 'Failed to search for contact information'
      
      if (perplexityResponse.status === 401) {
        errorMessage = 'Perplexity API key is invalid or missing. Please check your API configuration.'
      } else if (perplexityResponse.status === 429) {
        errorMessage = 'Perplexity API rate limit exceeded. Please try again later.'
      } else if (perplexityResponse.status === 400) {
        errorMessage = errorData?.error?.message || 'Invalid request to Perplexity API'
      } else if (errorData?.error?.message) {
        errorMessage = `Perplexity API error: ${errorData.error.message}`
      } else if (errorText) {
        errorMessage = `API error: ${errorText.substring(0, 200)}`
      }
      
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? {
            status: perplexityResponse.status,
            error: errorData || errorText,
          } : undefined,
        },
        { status: 500 }
      )
    }

    const data = await perplexityResponse.json()
    const content = data.choices[0]?.message?.content || ''
    const citations = data.citations || []

    console.log('[Enrichment] Received response, length:', content.length)

    // Parse the response to extract structured data
    const result: EnrichmentResult = {
      emails: [],
      phones: [],
      contacts: [],
      source: 'perplexity',
      confidence: 'medium',
    }

    // Try to parse JSON from response
    let parsedContacts: any[] = []
    
    try {
      // Remove markdown code blocks if present
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      // Try direct JSON parsing
      parsedContacts = JSON.parse(cleanedContent)
      
      if (!Array.isArray(parsedContacts)) {
        throw new Error('Response is not an array')
      }
    } catch (parseError) {
      // Fallback: Find JSON array in text
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        try {
          parsedContacts = JSON.parse(jsonMatch[0])
        } catch (e) {
          console.warn('[Enrichment] Failed to parse JSON from match')
        }
      }
    }

    // Helper function to validate email
    function isValidEmail(email: string): boolean {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/
      return emailRegex.test(email)
    }

    // Helper function to extract domain from URL
    function extractDomain(url: string): string | null {
      try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
        return urlObj.hostname.replace('www.', '').toLowerCase()
      } catch {
        return null
      }
    }

    // If we got structured data, use it
    if (parsedContacts.length > 0) {
      parsedContacts.forEach((item: any) => {
        if (item.email && isValidEmail(item.email)) {
          result.emails.push(item.email.toLowerCase())
          
          // Add to contacts if we have name or title
          if (item.name || item.title) {
            result.contacts.push({
              name: item.name || null,
              title: item.title || null,
              email: item.email.toLowerCase(),
              phone: item.phone || null,
            })
          }
        }
      })
    } else {
      // Fallback: Extract emails using regex
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
      const foundEmails = (content.match(emailRegex) || []) as string[]
      
      // Filter to company domain if we have website
      if (facilityWebsiteUrl) {
        const domain = extractDomain(facilityWebsiteUrl)
        if (domain) {
          result.emails = [...new Set(foundEmails.filter((email: string) => {
            const emailDomain = email.split('@')[1]?.toLowerCase()
            return emailDomain === domain || emailDomain?.includes(domain) || domain.includes(emailDomain)
          }))]
        } else {
          result.emails = [...new Set(foundEmails)]
        }
      } else {
        result.emails = [...new Set(foundEmails)]
      }
    }

    // Extract phone numbers (various formats)
    const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g
    const foundPhones = (content.match(phoneRegex) || []) as string[]
    result.phones = [...new Set(foundPhones.map((p: string) => p.replace(/\D/g, '').replace(/^1/, '')))]

    // If we have existing phone, add it
    if (phone && !result.phones.includes(phone.replace(/\D/g, ''))) {
      result.phones.unshift(phone.replace(/\D/g, ''))
    }

    // Determine confidence based on results
    if (result.emails.length > 0 && result.phones.length > 0) {
      result.confidence = 'high'
    } else if (result.emails.length > 0) {
      result.confidence = 'medium'
    } else {
      result.confidence = 'low'
    }

    return NextResponse.json({
      success: true,
      data: result,
      citations,
    })
  } catch (error: any) {
    console.error('[Enrichment] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to enrich facility contacts',
      },
      { status: 500 }
    )
  }
}

