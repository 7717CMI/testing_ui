'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useEmailCRMStore } from '@/stores/email-crm-store'
import { useSavedSearchesStore, FacilityData } from '@/stores/saved-searches-store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail, Users, BarChart3, Send, Loader2, Bookmark, Phone, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { EmailComposer } from '@/components/email-crm/email-composer'
import { Button } from '@/components/ui/button'
import { SaveListDialog } from '@/components/email-crm/save-list-dialog'

// Lazy load heavy components
const FacilitySelector = lazy(() => import('@/components/email-crm/facility-selector').then(m => ({ default: m.FacilitySelector })))
const LeadDashboard = lazy(() => import('@/components/email-crm/lead-dashboard').then(m => ({ default: m.LeadDashboard })))
const TrackingPanel = lazy(() => import('@/components/email-crm/tracking-panel').then(m => ({ default: m.TrackingPanel })))
const EmailOnboardingTour = lazy(() => import('@/components/email-crm/email-onboarding-tour').then(m => ({ default: m.EmailOnboardingTour })))
const SavedFacilityLists = lazy(() => import('@/components/email-crm/saved-facility-lists').then(m => ({ default: m.SavedFacilityLists })))
const CallDialer = lazy(() => import('@/components/phone-crm/call-dialer').then(m => ({ default: m.CallDialer })))
const CallHistory = lazy(() => import('@/components/phone-crm/call-history').then(m => ({ default: m.CallHistory })))

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
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [selectedCallLead, setSelectedCallLead] = useState<{ id: string; phone: string; name: string } | null>(null)
  const { leads, clearMockData, importLeads } = useEmailCRMStore()
  const { addFacilityList } = useSavedSearchesStore()

  // Get selected facilities from leads
  const selectedFacilities = leads.filter(lead => lead.facilityId)

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

  const handleSaveFacilities = (name: string, description: string) => {
    if (selectedFacilities.length === 0) {
      toast.error('No facilities selected to save')
      return
    }

    // Convert leads to facility data format
    const facilities: FacilityData[] = selectedFacilities.map(lead => ({
      id: lead.facilityId!,
      npi_number: lead.npiNumber || '',
      provider_name: lead.name,
      facility_type: '',
      category: '',
      business_address_line1: lead.address || '',
      business_city: lead.city || '',
      business_state: lead.state || '',
      business_postal_code: lead.zipCode || '',
      business_phone: lead.phone,
      business_fax: null,
      authorized_person_name: lead.name || null, // Use lead name as authorized person name if available
      authorized_person_designation: lead.designation || null,
      authorized_person_phone: lead.phone || null,
      authorized_person_email: lead.email || null,
      authorized_person_number: lead.phone || null,
    }))

    addFacilityList({
      name,
      description,
      facilityIds: facilities.map(f => f.id.toString()),
      facilities: facilities,
      tags: ['email-outreach'],
    })

    toast.success(`Saved ${facilities.length} facility(ies) to "${name}"`)
    setSaveDialogOpen(false)
  }

  const handleImportList = (facilities: FacilityData[]) => {
    // Convert facilities to leads
    const leads = facilities.map((facility) => ({
      name: facility.provider_name,
      designation: facility.authorized_person_name || null,
      company: facility.provider_name,
      email: facility.authorized_person_email || null,
      profileUrl: '',
      enriched: !!facility.authorized_person_email,
      facilityId: facility.id,
      npiNumber: facility.npi_number,
      address: facility.business_address_line1,
      city: facility.business_city,
      state: facility.business_state,
      zipCode: facility.business_postal_code,
      phone: facility.business_phone || facility.authorized_person_phone || null,
      websiteUrl: '',
    }))
    importLeads(leads)
    toast.success(`Imported ${leads.length} facility(ies) from saved list`)
    setActiveTab('leads')
  }

  const handleCall = (leadId: string, phoneNumber: string) => {
    const lead = leads.find(l => l.id === leadId)
    if (lead) {
      setSelectedCallLead({
        id: leadId,
        phone: phoneNumber,
        name: lead.name,
      })
      setActiveTab('phone')
    }
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-xl">
              <Mail className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                Outreach Workspace
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                Select facilities, enrich contacts, send personalized emails, and track performance
              </p>
            </div>
            </div>
            
            {/* Save Facilities Button */}
            {selectedFacilities.length > 0 && (
              <SaveListDialog 
                open={saveDialogOpen}
                onOpenChange={setSaveDialogOpen}
                selectedCount={selectedFacilities.length}
                onSave={handleSaveFacilities}
              />
            )}
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Saved Lists
            </TabsTrigger>
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone
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
                  onCall={handleCall}
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
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                Go to the Leads tab and click "Send Email" on any lead
              </p>
              <Button 
                onClick={() => setActiveTab('leads')}
                variant="outline"
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Leads
              </Button>
            </motion.div>
          </TabsContent>

          <TabsContent value="phone" className="space-y-6">
            <Suspense fallback={<ComponentLoader />}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <CallDialer
                  leadId={selectedCallLead?.id}
                  phoneNumber={selectedCallLead?.phone || ''}
                  leadName={selectedCallLead?.name}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CallHistory />
              </motion.div>
            </Suspense>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <Suspense fallback={<ComponentLoader />}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SavedFacilityLists onImportList={handleImportList} />
              </motion.div>
            </Suspense>
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
