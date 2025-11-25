import { create } from 'zustand'

export interface Intent {
  id: string
  company: string
  topic: string
  score: number
  category: string
  location?: string
  timestamp: Date
  trend?: 'up' | 'down' | 'stable'
}

export interface TrendingTopic {
  topic: string
  count: number
  change: number
  trend: 'up' | 'down' | 'stable'
}

interface IntentState {
  intents: Intent[]
  trendingTopics: TrendingTopic[]
  totalCompanies: number
  averageScore: number
  topicCount: number
  isLoading: boolean

  // Actions
  fetchIntentData: () => Promise<void>
  exportIntentData: () => void
}

export const useIntentStore = create<IntentState>((set, get) => ({
  intents: [],
  trendingTopics: [],
  totalCompanies: 0,
  averageScore: 0,
  topicCount: 0,
  isLoading: false,

  fetchIntentData: async () => {
    set({ isLoading: true })
    
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock data - replace with actual API response
      const mockIntents: Intent[] = [
        {
          id: '1',
          company: 'HealthTech Solutions',
          topic: 'Healthcare Analytics',
          score: 85,
          category: 'Technology',
          location: 'San Francisco, CA',
          timestamp: new Date(),
          trend: 'up',
        },
        {
          id: '2',
          company: 'MedCare Systems',
          topic: 'Patient Management',
          score: 78,
          category: 'Software',
          location: 'Austin, TX',
          timestamp: new Date(),
          trend: 'up',
        },
        {
          id: '3',
          company: 'AI Diagnostics Inc',
          topic: 'AI Diagnostics',
          score: 92,
          category: 'AI/ML',
          location: 'Boston, MA',
          timestamp: new Date(),
          trend: 'up',
        },
        {
          id: '4',
          company: 'TeleHealth Pro',
          topic: 'Telemedicine',
          score: 75,
          category: 'Telehealth',
          location: 'Seattle, WA',
          timestamp: new Date(),
          trend: 'stable',
        },
        {
          id: '5',
          company: 'DataHealth Corp',
          topic: 'Healthcare Analytics',
          score: 88,
          category: 'Analytics',
          location: 'New York, NY',
          timestamp: new Date(),
          trend: 'up',
        },
      ]

      const mockTrendingTopics: TrendingTopic[] = [
        { topic: 'Healthcare Analytics', count: 45, change: 15, trend: 'up' },
        { topic: 'Patient Management', count: 38, change: 22, trend: 'up' },
        { topic: 'AI Diagnostics', count: 32, change: 28, trend: 'up' },
        { topic: 'Telemedicine', count: 25, change: -5, trend: 'down' },
        { topic: 'Electronic Health Records', count: 20, change: 8, trend: 'up' },
      ]

      const totalCompanies = new Set(mockIntents.map(i => i.company)).size
      const averageScore = mockIntents.reduce((sum, i) => sum + i.score, 0) / mockIntents.length

      set({
        intents: mockIntents,
        trendingTopics: mockTrendingTopics,
        totalCompanies,
        averageScore: Math.round(averageScore),
        topicCount: mockTrendingTopics.length,
        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to fetch intent data:', error)
      set({ isLoading: false })
    }
  },

  exportIntentData: () => {
    const { intents, trendingTopics } = get()
    
    const exportData = {
      intents: intents.map(intent => ({
        ...intent,
        timestamp: intent.timestamp.toISOString(),
      })),
      trendingTopics,
      exportedAt: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `intent-data-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  },
}))





