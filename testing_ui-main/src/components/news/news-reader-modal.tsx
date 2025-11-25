'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { NewsArticle } from '@/types/news'
import { Calendar, User, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'

interface NewsReaderModalProps {
  article: NewsArticle | null
  isOpen: boolean
  onClose: () => void
}

export function NewsReaderModal({ article, isOpen, onClose }: NewsReaderModalProps) {
  if (!article) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        {/* Accessible Title (Hidden) */}
        <VisuallyHidden.Root>
          <DialogTitle>Article: {article.title}</DialogTitle>
        </VisuallyHidden.Root>

        {/* Header Section */}
        <div className="px-6 pt-6 pb-4 border-b bg-muted/5">
          <div className="space-y-4">
            {/* Source Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
                {article.source.name}
              </span>
              {article.author && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {article.author}
                </span>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(article.publishedAt), 'MMM d, yyyy')}
              </span>
            </div>

            {/* Visible Title */}
            <h2 className="text-2xl font-bold tracking-tight text-foreground leading-tight">
              {article.title}
            </h2>
          </div>
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {/* Fallback for content if only description is available */}
            {article.content ? (
              <div className="space-y-4">
                {article.content.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="leading-relaxed text-base">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-lg leading-relaxed text-muted-foreground">
                {article.description}
              </p>
            )}

            {/* Disclaimer about external content */}
            <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground italic">
                This is a summary of the article. To read the full story, please visit the original source.
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-muted/5 flex justify-between items-center">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button 
            onClick={() => window.open(article.url, '_blank')}
            className="gap-2"
          >
            Read on {article.source.name}
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
