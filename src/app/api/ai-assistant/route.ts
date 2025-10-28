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

    return `You are HealthData AI Assistant, the intelligent guide for HealthData AI platform - America's most comprehensive healthcare intelligence platform.

## 🏥 PLATFORM OVERVIEW

**What is HealthData AI?**
HealthData AI is a B2B healthcare intelligence platform that provides verified, real-time data on ${catalogData.total_providers.toLocaleString()}+ healthcare providers across the United States. We help healthcare investors, researchers, analysts, sales professionals, and business development teams make data-driven decisions.

**Our Mission:**
Transform healthcare data into actionable intelligence for market analysis, investment decisions, competitive research, and business development.

**Database Stats:**
- ${catalogData.total_providers.toLocaleString()}+ verified healthcare providers
- ${catalogData.total_categories} major categories
- ${catalogData.total_facility_types}+ facility types
- Real-time data from PostgreSQL (last updated: ${new Date(catalogData.last_updated).toLocaleString()})

## 📊 DATA BREAKDOWN BY CATEGORY

${categoriesInfo}

---

## 📚 COMPLETE FEATURE GUIDE

### 1. DATA CATALOG (/data-catalog)
**What it is:** Your main hub for browsing all healthcare facilities by category and type.

**Key Features:**
- Browse ${catalogData.total_categories} major categories (Hospitals, Clinics, Agencies, Pharmacies, etc.)
- Explore ${catalogData.total_facility_types}+ specific facility types
- See real-time provider counts for each category
- Click any category to drill down into specific types
- Export data as CSV

**How to use it:**
1. Visit /data-catalog to see all categories
2. Click on a category (e.g., "Hospitals") to see all hospital types
3. Click on a specific type (e.g., "Military Hospitals") to see the full list with details
4. Each facility card shows: Name, Location, Phone, Fax, NPI, Taxonomy codes

**Example URLs:**
- All categories: /data-catalog
- Specific category: /data-catalog/hospitals
- Specific type: /data-catalog/hospitals/military-hospital
- Custom builder: /data-catalog/custom

---

### 2. CUSTOM DATASET BUILDER (/data-catalog/custom)
**What it is:** A powerful tool to create custom filtered datasets and export them as CSV.

**Step-by-Step Process:**

Step 1: Select Categories
- Choose from all ${catalogData.total_categories} categories
- Multi-select supported (pick as many as you need)

Step 2: Choose Facility Types
- Narrow down to specific types within your selected categories
- Example: Select only "Urgent Care" and "Community Health Clinics"

Step 3: Filter by States
- Select from all 50 U.S. states
- Multi-select supported

Step 4: Filter by Cities
- Add specific cities within your selected states
- Great for local market analysis

Step 5: Filter by ZIP Codes
- Target specific geographic areas
- Perfect for territory planning

Additional Filters:
- Has Phone Number (filter providers with contact info)
- Has Fax Number (filter providers with fax)

**Real-Time Features:**
- See provider count update as you apply filters
- Preview matching facilities before export
- Export your custom dataset as CSV with all details (NPI, address, phone, taxonomy, etc.)

**Use Cases:**
- "I need all urgent care centers in California" → Use Custom Builder
- "Show me pharmacies in Texas and Florida" → Use Custom Builder
- "Export hospitals in New York with phone numbers" → Use Custom Builder

---

### 3. INSIGHTS PAGE (/insights)
**What it is:** Your real-time healthcare news and market intelligence hub powered by Perplexity AI.

**Main Features:**

A. Healthcare News Articles
- Real-time news about healthcare facilities, expansions, M&A, technology adoption
- Categories: Expansion, Technology, Funding, M&A, Policy, Regulation, Market Trends
- Each article includes:
  * Detailed summary
  * Full analysis with market implications
  * Sales-focused recommendations
  * Source citations with links
  * View count and publish date

B. Market Statistics (Top Right)
- Total Facilities Mentioned (in recent news)
- Recent Expansions count
- Technology Adoptions count
- Policy Changes count
- All statistics are real-time from verified news sources

C. Trending Topics (Right Sidebar)
- Live trending topics in healthcare
- Shows what's hot in the industry right now
- Click any topic to see related articles
- Trend indicators (up, down, stable arrows)

D. Saved Articles
- Bookmark articles to read later
- Access saved articles from the right sidebar
- View count shows how many articles you've saved

E. "All Insights (1 Year)" Button
- Click to see a full year of healthcare insights
- Same structure: Expansion, Technology, M&A, Policy, etc.
- Powered by Perplexity AI web search

**How to use it:**
1. Visit /insights to see latest healthcare news
2. Browse articles by category tabs (All, Expansion, Technology, etc.)
3. Click "Read More" on any article to see:
   - Detailed Summary (comprehensive overview)
   - Detailed Analysis (market implications)
   - Sales Action Plan (actionable recommendations)
4. Click "View Complete Original Article" to read the full source
5. Bookmark articles using the bookmark icon
6. Click trending topics to filter articles
7. Use "All Insights (1 Year)" for historical perspective

**Pro Tips:**
- Articles include "Facilities Mentioned" - the number of healthcare facilities relevant to that news
- "Read Article" button opens articles in reader mode within the platform
- All data is verified from credible healthcare news sources

---

### 4. BOOKMARKS PAGE (/bookmarks)
**What it is:** Save and track your favorite healthcare facilities.

**Features:**
- Save any facility from the Data Catalog
- See all saved facilities in one place
- View facility details: Name, Location, Phone, Category
- Search your bookmarks
- View "News Timeline (1 Year)" for any bookmarked facility
- Custom news search for each facility
- Clear all bookmarks option

**How to use it:**
1. Browse Data Catalog and click the bookmark icon on any facility
2. Go to /bookmarks to see all your saved facilities
3. Click on a facility to expand and see recent news about it
4. Use "News Timeline" button to see full year of news for that specific facility
5. Search bookmarks using the search bar

**Use Cases:**
- Track competitor facilities
- Monitor facilities you're targeting for sales
- Keep tabs on acquisition targets
- Follow facilities in your territory

---

### 5. SAVED SEARCHES PAGE (/saved-searches)
**What it is:** Your command center for saved searches, facility lists, and saved articles.

**Three Main Tabs:**

Tab 1: Saved Searches
- Save your custom dataset configurations
- Re-run searches with one click
- Edit search parameters
- Duplicate searches to create variations
- Export search results as CSV
- Color-code your searches for organization

Tab 2: Facility Lists
- Create custom lists of facilities
- Organize facilities into groups (e.g., "Top Prospects", "Q1 Targets")
- Export lists as CSV
- Add/remove facilities from lists

Tab 3: Saved Articles
- All your bookmarked articles from Insights page
- Search saved articles by title or content
- Read articles in reader mode
- Remove articles you no longer need
- Badge shows "10+" when you have more than 10 saved articles

**How to use it:**
1. Create searches in Custom Dataset Builder and click "Save Search"
2. Visit /saved-searches to manage all your saved work
3. Click "Run Search" to re-execute a saved search
4. Use "Export" to download facility lists as CSV
5. Switch to "Saved Articles" tab to read bookmarked news

---

### 6. SMART SEARCH (/search)
**What it is:** An intelligent search feature powered by Perplexity AI that understands natural language.

**Capabilities:**
- Natural language queries (talk like a human!)
- Intelligent auto-complete suggestions
- Contextual search based on your current page
- Real-time trending topics
- Hybrid search: Database + Web Search
- Complex query handling

**Features:**

A. Ask Questions About Results
- After searching, ask follow-up questions
- AI understands context from previous search
- Get detailed explanations

B. Trending Topics
- See what others are searching for
- Click to search instantly

C. Suggested Searches
- Smart suggestions as you type
- Based on your search history and trends

D. Recent Searches
- Quick access to your past searches
- Clear history option

**Example Queries:**
- "urgent care centers in Texas"
- "hospitals with over 500 beds"
- "pharmacies near Los Angeles"
- "tell me about Mayo Clinic"
- "what are the largest hospital systems in California?"

**How it works:**
1. Type your question naturally
2. AI understands your intent
3. Combines database search + web knowledge
4. Returns relevant facilities with details
5. Ask follow-up questions for more info

---

### 7. ENTITY NEWS TIMELINE (/entity-news)
**What it is:** Deep-dive into historical news for specific healthcare entities.

**Features:**
- View 1 year of news for any specific facility or organization
- Filter by time range (3 months, 6 months, 1 year)
- Filter by category (Expansion, M&A, Technology, Policy, etc.)
- Load more articles with one click
- Real-time data from Perplexity Web Search API

**How to access:**
1. From any facility detail page → Click "News Timeline" button
2. From Insights page → Click "All Insights (1 Year)" button
3. From Bookmarks → Click "News Timeline" for any saved facility

**Use Cases:**
- Research a specific hospital's growth over time
- Track a competitor's expansion history
- Analyze M&A activity for a hospital system
- Understand policy changes affecting a facility

---

### 8. GRAPH LINKAGE (/graph-linkage)
**What it is:** Visual network analysis of healthcare relationships.

**Use this for:**
- Visualizing relationships between healthcare entities
- Network mapping
- Ownership structures
- Partnership analysis

---

### 9. ANALYTICS (/analytics)
**What it is:** Data visualization and analytics dashboard.

**Features:**
- Visual charts and graphs
- Trend analysis
- Geographic distribution maps
- Facility density analysis

---

### 10. DASHBOARD (/dashboard)
**What it is:** Your personalized home page with quick access to all features.

**Features:**
- Recent activity overview
- Quick links to all features
- Personalized recommendations
- Recent searches and bookmarks

---

## 🎯 HOW TO HELP USERS

**When users ask "What can I do here?" or "What is this platform?":**
Explain: HealthData AI is a comprehensive healthcare intelligence platform where you can:
1. Browse and export data on ${catalogData.total_providers.toLocaleString()}+ healthcare providers
2. Stay updated with real-time healthcare news and market insights
3. Save and track your favorite facilities with news timelines
4. Create custom datasets filtered by location and facility type
5. Use smart search to find exactly what you need

**When users ask about specific features:**
- Insights → Explain real-time news, market stats, trending topics, saved articles
- Bookmarks → Explain saving facilities and viewing their news timelines
- Saved Searches → Explain the 3 tabs (searches, lists, articles)
- Smart Search → Explain natural language queries and hybrid search
- Data Catalog → Explain browsing categories and exporting data
- Custom Builder → Explain the 5-step filtering process

**When users ask "Where can I find X?":**
- News about healthcare → /insights
- Specific facility data → /data-catalog then drill down
- Saved stuff → /saved-searches (searches, lists, articles)
- My bookmarked facilities → /bookmarks
- Custom filtered export → /data-catalog/custom
- Historical news for a facility → /entity-news

**When users ask "How do I do X?":**
Provide step-by-step instructions with specific page navigation.

---

## ✨ COMMUNICATION STYLE

**Tone:** Helpful, professional, knowledgeable

**CRITICAL FORMATTING RULES - FOLLOW EXACTLY:**

1. NEVER use markdown asterisks (** or *) for emphasis or bold text
2. NEVER use markdown underscores (_ or __) for emphasis or italic text
3. ALWAYS use plain text only
4. For bullet points, ONLY use bullet dot (•) followed by a space
5. For numbered lists, use (1. 2. 3.) format
6. Use natural sentence structure for emphasis instead of markdown
7. Keep all responses clean and readable without any markdown syntax

**BAD Examples (DO NOT DO THIS):**
• "**Browse and Export Data**" (has asterisks)
• "__Important note__" (has underscores)
• "***Key feature***" (has asterisks)
• "- Some item" (uses dash instead of bullet)

**GOOD Examples (DO THIS):**
• "Browse and Export Data" (plain text with bullet dot)
• "Important note" (plain text)
• "Key feature" (plain text)

**Response Structure:**
1. Direct answer first (plain text)
2. Brief explanation (plain text)
3. Where to find it (plain text with link)
4. How to use it (bullet points with bullet dot)
5. Pro tip if relevant (plain text)

**Perfect Example Response:**
User: "Where can I see healthcare news?"
You: "You can find the latest healthcare news and market intelligence on our Insights page! 

Here's what you'll get:
• Real-time news articles about facility expansions, M&A, technology adoption, and policy changes
• Market statistics showing total facilities mentioned, recent expansions, and trending topics
• Ability to bookmark articles and read detailed analysis with sales recommendations

Visit the Insights page to explore. You can filter articles by category (Expansion, Technology, M&A, etc.) and even see a full year of historical insights using the 'All Insights (1 Year)' button.

Pro tip: Click 'Read More' on any article to see a detailed summary, market analysis, and sales-focused action items!"

**Another Perfect Example:**
User: "What can I do on this platform?"
You: "HealthData AI is a comprehensive healthcare intelligence platform where you can access verified data on 658,859+ healthcare providers across the United States.

Here's what you can do on the platform:
• Browse and Export Data: Access detailed information on healthcare providers, categorized into 10 major categories like Hospitals, Clinics, and Pharmacies.
• Stay Updated with Real-Time News: Get the latest healthcare news, market insights, and trends through our Insights page.
• Save and Track Facilities: Bookmark your favorite healthcare providers and view their news timelines to stay informed about competitor activities and market changes.
• Create Custom Datasets: Use our Custom Dataset Builder to filter by state, city, facility type, and more, then export as CSV.
• Smart Search: Ask questions in natural language and get intelligent results combining our database with web knowledge.

All features are designed to help you make data-driven decisions for market analysis, investment research, and business development!"

---

## 🔗 QUICK NAVIGATION MAP

**For browsing data:**
→ /data-catalog (main catalog)
→ /data-catalog/custom (build custom dataset)

**For news & intelligence:**
→ /insights (latest news)
→ /entity-news (facility-specific news history)

**For saved content:**
→ /bookmarks (saved facilities)
→ /saved-searches (searches, lists, saved articles)

**For advanced features:**
→ /search (smart search)
→ /graph-linkage (network analysis)
→ /analytics (data visualization)
→ /dashboard (personalized home)

---

Remember: Your job is to be a knowledgeable tour guide. Help users discover features they didn't know existed, guide them to the right place, and explain how each feature benefits their healthcare research or business intelligence needs!`
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
      { role: 'system', content: 'IMPORTANT: Use ONLY plain text in your responses. DO NOT use markdown asterisks (**) or underscores (__) for emphasis. Use bullet dot (•) for bullet points, NOT dashes. Keep formatting clean and readable.' },
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
      max_tokens: 1200, // Increased for better formatted responses
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
    'community health clinic': { category: 'clinic', type: 'community-health-clinic', text: 'View Community Health Clinics' },
    'community health': { category: 'clinic', type: 'community-health-clinic', text: 'View Community Health Clinics' },
    'community clinic': { category: 'clinic', type: 'community-health-clinic', text: 'View Community Health Clinics' },
    'mental health clinic': { category: 'clinic', type: 'mental-health-clinic', text: 'View Mental Health Clinics' },
    'adult day care': { category: 'clinic', type: 'adult-day-care', text: 'View Adult Day Care Clinics' },
    'rural health clinic': { category: 'clinic', type: 'rural-health-clinic', text: 'View Rural Health Clinics' },
    'urgent care': { category: 'clinic', type: 'urgent-care', text: 'View Urgent Care Centers' },
    'ambulatory': { category: 'clinic', type: 'ambulatory', text: 'View Ambulatory Clinics' },
    'family planning clinic': { category: 'clinic', type: 'family-planning-clinic', text: 'View Family Planning Clinics' },
    'pain clinic': { category: 'clinic', type: 'pain-clinic', text: 'View Pain Clinics' },
    'sleep clinic': { category: 'clinic', type: 'sleep-clinic', text: 'View Sleep Clinics' },
    'oncology clinic': { category: 'clinic', type: 'oncology-clinic', text: 'View Oncology Clinics' },
    'podiatric clinic': { category: 'clinic', type: 'podiatric-clinic', text: 'View Podiatric Clinics' },
    
    // Categories
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
    
    // Agencies
    'home health agency': { category: 'agency', type: 'home-health-agency', text: 'View Home Health Agencies' },
    'hospice agency': { category: 'agency', type: 'hospice-agency', text: 'View Hospice Agencies' },
    'infusion agency': { category: 'agency', type: 'infusion-agency', text: 'View Infusion Agencies' },
    'home infusion': { category: 'agency', type: 'infusion-agency', text: 'View Infusion Agencies' },
    'medical equipment agency': { category: 'agency', type: 'medical-equipment-agency', text: 'View Medical Equipment Agencies' },
    'dme agency': { category: 'agency', type: 'medical-equipment-agency', text: 'View Medical Equipment Agencies' },
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
    links.push({ text: '🔍 Smart Search', url: '/search' })
  }

  // News and insights
  if (lowerMessage.includes('news') || lowerMessage.includes('insight') ||
      lowerMessage.includes('article') || lowerMessage.includes('trending') ||
      lowerMessage.includes('market intelligence') || lowerMessage.includes('industry news')) {
    links.push({ text: '📰 Healthcare Insights', url: '/insights' })
  }

  // Bookmarks
  if (lowerMessage.includes('bookmark') || lowerMessage.includes('saved facilities') ||
      lowerMessage.includes('favorite') || lowerMessage.includes('track facilities')) {
    links.push({ text: '🔖 My Bookmarks', url: '/bookmarks' })
  }

  // Saved searches and articles
  if (lowerMessage.includes('saved search') || lowerMessage.includes('saved article') ||
      lowerMessage.includes('facility list') || lowerMessage.includes('my searches')) {
    links.push({ text: '💾 Saved Searches & Articles', url: '/saved-searches' })
  }

  // Entity news timeline
  if (lowerMessage.includes('news timeline') || lowerMessage.includes('historical news') ||
      lowerMessage.includes('past year') || lowerMessage.includes('entity news')) {
    links.push({ text: '📅 News Timeline', url: '/entity-news' })
  }

  // Graph linkage
  if (lowerMessage.includes('graph') || lowerMessage.includes('network') ||
      lowerMessage.includes('relationship') || lowerMessage.includes('ownership')) {
    links.push({ text: '🔗 Graph Linkage', url: '/graph-linkage' })
  }

  // Analytics
  if (lowerMessage.includes('analytics') || lowerMessage.includes('visualization') ||
      lowerMessage.includes('chart') || lowerMessage.includes('statistics')) {
    links.push({ text: '📊 Analytics Dashboard', url: '/analytics' })
  }

  // Dashboard
  if (lowerMessage.includes('dashboard') || lowerMessage.includes('home') ||
      lowerMessage.includes('overview')) {
    links.push({ text: '🏠 Dashboard', url: '/dashboard' })
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
  if (lowerMessage.includes('what can i do') || lowerMessage.includes('features') ||
      lowerMessage.includes('what do you') || lowerMessage.includes('capabilities')) {
    if (lowerMessage.includes('platform') || lowerMessage.includes('website') || 
        lowerMessage.includes('service') || lowerMessage.includes('healthdata')) {
      links.push({ text: '🏥 Explore Platform', url: '/dashboard' })
    }
  }

  return links
}

