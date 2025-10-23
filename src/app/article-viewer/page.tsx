"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ExternalLink, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"

function ArticleViewerContent() {
  const searchParams = useSearchParams()
  const url = searchParams?.get('url') || ''
  const title = searchParams?.get('title') || 'Article'
  const [iframeError, setIframeError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showEmbeddingWarning, setShowEmbeddingWarning] = useState(false)

  useEffect(() => {
    // Set loading to false and show warning after 3 seconds
    const timer = setTimeout(() => {
      setLoading(false)
      // After 5 seconds, if still showing iframe, display warning
      setTimeout(() => {
        setShowEmbeddingWarning(true)
      }, 2000)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header with your branding */}
      <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-950 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/insights">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Insights
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">HD</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">HealthData AI</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Healthcare Insights Portal</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={() => window.open(url, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              Open Original Article
            </Button>
          </div>
        </div>
      </header>

      {/* Article Title Bar */}
      <div className="bg-white dark:bg-gray-950 border-b px-4 py-3">
        <div className="container">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {decodeURIComponent(title)}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Source: {decodeURIComponent(url)}
          </p>
        </div>
      </div>

      {/* Embedded Article or Fallback */}
      <div className="flex-1 relative bg-white dark:bg-gray-950">
        {!url ? (
          <div className="flex items-center justify-center h-full p-8">
            <Card className="max-w-md">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto">
                    <ExternalLink className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      No Article URL Provided
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Please select an article from the insights page.
                    </p>
                  </div>
                  <Link href="/insights">
                    <Button variant="outline" className="gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Go to Insights
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-950 z-10">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
                  <p className="text-sm text-gray-500">Loading article from source...</p>
                </div>
              </div>
            )}
            
            {/* Warning overlay when embedding likely blocked */}
            {showEmbeddingWarning && !loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/95 dark:bg-gray-950/95 z-20 p-8">
                <Card className="max-w-2xl border-2 border-amber-200 shadow-2xl">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto shadow-lg">
                        <AlertCircle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                          ⚠️ Website Blocks Embedding
                        </h3>
                        <p className="text-base text-gray-600 dark:text-gray-300 max-w-lg mx-auto mb-4">
                          Most news websites prevent embedding for security. The article is loading behind this message, but you likely see a blank page.
                        </p>
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          👉 Click the button below to read the full article
                        </p>
                      </div>
                      <div className="flex flex-col gap-3">
                        <Button
                          variant="default"
                          size="lg"
                          className="gap-3 text-base h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                          onClick={() => window.open(url, '_blank')}
                        >
                          <ExternalLink className="h-6 w-6" />
                          Open Article on {decodeURIComponent(url).split('/')[2] || 'Source Website'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => setShowEmbeddingWarning(false)}
                        >
                          Hide This Message (I want to try embedding anyway)
                        </Button>
                        <Link href="/insights">
                          <Button variant="ghost" size="sm" className="gap-2 w-full">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Insights
                          </Button>
                        </Link>
                      </div>
                      <div className="pt-6 border-t border-amber-200">
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
                          <strong>💡 Technical Note:</strong> Healthcare news websites (like Hennepin Healthcare, Becker's, Modern Healthcare) 
                          use <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">X-Frame-Options</code> headers 
                          to prevent their content from being displayed in iframes. This is a standard security practice called 
                          "clickjacking protection."
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <iframe
              src={url}
              className="w-full h-full border-0"
              title={title}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false)
                setIframeError(true)
              }}
              loading="eager"
            />
          </>
        )}
      </div>

      {/* Footer Note */}
      {url && !iframeError && !showEmbeddingWarning && (
        <footer className="bg-white dark:bg-gray-950 border-t px-4 py-2">
          <div className="container">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              📰 This article is displayed from <strong>{decodeURIComponent(url).split('/')[2]}</strong> within HealthData AI. 
              If you see a blank page, the source may block embedding. Use the "Open Original Article" button above.
            </p>
          </div>
        </footer>
      )}
    </div>
  )
}

export default function ArticleViewerPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
            <p className="text-sm text-gray-500">Preparing article viewer...</p>
          </div>
        </div>
      }
    >
      <ArticleViewerContent />
    </Suspense>
  )
}

