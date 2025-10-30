"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import * as Popover from '@radix-ui/react-popover'
import { Send, Sparkles, Loader2, Download, MapPin, Phone, Building2, BarChart3, Bookmark, X, FileText, Paperclip } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { AnalysisModal } from '@/components/analysis-modal'
import { useSavedInsightsStore, type SavedInsight } from '@/stores/saved-insights-store'

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
- "Show me hospitals in California"
- "Tell me about Mayo Clinic"
- "Find urgent care centers in New York"
- "What's the bed count for Cleveland Clinic?"

I can handle typos and understand natural language!

**Need deeper insights?** Click the "Perform Analysis" button to run comprehensive market analysis, competitive intelligence, or custom research!`,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => uuidv4())
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false)
  const [showTransition, setShowTransition] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // File upload and saved articles state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])
  const [articlesPopoverOpen, setArticlesPopoverOpen] = useState(false)
  const savedArticles = useSavedInsightsStore((state) => state.savedInsights)

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

  function handleOpenAnalysis() {
    setShowTransition(true)
    setTimeout(() => {
      setShowTransition(false)
      setAnalysisModalOpen(true)
    }, 2000)
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

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
    toast.success(`${files.length} file(s) uploaded`)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeFile(index: number) {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  function clearAllFiles() {
    setUploadedFiles([])
    setSelectedArticles([])
  }

  function toggleArticle(articleId: string) {
    setSelectedArticles(prev => 
      prev.includes(articleId)
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    )
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
      
      <AnimatePresence>
        {showTransition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-purple-700 to-blue-900 flex items-center justify-center overflow-hidden"
          >
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/20 rounded-full"
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    scale: 0
                  }}
                  animate={{
                    y: [null, Math.random() * window.innerHeight],
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>

            {/* Main content */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 200 }}
              className="text-center relative z-10"
            >
              {/* Rotating rings */}
              <div className="relative w-32 h-32 mx-auto mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-white/20 border-t-white"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full border-4 border-white/20 border-b-white"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <BarChart3 className="h-12 w-12 text-white" />
                </motion.div>
              </div>

              {/* Animated text */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <motion.h2
                  className="text-5xl font-bold text-white mb-4"
                  animate={{ 
                    textShadow: [
                      "0 0 20px rgba(255,255,255,0.5)",
                      "0 0 40px rgba(255,255,255,0.8)",
                      "0 0 20px rgba(255,255,255,0.5)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Switching to Analysis Mode
                </motion.h2>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="space-y-2"
              >
                <p className="text-xl text-white/90">Preparing comprehensive insights...</p>
                
                {/* Loading steps */}
                <div className="mt-6 space-y-2">
                  {['Initializing AI Engine', 'Loading Context', 'Ready for Analysis'].map((text, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.9 + i * 0.3, duration: 0.4 }}
                      className="flex items-center justify-center gap-2 text-white/80"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.1 + i * 0.3, type: "spring" }}
                        className="w-2 h-2 bg-green-400 rounded-full"
                      />
                      <span className="text-sm">{text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Progress bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
                className="mt-8 h-1 bg-white/30 rounded-full overflow-hidden mx-auto max-w-xs"
              >
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="h-full w-1/3 bg-gradient-to-r from-transparent via-white to-transparent"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-screen flex flex-col bg-background overflow-hidden">
        <div className="border-b bg-card/50 backdrop-blur-sm flex-shrink-0">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/'}
                className="gap-2 h-9"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Smart Search</h1>
                  <p className="text-xs text-muted-foreground">
                    Ask questions in natural language
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenAnalysis}
                className="gap-2 bg-purple-600 hover:bg-purple-700 text-white h-9 text-sm"
              >
                <BarChart3 className="h-4 w-4" />
                Perform Analysis
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={exportConversation}
                disabled={messages.length <= 1}
                className="h-9 text-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <Card className="flex-1 flex flex-col m-0 rounded-none border-0 shadow-none overflow-hidden">
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
                                    <span className="font-medium">Beds: {facility.beds}</span>
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

                      {message.metadata && (
                        <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-3 text-xs text-muted-foreground">
                          {message.metadata.executionTime && (
                            <span>Time: {message.metadata.executionTime}ms</span>
                          )}
                          {message.metadata.resultsCount !== undefined && (
                            <span>Results: {message.metadata.resultsCount}</span>
                          )}
                          {message.metadata.correctedQuery && (
                            <span>Auto-corrected typos</span>
                          )}
                          {message.metadata.gapsFilled > 0 && (
                            <span>Enhanced with {message.metadata.gapsFilled} web searches</span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

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

            {messages.length === 1 && !isLoading && (
              <div className="px-6 pb-4 border-t">
                <p className="text-sm text-muted-foreground mb-3 mt-4 font-medium">
                  Try these queries:
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

            {(uploadedFiles.length > 0 || selectedArticles.length > 0) && (
              <div className="px-6 py-3 border-t bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">Attachments:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFiles}
                    className="h-6 text-xs"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-2">
                      <FileText className="h-3 w-3" />
                      {file.name}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeFile(idx)}
                      />
                    </Badge>
                  ))}
                  {selectedArticles.map((articleId) => {
                    const article = savedArticles.find((a: SavedInsight) => a.id === articleId)
                    return article ? (
                      <Badge key={articleId} variant="secondary" className="gap-2 bg-purple-100 dark:bg-purple-900">
                        <Bookmark className="h-3 w-3" />
                        {article.title.slice(0, 30)}...
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => toggleArticle(articleId)}
                        />
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="border-t p-4 bg-muted/30">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about any healthcare facility... (typos are OK!)"
                    disabled={isLoading}
                    className="pr-20"
                    autoComplete="off"
                  />
                  
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Popover.Root open={articlesPopoverOpen} onOpenChange={setArticlesPopoverOpen}>
                      <Popover.Trigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-muted relative"
                          disabled={isLoading}
                        >
                          <Bookmark className="h-4 w-4 text-muted-foreground" />
                          {selectedArticles.length > 0 && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 text-xs bg-purple-600 text-white rounded-full flex items-center justify-center">
                              {selectedArticles.length}
                            </span>
                          )}
                        </Button>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content
                          className="z-50 w-96 rounded-lg border bg-popover p-0 text-popover-foreground shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                          sideOffset={5}
                        >
                          <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-base flex items-center gap-2">
                                  <Bookmark className="h-4 w-4 text-purple-600" />
                                  Saved Articles
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Select articles to include in your analysis
                                </p>
                              </div>
                              {selectedArticles.length > 0 && (
                                <Badge variant="secondary" className="bg-purple-600 text-white">
                                  {selectedArticles.length} selected
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="p-4">
                            {savedArticles.length === 0 ? (
                              <div className="text-center py-8">
                                <Bookmark className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground font-medium">No saved articles yet</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Save articles from Insights to analyze them here
                                </p>
                              </div>
                            ) : (
                              <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                                {savedArticles.map((article: SavedInsight) => (
                                  <motion.div
                                    key={article.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                      selectedArticles.includes(article.id)
                                        ? 'bg-purple-50 dark:bg-purple-950 border-purple-500 shadow-md'
                                        : 'bg-card hover:bg-muted border-border hover:border-purple-300'
                                    }`}
                                    onClick={() => toggleArticle(article.id)}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                        selectedArticles.includes(article.id)
                                          ? 'bg-purple-600 border-purple-600'
                                          : 'border-muted-foreground'
                                      }`}>
                                        {selectedArticles.includes(article.id) && (
                                          <motion.svg
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-3 h-3 text-white"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="3"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path d="M5 13l4 4L19 7" />
                                          </motion.svg>
                                        )}
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold leading-tight line-clamp-2 mb-1">
                                          {article.title}
                                        </p>
                                        
                                        {article.summary && (
                                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                            {article.summary}
                                          </p>
                                        )}

                                        <div className="flex items-center gap-2 flex-wrap">
                                          <Badge variant="outline" className="text-xs">
                                            {article.category}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground">
                                            {article.author}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            {article.date}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            )}

                            {savedArticles.length > 0 && selectedArticles.length > 0 && (
                              <div className="mt-4 pt-4 border-t">
                                <Button
                                  size="sm"
                                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                  onClick={() => setArticlesPopoverOpen(false)}
                                >
                                  Use {selectedArticles.length} article{selectedArticles.length > 1 ? 's' : ''} for analysis
                                </Button>
                              </div>
                            )}
                          </div>
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 w-8 p-0 hover:bg-muted relative"
                      disabled={isLoading}
                    >
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      {uploadedFiles.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 text-xs bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                          {uploadedFiles.length}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>

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
                Powered by AI - Searching 658,859 verified facilities - Natural language supported
              </p>
            </form>
          </Card>
        </div>
      </div>
    </>
  )
}
