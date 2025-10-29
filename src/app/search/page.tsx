"use client"

import { useState, useRef, useEffect } from 'react'
import { Navbar } from '@/components/shared/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, Sparkles, Loader2, Download, MapPin, Phone, Building2, BarChart3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { AnalysisModal } from '@/components/analysis-modal'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  facilities?: any[]
  metadata?: any
  timestamp: Date
  analysisResults?: any
}

export default function SmartSearchPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      role: 'assistant',
      content: `Hi! I'm your healthcare data assistant powered by AI. I can help you search our database of 658,000+ healthcare facilities.

Try asking me:
• "Show me hospitals in California"
• "Tell me about Mayo Clinic"
• "Find urgent care centers in New York"
• "What's the bed count for Cleveland Clinic?"

I can handle typos and understand natural language!

**Need deeper insights?** Click the "Perform Analysis" button to run comprehensive market analysis, competitive intelligence, or custom research!`,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => uuidv4())
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setInput('')
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Regular search mode
      const response = await fetch('/api/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessage.content,
          sessionId,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: data.response,
          facilities: data.facilities,
          metadata: data.metadata,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        toast.error(data.error || 'Search failed')
        setMessages(prev => [...prev, {
          id: uuidv4(),
          role: 'assistant',
          content: `Sorry, I encountered an error: ${data.error || 'Search failed'}. Please try rephrasing your question.`,
          timestamp: new Date()
        }])
        }
      } catch (error) {
      console.error('Error:', error)
      toast.error('Connection error. Please try again.')
      setMessages(prev => [...prev, {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I had trouble connecting to the server. Please try again.',
        timestamp: new Date()
      }])
      } finally {
        setIsLoading(false)
      }
    }
    
  function handleSuggestedQuery(query: string) {
    setInput(query)
    inputRef.current?.focus()
  }

  function exportConversation() {
    const text = messages
      .map(m => `${m.role.toUpperCase()} (${m.timestamp.toLocaleString()}): ${m.content}`)
      .join('\n\n')
    
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `healthcare-search-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Conversation exported!')
  }

  const suggestedQueries = [
    "Top hospitals in Texas",
    "Mental health clinics in California",
    "Tell me about Cleveland Clinic",
    "Find urgent care in Manhattan"
  ]

  return (
    <>
      <AnalysisModal 
        isOpen={analysisModalOpen} 
        onClose={() => setAnalysisModalOpen(false)} 
      />
      
      <div className="min-h-screen bg-background">
      <Navbar />
      
        {/* Full-width container */}
        <div className="w-full px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 max-w-[1800px] mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Smart Search</h1>
                <p className="text-sm text-muted-foreground">
                  Ask questions in natural language
                </p>
              </div>
      </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAnalysisModalOpen(true)}
                className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <BarChart3 className="h-4 w-4" />
                Perform Analysis
              </Button>
              
                  <Button
                variant="outline"
                size="sm"
                onClick={exportConversation}
                disabled={messages.length <= 1}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
                  </Button>
                </div>
              </div>

        {/* Chat Container - Full Width */}
        <Card className="h-[calc(100vh-220px)] flex flex-col shadow-xl max-w-[1800px] mx-auto">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-md ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted border border-border'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                    
                    {/* Facility cards (for assistant messages) */}
                    {message.facilities && message.facilities.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <div className="text-xs font-semibold opacity-70 uppercase tracking-wide">
                          {message.facilities.length} {message.facilities.length === 1 ? 'Facility' : 'Facilities'} Found
                        </div>
                        {message.facilities.slice(0, 5).map((facility, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-background rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                                  <Building2 className="h-4 w-4 flex-shrink-0 text-primary" />
                                  <span className="truncate">{facility.name}</span>
                                </div>
                                {facility.type && (
                                  <Badge variant="secondary" className="mt-1 text-xs">
                                    {facility.type}
                                  </Badge>
                      )}
                    </div>
                </div>

                            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                              {(facility.city || facility.state) && (
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">
                                    {[facility.city, facility.state].filter(Boolean).join(', ')}
                                  </span>
                                </div>
                              )}
                              {facility.phone && (
                                <div className="flex items-center gap-1.5">
                                  <Phone className="h-3 w-3 flex-shrink-0" />
                                  <span>{facility.phone}</span>
                                </div>
                              )}
                              {facility.beds && (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium">🛏️ {facility.beds} beds</span>
                    </div>
                  )}
                </div>
                          </motion.div>
                        ))}
                        {message.facilities.length > 5 && (
                          <div className="text-xs text-muted-foreground pl-3">
                            +{message.facilities.length - 5} more facilities (ask for details)
                    </div>
                  )}
                </div>
                    )}

                    {/* Metadata */}
                    {message.metadata && (
                      <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-3 text-xs text-muted-foreground">
                        {message.metadata.executionTime && (
                          <span>⚡ {message.metadata.executionTime}ms</span>
                        )}
                        {message.metadata.resultsCount !== undefined && (
                          <span>📊 {message.metadata.resultsCount} results</span>
                        )}
                        {message.metadata.correctedQuery && (
                          <span>✨ Auto-corrected typos</span>
                        )}
                        {message.metadata.gapsFilled > 0 && (
                          <span>🌐 Enhanced with {message.metadata.gapsFilled} web searches</span>
                        )}
                      </div>
                    )}
                    </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-muted rounded-2xl p-4 flex items-center gap-3 shadow-md">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm">Searching 658K+ facilities...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
            </div>

          {/* Suggested Queries */}
          {messages.length === 1 && !isLoading && (
            <div className="px-6 pb-4 border-t">
              <p className="text-sm text-muted-foreground mb-3 mt-4 font-medium">
                💡 Try these queries:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQueries.map((query, index) => (
                <Button
                    key={index}
                  variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedQuery(query)}
                    className="text-xs"
                  >
                    {query}
                      </Button>
                ))}
              </div>
              </div>
            )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t p-4 bg-muted/30">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about any healthcare facility... (typos are OK!)"
                disabled={isLoading}
                className="flex-1"
                autoComplete="off"
              />
              <Button type="submit" disabled={!input.trim() || isLoading} size="lg">
              {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                  <Send className="h-4 w-4" />
              )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              Powered by AI • Searching 658,859 verified facilities • Natural language supported
            </p>
          </form>
        </Card>
        </div>
      </div>
    </>
  )
}
