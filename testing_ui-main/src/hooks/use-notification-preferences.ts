import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useSubscriptionStore } from '@/stores/subscription-store'
import { getNotificationPreferences, updateNotificationPreferences } from '@/lib/profile-utils'
import { NotificationPreferences } from '@/types'
import { toast } from 'sonner'

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailNotifications: true,
  weeklySummary: true,
  marketAlerts: false,
  newListings: true,
  productUpdates: true,
}

export function useNotificationPreferences() {
  const { user } = useAuthStore()
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load preferences
  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    async function loadPreferences() {
      try {
        setLoading(true)
        const prefs = await getNotificationPreferences(user.id)
        if (prefs) {
          setPreferences({
            ...DEFAULT_PREFERENCES,
            ...prefs,
          })
        }
      } catch (error: any) {
        console.error('Error loading preferences:', error)
        // Use defaults on error
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [user?.id])

  // Update preference
  async function updatePreference(key: keyof NotificationPreferences, value: boolean) {
    if (!user?.id) {
      toast.error('You must be logged in to update preferences')
      return
    }

    // Check if user has premium plan
    const { plan } = useSubscriptionStore.getState()
    if (plan === "free") {
      toast.error('Notifications are only available for Pro and Enterprise plans. Please upgrade to enable notifications.')
      return
    }

    try {
      setSaving(true)
      const newPreferences = {
        ...preferences,
        [key]: value,
      }
      
      await updateNotificationPreferences(user.id, newPreferences)
      setPreferences(newPreferences)
      toast.success('Notification preference updated!')
    } catch (error: any) {
      console.error('Error updating preference:', error)
      toast.error('Failed to update preference')
      throw error
    } finally {
      setSaving(false)
    }
  }

  // Update all preferences at once
  async function updateAllPreferences(newPreferences: NotificationPreferences) {
    if (!user?.id) {
      toast.error('You must be logged in to update preferences')
      return
    }

    try {
      setSaving(true)
      await updateNotificationPreferences(user.id, newPreferences)
      setPreferences(newPreferences)
      toast.success('Notification preferences updated!')
    } catch (error: any) {
      console.error('Error updating preferences:', error)
      toast.error('Failed to update preferences')
      throw error
    } finally {
      setSaving(false)
    }
  }

  return {
    preferences,
    loading,
    saving,
    updatePreference,
    updateAllPreferences,
  }
}

