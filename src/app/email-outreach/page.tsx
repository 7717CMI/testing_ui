'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useEmailCRMStore } from '@/stores/email-crm-store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail, Users, BarChart3, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { EmailComposer } from '@/components/email-crm/email-composer'

// Lazy load heavy components
const FacilitySelector = lazy(() => import('@/components/email-crm/facility-selector').then(m => ({ default: m.FacilitySelector })))
const LeadDashboard = lazy(() => import('@/components/email-crm/lead-dashboard').then(m => ({ default: m.LeadDashboard })))
const TrackingPanel = lazy(() => import('@/components/email-crm/tracking-panel').then(m => ({ default: m.TrackingPanel })))
const EmailOnboardingTour = lazy(() => import('@/components/email-crm/email-onboarding-tour').then(m => ({ default: m.EmailOnboardingTour })))

// Loading fallback
const ComponentLoader = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
  </div>
)

export default function EmailOutreachPage() {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [bulkLeadIds, setBulkLeadIds] = useState<string[]>([])
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('leads')
  const { leads, clearMockData } = useEmailCRMStore()

  // Clear old mock data on mount (leads without facilityId)
  useEffect(() => {
    const hasMockData = leads.some((lead) => !lead.facilityId)
    if (hasMockData) {
      clearMockData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount to clear old mock data

  const handleSendEmail = (leadId: string) => {
    setSelectedLeadId(leadId)
    setBulkLeadIds([])
    setIsComposerOpen(true)
  }

  const handleBulkSend = (leadIds: string[]) => {
    setSelectedLeadId(null)
    setBulkLeadIds(leadIds)
    setIsComposerOpen(true)
  }

  const handleComposerClose = () => {
    setIsComposerOpen(false)
    setSelectedLeadId(null)
    setBulkLeadIds([])
  }

  const handleSent = () => {
    // Refresh or update UI after sending
    toast.success('Email sent successfully!')
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-xl">
              <Mail className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                Email Outreach
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                Select facilities, enrich contacts, send personalized emails, and track performance
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Tracking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="space-y-6">
            <Suspense fallback={<ComponentLoader />}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <FacilitySelector />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <LeadDashboard
                  onSendEmail={handleSendEmail}
                  onBulkSend={handleBulkSend}
                />
              </motion.div>
            </Suspense>
          </TabsContent>

          <TabsContent value="compose">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Send className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Select a lead to compose email
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Go to the Leads tab and click "Send Email" on any lead
              </p>
            </motion.div>
          </TabsContent>

          <TabsContent value="tracking">
            <Suspense fallback={<ComponentLoader />}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <TrackingPanel />
              </motion.div>
            </Suspense>
          </TabsContent>
        </Tabs>

        {/* Email Composer Modal - Only render when open */}
        {isComposerOpen && (
          <EmailComposer
            leadId={selectedLeadId}
            leadIds={bulkLeadIds.length > 0 ? bulkLeadIds : undefined}
            isOpen={isComposerOpen}
            onClose={handleComposerClose}
            onSent={handleSent}
          />
        )}

        {/* Onboarding Tour - Lazy loaded */}
        <Suspense fallback={null}>
          <EmailOnboardingTour />
        </Suspense>
      </div>
    </div>
  )
}

