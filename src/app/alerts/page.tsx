'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useNotificationsStore } from '@/stores/notifications-store'
import type { AlertType } from '@/stores/notifications-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bell,
  Settings,
  Trash2,
  CheckCheck,
  Mail,
  Smartphone,
  TrendingUp,
  Building2,
  Zap,
  AlertTriangle,
  Target,
  Database,
  Search,
  Info,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const alertTypeInfo: Record<
  AlertType,
  { icon: any; label: string; description: string; color: string }
> = {
  ma_activity: {
    icon: TrendingUp,
    label: 'M&A Activity',
    description: 'Mergers, acquisitions, and ownership changes',
    color: 'text-blue-500',
  },
  facility_change: {
    icon: Building2,
    label: 'Facility Changes',
    description: 'Updates to facility information',
    color: 'text-green-500',
  },
  intent_spike: {
    icon: Zap,
    label: 'Intent Spikes',
    description: 'High-intent companies showing buying signals',
    color: 'text-yellow-500',
  },
  new_facility: {
    icon: Building2,
    label: 'New Facilities',
    description: 'Newly added facilities in tracked regions',
    color: 'text-purple-500',
  },
  competitive_move: {
    icon: AlertTriangle,
    label: 'Competitive Moves',
    description: 'Competitor activity and market changes',
    color: 'text-red-500',
  },
  data_update: {
    icon: Database,
    label: 'Data Updates',
    description: 'Database refreshes and data quality improvements',
    color: 'text-gray-500',
  },
  saved_search_result: {
    icon: Search,
    label: 'Saved Search Results',
    description: 'New results for your saved searches',
    color: 'text-indigo-500',
  },
  system: {
    icon: Info,
    label: 'System Notifications',
    description: 'Platform updates and announcements',
    color: 'text-gray-500',
  },
}

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export default function AlertsPage() {
  const {
    alerts,
    unreadCount,
    preferences,
    globalNotifications,
    markAsRead,
    markAllAsRead,
    deleteAlert,
    clearAllAlerts,
    updatePreference,
    toggleGlobalNotifications,
  } = useNotificationsStore()

  const [selectedType, setSelectedType] = useState<AlertType | 'all'>('all')

  const filteredAlerts =
    selectedType === 'all'
      ? alerts
      : alerts.filter((alert) => alert.type === selectedType)

  const sortedAlerts = [...filteredAlerts].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Bell className="h-10 w-10 text-primary-500" />
                Alerts & Notifications
              </h1>
              <p className="text-xl text-muted-foreground">
                Manage your notification preferences and view all alerts
              </p>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} variant="outline">
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
              {alerts.length > 0 && (
                <Button onClick={clearAllAlerts} variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{alerts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Unread
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary-500">
                {unreadCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Alert Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary-500">
                {preferences.filter((p) => p.enabled).length}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="alerts" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="alerts" className="gap-2">
                <Bell className="h-4 w-4" />
                All Alerts
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Alerts Tab */}
            <TabsContent value="alerts" className="space-y-4">
              {/* Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filter by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedType === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedType('all')}
                    >
                      All ({alerts.length})
                    </Button>
                    {Object.entries(alertTypeInfo).map(([type, info]) => {
                      const count = alerts.filter((a) => a.type === type).length
                      if (count === 0) return null
                      const Icon = info.icon
                      return (
                        <Button
                          key={type}
                          variant={selectedType === type ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedType(type as AlertType)}
                        >
                          <Icon className="h-3 w-3 mr-1" />
                          {info.label} ({count})
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Alerts List */}
              <div className="space-y-3">
                {sortedAlerts.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <h3 className="text-lg font-semibold mb-2">
                        No alerts
                      </h3>
                      <p className="text-muted-foreground">
                        {selectedType === 'all'
                          ? "You're all caught up!"
                          : `No ${alertTypeInfo[selectedType as AlertType]?.label} alerts`}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  sortedAlerts.map((alert) => {
                    const Icon = alertTypeInfo[alert.type].icon
                    const content = (
                      <Card
                        key={alert.id}
                        className={`card-hover ${
                          !alert.read ? 'border-l-4 border-l-primary-500' : ''
                        }`}
                      >
                        <CardContent className="pt-6">
                          <div className="flex gap-4">
                            <div
                              className={`p-3 rounded-lg h-fit ${
                                alert.priority === 'critical'
                                  ? 'bg-red-100 dark:bg-red-900'
                                  : alert.priority === 'high'
                                  ? 'bg-orange-100 dark:bg-orange-900'
                                  : alert.priority === 'medium'
                                  ? 'bg-blue-100 dark:bg-blue-900'
                                  : 'bg-gray-100 dark:bg-gray-800'
                              }`}
                            >
                              <Icon
                                className={`h-5 w-5 ${
                                  alertTypeInfo[alert.type].color
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <h4 className="font-semibold">
                                    {alert.title}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {alertTypeInfo[alert.type].label}
                                    </Badge>
                                    <Badge
                                      variant={
                                        alert.priority === 'critical' ||
                                        alert.priority === 'high'
                                          ? 'destructive'
                                          : 'secondary'
                                      }
                                      className="text-xs"
                                    >
                                      {priorityLabels[alert.priority]}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  {!alert.read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => markAsRead(alert.id)}
                                    >
                                      <CheckCheck className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteAlert(alert.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {alert.message}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(alert.createdAt, {
                                    addSuffix: true,
                                  })}
                                </span>
                                {alert.link && (
                                  <Link href={alert.link}>
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="h-auto p-0"
                                    >
                                      View Details →
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )

                    return content
                  })
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              {/* Global Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Global Notifications</CardTitle>
                  <CardDescription>
                    Master switch for all notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable all notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Turn off to pause all alerts
                      </p>
                    </div>
                    <Switch
                      checked={globalNotifications}
                      onCheckedChange={toggleGlobalNotifications}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Alert Type Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Alert Preferences</CardTitle>
                  <CardDescription>
                    Configure which alerts you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {preferences.map((pref) => {
                    const info = alertTypeInfo[pref.type]
                    const Icon = info.icon
                    return (
                      <div
                        key={pref.type}
                        className="border rounded-lg p-4 space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3">
                            <div className="p-2 bg-muted rounded-lg h-fit">
                              <Icon className={`h-5 w-5 ${info.color}`} />
                            </div>
                            <div>
                              <h4 className="font-semibold">{info.label}</h4>
                              <p className="text-sm text-muted-foreground">
                                {info.description}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={pref.enabled}
                            onCheckedChange={(checked) =>
                              updatePreference(pref.type, { enabled: checked })
                            }
                          />
                        </div>

                        {pref.enabled && (
                          <div className="grid md:grid-cols-2 gap-4 pl-14">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4" />
                                <span>Email notifications</span>
                              </div>
                              <Switch
                                checked={pref.emailNotification}
                                onCheckedChange={(checked) =>
                                  updatePreference(pref.type, {
                                    emailNotification: checked,
                                  })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm">
                                <Smartphone className="h-4 w-4" />
                                <span>Push notifications</span>
                              </div>
                              <Switch
                                checked={pref.pushNotification}
                                onCheckedChange={(checked) =>
                                  updatePreference(pref.type, {
                                    pushNotification: checked,
                                  })
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}


