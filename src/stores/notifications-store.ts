import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AlertType = 
  | 'ma_activity'
  | 'facility_change'
  | 'intent_spike'
  | 'new_facility'
  | 'competitive_move'
  | 'data_update'
  | 'saved_search_result'
  | 'system'

export type AlertPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Alert {
  id: string
  type: AlertType
  priority: AlertPriority
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: Date
  metadata?: Record<string, any>
}

export interface AlertPreference {
  type: AlertType
  enabled: boolean
  emailNotification: boolean
  pushNotification: boolean
  minimumPriority: AlertPriority
}

interface NotificationsState {
  // Alerts
  alerts: Alert[]
  unreadCount: number
  
  // Preferences
  preferences: AlertPreference[]
  globalNotifications: boolean
  
  // Actions
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteAlert: (id: string) => void
  clearAllAlerts: () => void
  
  // Preferences
  updatePreference: (type: AlertType, updates: Partial<AlertPreference>) => void
  toggleGlobalNotifications: () => void
  
  // Utilities
  getUnreadAlerts: () => Alert[]
  getAlertsByType: (type: AlertType) => Alert[]
}

const defaultPreferences: AlertPreference[] = [
  {
    type: 'ma_activity',
    enabled: true,
    emailNotification: true,
    pushNotification: true,
    minimumPriority: 'medium',
  },
  {
    type: 'facility_change',
    enabled: true,
    emailNotification: true,
    pushNotification: false,
    minimumPriority: 'medium',
  },
  {
    type: 'intent_spike',
    enabled: true,
    emailNotification: true,
    pushNotification: true,
    minimumPriority: 'high',
  },
  {
    type: 'new_facility',
    enabled: true,
    emailNotification: false,
    pushNotification: false,
    minimumPriority: 'low',
  },
  {
    type: 'competitive_move',
    enabled: true,
    emailNotification: true,
    pushNotification: true,
    minimumPriority: 'high',
  },
  {
    type: 'data_update',
    enabled: false,
    emailNotification: false,
    pushNotification: false,
    minimumPriority: 'low',
  },
  {
    type: 'saved_search_result',
    enabled: true,
    emailNotification: true,
    pushNotification: false,
    minimumPriority: 'medium',
  },
  {
    type: 'system',
    enabled: true,
    emailNotification: false,
    pushNotification: false,
    minimumPriority: 'medium',
  },
]

// Mock alerts for demonstration
const generateMockAlerts = (): Alert[] => [
  {
    id: 'alert-1',
    type: 'ma_activity',
    priority: 'high',
    title: 'New M&A Activity Detected',
    message: 'Memorial Hospital acquired by HealthCorp Inc. for $450M',
    link: '/insights',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    metadata: { facilityId: 'fac-123', dealValue: 450000000 },
  },
  {
    id: 'alert-2',
    type: 'intent_spike',
    priority: 'critical',
    title: 'High Intent Score Detected',
    message: 'Metro Hospital Network shows 92 intent score for Healthcare Analytics',
    link: '/intent',
    read: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    metadata: { companyId: 'intent-9', score: 92 },
  },
  {
    id: 'alert-3',
    type: 'saved_search_result',
    priority: 'medium',
    title: 'New Results for "CA Hospitals"',
    message: '15 new facilities match your saved search criteria',
    link: '/search',
    read: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    metadata: { searchId: 'search-123', newCount: 15 },
  },
  {
    id: 'alert-4',
    type: 'facility_change',
    priority: 'medium',
    title: 'Facility Ownership Changed',
    message: 'St. Mary\'s Hospital ownership transferred to new parent company',
    link: '/verified-data',
    read: true,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: 'alert-5',
    type: 'competitive_move',
    priority: 'high',
    title: 'Competitor Activity Alert',
    message: 'TechHealth Solutions expanded to 3 new states this quarter',
    link: '/analytics',
    read: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'alert-6',
    type: 'new_facility',
    priority: 'low',
    title: 'New Facilities Added',
    message: '8 new facilities added in your target region',
    link: '/search',
    read: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
]

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      alerts: generateMockAlerts(),
      unreadCount: generateMockAlerts().filter(a => !a.read).length,
      preferences: defaultPreferences,
      globalNotifications: true,

      addAlert: (alert) => {
        const newAlert: Alert = {
          ...alert,
          id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          read: false,
        }
        
        set((state) => ({
          alerts: [newAlert, ...state.alerts],
          unreadCount: state.unreadCount + 1,
        }))
      },

      markAsRead: (id) => {
        set((state) => {
          const alert = state.alerts.find(a => a.id === id)
          const wasUnread = alert && !alert.read
          
          return {
            alerts: state.alerts.map((alert) =>
              alert.id === id ? { ...alert, read: true } : alert
            ),
            unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
          }
        })
      },

      markAllAsRead: () => {
        set((state) => ({
          alerts: state.alerts.map((alert) => ({ ...alert, read: true })),
          unreadCount: 0,
        }))
      },

      deleteAlert: (id) => {
        set((state) => {
          const alert = state.alerts.find(a => a.id === id)
          const wasUnread = alert && !alert.read
          
          return {
            alerts: state.alerts.filter((alert) => alert.id !== id),
            unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
          }
        })
      },

      clearAllAlerts: () => {
        set({
          alerts: [],
          unreadCount: 0,
        })
      },

      updatePreference: (type, updates) => {
        set((state) => ({
          preferences: state.preferences.map((pref) =>
            pref.type === type ? { ...pref, ...updates } : pref
          ),
        }))
      },

      toggleGlobalNotifications: () => {
        set((state) => ({
          globalNotifications: !state.globalNotifications,
        }))
      },

      getUnreadAlerts: () => {
        return get().alerts.filter((alert) => !alert.read)
      },

      getAlertsByType: (type) => {
        return get().alerts.filter((alert) => alert.type === type)
      },
    }),
    {
      name: 'notifications-storage',
    }
  )
)


