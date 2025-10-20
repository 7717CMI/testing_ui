import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Insight } from "@/types"
import { Eye, Bookmark, Share2, Clock } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface InsightCardProps {
  insight: Insight
  onBookmark?: () => void
  onShare?: () => void
}

export function InsightCard({ insight, onBookmark, onShare }: InsightCardProps) {
  const categoryColors: Record<string, string> = {
    Expansion: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    Technology: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    Funding: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    "M&A": "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    Regulation: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  }

  return (
    <Card className="card-hover cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Badge className={categoryColors[insight.category] || ""}>
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
          <Button size="sm" className="ml-auto">
            Read More
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

