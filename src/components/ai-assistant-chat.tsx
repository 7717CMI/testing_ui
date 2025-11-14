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
  MessageCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
  links?: Array<{ text: string; url: string }>
}

export function AIAssistant() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [showBubble, setShowBubble] = useState(true)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm Bunny, your HealthData AI Research Assistant. I can help you navigate our platform and find the healthcare data you need.\n\nHow can I assist you today?",
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
      setShowBubble(false) // Hide bubble when chat opens
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-hide bubble after 8 seconds
  useEffect(() => {
    if (!isOpen && showBubble) {
      const timer = setTimeout(() => {
        setShowBubble(false)
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, showBubble])
  
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
      <div className="fixed bottom-6 right-6 z-50 no-print">
        <div className="flex flex-col items-end gap-3">
          {/* Text Bubble */}
          <AnimatePresence>
            {showBubble && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="relative"
              >
                <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-700 px-4 py-3 pr-8 max-w-[280px] sm:max-w-[320px]">
                  <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed">
                    Not able to find what you're looking for?{' '}
                    <span className="font-semibold text-primary-600 dark:text-primary-400">
                      Ask Bunny
                    </span>
                  </p>
                  {/* Arrow pointing to button */}
                  <div className="absolute bottom-[-8px] right-8 w-4 h-4 bg-white dark:bg-neutral-800 border-r border-b border-neutral-200 dark:border-neutral-700 transform rotate-45"></div>
                </div>
                {/* Close button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowBubble(false)
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Assistant Button */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              delay: 0.2 
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => {
                setIsOpen(true)
                setShowBubble(false)
              }}
              className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 border border-primary-500/20 shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 overflow-hidden group"
              aria-label="Open AI Assistant"
            >
              {/* Subtle pulse animation */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-primary-400/20"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.3, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* Main icon */}
              <div className="relative z-10">
                <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2} />
              </div>
              
              {/* Badge indicator */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 no-print"
        onClick={() => setIsOpen(false)}
      />
      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ 
          type: 'spring', 
          damping: 35, 
          stiffness: 400,
          mass: 0.8
        }}
        className="fixed right-0 top-0 bottom-0 w-full sm:w-[450px] bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl z-50 flex flex-col no-print"
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-neutral-900">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Bunny - AI Assistant
            </h2>
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
      </motion.div>
    </>
  )
}

