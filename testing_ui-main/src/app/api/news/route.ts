import { NextRequest, NextResponse } from 'next/server'

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const { facilityName, city, state, searchQuery } = await request.json()

    if (!PERPLEXITY_API_KEY) {
      return NextResponse.json(
        { error: 'Perplexity API key not configured' },
        { status: 500 }
      )
    }

    // Build search query
    const query = searchQuery || 
      `Latest news and updates about ${facilityName} hospital in ${city}, ${state}. Include recent developments, services, awards, or announcements.`

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a healthcare news assistant. Provide accurate, recent news and information about healthcare facilities. Format your response as clean bullet points without any markdown formatting (no ** or * characters). Each bullet point should be a separate news item. Use simple bullet points like "-" or "•" followed by clear, concise information.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        max_tokens: 800,
        temperature: 0.2,
        return_citations: true,
        return_images: false,
        search_recency_filter: 'month', // Focus on recent news
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Perplexity API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch news from Perplexity', details: errorText, status: response.status },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Extract content and citations
    const content = data.choices?.[0]?.message?.content || ''
    const citations = data.citations || []

    // Parse the response into structured news items
    const newsItems = parseNewsResponse(content, citations)

    return NextResponse.json({
      news: newsItems,
      rawContent: content,
      citations: citations,
      fetchedAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('News API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function parseNewsResponse(content: string, citations: string[]): any[] {
  const items: any[] = []
  
  // Clean the content by removing markdown formatting
  const cleanContent = content
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold** formatting
    .replace(/\*(.*?)\*/g, '$1')     // Remove *italic* formatting
    .replace(/`(.*?)`/g, '$1')       // Remove `code` formatting
  
  // Split by bullet points or numbered lists
  const lines = cleanContent.split('\n').filter(line => line.trim())
  
  let currentItem = ''
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Check if it's a bullet point or numbered item
    if (trimmed.match(/^[-•*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
      if (currentItem) {
        items.push({
          title: extractTitle(currentItem),
          summary: currentItem,
          source: 'Multiple sources',
          publishedAt: 'Recent',
        })
      }
      currentItem = trimmed.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, '')
    } else if (currentItem) {
      currentItem += ' ' + trimmed
    } else {
      currentItem = trimmed
    }
  }
  
  // Add the last item
  if (currentItem) {
    items.push({
      title: extractTitle(currentItem),
      summary: currentItem,
      source: 'Multiple sources',
      publishedAt: 'Recent',
    })
  }

  // If no structured items found, create a single item from the content
  if (items.length === 0 && cleanContent) {
    items.push({
      title: 'Latest Information',
      summary: cleanContent,
      source: 'Multiple sources',
      publishedAt: 'Recent',
    })
  }

  // Add citations as URLs if available
  if (citations.length > 0) {
    items.forEach((item, index) => {
      if (citations[index]) {
        item.url = citations[index]
        item.source = new URL(citations[index]).hostname
      }
    })
  }

  return items
}

function extractTitle(text: string): string {
  // Extract first sentence or first 80 characters as title
  const firstSentence = text.split(/[.!?]/)[0]
  if (firstSentence && firstSentence.length < 100) {
    return firstSentence.trim()
  }
  return text.substring(0, 80).trim() + '...'
}

