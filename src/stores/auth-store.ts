import { create } from "zustand"
import { User } from "@/types"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    // Mock login - replace with actual API call
    const mockUser: User = {
      id: "1",
      email,
      name: "John Doe",
      role: "Analyst",
      plan: "Pro",
      avatar: undefined,
      jobTitle: "Healthcare Analyst",
    }
    set({ user: mockUser, isAuthenticated: true })
  },
  logout: () => {
    set({ user: null, isAuthenticated: false })
  },
  setUser: (user: User) => {
    set({ user, isAuthenticated: true })
  },
}))

