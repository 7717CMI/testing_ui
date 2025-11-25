export interface DataGap {
  facility: any
  missingFields: string[]
  webSearchQuery: string
}

// 1. Detect what's missing
export function detectGaps(
  facilities: any[],
  requestedFields: string[],
  availableFields: string[]
): DataGap[] {
  const gaps: DataGap[] = []

  // Fields that need web search
  const webSearchFields = ['beds', 'bed_count', 'capacity', 'specialties', 'services', 'ratings', 'emergency', 'trauma_level', 'revenue', 'income', 'annual_revenue', 'sales', 'email', 'emails', 'email_address', 'contact_email', 'website', 'url']

  for (const facility of facilities) {
    const missing = requestedFields.filter(field => 
      webSearchFields.includes(field.toLowerCase()) || 
      (!availableFields.includes(field) && !facility[field])
    )

    if (missing.length > 0) {
      gaps.push({
        facility,
        missingFields: missing,
        webSearchQuery: buildWebSearchQuery(facility, missing)
      })
    }
  }

  return gaps
}

// 2. Build smart search query for Perplexity
function buildWebSearchQuery(facility: any, missingFields: string[]): string {
  const parts = [facility.name]
  
  if (facility.city) parts.push(facility.city)
  if (facility.state) parts.push(facility.state)
  
  // Add field-specific keywords
  const fieldKeywords: Record<string, string> = {
    beds: 'bed count capacity',
    bed_count: 'bed count capacity',
    capacity: 'bed count capacity',
    specialties: 'specialties services departments',
    services: 'specialties services departments',
    ratings: 'ratings reviews quality',
    emergency: 'emergency room ER',
    trauma_level: 'trauma level center',
    revenue: 'annual revenue income financial performance',
    income: 'annual revenue income financial performance',
    annual_revenue: 'annual revenue income financial performance',
    sales: 'annual revenue income financial performance',
    email: 'contact email address',
    emails: 'contact email address',
    email_address: 'contact email address',
    contact_email: 'contact email address',
    website: 'official website URL',
    url: 'official website URL'
  }

  for (const field of missingFields) {
    const keyword = fieldKeywords[field.toLowerCase()]
    if (keyword) {
      parts.push(keyword)
    } else {
      parts.push(field)
    }
  }
  
  return parts.join(' ')
}

// 3. Fill gaps using Perplexity API
export async function fillGapsWithWebSearch(gaps: DataGap[]): Promise<Map<number, any>> {
  const enrichedData = new Map<number, any>()

  // Limit to first 5 facilities to avoid excessive API calls
  const limitedGaps = gaps.slice(0, 5)

  for (const gap of limitedGaps) {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [{
            role: 'user',
            content: `Find ONLY factual data about ${gap.facility.name} in ${gap.facility.city}, ${gap.facility.state}. 
            
Needed information: ${gap.missingFields.join(', ')}

Return JSON format with ONLY these fields (use null if not found):
{
  "beds": <number or null>,
  "specialties": [<array of strings or empty>],
  "emergency": <boolean or null>,
  "revenue": <number in millions or null>,
  "email": "<email address or null>",
  "website": "<website URL or null>"
}

Be concise and factual. No explanations.`
          }],
          return_citations: false,
          temperature: 0.1
        })
      })

      if (!response.ok) {
        console.warn(`[Web Search] Failed for ${gap.facility.name}: ${response.status}`)
        continue
      }

      const data = await response.json()
      const content = data.choices[0].message.content

      // Try to parse as JSON
      try {
        const webData = JSON.parse(content)
        enrichedData.set(gap.facility.id, webData)
        console.log(`[Web Search] Enriched ${gap.facility.name}:`, webData)
      } catch {
        // Fallback: extract from text
        const extracted = extractDataFromText(content, gap.missingFields)
        if (Object.keys(extracted).length > 0) {
          enrichedData.set(gap.facility.id, extracted)
          console.log(`[Web Search] Extracted from text for ${gap.facility.name}:`, extracted)
        }
      }
    } catch (error) {
      console.error(`[Web Search] Error for ${gap.facility.name}:`, error)
      // Continue without this data (graceful degradation)
    }
  }

  return enrichedData
}

// 4. Extract data from text (fallback)
function extractDataFromText(text: string, fields: string[]): any {
  const result: any = {}
  
  // Extract bed count
  if (fields.some(f => ['beds', 'bed_count', 'capacity'].includes(f.toLowerCase()))) {
    const bedMatch = text.match(/(\d+)\s*(beds?|bed\s*capacity)/i)
    if (bedMatch) {
      result.beds = parseInt(bedMatch[1])
    }
  }

  // Extract specialties
  if (fields.some(f => ['specialties', 'services'].includes(f.toLowerCase()))) {
    const specialtyMatch = text.match(/specialt(?:y|ies):\s*([^\.]+)/i)
    if (specialtyMatch) {
      result.specialties = specialtyMatch[1]
        .split(/,|and/)
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .slice(0, 5) // Limit to 5
    }
  }

  // Extract emergency info
  if (fields.some(f => f.toLowerCase() === 'emergency')) {
    result.emergency = /emergency|ER|trauma/i.test(text)
  }

  // Extract revenue/income
  if (fields.some(f => ['revenue', 'income', 'annual_revenue', 'sales'].includes(f.toLowerCase()))) {
    // Match patterns like "$100M", "$1.5 billion", "100 million"
    const revenueMatch = text.match(/\$?([\d,.]+)\s*(million|billion|M|B)/i)
    if (revenueMatch) {
      let amount = parseFloat(revenueMatch[1].replace(/,/g, ''))
      const unit = revenueMatch[2].toLowerCase()
      if (unit === 'billion' || unit === 'b') {
        amount = amount * 1000 // Convert to millions
      }
      result.revenue = Math.round(amount)
    }
  }

  // Extract email address
  if (fields.some(f => ['email', 'emails', 'email_address', 'contact_email'].includes(f.toLowerCase()))) {
    const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i)
    if (emailMatch) {
      result.email = emailMatch[1]
    }
  }

  // Extract website/URL
  if (fields.some(f => ['website', 'url'].includes(f.toLowerCase()))) {
    const urlMatch = text.match(/(https?:\/\/[^\s]+)|(?:www\.)([^\s]+\.[a-z]{2,})/i)
    if (urlMatch) {
      result.website = urlMatch[1] || `https://${urlMatch[2]}`
    }
  }

  return result
}

