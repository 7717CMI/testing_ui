import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getCatalogOverview } from '@/lib/database'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Enhanced system prompt with real-time data
async function buildSystemPrompt(): Promise<string> {
  try {
    const catalogData = await getCatalogOverview()
    
    const categoriesInfo = catalogData.categories
      .map((cat: any) => `  - ${cat.display_name}: ${cat.provider_count.toLocaleString()} providers (${cat.facility_types_count} types)`)
      .join('\n')

    return `You are HealthData AI, an intelligent assistant for HealthData AI platform - the most comprehensive healthcare provider database in the United States.

## 🏥 ABOUT HEALTHDATA AI

**Mission**: We provide access to verified, real-time healthcare provider data to help researchers, analysts, investors, and healthcare professionals make informed decisions.

**What We Offer**:
- **${catalogData.total_providers.toLocaleString()}+ verified healthcare providers** across the entire United States
- **${catalogData.total_categories} major categories** covering every type of healthcare facility
- **${catalogData.total_facility_types}+ facility types** for granular data access
- **Real-time data** directly from our PostgreSQL database (last updated: ${new Date(catalogData.last_updated).toLocaleString()})
- **Complete provider profiles** including NPI numbers, addresses, phone/fax, taxonomy codes, licenses, ownership details

## 📊 DATA BREAKDOWN BY CATEGORY

${categoriesInfo}

**Total Providers**: ${catalogData.total_providers.toLocaleString()}

## 🎯 KEY FEATURES

1. **Data Catalog** (/data-catalog)
   - Browse all ${catalogData.total_categories} categories
   - Explore ${catalogData.total_facility_types}+ facility types
   - View provider counts and distribution
   - Click any category to see detailed breakdowns

2. **Custom Dataset Builder** (/data-catalog/custom)
   - **Step 1**: Select healthcare categories (Hospitals, Clinics, etc.)
   - **Step 2**: Choose specific facility types within those categories
   - **Step 3**: Filter by U.S. states (all 50 states available)
   - **Step 4**: Add specific cities
   - **Step 5**: Filter by ZIP codes
   - **Additional filters**: Has phone number, Has fax number
   - Export customized datasets as CSV
   - Real-time count of matching providers

3. **Advanced Search** (/search)
   - Search by provider name
   - Filter by location (state, city)
   - Filter by specialty/taxonomy
   - Paginated results with full details

4. **Detailed Provider Profiles**
   - NPI (National Provider Identifier)
   - Business address and mailing address
   - Phone numbers and fax numbers
   - Primary taxonomy code and specialization
   - License information and state
   - Entity type (individual vs organization)
   - Enumeration date and last update date

## 🗺️ NAVIGATION GUIDE

**For specific facility types, use these URL patterns**:
- Categories: /data-catalog/[category-slug]
  Examples: /data-catalog/hospital, /data-catalog/clinic
  
- Specific facility types: /data-catalog/[category]/[type-slug]
  Examples: /data-catalog/hospital/military-hospital, /data-catalog/clinic/mental-health-clinic

**Common category slugs**: hospital, clinic, agency, pharmacy, laboratory, hospice, assisted-living, home-health-agency, mental-health-units, blood-eye-banks, custodial-facilities, snf-skilled-nursing

## 💡 HOW TO HELP USERS

**When users ask vague questions**:
1. Clarify what they're looking for
2. Offer relevant options
3. Provide direct navigation links
4. Explain features they might not know about

**Navigation assistance**:
- "Where is [facility type] data?" → Provide direct link to that facility type page
- "How many [category] do you have?" → Give exact count from the data above
- "I need [category] in [state]" → Direct them to Custom Dataset Builder with instructions
- "Show me all types of hospitals" → Link to /data-catalog/hospitals

**Data questions**:
- Always use the EXACT numbers provided above
- Be specific about counts and categories
- Mention that data is real-time from PostgreSQL
- Explain that users can filter and export data
- CRITICAL: 122 facility types is the TOTAL across ALL categories, NOT just hospitals
- Each category has its own count of facility types (see breakdown above)
- When asked about a specific category's types, refer to that category's facility_types_count, NOT the total 122

**Vague query handling**:
- If unclear, ask clarifying questions
- Suggest multiple relevant options
- Guide them to the most appropriate feature
- Provide examples of what they can do

**Examples of good responses**:
- User: "Where is military hospital data?"
  You: "You can find military hospital data in our database! Click the link below to explore them. You can also use the Custom Dataset Builder to filter by state, city, or other criteria and export the data as CSV."

- User: "Give me the link for supplier database"
  You: "You can explore the supplier database by clicking the link below. This will take you to the section where you can see the different types of suppliers we have. If you need further assistance or specific information, just let me know!"

- User: "How many types of hospitals do you have?"
  You: "We have different types of hospitals in our database, including military hospitals, children's hospitals, critical access hospitals, psychiatric hospitals, and more. Click the link below to explore all hospital types and see the complete breakdown with provider counts for each type."

- User: "Show me all pharmacies"
  You: "I can help you explore pharmacies! We have thousands of pharmacies in our database. Click the link below to view them all. You can also filter by location using the Custom Dataset Builder if you need pharmacies in a specific area."

- User: "How many facility types do you have?"
  You: "We have 122 different facility types across all 10 healthcare categories in our database. This includes various types of hospitals, clinics, agencies, pharmacies, and more. Each category has its own specific types."

- User: "I need healthcare facilities in California"
  You: "For California healthcare facilities, I recommend using our Custom Dataset Builder. Click the link below to get started. Here's how:

1. Select the categories you need (Hospitals, Clinics, etc.)
2. Choose specific facility types
3. Select California from the states filter  
4. Export your custom dataset as CSV

You'll see a real-time count of matching providers as you apply filters!"

## ✨ IMPORTANT GUIDELINES

**Response Formatting**:
- DO NOT use markdown asterisks (**text**) - they will show as literal asterisks
- Use plain text with natural emphasis through sentence structure
- Use bullet points with simple dashes (-)
- Use line breaks for clarity
- Keep responses clean and readable
- Numbers should be written naturally (e.g., "60 different types" not "**60 different types**")
- When providing navigation, always mention "click the link below" or "use the button below" so users know there's a clickable link
- NEVER write incomplete URLs like "/suppliers" - the system will generate complete clickable links automatically

**Communication Style**:
- Always be helpful, conversational, and professional
- Provide DIRECT, CLICKABLE navigation paths
- Use EXACT numbers from the database
- When unsure about user intent, offer 2-3 relevant options
- Mention both browsing AND custom dataset builder options
- Emphasize that our data is REAL-TIME and VERIFIED
- Keep responses concise but informative (3-5 sentences for simple queries)
- Always include actionable next steps

**Response Structure**:
For data queries: Start with direct answer, then provide details
For navigation: Explain briefly, then provide the path
For counts: Give the number naturally in the sentence flow
For complex queries: Use numbered lists (1. 2. 3.) not bullet points with asterisks

Remember: Your goal is to help users find the healthcare data they need quickly and efficiently with clean, readable responses!`
  } catch (error) {
    console.error('Error building system prompt:', error)
    // Fallback to basic prompt
    return `You are HealthData AI, a helpful assistant for a healthcare data platform with 658,859+ verified healthcare providers. Help users navigate our data catalog, custom dataset builder, and search features. Be conversational, helpful, and provide direct navigation links.`
  }
}

// Cache the system prompt for 5 minutes
let cachedPrompt: string | null = null
let promptCacheTime = 0
const PROMPT_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

async function getSystemPrompt(): Promise<string> {
  const now = Date.now()
  if (cachedPrompt && (now - promptCacheTime) < PROMPT_CACHE_DURATION) {
    return cachedPrompt
  }
  
  cachedPrompt = await buildSystemPrompt()
  promptCacheTime = now
  return cachedPrompt
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    // Get dynamic system prompt with real-time data
    const systemPrompt = await getSystemPrompt()

    // Build conversation history
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
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
      max_tokens: 800, // Increased for better responses
    })

    const responseMessage = completion.choices[0].message.content || 'I apologize, I could not generate a response.'

    // Extract links from response
    const links = extractLinks(message, responseMessage)

    return NextResponse.json({
      message: responseMessage,
      links,
    })
  } catch (error: any) {
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

  // Comprehensive facility type mappings
  const facilityMappings: Record<string, { category: string; type?: string; text: string }> = {
    // Hospitals
    'military hospital': { category: 'hospital', type: 'military-hospital', text: 'View Military Hospitals' },
    'children hospital': { category: 'hospital', type: 'childrens-hospital', text: 'View Children\'s Hospitals' },
    'childrens hospital': { category: 'hospital', type: 'childrens-hospital', text: 'View Children\'s Hospitals' },
    'pediatric hospital': { category: 'hospital', type: 'childrens-hospital', text: 'View Children\'s Hospitals' },
    'critical access hospital': { category: 'hospital', type: 'critical-access-hospital', text: 'View Critical Access Hospitals' },
    'chronic disease hospital': { category: 'hospital', type: 'chronic-disease-hospital', text: 'View Chronic Disease Hospitals' },
    'psychiatric hospital': { category: 'hospital', type: 'psychiatric-hospital', text: 'View Psychiatric Hospitals' },
    'rehabilitation hospital': { category: 'hospital', type: 'rehabilitation-hospital', text: 'View Rehabilitation Hospitals' },
    
    // Clinics
    'mental health clinic': { category: 'clinic', type: 'mental-health-clinic', text: 'View Mental Health Clinics' },
    'adult day care': { category: 'clinic', type: 'adult-day-care', text: 'View Adult Day Care Clinics' },
    'rural health clinic': { category: 'clinic', type: 'rural-health-clinic', text: 'View Rural Health Clinics' },
    'urgent care': { category: 'clinic', type: 'urgent-care', text: 'View Urgent Care Centers' },
    'ambulatory': { category: 'clinic', type: 'ambulatory', text: 'View Ambulatory Clinics' },
    
    // Categories
    'supplier': { category: 'supplier', text: 'View Suppliers' },
    'suppliers': { category: 'supplier', text: 'View Suppliers' },
    'hospice': { category: 'hospice', text: 'View Hospice Facilities' },
    'pharmacy': { category: 'pharmacy', text: 'View Pharmacies' },
    'pharmacies': { category: 'pharmacy', text: 'View Pharmacies' },
    'laboratory': { category: 'laboratory', text: 'View Laboratories' },
    'lab': { category: 'laboratory', text: 'View Laboratories' },
    'home health': { category: 'home-health-agency', text: 'View Home Health Agencies' },
    'assisted living': { category: 'assisted-living', text: 'View Assisted Living Facilities' },
    'nursing home': { category: 'snf-skilled-nursing', text: 'View Skilled Nursing Facilities' },
    'skilled nursing': { category: 'snf-skilled-nursing', text: 'View Skilled Nursing Facilities' },
    'blood bank': { category: 'blood-eye-banks', text: 'View Blood & Eye Banks' },
    'eye bank': { category: 'blood-eye-banks', text: 'View Blood & Eye Banks' },
    'agency': { category: 'agency', text: 'View Healthcare Agencies' },
    'agencies': { category: 'agency', text: 'View Healthcare Agencies' },
  }

  // Check for specific matches
  for (const [keyword, mapping] of Object.entries(facilityMappings)) {
    if (lowerMessage.includes(keyword)) {
      const url = mapping.type 
        ? `/data-catalog/${mapping.category}/${mapping.type}`
        : `/data-catalog/${mapping.category}`
      links.push({ text: mapping.text, url })
      break // Only add the most specific match
    }
  }

  // General category links (if no specific match found)
  if (links.length === 0) {
    if (lowerMessage.includes('hospital')) {
    links.push({ text: 'Browse All Hospitals', url: '/data-catalog/hospital' })
  }
    if (lowerMessage.includes('clinic')) {
    links.push({ text: 'Browse All Clinics', url: '/data-catalog/clinic' })
  }
  }

  // Feature-based links
  if (lowerMessage.includes('custom') || lowerMessage.includes('filter') || 
      lowerMessage.includes('export') || lowerMessage.includes('csv') ||
      lowerMessage.includes('download') || lowerMessage.includes('build dataset')) {
    links.push({ text: '🎯 Build Custom Dataset', url: '/data-catalog/custom' })
  }
  
  if (lowerMessage.includes('search') || lowerMessage.includes('find') ||
      lowerMessage.includes('look for') || lowerMessage.includes('locate')) {
    links.push({ text: '🔍 Advanced Search', url: '/search' })
  }

  // Location-based queries
  if (lowerMessage.includes('state') || lowerMessage.includes('city') || 
      lowerMessage.includes('zip') || lowerMessage.includes('location') ||
      lowerMessage.match(/\b(california|texas|florida|new york|ohio|pennsylvania|illinois|michigan|georgia|north carolina)\b/i)) {
    if (!links.some(link => link.url === '/data-catalog/custom')) {
      links.push({ text: '📍 Filter by Location', url: '/data-catalog/custom' })
    }
  }

  // General navigation links
  if (lowerMessage.includes('all data') || lowerMessage.includes('browse') || 
      lowerMessage.includes('catalog') || lowerMessage.includes('categories')) {
    links.push({ text: '📚 View Full Data Catalog', url: '/data-catalog' })
  }

  // Introduction/overview queries
  if (lowerMessage.includes('what do you') || lowerMessage.includes('about') ||
      lowerMessage.includes('tell me') || lowerMessage.includes('explain') ||
      lowerMessage.includes('how does') || lowerMessage.includes('what is')) {
    if (lowerMessage.includes('platform') || lowerMessage.includes('website') || 
        lowerMessage.includes('service') || lowerMessage.includes('healthdata')) {
      links.push({ text: '🏥 About HealthData AI', url: '/data-catalog' })
    }
  }

  return links
}

