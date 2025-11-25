export interface Facility {
  id: string
  name: string
  type: "Hospital" | "Clinic" | "Urgent Care" | "Mental Health"
  ownership: "Public" | "Private" | "Non-Profit"
  accreditation: string[]
  rating: number
  bedCount: number
  address: string
  city: string
  state: string
  zip: string
  phone: string
  email: string
  website: string
  summary: string
  verified: boolean
  latitude: number
  longitude: number
}

export interface Insight {
  id: string
  title: string
  category: "Expansion" | "Technology" | "Funding" | "M&A" | "Regulation" | "Policy" | "Market Trend"
  type: string
  summary: string
  content: string
  views: number
  date: string
  author: string
  sourceUrl?: string // URL to the original article
  tags: string[]
  excerpt?: string
  readTime?: number
}

export interface User {
  id: string
  email: string
  name: string | null
  role?: "Admin" | "Analyst" | "Viewer"
  plan?: "Free" | "Pro" | "Enterprise"
  avatar?: string
  jobTitle?: string
  company?: string
  phone?: string
  emailVerified?: boolean
  uid?: string
  createdAt?: string
  updatedAt?: string
}

export interface UserProfile {
  name?: string
  jobTitle?: string
  company?: string
  phone?: string
  avatar?: string
  role?: "Admin" | "Analyst" | "Viewer"
}

export interface NotificationPreferences {
  emailNotifications: boolean
  weeklySummary: boolean
  marketAlerts: boolean
  newListings: boolean
  productUpdates: boolean
}

export interface SearchFilters {
  facilityType: string[]
  ownership: string[]
  accreditation: string[]
  bedCountRange: [number, number]
  ratingRange: [number, number]
  revenueRange?: [number, number] // Annual revenue in millions
  states: string[]
  cities: string[]
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  citations?: string[]
}

