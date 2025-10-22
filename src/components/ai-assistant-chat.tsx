'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Sparkles,
  ExternalLink,
  Bot,
  User,
  MessageSquare,
  Zap,
} from 'lucide-react'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
  links?: Array<{ text: string; url: string }>
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your HealthData AI assistant. I can help you:\n\n• Navigate our 658,859+ verified healthcare provider database\n• Find specific facility types (hospitals, clinics, etc.)\n• Search by location (state, city, ZIP)\n• Build and export custom datasets\n• Explain how to use our platform features\n\nWhat would you like to know? Try asking about military hospitals, pharmacies in California, or how to export data!",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function handleSend() {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: messages }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          links: data.links,
        },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full bg-gradient-to-r from-[#006AFF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#003D99] shadow-lg hover:shadow-xl transition-all relative group"
        >
          <MessageSquare className="h-6 w-6 transition-transform group-hover:scale-110" />
          <Sparkles className="h-3 w-3 absolute top-2 right-2 text-yellow-300 animate-pulse" />
        </Button>
        <div className="absolute -top-2 -right-2 flex h-6 w-6">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006AFF] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-6 w-6 bg-[#006AFF] items-center justify-center">
            <Zap className="h-3 w-3 text-white" />
          </span>
        </div>
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
          <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            💬 Ask me anything about healthcare data
            <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      <Card className="shadow-2xl border-[#006AFF]/20">
        <CardHeader className="bg-gradient-to-r from-[#006AFF] to-[#0052CC] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  HealthData AI
                  <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                </CardTitle>
                <p className="text-xs text-blue-100 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Powered by GPT-4o Mini • Real-time Data
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-md ${
                    message.role === 'user'
                      ? 'bg-[#006AFF]'
                      : 'bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-white" />
                  )}
                </div>
                <div
                  className={`flex-1 space-y-2 ${
                    message.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`inline-block max-w-[85%] p-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-[#006AFF] text-white rounded-tr-none'
                        : 'bg-white border border-gray-200 rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.links && message.links.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <div className="text-xs text-gray-500 font-medium mb-1">Quick Links:</div>
                      {message.links.map((link, linkIndex) => (
                        <Link
                          key={linkIndex}
                          href={link.url}
                          className="flex items-center gap-2 text-sm text-[#006AFF] hover:text-white bg-blue-50 hover:bg-[#006AFF] px-3 py-2 rounded-lg transition-all border border-blue-200 hover:border-[#006AFF] group"
                          onClick={() => setIsOpen(false)}
                        >
                          <ExternalLink className="h-3 w-3 group-hover:animate-bounce" />
                          <span className="font-medium">{link.text}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse shadow-md">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#006AFF]" />
                  <span className="text-xs text-gray-500">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask me anything about healthcare data..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-[#006AFF] hover:bg-[#0052CC]"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI-powered • Real-time healthcare data • 658,859+ providers
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

