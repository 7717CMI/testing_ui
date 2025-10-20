'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotificationsStore } from '@/stores/notifications-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  X,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const alertTypeIcons = {
  ma_activity: TrendingUp,
  facility_change: Building2,
  intent_spike: Zap,
  new_facility: Building2,
  competitive_move: AlertTriangle,
  data_update: Database,
  saved_search_result: Search,
  system: Info,
}

const priorityColors = {
  low: 'text-gray-500 bg-gray-100 dark:bg-gray-800',
  medium: 'text-blue-500 bg-blue-100 dark:bg-blue-900',
  high: 'text-orange-500 bg-orange-100 dark:bg-orange-900',
  critical: 'text-red-500 bg-red-100 dark:bg-red-900',
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const {
    alerts,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteAlert,
  } = useNotificationsStore()

  const sortedAlerts = [...alerts].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )

  const handleAlertClick = (id: string, link?: string) => {
    markAsRead(id)
    if (link) {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </Button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 z-50 w-96 max-h-[600px] bg-background border rounded-lg shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Notifications</h3>
                  {unreadCount > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {unreadCount} unread
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      title="Mark all as read"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                  <Link href="/alerts" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" size="sm" title="Settings">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Alerts List */}
              <div className="flex-1 overflow-y-auto">
                {sortedAlerts.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No notifications yet</p>
                    <p className="text-sm mt-1">
                      We'll notify you when something important happens
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {sortedAlerts.map((alert) => {
                      const Icon = alertTypeIcons[alert.type]
                      const content = (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                            !alert.read ? 'bg-primary-50/50 dark:bg-primary-950/20' : ''
                          }`}
                          onClick={() => handleAlertClick(alert.id, alert.link)}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`p-2 rounded-lg h-fit ${
                                priorityColors[alert.priority]
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-semibold text-sm">
                                  {alert.title}
                                </h4>
                                {!alert.read && (
                                  <div className="h-2 w-2 rounded-full bg-primary-500 flex-shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {alert.message}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(alert.createdAt, {
                                    addSuffix: true,
                                  })}
                                </span>
                                <div className="flex gap-1">
                                  {!alert.read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        markAsRead(alert.id)
                                      }}
                                    >
                                      <Check className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteAlert(alert.id)
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )

                      return alert.link ? (
                        <Link
                          key={alert.id}
                          href={alert.link}
                          className="block"
                        >
                          {content}
                        </Link>
                      ) : (
                        <div key={alert.id}>{content}</div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {sortedAlerts.length > 0 && (
                <div className="p-3 border-t">
                  <Link href="/alerts" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full" size="sm">
                      View All Notifications
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}


