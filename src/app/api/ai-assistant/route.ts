import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// System prompt with website knowledge
const SYSTEM_PROMPT = `You are HealthData AI, a helpful assistant for a healthcare data platform. You help users navigate and understand our comprehensive U.S. healthcare provider database.

**Platform Overview:**
- 6+ Million healthcare providers indexed
- Real-time data from PostgreSQL database
- Categories: Hospitals, Clinics, Agencies, Assisted Living, Blood & Eye Banks, Custodial Facilities, Home Health Agency, Hospice, Laboratory, Mental Health Units, Pharmacy, SNF (Skilled Nursing)
- Data includes: NPI numbers, addresses, phone numbers, taxonomy codes, licenses, and more

**Key Features:**
1. **Data Catalog** (/data-catalog) - Browse by category and facility type
2. **Custom Dataset Builder** (/data-catalog/custom) - Build filtered datasets with specific criteria
3. **Search** (/search) - Search providers by name, location, specialty
4. **Detailed Provider Info** - View complete provider details including business/mailing addresses, taxonomy, licenses

**Common Facility Types:**
- Hospitals: Children's Hospital, Critical Access Hospital, Chronic Disease Hospital, Military Hospital, etc.
- Clinics: Adult Day Care Clinic, Mental Health Clinic, Adolescent Clinic, etc.
- Agencies: Home Health Agency, Hospice, Medical Equipment Suppliers
- And many more...

**How to Help Users:**
1. If they ask about specific facility types (e.g., "military hospitals"), provide the direct link
2. If they want to search by location, explain the custom dataset builder
3. If they need data export, mention CSV export feature
4. Always be helpful and provide specific navigation paths

**Important URLs:**
- Main Catalog: /data-catalog
- Hospitals: /data-catalog/hospital
- Clinics: /data-catalog/clinic
- Custom Builder: /data-catalog/custom
- Search: /search

When users ask about specific facility types, generate links in this format:
- Category pages: /data-catalog/[category-slug]
- Facility type pages: /data-catalog/[category-slug]/[facility-type-slug]

Be conversational, helpful, and concise. Provide actionable links when relevant.`

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    // Build conversation history
    const messages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-5).map((msg: Message) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ]

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    const responseMessage = completion.choices[0].message.content || 'I apologize, I could not generate a response.'

    // Extract links from response
    const links = extractLinks(message, responseMessage)

    return NextResponse.json({
      message: responseMessage,
      links,
    })
  } catch (error) {
    console.error('AI Assistant Error:', error)
    return NextResponse.json(
      { 
        message: "I'm experiencing technical difficulties. Please try again in a moment.",
        error: error.message 
      },
      { status: 500 }
    )
  }
}

function extractLinks(userMessage: string, aiResponse: string): Array<{ text: string; url: string }> {
  const links: Array<{ text: string; url: string }> = []
  const lowerMessage = userMessage.toLowerCase()

  // Facility type mappings
  const facilityMappings: Record<string, { category: string; type?: string; text: string }> = {
    'military hospital': { category: 'hospital', type: 'military-hospital', text: 'View Military Hospitals' },
    'children hospital': { category: 'hospital', type: 'childrens-hospital', text: 'View Children\'s Hospitals' },
    'critical access hospital': { category: 'hospital', type: 'critical-access-hospital', text: 'View Critical Access Hospitals' },
    'mental health clinic': { category: 'clinic', type: 'adolescent-and-children-mental-health-clinic-center', text: 'View Mental Health Clinics' },
    'adult day care': { category: 'clinic', type: 'adult-day-care-clinic-center', text: 'View Adult Day Care Clinics' },
    'hospice': { category: 'hospice', text: 'View Hospice Facilities' },
    'pharmacy': { category: 'pharmacy', text: 'View Pharmacies' },
    'laboratory': { category: 'laboratory', text: 'View Laboratories' },
    'home health': { category: 'home-health-agency', text: 'View Home Health Agencies' },
  }

  // Check for matches
  for (const [keyword, mapping] of Object.entries(facilityMappings)) {
    if (lowerMessage.includes(keyword)) {
      const url = mapping.type 
        ? `/data-catalog/${mapping.category}/${mapping.type}`
        : `/data-catalog/${mapping.category}`
      links.push({ text: mapping.text, url })
    }
  }

  // General category links
  if (lowerMessage.includes('hospital') && links.length === 0) {
    links.push({ text: 'Browse All Hospitals', url: '/data-catalog/hospital' })
  }
  if (lowerMessage.includes('clinic') && links.length === 0) {
    links.push({ text: 'Browse All Clinics', url: '/data-catalog/clinic' })
  }
  if (lowerMessage.includes('custom dataset') || lowerMessage.includes('filter') || lowerMessage.includes('export')) {
    links.push({ text: 'Build Custom Dataset', url: '/data-catalog/custom' })
  }
  if (lowerMessage.includes('search')) {
    links.push({ text: 'Advanced Search', url: '/search' })
  }

  return links
}

