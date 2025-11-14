'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import {
  Mail,
  Send,
  Eye,
  MousePointerClick,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Calendar,
} from 'lucide-react'
import { useEmailCRMStore } from '@/stores/email-crm-store'
import { formatDistanceToNow, format } from 'date-fns'

export function TrackingPanel() {
  const { emails, leads } = useEmailCRMStore()
  // Memoize stats calculation to prevent recalculation on every render
  const stats = useMemo(() => {
    const totalLeads = leads.length
    const totalSent = emails.filter((e) => e.status === 'sent' || e.status === 'opened' || e.status === 'clicked' || e.status === 'replied').length
    const opened = emails.filter((e) => e.openedAt).length
    const replied = emails.filter((e) => e.repliedAt).length
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sentToday = emails.filter((e) => e.sentAt && new Date(e.sentAt) >= today).length

    return {
      totalLeads,
      totalSent,
      openRate: totalSent > 0 ? (opened / totalSent) * 100 : 0,
      replyRate: totalSent > 0 ? (replied / totalSent) * 100 : 0,
      sentToday,
    }
  }, [emails, leads])

  const recentEmails = useMemo(() => {
    return emails
      .filter((e) => e.sentAt)
      .sort((a, b) => {
        const dateA = a.sentAt ? new Date(a.sentAt).getTime() : 0
        const dateB = b.sentAt ? new Date(b.sentAt).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 10)
  }, [emails])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Send className="h-4 w-4 text-blue-500" />
      case 'opened':
        return <Eye className="h-4 w-4 text-green-500" />
      case 'clicked':
        return <MousePointerClick className="h-4 w-4 text-purple-500" />
      case 'replied':
        return <MessageSquare className="h-4 w-4 text-emerald-500" />
      case 'bounced':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Mail className="h-4 w-4 text-neutral-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'opened':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'clicked':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'replied':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'bounced':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {stats.totalSent}
            </span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Sent</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {stats.openRate.toFixed(1)}%
            </span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Open Rate</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {stats.replyRate.toFixed(1)}%
            </span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Reply Rate</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {stats.sentToday}
            </span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Sent Today</p>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Recent Activity
          </h3>
          <TrendingUp className="h-5 w-5 text-neutral-400" />
        </div>

        {recentEmails.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              No emails sent yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentEmails.map((email, index) => {
              const lead = leads.find((l) => l.id === email.leadId)
              return (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(email.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {lead?.name || 'Unknown Lead'}
                        </p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(email.status)}`}
                        >
                          {email.status}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                        {email.subject}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                        {email.sentAt && (
                          <span>Sent {formatDistanceToNow(new Date(email.sentAt), { addSuffix: true })}</span>
                        )}
                        {email.openedAt && (
                          <span className="text-green-600 dark:text-green-400">
                            Opened {formatDistanceToNow(new Date(email.openedAt), { addSuffix: true })}
                          </span>
                        )}
                        {email.repliedAt && (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Replied {formatDistanceToNow(new Date(email.repliedAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Simple Chart */}
      {stats.totalSent > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Performance Overview
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Open Rate</span>
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {stats.openRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.openRate}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-green-500 rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Reply Rate</span>
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {stats.replyRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.replyRate}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

