import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Insight } from "@/types"
import { Eye, Bookmark, Share2, Clock, ExternalLink, Newspaper } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useState } from "react"

interface InsightCardProps {
  insight: Insight
  onBookmark?: () => void
  onShare?: () => void
  onViewArticle?: (insight: Insight) => void // NEW: callback for opening article viewer
}

export function InsightCard({ insight, onBookmark, onShare, onViewArticle }: InsightCardProps) {
  const [showFullArticle, setShowFullArticle] = useState(false)

  const categoryColors: Record<string, string> = {
    Expansion: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    Technology: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    Funding: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    "M&A": "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    Regulation: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    Policy: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    "Market Trend": "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
  }

  return (
    <>
      <Card className="card-hover cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Badge className={categoryColors[insight.category] || "bg-gray-100 text-gray-700"}>
                {insight.category}
              </Badge>
              <h3 className="font-semibold text-lg mt-2 line-clamp-2">
                {insight.title}
              </h3>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {insight.summary}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{insight.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDate(insight.date)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {insight.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t">
            <Button size="sm" variant="ghost" onClick={onBookmark}>
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              className="ml-auto"
              onClick={() => setShowFullArticle(true)}
            >
              Read More
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Full Article Modal */}
      <Dialog open={showFullArticle} onOpenChange={setShowFullArticle}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Badge className={categoryColors[insight.category] || "bg-gray-100 text-gray-700"}>
                  {insight.category}
                </Badge>
                <DialogTitle className="mt-2 text-2xl">{insight.title}</DialogTitle>
                <DialogDescription className="mt-2 flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {insight.views.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(insight.date)}
                  </span>
                  <span>By {insight.author}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="mt-6 space-y-6">
            {/* Full Article Content */}
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {insight.content}
              </div>
            </div>

            {/* Source Attribution with Read Full Article Button */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Source: {insight.author}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                    Published: {formatDate(insight.date)} • {insight.views.toLocaleString()} views
                  </p>
                </div>
              </div>

              {/* Read Full Article Button - Opens in embedded viewer */}
              {insight.sourceUrl && (
                <Button
                  onClick={() => {
                    // Trigger the parent component's article viewer modal
                    if (onViewArticle) {
                      setShowFullArticle(false) // Close summary modal
                      onViewArticle(insight) // Open article viewer modal
                    }
                  }}
                  className="w-full gap-2"
                  variant="default"
                >
                  <Newspaper className="h-4 w-4" />
                  View Full Article in Reader
                </Button>
              )}
              {insight.sourceUrl && (
                <p className="text-xs text-center text-muted-foreground">
                  Opens article within HealthData AI reader (stays in app)
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap pt-4 border-t">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags:</span>
              {insight.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-4">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onBookmark}
                className="gap-2"
              >
                <Bookmark className="h-4 w-4" />
                Bookmark
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onShare}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

