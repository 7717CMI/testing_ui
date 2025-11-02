import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AnalysisPoolItem {
  id: string
  query: string
  summary: string
  facilities: any[]
  resultCount: number
  timestamp: Date
  addedAt: Date
}

interface AnalysisPoolState {
  items: AnalysisPoolItem[]
  addToPool: (item: Omit<AnalysisPoolItem, 'id' | 'addedAt'>) => void
  removeFromPool: (id: string) => void
  clearPool: () => void
  isInPool: (query: string) => boolean
}

export const useAnalysisPoolStore = create<AnalysisPoolState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToPool: (item) => {
        const newItem: AnalysisPoolItem = {
          ...item,
          id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          addedAt: new Date()
        }
        
        set((state) => ({
          items: [...state.items, newItem]
        }))
      },
      
      removeFromPool: (id) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== id)
        }))
      },
      
      clearPool: () => set({ items: [] }),
      
      isInPool: (query) => {
        return get().items.some(item => 
          item.query.toLowerCase().trim() === query.toLowerCase().trim()
        )
      }
    }),
    {
      name: 'analysis-pool-storage'
    }
  )
)


