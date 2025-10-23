"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ExternalLink, Loader2, AlertCircle, BookOpen, Calendar, User, Globe, Maximize2, Type, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface ArticleData {
  title: string
  url: string
  source: string
  publishedDate?: string
  description?: string
}

interface ExtractedArticle {
  title: string
  byline: string | null
  content: string
  textContent: string
  length: number
  excerpt: string
  siteName: string
  publishedTime: string | null
  sourceUrl: string
}

export interface ArticleViewerModalProps {
  isOpen: boolean
  onClose: () => void
  article: ArticleData | null
}

export function ArticleViewerModal({ isOpen, onClose, article }: ArticleViewerModalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<number | null>(null)
  const [extractedArticle, setExtractedArticle] = useState<ExtractedArticle | null>(null)
  const [readerMode, setReaderMode] = useState(true) // Start with reader mode
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base')
  const [showIframe, setShowIframe] = useState(false)

  // Fetch and extract article content when modal opens
  useEffect(() => {
    if (isOpen && article && readerMode) {
      setLoading(true)
      setError(null)
      setErrorCode(null)
      setExtractedArticle(null)

      console.log('🚀 Fetching article in reader mode:', article.url)

      // Call our article reader API
      fetch('/api/article-reader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: article.url,
          title: article.title
        })
      })
        .then(async (res) => {
          const data = await res.json()
          
          if (!res.ok || !data.success) {
            // This is expected for some websites - not a critical error
            console.warn('⚠️ Article extraction unavailable:', data.error || 'Could not extract content')
            console.info('💡 This is normal - some websites block content extraction')
            setError(data.error || 'Could not extract article content')
            setErrorCode(data.errorCode || res.status)
            return
          }

          console.log('✅ Article extracted successfully')
          console.log('   Title:', data.data.title)
          console.log('   Author:', data.data.byline || 'Unknown')
          console.log('   Length:', data.data.length, 'characters')
          setExtractedArticle(data.data)
        })
        .catch((err) => {
          console.error('❌ Network error while fetching article:', err.message)
          setError('Network error: Could not connect to article reader API')
          setErrorCode(500)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [isOpen, article, readerMode])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  const handleOpenInNewTab = useCallback(() => {
    if (article?.url) {
      window.open(article.url, "_blank", "noopener,noreferrer")
    }
  }, [article])

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  const toggleView = useCallback(() => {
    setShowIframe(!showIframe)
  }, [showIframe])

  const cycleFontSize = useCallback(() => {
    setFontSize(prev => {
      if (prev === 'sm') return 'base'
      if (prev === 'base') return 'lg'
      if (prev === 'lg') return 'xl'
      return 'sm'
    })
  }, [])

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm': return 'text-sm leading-relaxed'
      case 'base': return 'text-base leading-relaxed'
      case 'lg': return 'text-lg leading-relaxed'
      case 'xl': return 'text-xl leading-relaxed'
    }
  }

  if (!article) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-label="Article reader"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close article reader"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full h-full md:h-[90vh] md:w-[90vw] md:max-w-5xl bg-white dark:bg-gray-900 md:rounded-xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between h-auto md:h-16 px-4 md:px-6 py-3 md:py-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                    Reader Mode
                  </h2>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {article.source}
                </p>
              </div>

              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                {/* Font Size Toggle */}
                {!showIframe && extractedArticle && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cycleFontSize}
                    className="p-2 hidden md:flex"
                    title={`Font size: ${fontSize} (click to change)`}
                  >
                    <Type className="h-4 w-4" />
                  </Button>
                )}

                {/* Toggle View */}
                {extractedArticle && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleView}
                    className="gap-2 hidden md:flex"
                    title={showIframe ? "Show reader view" : "Show original website"}
                  >
                    {showIframe ? <BookOpen className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                    <span className="hidden lg:inline">{showIframe ? "Reader" : "Original"}</span>
                  </Button>
                )}

                {/* Open External */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenInNewTab}
                  className="p-2 md:gap-2 md:px-3"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="hidden lg:inline">Open</span>
                </Button>

                {/* Close */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2"
                  title="Close (Esc)"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative overflow-hidden">
              {/* Loading State */}
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-20">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Extracting article content...</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Using Mozilla Readability engine</p>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-950 z-20 p-4 md:p-8 overflow-y-auto">
                  <div className="max-w-2xl w-full text-center space-y-6 my-auto">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto shadow-lg">
                      <AlertCircle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                        {errorCode === 403 ? '🔒 Access Blocked' : '📰 Reader Mode Unavailable'}
                      </h3>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border-l-4 border-amber-500">
                        <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
                          {error}
                        </p>
                      </div>
                      <div className="text-left bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2 text-sm">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          {errorCode === 403 ? 'Why Access is Blocked:' : 'Why This Happens:'}
                        </p>
                        {errorCode === 403 ? (
                          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 pl-6">
                            <li>Website detects and blocks automated access</li>
                            <li>Content may require login or subscription</li>
                            <li>Site uses Cloudflare or similar protection</li>
                            <li>Geographic or IP-based restrictions</li>
                          </ul>
                        ) : (
                          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 pl-6">
                            <li>Website uses complex JavaScript rendering</li>
                            <li>Content is behind a paywall or login</li>
                            <li>Unusual HTML structure our parser doesn't recognize</li>
                            <li>Website blocks automated content extraction</li>
                          </ul>
                        )}
                      </div>
                      {errorCode === 403 && (
                        <div className="text-left bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mt-3">
                          <p className="text-sm text-green-800 dark:text-green-200">
                            <strong>💡 Good news:</strong> Opening in a new tab will work perfectly! 
                            When you visit directly in your browser, you'll have full access.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button
                        size="lg"
                        className="gap-3 text-base h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                        onClick={handleOpenInNewTab}
                      >
                        <ExternalLink className="h-6 w-6" />
                        {errorCode === 403 ? 'Open Directly (Bypasses Block)' : `Read on ${new URL(article.url).hostname.replace('www.', '')}`}
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        {errorCode !== 403 && (
                          <Button variant="outline" size="sm" onClick={() => setShowIframe(true)} className="gap-2">
                            <Eye className="h-4 w-4" />
                            Try Embedded View
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={onClose} 
                          className={cn("gap-2", errorCode === 403 && "col-span-2")}
                        >
                          <X className="h-4 w-4" />
                          Close Reader
                        </Button>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-amber-200 dark:border-amber-800/30">
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg mx-auto">
                        {errorCode === 403 ? (
                          <>
                            <strong>🔐 Security Note:</strong> This website uses automated access protection (likely Cloudflare or similar). 
                            We respect their security measures. Opening directly in your browser will bypass this and work normally.
                          </>
                        ) : (
                          <>
                            <strong>💡 Note:</strong> We use Mozilla's Readability technology to extract articles. 
                            Some websites are designed in ways that prevent automated extraction for security or business reasons. 
                            Opening in a new tab will always work.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reader View */}
              {extractedArticle && !loading && !showIframe && (
                <div className="absolute inset-0 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
                  <article className="max-w-3xl mx-auto px-6 md:px-12 py-8 md:py-12">
                    {/* Article Header */}
                    <header className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
                        {extractedArticle.title}
                      </h1>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        {extractedArticle.byline && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{extractedArticle.byline}</span>
                          </div>
                        )}
                        {extractedArticle.publishedTime && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <time>{new Date(extractedArticle.publishedTime).toLocaleDateString()}</time>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>{extractedArticle.siteName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          <span>{Math.ceil(extractedArticle.length / 200)} min read</span>
                        </div>
                      </div>

                      {/* Excerpt */}
                      {extractedArticle.excerpt && (
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
                          <p className="text-base text-gray-700 dark:text-gray-300 italic">
                            {extractedArticle.excerpt}
                          </p>
                        </div>
                      )}
                    </header>

                    {/* Article Content */}
                    <div
                      className={cn(
                        "prose prose-gray dark:prose-invert max-w-none",
                        "prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100",
                        "prose-p:text-gray-700 dark:prose-p:text-gray-300",
                        "prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline",
                        "prose-strong:text-gray-900 dark:prose-strong:text-gray-100",
                        "prose-img:rounded-lg prose-img:shadow-md",
                        "prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg",
                        getFontSizeClass()
                      )}
                      dangerouslySetInnerHTML={{ __html: extractedArticle.content }}
                    />

                    {/* Source Attribution */}
                    <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <strong>Source:</strong> {extractedArticle.siteName}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={handleOpenInNewTab}
                        >
                          <ExternalLink className="h-4 w-4" />
                          Read Original Article
                        </Button>
                      </div>
                    </footer>
                  </article>
                </div>
              )}

              {/* Iframe View (Fallback) */}
              {showIframe && extractedArticle && (
                <iframe
                  src={article.url}
                  className="w-full h-full border-0"
                  title={article.title}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  referrerPolicy="no-referrer-when-downgrade"
                  loading="eager"
                />
              )}
            </div>

            {/* Footer Info */}
            {extractedArticle && !loading && !showIframe && (
              <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Badge variant="outline" className="bg-white dark:bg-gray-800 gap-1">
                    <BookOpen className="h-3 w-3" />
                    Reader Mode Active
                  </Badge>
                  <span>•</span>
                  <span>Content extracted using Mozilla Readability</span>
                  <span>•</span>
                  <span className="font-semibold">{extractedArticle.length.toLocaleString()} characters</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
