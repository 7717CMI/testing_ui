import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SavedArticle {
  id: string
  title: string
  source: string
  url: string
  publishedAt: string
  category: string
  summary?: string
  savedAt: string
}

interface SavedArticlesState {
  savedArticles: SavedArticle[]
  addArticle: (article: Omit<SavedArticle, 'id' | 'savedAt'>) => void
  removeArticle: (id: string) => void
  clearAll: () => void
}

export const useSavedArticlesStore = create<SavedArticlesState>()(
  persist(
    (set) => ({
      savedArticles: [],
      
      addArticle: (article) => set((state) => {
        const newArticle: SavedArticle = {
          ...article,
          id: `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          savedAt: new Date().toISOString()
        }
        return {
          savedArticles: [newArticle, ...state.savedArticles]
        }
      }),
      
      removeArticle: (id) => set((state) => ({
        savedArticles: state.savedArticles.filter(a => a.id !== id)
      })),
      
      clearAll: () => set({ savedArticles: [] })
    }),
    {
      name: 'saved-articles-storage'
    }
  )
)



