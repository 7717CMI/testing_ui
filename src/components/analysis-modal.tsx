"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Send, Sparkles, Loader2, MapPin, Phone, Building2, X, Upload, FileText, Bookmark, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { useSavedArticlesStore } from '@/stores/saved-articles-store'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  facilities?: any[]
  metadata?: any
  timestamp: Date
  analysisResults?: any
}

interface AnalysisModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AnalysisModal({ isOpen, onClose }: AnalysisModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [analysisSessionId] = useState(() => uuidv4())
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentStage, setCurrentStage] = useState<'user_profile' | 'file_upload' | 'analysis'>('user_profile')
  const [userProfile, setUserProfile] = useState<any>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { savedArticles } = useSavedArticlesStore()

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startUserProfiling()
    }
  }, [isOpen])

  async function startUserProfiling() {
    const welcomeMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: `Welcome to Advanced Analysis! 🎯

Before we begin, I'd like to learn a bit about you to provide the most relevant insights.

**Tell me about yourself:**

• What's your role? (e.g., Sales Executive, Market Analyst, Healthcare Consultant)
• What industry or sector are you focused on?
• What are your primary goals? (e.g., lead generation, market research, competitive intelligence)
• Any specific geographic regions of interest?

This will help me tailor the analysis to your needs!`,
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
    setCurrentStage('user_profile')
  }

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
      if (currentStage === 'user_profile') {
        // Extract user profile with AI
        await processUserProfile(userMessage.content)
      } else if (currentStage === 'file_upload') {
        // Process analysis request
        await performAnalysis(userMessage.content)
      } else {
        // Continue analysis conversation
        await continueAnalysis(userMessage.content)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Something went wrong. Please try again.')
      setMessages(prev => [...prev, {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  async function processUserProfile(userInput: string) {
    // Extract profile with GPT
    const response = await fetch('/api/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: analysisSessionId,
        action: 'profile',
        userMessage: userInput,
        conversationHistory: messages.map(m => ({ role: m.role, content: m.content }))
      })
    })

    const data = await response.json()

    if (data.profileComplete) {
      setUserProfile(data.profile)
      setCurrentStage('file_upload')

      const nextMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: `Perfect! Thanks for sharing, ${data.profile.role || 'there'}! 👍

Now, let's gather your data sources. You can:

**1. Upload Files** 📄
Click "Upload Files" to add:
- Excel/CSV files with facility data
- PDF reports or documents
- Market research files

**2. Use Saved Articles** 📰
Select from your ${savedArticles.length} saved articles from the Insights page

**3. Skip to Analysis** ⚡
Start immediately with our 658K+ facility database

What would you like to do?`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, nextMessage])
    } else {
      // Ask follow-up questions
      const followUpMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: data.response || 'Could you tell me more about your goals?',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, followUpMessage])
    }
  }

  async function performAnalysis(userRequest: string) {
    setIsAnalyzing(true)
    setCurrentStage('analysis')

    const analysisMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: `Starting comprehensive analysis...

**Your Profile:**
• Role: ${userProfile?.role || 'Not specified'}
• Focus: ${userProfile?.industry || 'Healthcare'}
• Goal: ${userProfile?.goals || 'Market analysis'}

**Data Sources:**
• Database: 658,859 facilities ✓
• Uploaded Files: ${uploadedFiles.length} files ${uploadedFiles.length > 0 ? '✓' : ''}
• Saved Articles: ${selectedArticles.length} articles ${selectedArticles.length > 0 ? '✓' : ''}

**Processing...**`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, analysisMessage])

    // Call analysis API
    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: analysisSessionId,
          action: 'analyze',
          userProfile,
          uploadedFiles: uploadedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })),
          selectedArticles,
          userRequest,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content }))
        })
      })

      const data = await response.json()

      if (data.success) {
        const resultMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          analysisResults: data.analysisResults
        }
        setMessages(prev => [...prev, resultMessage])
      }
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  async function continueAnalysis(userMessage: string) {
    const response = await fetch('/api/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: analysisSessionId,
        action: 'chat',
        userMessage,
        conversationHistory: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
      })
    })

    const data = await response.json()

    if (data.success) {
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
    toast.success(`${files.length} file(s) added!`)
  }

  function removeFile(index: number) {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    toast.success('File removed')
  }

  function toggleArticle(articleId: string) {
    setSelectedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    )
  }

  function skipToAnalysis() {
    setCurrentStage('file_upload')
    const skipMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: 'Skip to analysis with database only',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, skipMessage])
    performAnalysis('Perform comprehensive market analysis')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background"
      >
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-screen w-screen flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-purple-600 to-purple-800 text-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Advanced Analysis</h2>
                <p className="text-sm text-purple-100">
                  {currentStage === 'user_profile' && 'Getting to know you'}
                  {currentStage === 'file_upload' && 'Gathering data sources'}
                  {currentStage === 'analysis' && 'AI-powered insights'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-background">
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
                            ? 'bg-purple-600 text-white'
                            : 'bg-muted border border-border'
                        }`}
                      >
                        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
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
                    <div className="bg-muted rounded-2xl p-4 flex items-center gap-3 shadow-md border border-border">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                      <span className="text-sm">Processing...</span>
                    </div>
                  </motion.div>
                )}

                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 shadow-md">
                      <div className="flex items-center gap-3 mb-2">
                        <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                        <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                          Running Comprehensive Analysis...
                        </span>
                      </div>
                      <div className="text-xs text-purple-600 dark:text-purple-400 space-y-1 ml-7">
                        <div>✓ Analyzing user profile</div>
                        <div>✓ Processing uploaded files</div>
                        <div>✓ Querying database (658K+ facilities)</div>
                        <div>✓ Fetching real-time market data</div>
                        <div className="animate-pulse">⟳ Applying ML/statistical models</div>
                        <div className="opacity-50">○ Generating personalized insights</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              {currentStage === 'file_upload' && (
                <div className="px-6 pb-4 border-t bg-muted/30">
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <Button
                      variant="outline"
                      className="flex flex-col gap-2 h-auto py-4"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-5 w-5" />
                      <span className="text-xs">Upload Files</span>
                      {uploadedFiles.length > 0 && (
                        <Badge variant="secondary">{uploadedFiles.length}</Badge>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      className="flex flex-col gap-2 h-auto py-4"
                      onClick={() => {/* Show articles panel */}}
                    >
                      <Bookmark className="h-5 w-5" />
                      <span className="text-xs">Saved Articles</span>
                      {selectedArticles.length > 0 && (
                        <Badge variant="secondary">{selectedArticles.length}</Badge>
                      )}
                    </Button>

                    <Button
                      variant="default"
                      className="flex flex-col gap-2 h-auto py-4 bg-purple-600 hover:bg-purple-700"
                      onClick={skipToAnalysis}
                    >
                      <Sparkles className="h-5 w-5" />
                      <span className="text-xs">Start Analysis</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSubmit} className="border-t p-4 bg-background">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      currentStage === 'user_profile' 
                        ? "Tell me about your role and goals..." 
                        : "Type your message..."
                    }
                    disabled={isLoading || isAnalyzing}
                    className="flex-1"
                    autoComplete="off"
                  />
                  <Button 
                    type="submit" 
                    disabled={!input.trim() || isLoading || isAnalyzing}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Sidebar - Files & Articles */}
            {currentStage === 'file_upload' && (
              <div className="w-80 border-l bg-muted/30 overflow-y-auto p-4">
                <h3 className="font-semibold mb-4">Data Sources</h3>
                
                {/* Uploaded Files */}
                <div className="mb-6">
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Uploaded Files ({uploadedFiles.length})
                  </div>
                  {uploadedFiles.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No files uploaded yet</p>
                  ) : (
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-background rounded border text-xs">
                          <span className="truncate flex-1">{file.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Saved Articles */}
                <div>
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Bookmark className="h-4 w-4" />
                    Saved Articles ({savedArticles.length})
                  </div>
                  {savedArticles.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No saved articles</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {savedArticles.slice(0, 10).map((article: any) => (
                        <div 
                          key={article.id}
                          className={`p-2 bg-background rounded border text-xs cursor-pointer transition-colors ${
                            selectedArticles.includes(article.id) 
                              ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' 
                              : 'hover:border-purple-400'
                          }`}
                          onClick={() => toggleArticle(article.id)}
                        >
                          <div className="font-medium truncate">{article.title}</div>
                          <div className="text-muted-foreground text-xs mt-1">{article.source}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}



