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
- ALWAYS mention specific facility types by name (e.g., "military hospitals", "urgent care centers") so the system can generate accurate links

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

    // Check if OpenAI API key is configured
    const hasValidApiKey = process.env.OPENAI_API_KEY && 
                          process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' &&
                          process.env.OPENAI_API_KEY.startsWith('sk-')

    let responseMessage: string

    if (!hasValidApiKey) {
      // Use mock response when API key is not configured
      console.log('⚠️ OpenAI API key not configured, using mock response')
      responseMessage = generateMockResponse(message)
    } else {
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
        max_tokens: 800,
      })

      responseMessage = completion.choices[0].message.content || 'I apologize, I could not generate a response.'
    }

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

// Generate mock response when OpenAI API is not available
function generateMockResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase()
  
  // Military hospitals
  if (lowerMessage.includes('military hospital')) {
    return "I can help you find military hospitals in our database! We have military hospital data that you can access by clicking the link below. These facilities serve active duty military personnel and their families across the United States."
  }
  
  // Urgent care
  if (lowerMessage.includes('urgent care')) {
    return "We have comprehensive urgent care center data in our platform. You can view all urgent care facilities by clicking the link below, or use our Custom Dataset Builder to filter by location, state, or other criteria and export the data."
  }
  
  // Pharmacies
  if (lowerMessage.includes('pharmac')) {
    return "Our database includes thousands of pharmacies across the United States. Click the link below to browse all pharmacies, or use the Custom Dataset Builder to filter by specific locations and export your custom dataset."
  }
  
  // Mental health
  if (lowerMessage.includes('mental health')) {
    return "We have extensive mental health clinic and facility data. You can explore mental health clinics by clicking the link below. Use our filtering tools to narrow down by location, services, or other criteria."
  }
  
  // Dialysis
  if (lowerMessage.includes('dialysis')) {
    return "Our platform includes dialysis center data from across the country. Click the link below to view all dialysis facilities, and you can filter by state, city, or ZIP code using our Custom Dataset Builder."
  }
  
  // Export/filter
  if (lowerMessage.includes('export') || lowerMessage.includes('download') || lowerMessage.includes('csv')) {
    return "To export data, use our Custom Dataset Builder! You can select specific healthcare categories, facility types, filter by location (states, cities, ZIP codes), and add additional filters like phone number availability. Then export your customized dataset as a CSV file. Click the link below to get started."
  }
  
  // Location-based
  if (lowerMessage.includes('california') || lowerMessage.includes('texas') || lowerMessage.includes('florida')) {
    const state = lowerMessage.includes('california') ? 'California' : lowerMessage.includes('texas') ? 'Texas' : 'Florida'
    return `To find healthcare facilities in ${state}, I recommend using our Custom Dataset Builder. You can select the categories you need (hospitals, clinics, agencies, etc.), choose specific facility types, then filter by ${state}. You'll see a real-time count of matching providers and can export the data as CSV. Click the link below to start building your custom dataset.`
  }
  
  // General facilities
  if (lowerMessage.includes('hospital') && !lowerMessage.includes('military')) {
    return "We have 189,547+ hospitals in our database across all types including general acute care, children's hospitals, psychiatric hospitals, and more. Click the link below to browse all hospitals or search for specific types."
  }
  
  if (lowerMessage.includes('clinic')) {
    return "Our platform includes 239,713+ clinics covering urgent care, mental health clinics, rural health clinics, ambulatory care, and more. Browse all clinics using the link below or filter by specific types."
  }
  
  // About platform
  if (lowerMessage.includes('what') || lowerMessage.includes('about') || lowerMessage.includes('platform')) {
    return "HealthData AI is a comprehensive healthcare provider database platform with 658,859+ verified providers across the United States. We offer real-time data covering 10 major categories and 122+ facility types. You can browse our data catalog, use advanced search, build custom datasets, and export data for your analysis needs."
  }
  
  // Default response
  return "I can help you navigate our healthcare database with 658,859+ verified providers. You can browse by categories (hospitals, clinics, agencies, pharmacies, etc.), search for specific facilities, or use our Custom Dataset Builder to create and export customized datasets. What specific information are you looking for?"
}

function extractLinks(userMessage: string, aiResponse: string): Array<{ text: string; url: string }> {
  const links: Array<{ text: string; url: string }> = []
  const lowerMessage = userMessage.toLowerCase()
  const lowerResponse = aiResponse.toLowerCase()

  // Comprehensive facility type mappings - EXPANDED
  const facilityMappings: Record<string, { category: string; type?: string; text: string; priority: number }> = {
    // Hospitals - Priority 10 (most specific)
    'military hospital': { category: 'hospital', type: 'military-hospital', text: '🏥 View Military Hospitals', priority: 10 },
    'children hospital': { category: 'hospital', type: 'childrens-hospital', text: '🏥 View Children\'s Hospitals', priority: 10 },
    'childrens hospital': { category: 'hospital', type: 'childrens-hospital', text: '🏥 View Children\'s Hospitals', priority: 10 },
    'pediatric hospital': { category: 'hospital', type: 'childrens-hospital', text: '🏥 View Children\'s Hospitals', priority: 10 },
    'critical access hospital': { category: 'hospital', type: 'critical-access-hospital', text: '🏥 View Critical Access Hospitals', priority: 10 },
    'chronic disease hospital': { category: 'hospital', type: 'chronic-disease-hospital', text: '🏥 View Chronic Disease Hospitals', priority: 10 },
    'psychiatric hospital': { category: 'hospital', type: 'psychiatric-hospital', text: '🏥 View Psychiatric Hospitals', priority: 10 },
    'mental hospital': { category: 'hospital', type: 'psychiatric-hospital', text: '🏥 View Psychiatric Hospitals', priority: 10 },
    'rehabilitation hospital': { category: 'hospital', type: 'rehabilitation-hospital', text: '🏥 View Rehabilitation Hospitals', priority: 10 },
    'rehab hospital': { category: 'hospital', type: 'rehabilitation-hospital', text: '🏥 View Rehabilitation Hospitals', priority: 10 },
    'general hospital': { category: 'hospital', type: 'general-acute-care-hospital', text: '🏥 View General Hospitals', priority: 10 },
    'acute care hospital': { category: 'hospital', type: 'general-acute-care-hospital', text: '🏥 View Acute Care Hospitals', priority: 10 },
    
    // Clinics - Priority 10
    'mental health clinic': { category: 'clinic', type: 'mental-health-clinic', text: '🏥 View Mental Health Clinics', priority: 10 },
    'adult day care': { category: 'clinic', type: 'adult-day-care', text: '🏥 View Adult Day Care Clinics', priority: 10 },
    'rural health clinic': { category: 'clinic', type: 'rural-health-clinic', text: '🏥 View Rural Health Clinics', priority: 10 },
    'rural clinic': { category: 'clinic', type: 'rural-health-clinic', text: '🏥 View Rural Health Clinics', priority: 10 },
    'urgent care': { category: 'clinic', type: 'urgent-care', text: '🏥 View Urgent Care Centers', priority: 10 },
    'ambulatory': { category: 'clinic', type: 'ambulatory', text: '🏥 View Ambulatory Clinics', priority: 10 },
    'ambulatory clinic': { category: 'clinic', type: 'ambulatory', text: '🏥 View Ambulatory Clinics', priority: 10 },
    'dialysis': { category: 'clinic', type: 'dialysis', text: '🏥 View Dialysis Centers', priority: 10 },
    'dialysis center': { category: 'clinic', type: 'dialysis', text: '🏥 View Dialysis Centers', priority: 10 },
    
    // Agencies - Priority 10
    'home health agency': { category: 'agency', type: 'home-health-agency', text: '🏥 View Home Health Agencies', priority: 10 },
    'home health': { category: 'agency', type: 'home-health-agency', text: '🏥 View Home Health Agencies', priority: 10 },
    'hospice': { category: 'agency', type: 'hospice', text: '🏥 View Hospice Agencies', priority: 10 },
    
    // Suppliers - Priority 10
    'dme supplier': { category: 'supplier', type: 'durable-medical-equipment', text: '🏥 View DME Suppliers', priority: 10 },
    'medical equipment': { category: 'supplier', type: 'durable-medical-equipment', text: '🏥 View Medical Equipment Suppliers', priority: 10 },
    
    // Categories - Priority 5 (less specific)
    'hospital': { category: 'hospital', text: '🏥 Browse All Hospitals', priority: 5 },
    'hospitals': { category: 'hospital', text: '🏥 Browse All Hospitals', priority: 5 },
    'clinic': { category: 'clinic', text: '🏥 Browse All Clinics', priority: 5 },
    'clinics': { category: 'clinic', text: '🏥 Browse All Clinics', priority: 5 },
    'supplier': { category: 'supplier', text: '🏥 View All Suppliers', priority: 5 },
    'suppliers': { category: 'supplier', text: '🏥 View All Suppliers', priority: 5 },
    'pharmacy': { category: 'pharmacy', text: '💊 View All Pharmacies', priority: 5 },
    'pharmacies': { category: 'pharmacy', text: '💊 View All Pharmacies', priority: 5 },
    'laboratory': { category: 'laboratory', text: '🔬 View All Laboratories', priority: 5 },
    'lab': { category: 'laboratory', text: '🔬 View All Laboratories', priority: 5 },
    'labs': { category: 'laboratory', text: '🔬 View All Laboratories', priority: 5 },
    'assisted living': { category: 'assisted-living', text: '🏡 View Assisted Living Facilities', priority: 5 },
    'nursing home': { category: 'snf-skilled-nursing', text: '🏥 View Skilled Nursing Facilities', priority: 5 },
    'skilled nursing': { category: 'snf-skilled-nursing', text: '🏥 View Skilled Nursing Facilities', priority: 5 },
    'nursing facility': { category: 'snf-skilled-nursing', text: '🏥 View Skilled Nursing Facilities', priority: 5 },
    'blood bank': { category: 'blood-eye-banks', text: '🏥 View Blood & Eye Banks', priority: 5 },
    'eye bank': { category: 'blood-eye-banks', text: '🏥 View Blood & Eye Banks', priority: 5 },
    'agency': { category: 'agency', text: '🏥 View Healthcare Agencies', priority: 5 },
    'agencies': { category: 'agency', text: '🏥 View Healthcare Agencies', priority: 5 },
  }

  // Find matches with priority sorting
  const matchedLinks: Array<{ text: string; url: string; priority: number }> = []

  for (const [keyword, mapping] of Object.entries(facilityMappings)) {
    // Check both user message and AI response for better accuracy
    if (lowerMessage.includes(keyword) || lowerResponse.includes(keyword)) {
      const url = mapping.type 
        ? `/data-catalog/${mapping.category}/${mapping.type}`
        : `/data-catalog/${mapping.category}`
      
      // Avoid duplicates
      if (!matchedLinks.some(link => link.url === url)) {
        matchedLinks.push({ 
          text: mapping.text, 
          url, 
          priority: mapping.priority 
        })
      }
    }
  }

  // Sort by priority (highest first) and add to links
  matchedLinks
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3) // Limit to top 3 most relevant links
    .forEach(link => links.push({ text: link.text, url: link.url }))

  // Feature-based links - Add if relevant
  const hasLocationQuery = lowerMessage.includes('state') || lowerMessage.includes('city') || 
      lowerMessage.includes('zip') || lowerMessage.includes('location') ||
      lowerMessage.match(/\b(california|texas|florida|new york|ohio|pennsylvania|illinois|michigan|georgia|north carolina|alabama|alaska|arizona|arkansas|colorado|connecticut|delaware|hawaii|idaho|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|north dakota|oklahoma|oregon|rhode island|south carolina|south dakota|tennessee|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming)\b/i)

  const hasFilterQuery = lowerMessage.includes('filter') || lowerMessage.includes('export') || 
      lowerMessage.includes('csv') || lowerMessage.includes('download') || 
      lowerMessage.includes('build dataset') || lowerMessage.includes('custom')

  const hasSearchQuery = lowerMessage.includes('search') || lowerMessage.includes('find') ||
      lowerMessage.includes('look for') || lowerMessage.includes('locate')

  // Add Custom Dataset Builder if location or filter mentioned
  if ((hasLocationQuery || hasFilterQuery) && !links.some(link => link.url === '/data-catalog/custom')) {
    links.push({ text: '🎯 Build Custom Dataset', url: '/data-catalog/custom' })
  }

  // Add Search if searching mentioned
  if (hasSearchQuery && !links.some(link => link.url === '/search')) {
    links.push({ text: '🔍 Advanced Search', url: '/search' })
  }

  // Add main catalog if asking about overview/browsing
  if ((lowerMessage.includes('all data') || lowerMessage.includes('browse all') || 
      lowerMessage.includes('show all') || lowerMessage.includes('view all') ||
      lowerMessage.includes('catalog') || lowerMessage.includes('categories')) &&
      !links.some(link => link.url === '/data-catalog')) {
    links.push({ text: '📚 View Full Data Catalog', url: '/data-catalog' })
  }

  // Add About/Dashboard link for intro queries
  if ((lowerMessage.includes('what is') || lowerMessage.includes('about') ||
      lowerMessage.includes('tell me') || lowerMessage.includes('how does') ||
      lowerMessage.includes('what do you')) &&
      (lowerMessage.includes('platform') || lowerMessage.includes('website') || 
       lowerMessage.includes('service') || lowerMessage.includes('healthdata') || 
       lowerMessage.includes('this site')) &&
      !links.some(link => link.url === '/dashboard')) {
    links.push({ text: '🏠 Go to Dashboard', url: '/dashboard' })
  }

  // Limit total links to 4 for cleaner UI
  return links.slice(0, 4)
}

