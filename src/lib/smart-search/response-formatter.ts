import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function formatResponse(
  userQuery: string,
  mergedData: any[],
  conversationHistory: any[] = []
): Promise<string> {
  try {
    const systemPrompt = `You are an expert healthcare data assistant.

CRITICAL RULES:
1. NEVER mention "database", "web search", "API", or data sources
2. Present ALL data as from ONE authoritative healthcare database
3. Be conversational, clear, and helpful
4. Use bullet points for readability
5. If multiple facilities, summarize key ones and offer to show more
6. Always offer next steps or follow-up questions
7. Be concise but complete
8. NEVER use ** or asterisks for bold text - use plain text only
9. DO NOT use markdown formatting - just clean, readable text
10. For facility names in numbered lists, use format: "1. Facility Name" (no asterisks)

Tone: Professional but friendly, like a knowledgeable colleague

Example response format:
"Mayo Clinic is a renowned academic medical center in Rochester, Minnesota. Here are the key details:

• Bed Capacity: 2,059 beds
• Specialties: Cancer treatment, Cardiovascular care, Neurosurgery
• Type: Non-profit academic medical center
• Contact: (507) 284-2511

Would you like details about other Mayo Clinic locations or specific departments?"

When listing multiple facilities, use this format:
"Here are mental health clinics in California:

1. Accessible Mental Health Care Group
   - Location: 2711 Alcatraz Ave, Suite 4, California
   - Phone: (415) 944-9685
   - Specialties: Behavioral health for children and adults

2. Advances in Mental Health Center
   - Location: 5199 E Pacific Coast Hwy, Long Beach, California
   - Phone: (562) 365-2020
   - Specialties: Behavioral health, eating disorders"`

    // Build context from conversation history
    const historyContext = conversationHistory.length > 0
      ? `\n\nPrevious conversation:\n${conversationHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')}`
      : ''

    // Clean data (remove internal meta fields)
    const cleanData = mergedData.map(f => {
      const { _meta, similarityScore, ...publicData } = f
      return publicData
    })

    const dataContext = JSON.stringify(cleanData, null, 2).substring(0, 8000) // Limit size

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `User query: "${userQuery}"${historyContext}\n\nData:\n${dataContext}\n\nGenerate helpful response:` }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    return response.choices[0].message.content || 'I found the information but had trouble formatting it. Please try rephrasing your question.'
  } catch (error) {
    console.error('[Response Formatter] Error:', error)
    
    // Fallback: Simple formatting
    if (mergedData.length === 0) {
      return "I couldn't find any facilities matching your query. Could you try rephrasing or providing more details?"
    }

    const facility = mergedData[0]
    return `I found ${facility.name} in ${facility.city}, ${facility.state}.\n\nContact: ${facility.phone || 'Not available'}\nType: ${facility.type || 'Healthcare provider'}\n\nWould you like more details about this facility?`
  }
}



