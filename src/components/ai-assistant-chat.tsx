'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  X,
  Send,
  Loader2,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Download,
} from 'lucide-react'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
  links?: Array<{ text: string; url: string }>
}

export function AIAssistant() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your HealthData AI Research Assistant. I can help you navigate our platform and find the healthcare data you need.\n\nHow can I assist you today?",
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
  
  // Hide AI Assistant on Smart Search page - AFTER all hooks
  if (pathname === '/search') {
    return null
  }

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hello! I'm your HealthData AI Research Assistant. I can help you navigate our platform and find the healthcare data you need.\n\nHow can I assist you today?",
      },
    ])
  }

  const handleExportChat = () => {
    const chatText = messages
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n')
    const blob = new Blob([chatText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `healthdata-chat-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

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
          content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-8 right-8 z-50 no-print">
        <Button
          onClick={() => setIsOpen(true)}
          className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-blue-700 hover:from-primary-800 hover:via-primary-700 hover:to-blue-800 border-2 border-primary-400/30 shadow-2xl hover:shadow-primary-500/50 flex items-center justify-center transition-all duration-300 hover:scale-110 overflow-hidden group"
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Pulsing ring effect */}
          <div className="absolute inset-0 rounded-2xl bg-primary-500/30 animate-ping"></div>
          
          {/* Main icon container */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Chat bubble icon */}
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-white drop-shadow-lg"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              <circle cx="9" cy="10" r="1" fill="currentColor"></circle>
              <circle cx="12" cy="10" r="1" fill="currentColor"></circle>
              <circle cx="15" cy="10" r="1" fill="currentColor"></circle>
            </svg>
          </div>
          
          {/* Sparkle effect on hover */}
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
          </div>
        </Button>
        
        {/* Dynamic tooltip */}
        <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <div className="bg-neutral-900 text-white px-4 py-2 rounded-lg shadow-xl text-sm font-medium whitespace-nowrap">
            💬 Chat with AI Assistant
            <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-neutral-900 transform rotate-45"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 no-print"
        onClick={() => setIsOpen(false)}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-[450px] bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl z-50 flex flex-col animate-slide-in-right no-print">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-neutral-900">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
              <Sparkles className="h-5 w-5 text-primary-700 dark:text-primary-500" />
              AI Research Assistant
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Powered by GPT-4 + Perplexity Hybrid Search
            </p>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleExportChat}
                  title="Export chat"
                  className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearChat}
                  title="Clear chat"
                  className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-neutral-950 custom-scrollbar">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center font-semibold text-xs ${
                  message.role === 'user'
                    ? 'bg-primary-700 text-white dark:bg-primary-600'
                    : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                {message.role === 'user' ? 'YOU' : 'AI'}
              </div>
              <div
                className={`flex-1 space-y-2 ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`inline-block max-w-[85%] p-3.5 rounded-xl text-[15px] leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-primary-700 text-white dark:bg-primary-600'
                      : 'bg-white border border-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.links && message.links.length > 0 && (
                  <div className="space-y-1.5 pl-3">
                    {message.links.map((link, linkIndex) => (
                      <Link
                        key={linkIndex}
                        href={link.url}
                        className="flex items-center gap-2 text-sm text-primary-700 hover:text-primary-800 dark:text-primary-500 dark:hover:text-primary-400 font-medium transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {link.text}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 flex items-center justify-center font-semibold text-xs">
                AI
              </div>
              <div className="bg-white border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 rounded-xl p-3.5 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary-700 dark:text-primary-500" />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask about our platform, data, or features..."
              disabled={isLoading}
              className="flex-1 bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 focus:border-primary-600 dark:focus:border-primary-500"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-primary-700 hover:bg-primary-800 dark:bg-primary-600 dark:hover:bg-primary-700 shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-500 mt-2 text-center font-medium">
            Verified healthcare data • Real-time insights
          </p>
        </div>
      </div>
    </>
  )
}

