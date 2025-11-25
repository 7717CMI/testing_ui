// ============================================
// NOTIFICATION SYSTEM TYPE DEFINITIONS
// ============================================

export interface NotificationPreferences {
  id: string
  userId: string
  
  // What to monitor
  monitoredFacilityListIds: string[] // IDs of saved facility lists
  monitoredCategories: {
    expansion: boolean
    technology: boolean
    funding: boolean
    mna: boolean // M&A
    regulation: boolean
    policy: boolean
    marketTrend: boolean
  }
  monitoredRegions: {
    states: string[]
    cities: string[]
  }
  
  // How to notify
  frequency: 'immediate' | 'twice_daily' | 'daily' | 'weekly'
  deliveryMethods: {
    inApp: boolean
    email: boolean
    browserPush: boolean
  }
  
  // When to notify
  quietHours: {
    enabled: boolean
    start: string // "22:00"
    end: string // "08:00"
  }
  
  enabled: boolean
  createdAt: Date
  updatedAt: Date
  lastChecked?: Date
}

export interface NewsNotification {
  id: string
  userId: string
  
  // Content
  title: string
  message: string
  summary: string
  
  // Metadata
  type: 'facility_news' | 'market_trend' | 'category_update' | 'saved_search_result'
  category: 'Expansion' | 'Technology' | 'Funding' | 'M&A' | 'Regulation' | 'Policy' | 'Market Trend' | 'General'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // Related entities
  facilityListId?: string
  facilityListName?: string
  facilityId?: string
  facilityName?: string
  region?: string
  
  // Source
  sourceUrl?: string
  articleId?: string
  articleData?: any // Full article data
  
  // Status
  read: boolean
  archived: boolean
  createdAt: Date
  readAt?: Date
  
  // Link
  link?: string
}

export interface NotificationCheckResult {
  success: boolean
  newNotificationsCount: number
  totalArticlesFound: number
  errors: string[]
  checkedAt: Date
}
