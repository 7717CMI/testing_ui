import { create } from "zustand"
import { ChatMessage } from "@/types"

interface AIState {
  messages: ChatMessage[]
  isOpen: boolean
  isTyping: boolean
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void
  clearMessages: () => void
  toggleDrawer: () => void
  setTyping: (isTyping: boolean) => void
}

export const useAIStore = create<AIState>((set) => ({
  messages: [],
  isOpen: false,
  isTyping: false,
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
        },
      ],
    })),
  clearMessages: () => set({ messages: [] }),
  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
  setTyping: (isTyping) => set({ isTyping }),
}))

