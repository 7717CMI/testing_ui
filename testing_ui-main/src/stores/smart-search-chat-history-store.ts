import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChatSession {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
  message_count?: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  metadata?: any
}

interface SmartSearchChatHistoryState {
  sessions: ChatSession[]
  currentSessionId: string | null
  isLoading: boolean
  error: string | null
  needsInit: boolean // Flag to indicate database needs initialization
  
  // Actions
  loadSessions: (userId: string) => Promise<void>
  createSession: (userId: string, title: string, firstMessage?: ChatMessage) => Promise<string | null>
  loadSessionMessages: (userId: string, sessionId: string) => Promise<ChatMessage[] | null>
  saveMessages: (userId: string, sessionId: string, messages: ChatMessage[]) => Promise<boolean>
  deleteSession: (userId: string, sessionId: string) => Promise<boolean>
  setCurrentSession: (sessionId: string | null) => void
  clearError: () => void
}

export const useSmartSearchChatHistoryStore = create<SmartSearchChatHistoryState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      isLoading: false,
      error: null,
      needsInit: false,

      loadSessions: async (userId: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/chat-sessions', {
            headers: {
              'x-user-id': userId,
            },
          })

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          const data = await response.json()

          if (data.success) {
            set({ sessions: data.sessions || [], isLoading: false })
            // If there's a message (like "database not initialized"), show it as info
            if (data.message && data.sessions?.length === 0) {
              // Store the message and needsInit flag for UI detection
              set({ 
                error: data.message, 
                isLoading: false,
                needsInit: data.needsInit || false
              })
            } else if (data.sessions?.length === 0 && !data.message) {
              // No error, just empty - clear any previous errors
              set({ error: null, isLoading: false, needsInit: false })
            } else {
              // Has sessions - clear any errors
              set({ error: null, isLoading: false, needsInit: false })
            }
          } else {
            // API returned success: false
            set({ 
              error: data.error || 'Failed to load sessions', 
              isLoading: false,
              sessions: [],
              needsInit: data.needsInit || false
            })
          }
        } catch (error: any) {
          console.error('[Chat History Store] Load sessions error:', error)
          set({ 
            error: 'Failed to load chat history. Please check your connection and try again.', 
            isLoading: false,
            sessions: [],
            needsInit: false
          })
        }
      },

      createSession: async (userId: string, title: string, firstMessage?: ChatMessage) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/chat-sessions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': userId,
            },
            body: JSON.stringify({
              title,
              firstMessage,
            }),
          })

          const data = await response.json()

          if (data.success) {
            const newSession = data.session
            set((state) => ({
              sessions: [newSession, ...state.sessions].slice(0, 10), // Keep only 10
              currentSessionId: newSession.id,
              isLoading: false,
            }))
            return newSession.id
          } else {
            set({ error: data.error || 'Failed to create session', isLoading: false })
            return null
          }
        } catch (error: any) {
          console.error('[Chat History Store] Create session error:', error)
          set({ error: 'Failed to create chat session', isLoading: false })
          return null
        }
      },

      loadSessionMessages: async (userId: string, sessionId: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/chat-sessions', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': userId,
            },
            body: JSON.stringify({ sessionId }),
          })

          const data = await response.json()

          if (data.success) {
            set({ isLoading: false })
            return data.messages
          } else {
            set({ error: data.error || 'Failed to load messages', isLoading: false })
            return null
          }
        } catch (error: any) {
          console.error('[Chat History Store] Load messages error:', error)
          set({ error: 'Failed to load messages', isLoading: false })
          return null
        }
      },

      saveMessages: async (userId: string, sessionId: string, messages: ChatMessage[]) => {
        try {
          const response = await fetch('/api/chat-sessions', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': userId,
            },
            body: JSON.stringify({
              sessionId,
              messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                metadata: msg.metadata,
              })),
            }),
          })

          const data = await response.json()

          if (data.success) {
            // Update session in list
            set((state) => ({
              sessions: state.sessions.map((s) =>
                s.id === sessionId
                  ? { ...s, updated_at: new Date().toISOString() }
                  : s
              ),
            }))
            return true
          } else {
            console.error('[Chat History Store] Save messages error:', data.error)
            return false
          }
        } catch (error: any) {
          console.error('[Chat History Store] Save messages error:', error)
          return false
        }
      },

      deleteSession: async (userId: string, sessionId: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/chat-sessions?sessionId=${sessionId}`, {
            method: 'DELETE',
            headers: {
              'x-user-id': userId,
            },
          })

          const data = await response.json()

          if (data.success) {
            set((state) => ({
              sessions: state.sessions.filter((s) => s.id !== sessionId),
              currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
              isLoading: false,
            }))
            return true
          } else {
            set({ error: data.error || 'Failed to delete session', isLoading: false })
            return false
          }
        } catch (error: any) {
          console.error('[Chat History Store] Delete session error:', error)
          set({ error: 'Failed to delete session', isLoading: false })
          return false
        }
      },

      setCurrentSession: (sessionId: string | null) => {
        set({ currentSessionId: sessionId })
      },

      clearError: () => {
        set({ error: null, needsInit: false })
      },
    }),
    {
      name: 'smart-search-chat-history',
      partialize: (state) => ({
        currentSessionId: state.currentSessionId,
      }),
    }
  )
)

