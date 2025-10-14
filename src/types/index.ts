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
  category: "Expansion" | "Technology" | "Funding" | "M&A" | "Regulation"
  type: "Hospitals" | "Clinics" | "Mental Health" | "Urgent Care" | "Policy"
  summary: string
  content: string
  views: number
  date: string
  author: string
  tags: string[]
}

export interface User {
  id: string
  email: string
  name: string
  role: "Admin" | "Analyst" | "Viewer"
  plan: "Free" | "Pro" | "Enterprise"
  avatar?: string
  jobTitle?: string
}

export interface SearchFilters {
  facilityType: string[]
  ownership: string[]
  accreditation: string[]
  bedCountRange: [number, number]
  ratingRange: [number, number]
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

