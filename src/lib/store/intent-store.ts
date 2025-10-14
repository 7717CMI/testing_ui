import { create } from 'zustand'

export interface IntentTopic {
  id: string
  name: string
  category: string
  score: number
  trend: 'up' | 'down' | 'stable'
  changePercent: number
}

export interface CompanyIntent {
  id: string
  companyName: string
  domain: string
  industry: string
  employeeCount: string
  topics: IntentTopic[]
  overallScore: number
  lastActivityDate: Date
  location: {
    city: string
    state: string
    country: string
  }
}

interface IntentState {
  // Intent data
  intents: CompanyIntent[]
  trendingTopics: IntentTopic[]
  
  // Filters
  selectedIndustries: string[]
  selectedCategories: string[]
  minScore: number
  
  // Stats
  totalCompanies: number
  averageScore: number
  topicCount: number
  
  // Loading
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchIntentData: () => Promise<void>
  setIndustryFilter: (industries: string[]) => void
  setCategoryFilter: (categories: string[]) => void
  setMinScore: (score: number) => void
  exportIntentData: (format: 'json' | 'csv') => void
}

export const useIntentStore = create<IntentState>((set, get) => ({
  intents: [],
  trendingTopics: [],
  selectedIndustries: [],
  selectedCategories: [],
  minScore: 0,
  totalCompanies: 0,
  averageScore: 0,
  topicCount: 0,
  isLoading: false,
  error: null,

  fetchIntentData: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch('/api/bombora/intent')
      if (response.ok) {
        const data = await response.json()
        set({
          intents: data.intents || [],
          trendingTopics: data.trendingTopics || [],
          totalCompanies: data.totalCompanies || 0,
          averageScore: data.averageScore || 0,
          topicCount: data.topicCount || 0,
          isLoading: false,
        })
      } else {
        throw new Error('Failed to fetch intent data')
      }
    } catch (error) {
      // Silently fall back to mock data (no backend API yet)
      
      // Use mock data on failure
      const mockTopics: IntentTopic[] = [
        { id: 'topic-1', name: 'Healthcare Analytics', category: 'Analytics', score: 92, trend: 'up', changePercent: 15 },
        { id: 'topic-2', name: 'Patient Management Systems', category: 'Software', score: 88, trend: 'up', changePercent: 22 },
        { id: 'topic-3', name: 'Medical Device Integration', category: 'Integration', score: 85, trend: 'stable', changePercent: 3 },
        { id: 'topic-4', name: 'Telemedicine Solutions', category: 'Healthcare', score: 83, trend: 'up', changePercent: 18 },
        { id: 'topic-5', name: 'Data Security & Compliance', category: 'Security', score: 80, trend: 'down', changePercent: -5 },
        { id: 'topic-6', name: 'Cloud Healthcare Infrastructure', category: 'Infrastructure', score: 78, trend: 'up', changePercent: 12 },
        { id: 'topic-7', name: 'AI Diagnostics', category: 'AI/ML', score: 76, trend: 'up', changePercent: 28 },
        { id: 'topic-8', name: 'Electronic Health Records', category: 'Software', score: 74, trend: 'stable', changePercent: 2 },
        { id: 'topic-9', name: 'Revenue Cycle Management', category: 'Finance', score: 72, trend: 'up', changePercent: 8 },
        { id: 'topic-10', name: 'Healthcare CRM', category: 'Software', score: 70, trend: 'up', changePercent: 14 },
      ]
      
      const mockIntents: CompanyIntent[] = [
        {
          id: 'intent-1',
          companyName: 'HealthTech Solutions Inc.',
          domain: 'healthtech-solutions.com',
          industry: 'Healthcare Technology',
          employeeCount: '500-1000',
          topics: [mockTopics[0], mockTopics[1], mockTopics[3]],
          overallScore: 89,
          lastActivityDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
          location: { city: 'San Francisco', state: 'CA', country: 'USA' },
        },
        {
          id: 'intent-2',
          companyName: 'MediCare Systems Corp.',
          domain: 'medicare-systems.com',
          industry: 'Healthcare Services',
          employeeCount: '1000-5000',
          topics: [mockTopics[1], mockTopics[2], mockTopics[4]],
          overallScore: 85,
          lastActivityDate: new Date(Date.now() - 5 * 60 * 60 * 1000),
          location: { city: 'Boston', state: 'MA', country: 'USA' },
        },
        {
          id: 'intent-3',
          companyName: 'Digital Health Innovations',
          domain: 'digital-health-innovations.com',
          industry: 'Digital Health',
          employeeCount: '100-500',
          topics: [mockTopics[3], mockTopics[6], mockTopics[0]],
          overallScore: 82,
          lastActivityDate: new Date(Date.now() - 8 * 60 * 60 * 1000),
          location: { city: 'Austin', state: 'TX', country: 'USA' },
        },
        {
          id: 'intent-4',
          companyName: 'CloudMed Enterprise',
          domain: 'cloudmed-enterprise.com',
          industry: 'Cloud Services',
          employeeCount: '500-1000',
          topics: [mockTopics[5], mockTopics[4], mockTopics[2]],
          overallScore: 79,
          lastActivityDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
          location: { city: 'Seattle', state: 'WA', country: 'USA' },
        },
        {
          id: 'intent-5',
          companyName: 'AI Medical Diagnostics',
          domain: 'ai-med-diagnostics.com',
          industry: 'AI/Healthcare',
          employeeCount: '50-100',
          topics: [mockTopics[6], mockTopics[0], mockTopics[1]],
          overallScore: 91,
          lastActivityDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          location: { city: 'New York', state: 'NY', country: 'USA' },
        },
        {
          id: 'intent-6',
          companyName: 'Regional Medical Group',
          domain: 'regional-medical.com',
          industry: 'Healthcare Provider',
          employeeCount: '1000-5000',
          topics: [mockTopics[7], mockTopics[8], mockTopics[4]],
          overallScore: 88,
          lastActivityDate: new Date(Date.now() - 3 * 60 * 60 * 1000),
          location: { city: 'Chicago', state: 'IL', country: 'USA' },
        },
        {
          id: 'intent-7',
          companyName: 'TeleCare Partners',
          domain: 'telecare-partners.com',
          industry: 'Telemedicine',
          employeeCount: '100-500',
          topics: [mockTopics[3], mockTopics[5], mockTopics[9]],
          overallScore: 86,
          lastActivityDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
          location: { city: 'Denver', state: 'CO', country: 'USA' },
        },
        {
          id: 'intent-8',
          companyName: 'HealthData Analytics Corp',
          domain: 'healthdata-analytics.com',
          industry: 'Data Analytics',
          employeeCount: '500-1000',
          topics: [mockTopics[0], mockTopics[2], mockTopics[6]],
          overallScore: 75,
          lastActivityDate: new Date(Date.now() - 18 * 60 * 60 * 1000),
          location: { city: 'Atlanta', state: 'GA', country: 'USA' },
        },
        {
          id: 'intent-9',
          companyName: 'Metro Hospital Network',
          domain: 'metro-hospital.org',
          industry: 'Hospital System',
          employeeCount: '5000+',
          topics: [mockTopics[1], mockTopics[4], mockTopics[7]],
          overallScore: 92,
          lastActivityDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
          location: { city: 'Philadelphia', state: 'PA', country: 'USA' },
        },
        {
          id: 'intent-10',
          companyName: 'SmartHealth Systems',
          domain: 'smarthealth-systems.com',
          industry: 'Healthcare IT',
          employeeCount: '100-500',
          topics: [mockTopics[5], mockTopics[9], mockTopics[3]],
          overallScore: 81,
          lastActivityDate: new Date(Date.now() - 10 * 60 * 60 * 1000),
          location: { city: 'Portland', state: 'OR', country: 'USA' },
        },
      ]
      
      set({
        intents: mockIntents,
        trendingTopics: mockTopics,
        totalCompanies: mockIntents.length,
        averageScore: Math.round(mockIntents.reduce((sum, i) => sum + i.overallScore, 0) / mockIntents.length),
        topicCount: mockTopics.length,
        isLoading: false,
        error: null,
      })
    }
  },

  setIndustryFilter: (industries) => {
    set({ selectedIndustries: industries })
  },

  setCategoryFilter: (categories) => {
    set({ selectedCategories: categories })
  },

  setMinScore: (score) => {
    set({ minScore: score })
  },

  exportIntentData: (format) => {
    const state = get()
    if (state.intents.length === 0) return

    if (format === 'json') {
      const dataStr = JSON.stringify(state.intents, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'intent-data.json'
      link.click()
      URL.revokeObjectURL(url)
    } else if (format === 'csv') {
      let csv = 'Company,Domain,Industry,Score,Last Activity,Location\n'
      state.intents.forEach((intent) => {
        csv += `${intent.companyName},${intent.domain},${intent.industry},${intent.overallScore},${intent.lastActivityDate.toISOString()},"${intent.location.city}, ${intent.location.state}"\n`
      })
      const dataBlob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'intent-data.csv'
      link.click()
      URL.revokeObjectURL(url)
    }
  },
}))

