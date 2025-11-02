import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface BookmarkedFacility {
  id: string
  npi: string
  name: string
  city: string
  state: string
  phone?: string
  facilityType: string
  category: string
  bookmarkedAt: number
  lastNewsFetch?: number
  latestNews?: NewsArticle[]
}

export interface NewsArticle {
  title: string
  summary: string
  source: string
  url?: string
  publishedAt?: string
}

interface BookmarksState {
  bookmarks: BookmarkedFacility[]
  addBookmark: (facility: Omit<BookmarkedFacility, 'bookmarkedAt' | 'latestNews'>) => void
  removeBookmark: (npi: string) => void
  isBookmarked: (npi: string) => boolean
  updateNews: (npi: string, news: NewsArticle[], fetchTime: number) => void
  clearAllBookmarks: () => void
}

export const useBookmarksStore = create<BookmarksState>()(
  persist(
    (set, get) => ({
      bookmarks: [],

      addBookmark: (facility) => {
        const existing = get().bookmarks.find(b => b.npi === facility.npi)
        if (existing) return // Already bookmarked

        set((state) => ({
          bookmarks: [
            ...state.bookmarks,
            {
              ...facility,
              bookmarkedAt: Date.now(),
            },
          ],
        }))
      },

      removeBookmark: (npi) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.npi !== npi),
        }))
      },

      isBookmarked: (npi) => {
        return get().bookmarks.some((b) => b.npi === npi)
      },

      updateNews: (npi, news, fetchTime) => {
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.npi === npi
              ? { ...b, latestNews: news, lastNewsFetch: fetchTime }
              : b
          ),
        }))
      },

      clearAllBookmarks: () => {
        set({ bookmarks: [] })
      },
    }),
    {
      name: 'healthdata-bookmarks',
    }
  )
)





