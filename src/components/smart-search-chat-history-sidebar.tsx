'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  MessageSquare, 
  X, 
  Trash2, 
  Plus, 
  Loader2,
  Clock,
  ChevronRight
} from 'lucide-react'
import { useSmartSearchChatHistoryStore, type ChatSession } from '@/stores/smart-search-chat-history-store'
import { useAuthStore } from '@/stores/auth-store'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface SmartSearchChatHistorySidebarProps {
  isOpen: boolean
  onClose: () => void
  onLoadSession: (sessionId: string) => void
  onNewChat: () => void
}

export function SmartSearchChatHistorySidebar({
  isOpen,
  onClose,
  onLoadSession,
  onNewChat,
}: SmartSearchChatHistorySidebarProps) {
  const { user } = useAuthStore()
  const {
    sessions,
    isLoading,
    error,
    needsInit,
    loadSessions,
    deleteSession,
    currentSessionId,
  } = useSmartSearchChatHistoryStore()

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && user?.id) {
      loadSessions(user.id)
    }
  }, [isOpen, user?.id, loadSessions])

  const handleInitializeDatabase = async () => {
    setIsInitializing(true)
    setInitError(null)
    
    try {
      const response = await fetch('/api/chat-sessions/init', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Database initialized successfully!')
        // Reload sessions
        if (user?.id) {
          await loadSessions(user.id)
        }
      } else {
        setInitError(data.error || 'Failed to initialize database')
        toast.error(data.error || 'Failed to initialize database')
      }
    } catch (error: any) {
      const errorMsg = 'Failed to initialize database. Please check your connection.'
      setInitError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsInitializing(false)
    }
  }

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user?.id) return

    setDeletingId(sessionId)
    const success = await deleteSession(user.id, sessionId)
    setDeletingId(null)

    if (success) {
      toast.success('Chat deleted')
    } else {
      toast.error('Failed to delete chat')
    }
  }

  const handleLoadSession = (sessionId: string) => {
    onLoadSession(sessionId)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed lg:relative left-0 top-0 h-full w-80 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 z-40 flex flex-col shadow-xl lg:shadow-none"
        >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Chat History
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
          <Button
            onClick={() => {
              onNewChat()
              onClose()
            }}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            </div>
          )}

          {error && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg space-y-3">
              <div>
                <p className="font-medium text-sm text-yellow-800 dark:text-yellow-200 mb-1">
                  Chat history unavailable
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 opacity-90">
                  {error}
                </p>
                {error.includes('authentication') || error.includes('Access denied') ? (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
                    <p className="font-medium mb-1">How to fix:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Go to GCP Console → SQL → Your MySQL Instance</li>
                      <li>Click Users tab</li>
                      <li>Create a new user or edit existing user</li>
                      <li>Set Host name to "%" (allows any IP) or your IP: 122.170.193.59</li>
                      <li>Grant privileges on chat_history database</li>
                      <li>Update .env.local with correct credentials</li>
                    </ol>
                  </div>
                ) : null}
              </div>
              
              {(needsInit ||
                error.includes('not initialized') || 
                error.includes('Database not') || 
                error.includes('Initialize Database') ||
                error.includes('Click "Initialize Database"') ||
                error.includes('initialize the database')) && (
                <Button
                  onClick={handleInitializeDatabase}
                  disabled={isInitializing}
                  size="sm"
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  {isInitializing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Initialize Database
                    </>
                  )}
                </Button>
              )}
              
              {initError && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  {initError}
                </p>
              )}
            </div>
          )}

          {!isLoading && !error && sessions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-neutral-400 mb-4" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No chat history yet
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                Start a new conversation to see it here
              </p>
            </div>
          )}

          {!isLoading && sessions.length > 0 && (
            <div className="space-y-2">
              {sessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group"
                >
                  <Card
                    className={`p-3 cursor-pointer transition-all border-0 rounded-lg ${
                      currentSessionId === session.id
                        ? 'bg-primary-50 dark:bg-primary-900/30 border-l-4 border-l-primary-600'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                    }`}
                    onClick={() => handleLoadSession(session.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate mb-1.5">
                          {session.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(session.updated_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-neutral-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={(e) => handleDelete(session.id, e)}
                    disabled={deletingId === session.id}
                  >
                    {deletingId === session.id ? (
                      <Loader2 className="h-3 w-3 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="h-3 w-3 text-red-600" />
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400 text-center">
          Last 10 conversations saved
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  )
}

