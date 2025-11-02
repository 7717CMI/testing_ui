import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Insight } from '@/types'

export interface SavedInsight extends Insight {
  savedAt: number
}

interface SavedInsightsState {
  savedInsights: SavedInsight[]
  addSavedInsight: (insight: Insight) => void
  removeSavedInsight: (id: string) => void
  isSaved: (id: string) => boolean
  clearAllSavedInsights: () => void
}

export const useSavedInsightsStore = create<SavedInsightsState>()(
  persist(
    (set, get) => ({
      savedInsights: [],

      addSavedInsight: (insight) => {
        const existing = get().savedInsights.find(s => s.id === insight.id)
        if (existing) return // Already saved

        set((state) => ({
          savedInsights: [
            {
              ...insight,
              savedAt: Date.now(),
            },
            ...state.savedInsights, // Add to beginning
          ],
        }))
      },

      removeSavedInsight: (id) => {
        set((state) => ({
          savedInsights: state.savedInsights.filter((s) => s.id !== id),
        }))
      },

      isSaved: (id) => {
        return get().savedInsights.some((s) => s.id === id)
      },

      clearAllSavedInsights: () => {
        set({ savedInsights: [] })
      },
    }),
    {
      name: 'healthdata-saved-insights',
    }
  )
)





