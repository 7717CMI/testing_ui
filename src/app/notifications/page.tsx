'use client'

import { useState } from 'react'
import { useNotificationsStore } from '@/stores/notifications-store'
import { notificationService } from '@/services/notification-service'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  TrendingUp,
  Building2,
  Zap,
  AlertTriangle,
  Target,
  Database,
  Search,
  Info,
  RefreshCw,
  ArrowRight,
  X
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { toast } from 'sonner'

const alertTypeIcons = {
  ma_activity: TrendingUp,
  facility_change: Building2,
  facility_news: Building2,
  intent_spike: Zap,
  new_facility: Building2,
  competitive_move: AlertTriangle,
  data_update: Database,
  saved_search_result: Search,
  market_trend: TrendingUp,
  category_update: TrendingUp,
  system: Info,
}

const priorityColors = {
  low: 'text-gray-500 bg-gray-100 dark:bg-gray-800 border-gray-200',
  medium: 'text-blue-500 bg-blue-100 dark:bg-blue-900 border-blue-200',
  high: 'text-orange-500 bg-orange-100 dark:bg-orange-900 border-orange-200',
  urgent: 'text-red-500 bg-red-100 dark:bg-red-900 border-red-200',
}

export default function NotificationsPage() {
  const {
    alerts,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteAlert,
    clearAllAlerts,
    getUnreadAlerts,
    getAlertsByType,
  } = useNotificationsStore()

  const [activeTab, setActiveTab] = useState<string>('all')
  const [isChecking, setIsChecking] = useState(false)

  const sortedAlerts = [...alerts].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )

  const filteredAlerts = activeTab === 'all' 
    ? sortedAlerts 
    : activeTab === 'unread'
    ? getUnreadAlerts()
    : sortedAlerts.filter(a => a.type === activeTab)

  // Group alerts by date
  const groupedAlerts = filteredAlerts.reduce((groups, alert) => {
    const date = new Date(alert.createdAt)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let key = date.toLocaleDateString()
    if (date.toDateString() === today.toDateString()) {
      key = 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = 'Yesterday'
    }

    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(alert)
    return groups
  }, {} as Record<string, typeof alerts>)

  async function handleCheckNow() {
    setIsChecking(true)
    try {
      await notificationService.checkNow()
    } finally {
      setIsChecking(false)
    }
  }

  function handleClearAll() {
    if (confirm('Are you sure you want to clear all notifications?')) {
      clearAllAlerts()
      toast.success('All notifications cleared')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleCheckNow}
              disabled={isChecking}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
              Check Now
            </Button>
            <Link href="/notification-settings">
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
        {unreadCount > 0 && (
          <p className="text-muted-foreground">
            {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
          </p>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="all">
            All {alerts.length > 0 && `(${alerts.length})`}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="facility_news">
            Facilities
          </TabsTrigger>
          <TabsTrigger value="market_trend">
            Market
          </TabsTrigger>
          <TabsTrigger value="system">
            System
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Actions */}
      {filteredAlerts.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All as Read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="gap-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        </div>
      )}

      {/* Notifications List */}
      {filteredAlerts.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
          <h3 className="text-xl font-semibold mb-2">No notifications</h3>
          <p className="text-muted-foreground mb-6">
            {activeTab === 'unread' 
              ? 'All caught up! No unread notifications.'
              : "We'll notify you when something important happens"}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button onClick={handleCheckNow} disabled={isChecking}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
              Check for Updates
            </Button>
            <Link href="/notification-settings">
              <Button variant="outline">
                Configure Settings
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedAlerts).map(([date, dateAlerts]) => (
            <div key={date}>
              <h2 className="text-lg font-semibold mb-4 text-muted-foreground">{date}</h2>
              <div className="space-y-3">
                {dateAlerts.map((alert) => {
                  const Icon = alertTypeIcons[alert.type as keyof typeof alertTypeIcons] || Bell
                  
                  return (
                    <Card
                      key={alert.id}
                      className={`p-4 hover:shadow-md transition-all ${
                        !alert.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex gap-4">
                        <div
                          className={`p-3 rounded-lg h-fit border ${
                            priorityColors[alert.priority]
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{alert.title}</h3>
                                {!alert.read && (
                                  <div className="h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-muted-foreground mb-2">{alert.message}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>
                                  {formatDistanceToNow(alert.createdAt, { addSuffix: true })}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {alert.priority}
                                </Badge>
                                {alert.metadata?.articleCount && alert.metadata.articleCount > 1 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {alert.metadata.articleCount} articles
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            {alert.link && (
                              <Link href={alert.link} onClick={() => markAsRead(alert.id)}>
                                <Button size="sm" variant="default" className="gap-2">
                                  View Details
                                  <ArrowRight className="h-3 w-3" />
                                </Button>
                              </Link>
                            )}
                            {!alert.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(alert.id)}
                                className="gap-2"
                              >
                                <Check className="h-3 w-3" />
                                Mark Read
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                deleteAlert(alert.id)
                                toast.success('Notification deleted')
                              }}
                              className="gap-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

