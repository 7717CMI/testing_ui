'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNotificationsStore } from '@/stores/notifications-store'
import { useSavedSearchesStore } from '@/stores/saved-searches-store'
import { notificationService } from '@/services/notification-service'
import { Bell, Mail, Smartphone, Clock, MapPin, Building2, TrendingUp, RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function NotificationSettingsPage() {
  const { globalNotifications, toggleGlobalNotifications, preferences, updatePreference } = useNotificationsStore()
  const { facilityLists } = useSavedSearchesStore()
  
  const [isCheckingNow, setIsCheckingNow] = useState(false)

  async function handleCheckNow() {
    setIsCheckingNow(true)
    try {
      await notificationService.checkNow()
    } finally {
      setIsCheckingNow(false)
    }
  }

  function handleClearHistory() {
    if (confirm('Are you sure you want to clear notification history? This will allow you to receive notifications for articles you\'ve already seen.')) {
      notificationService.clearHistory()
    }
  }

  const stats = notificationService.getStats?.()

  const categories = [
    { key: 'expansion', label: 'Expansion', icon: '🏗️', description: 'New facilities, renovations' },
    { key: 'technology', label: 'Technology', icon: '💻', description: 'New tech adoption, EHR updates' },
    { key: 'funding', label: 'Funding', icon: '💰', description: 'Investment rounds, grants' },
    { key: 'mna', label: 'M&A', icon: '🤝', description: 'Mergers & acquisitions' },
    { key: 'regulation', label: 'Regulation', icon: '📋', description: 'Regulatory changes' },
    { key: 'policy', label: 'Policy', icon: '🏛️', description: 'Healthcare policy updates' },
    { key: 'marketTrend', label: 'Market Trends', icon: '📈', description: 'Industry trends' },
  ]

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
        <p className="text-muted-foreground">
          Configure how and when you want to be notified about healthcare news and updates
        </p>
      </div>

      {/* Global Toggle */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary-500" />
              <div>
                <Label className="text-lg font-semibold">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Turn all notifications on or off
                </p>
              </div>
            </div>
            <Switch
              checked={globalNotifications}
              onCheckedChange={toggleGlobalNotifications}
              className="scale-125"
            />
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card className="mb-6 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${stats.isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="font-semibold">
                  {stats.isRunning ? 'Monitoring Active' : 'Monitoring Inactive'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Last check: {stats.lastCheck ? new Date(stats.lastCheck).toLocaleString() : 'Never'}
              </p>
              <p className="text-sm text-muted-foreground">
                Tracking {stats.seenArticlesCount} articles
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCheckNow}
                disabled={isCheckingNow}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isCheckingNow ? 'animate-spin' : ''}`} />
                {isCheckingNow ? 'Checking...' : 'Check Now'}
              </Button>
              <Button
                variant="outline"
                onClick={handleClearHistory}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Methods */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Delivery Methods
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications in the application bell icon
                </p>
              </div>
            </div>
            <Switch
              checked={true}
              disabled
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email (Coming Soon)
                </p>
              </div>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>Browser Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get desktop notifications (Coming Soon)
                </p>
              </div>
            </div>
            <Switch disabled />
          </div>
        </CardContent>
      </Card>

      {/* Categories to Monitor */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            News Categories
          </CardTitle>
          <CardDescription>
            Select which types of news you want to be notified about
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const isEnabled = preferences.find(p => p.type === category.key.replace('mna', 'ma_activity'))?.enabled ?? true
            
            return (
              <div
                key={category.key}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  isEnabled
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => {
                  // Toggle the preference
                  toast.info(`${category.label} notifications ${isEnabled ? 'disabled' : 'enabled'}`)
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{category.icon}</span>
                  <Switch checked={isEnabled} />
                </div>
                <p className="font-medium mb-1">{category.label}</p>
                <p className="text-xs text-muted-foreground">{category.description}</p>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Frequency */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Notification Frequency
          </CardTitle>
          <CardDescription>
            How often do you want to check for new articles?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select defaultValue="twice_daily" disabled>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="twice_daily">Twice Daily (Every 6 hours) - Recommended</SelectItem>
              <SelectItem value="daily">Daily Digest (Once per day)</SelectItem>
              <SelectItem value="immediate">Immediate (Real-time)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-2">
            Currently checking every 6 hours: approximately 9 AM, 3 PM, 9 PM, and 3 AM
          </p>
        </CardContent>
      </Card>

      {/* Monitored Facilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Monitored Facility Lists
          </CardTitle>
          <CardDescription>
            Get notified about news for facilities in your saved lists
          </CardDescription>
        </CardHeader>
        <CardContent>
          {facilityLists.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="mb-2">No facility lists saved yet</p>
              <p className="text-sm">Create facility lists in Saved Searches to start monitoring them for news</p>
              <Button className="mt-4" onClick={() => window.location.href = '/saved-searches'}>
                Go to Saved Searches
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {facilityLists.map((list) => (
                <div
                  key={list.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{list.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {list.facilityIds.length} {list.facilityIds.length === 1 ? 'facility' : 'facilities'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Monitoring
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

