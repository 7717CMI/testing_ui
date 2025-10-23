"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ExternalLink, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface ArticleData {
  title: string
  url: string
  source: string
  publishedDate?: string
  description?: string
}

export interface ArticleViewerModalProps {
  isOpen: boolean
  onClose: () => void
  article: ArticleData | null
}

export function ArticleViewerModal({ isOpen, onClose, article }: ArticleViewerModalProps) {
  const [loading, setLoading] = useState(true)
  const [iframeError, setIframeError] = useState(false)
  const [showBlockedWarning, setShowBlockedWarning] = useState(false)

  // Reset states when modal opens with new article
  useEffect(() => {
    if (isOpen && article) {
      setLoading(true)
      setIframeError(false)
      setShowBlockedWarning(false)

      // Show warning after 5 seconds if still loading (likely blocked)
      const timer = setTimeout(() => {
        if (loading) {
          setShowBlockedWarning(true)
          setLoading(false)
        }
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isOpen, article])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  const handleIframeLoad = useCallback(() => {
    setLoading(false)
    setIframeError(false)
  }, [])

  const handleIframeError = useCallback(() => {
    setLoading(false)
    setIframeError(true)
  }, [])

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

  if (!article) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-label="Article viewer"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-label="Close article viewer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full h-full md:h-[90vh] md:w-[90vw] md:max-w-7xl bg-white dark:bg-gray-900 md:rounded-xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 md:px-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
              <div className="flex-1 min-w-0 pr-4">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {article.title}
                </h2>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                  {article.source}
                  {article.publishedDate && ` • ${article.publishedDate}`}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Open in New Tab Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenInNewTab}
                  className="gap-2 hidden md:flex"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="hidden lg:inline">Open External</span>
                </Button>

                {/* Mobile: Icon only */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenInNewTab}
                  className="md:hidden p-2"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-5 w-5" />
                </Button>

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2"
                  title="Close viewer (Esc)"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative bg-gray-50 dark:bg-gray-950">
              {/* Loading State */}
              {loading && !showBlockedWarning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-20">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Loading article...</p>
                </div>
              )}

              {/* Blocked Warning Overlay */}
              {showBlockedWarning && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/95 dark:bg-gray-950/95 z-30 p-8">
                  <div className="max-w-md text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto">
                      <AlertCircle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                        ⚠️ Content Cannot Be Embedded
                      </h3>
                      <p className="text-base text-gray-600 dark:text-gray-300 mb-4">
                        This website prevents embedding for security reasons. The article is loading behind this message, but you likely see a blank page.
                      </p>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        👉 Click the button below to read the full article
                      </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button
                        size="lg"
                        className="gap-3 text-base h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        onClick={handleOpenInNewTab}
                      >
                        <ExternalLink className="h-6 w-6" />
                        Open Article on {new URL(article.url).hostname}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBlockedWarning(false)}
                      >
                        Hide This Warning (Try Embedding Anyway)
                      </Button>
                      <Button variant="ghost" size="sm" onClick={onClose}>
                        Close Viewer
                      </Button>
                    </div>
                    <div className="pt-4 border-t border-amber-200 dark:border-amber-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        <strong>💡 Technical Note:</strong> Many news websites use{" "}
                        <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">
                          X-Frame-Options
                        </code>{" "}
                        headers to prevent their content from being displayed in iframes for security.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {iframeError && !showBlockedWarning && (
                <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-20 p-8">
                  <div className="max-w-md text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto">
                      <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Unable to Load Article
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        This article cannot be displayed here. Would you like to open it in a new tab?
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button onClick={handleOpenInNewTab} className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Open in New Tab
                      </Button>
                      <Button variant="outline" onClick={onClose}>
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Iframe */}
              <iframe
                src={article.url}
                className="w-full h-full border-0"
                title={article.title}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                loading="eager"
              />
            </div>

            {/* Footer Note (only visible when no warning) */}
            {!showBlockedWarning && !iframeError && (
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  📰 Viewing article from <strong>{new URL(article.url).hostname}</strong> within HealthData AI
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

