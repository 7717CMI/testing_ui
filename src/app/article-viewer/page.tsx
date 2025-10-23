'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, ExternalLink, AlertCircle, Loader2, BookOpen, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { getDomainName } from '@/lib/iframe-whitelist'

export default function ArticleViewerPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const url = searchParams.get('url')
  const title = searchParams.get('title') || 'Article'
  const source = searchParams.get('source')
  
  const [iframeBlocked, setIframeBlocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showBlockedWarning, setShowBlockedWarning] = useState(false)
  
  useEffect(() => {
    if (!url) return
    
    // Show loading for 3 seconds, then check if content loaded
    const loadingTimer = setTimeout(() => {
      setLoading(false)
      
      // After loading stops, wait 2 more seconds to see if blocked
      const warningTimer = setTimeout(() => {
        // If still appears blocked, show warning
        if (!iframeBlocked) {
          setShowBlockedWarning(true)
        }
      }, 2000)
      
      return () => clearTimeout(warningTimer)
    }, 3000)
    
    return () => clearTimeout(loadingTimer)
  }, [url, iframeBlocked])
  
  const handleIframeLoad = useCallback(() => {
    setLoading(false)
    setIframeBlocked(false)
    setShowBlockedWarning(false)
  }, [])
  
  const handleIframeError = useCallback(() => {
    setLoading(false)
    setIframeBlocked(true)
    setShowBlockedWarning(true)
  }, [])
  
  const handleOpenExternal = useCallback(() => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }, [url])
  
  const handleBack = useCallback(() => {
    // Try to go back, or fallback to insights page
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/insights')
    }
  }, [router])
  
  if (!url) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid URL</h1>
          <p className="text-gray-600 mb-6">No article URL provided</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }
  
  const domainName = getDomainName(url)
  
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* Fixed Header with Your Branding */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Left: Back Button + Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 flex-shrink-0" />
            
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <h1 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm md:text-base">
                {title}
              </h1>
            </div>
          </div>
          
          {/* Right: Source + Open Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {source && (
              <span className="text-xs text-gray-500 dark:text-gray-400 hidden md:inline">
                from {source}
              </span>
            )}
            <Button
              onClick={handleOpenExternal}
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Open Original</span>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Content Area (below fixed header) */}
      <main className="flex-1 pt-16 relative">
        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-950 z-40"
            >
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Loading article from {domainName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    This may take a few seconds...
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Blocked Warning Overlay */}
        <AnimatePresence>
          {showBlockedWarning && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-950 z-40 p-4 md:p-8"
            >
              <div className="max-w-2xl w-full text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto shadow-lg">
                  <AlertCircle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                </div>
                
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    🔒 Content Cannot Be Embedded
                  </h3>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border-l-4 border-amber-500">
                    <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
                      This website ({domainName}) prevents embedding for security reasons.
                    </p>
                  </div>
                  <p className="text-base text-gray-600 dark:text-gray-300">
                    Most news websites use <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">X-Frame-Options</code> headers 
                    to prevent their content from being displayed in iframes.
                  </p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-500">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>💡 Good news:</strong> You can still read the article by opening it directly in a new tab!
                  </p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button
                    size="lg"
                    onClick={handleOpenExternal}
                    className="gap-3 text-base h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                  >
                    <ExternalLink className="h-6 w-6" />
                    Open Article on {domainName}
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowBlockedWarning(false)}
                    >
                      Hide Warning (Try Anyway)
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleBack}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Close & Go Back
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-amber-200 dark:border-amber-800/30">
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    <strong>🔐 Technical Note:</strong> Healthcare news sites use security headers to prevent 
                    clickjacking attacks. This is a standard security practice. Opening the article directly 
                    in your browser will work perfectly.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* The Iframe */}
        <iframe
          src={url}
          className="w-full h-full border-0"
          style={{ height: 'calc(100vh - 4rem)' }}
          title={title}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          loading="eager"
        />
      </main>
      
      {/* Footer Info (only visible when not blocked) */}
      {!showBlockedWarning && !loading && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-t border-gray-200 dark:border-gray-800 py-2 px-4 z-50">
          <div className="container mx-auto flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <BookOpen className="h-3 w-3" />
            <span>Viewing content from <strong>{domainName}</strong> within HealthData AI</span>
            <span>•</span>
            <button
              onClick={handleOpenExternal}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1"
            >
              Open original
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
