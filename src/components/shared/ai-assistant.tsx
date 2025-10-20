"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAIStore } from "@/stores/ai-store"
import { X, Send, Download, Sparkles, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

export function AIAssistant() {
  const { isOpen, messages, isTyping, addMessage, clearMessages, toggleDrawer, setTyping } = useAIStore()
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const suggestedPrompts = [
    "Summarize hospitals in Texas with >500 beds",
    "Compare top private clinics in California",
    "Show me mental health facilities with CARF accreditation",
    "What are the latest M&A trends in urgent care?",
  ]

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")

    addMessage({
      role: "user",
      content: userMessage,
    })

    setTyping(true)

    // Simulate AI response
    setTimeout(() => {
      addMessage({
        role: "assistant",
        content: `Based on the available data, I found the following information about "${userMessage}". Here are some key insights:\n\n• There are approximately 15 major healthcare facilities matching your criteria.\n• The average rating is 4.3 stars with bed counts ranging from 250 to 800.\n• Most facilities are accredited by Joint Commission and NCQA.\n\nWould you like me to provide more detailed analysis or export this data?`,
        citations: ["Source: HealthData Database", "Last updated: Oct 10, 2025"],
      })
      setTyping(false)
    }, 2000)
  }

  function handlePromptClick(prompt: string) {
    setInput(prompt)
  }

  function handleExportChat() {
    const chatText = messages
      .map((m) => `${m.role === "user" ? "You" : "AI"}: ${m.content}`)
      .join("\n\n")
    const blob = new Blob([chatText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "chat-export.txt"
    a.click()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
    if (e.key === "k" && e.ctrlKey) {
      e.preventDefault()
      clearMessages()
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={toggleDrawer}
        size="lg"
        className="fixed bottom-6 right-6 rounded-full shadow-lg h-14 w-14 z-50 no-print"
      >
        <Sparkles className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 no-print"
        onClick={toggleDrawer}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-[450px] bg-background border-l shadow-2xl z-50 flex flex-col animate-slide-in-right no-print">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary-500" />
              AI Assistant
            </h2>
            <p className="text-xs text-muted-foreground">
              Powered by GPT-4 + Perplexity Hybrid Search
            </p>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleExportChat}
                  title="Export chat"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearMessages}
                  title="Clear chat (Ctrl+K)"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={toggleDrawer}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center space-y-6">
              <div className="text-center space-y-2">
                <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mx-auto">
                  <Sparkles className="h-8 w-8 text-primary-500" />
                </div>
                <h3 className="font-semibold text-lg">How can I help you?</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Ask me anything about healthcare facilities, insights, or data analysis.
                </p>
              </div>

              <div className="w-full space-y-2">
                <p className="text-xs text-muted-foreground px-2">Suggested prompts:</p>
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handlePromptClick(prompt)}
                    className="w-full text-left p-3 rounded-lg border hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors text-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  "rounded-lg px-4 py-3 max-w-[85%]",
                  message.role === "user"
                    ? "bg-primary-500 text-white"
                    : "bg-muted"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.citations && (
                  <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                    {message.citations.map((citation, i) => (
                      <p key={i} className="text-xs opacity-70">
                        {citation}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              {message.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-secondary-500 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
                  U
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-3">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything... (Shift+Enter for new line)"
                className="pr-12 min-h-[60px] max-h-[200px]"
                rows={2}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 bottom-2"
                disabled={!input.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Press Shift+Enter for multiline • Ctrl+K to clear chat
            </p>
          </form>
        </div>
      </div>
    </>
  )
}

