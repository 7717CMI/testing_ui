'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useEmailCRMStore } from '@/stores/email-crm-store'
import { useSavedSearchesStore, FacilityData } from '@/stores/saved-searches-store'
import { useNotificationsStore } from '@/stores/notifications-store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Mail, 
  Users, 
  BarChart3, 
  Send, 
  Loader2, 
  Bookmark, 
  Phone, 
  Briefcase, 
  Newspaper, 
  BrainCircuit,
  Settings2
} from 'lucide-react'
import { toast } from 'sonner'
import { EmailComposer } from '@/components/email-crm/email-composer'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { NewsTicker } from '@/components/news/news-ticker'
import { AnalysisModal } from '@/components/analysis-modal'
import { NewsSubscriptionDialog } from '@/components/news/news-subscription-dialog'
import { NewsCategory } from '@/types/news'

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

export default function MyWorkspacePage() {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [bulkLeadIds, setBulkLeadIds] = useState<string[]>([])
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false)
  const [isNewsPrefsOpen, setIsNewsPrefsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [listName, setListName] = useState('')
  const [listDescription, setListDescription] = useState('')
  const [selectedCallLead, setSelectedCallLead] = useState<{ id: string; phone: string; name: string } | null>(null)
  
  const { leads, clearMockData, importLeads } = useEmailCRMStore()
  const { addFacilityList } = useSavedSearchesStore()
  const { userPreferences } = useNotificationsStore()

  // Get selected facilities from leads
  const selectedFacilities = leads.filter(lead => lead.facilityId)

  // Clear old mock data on mount
  useEffect(() => {
    const hasMockData = leads.some((lead) => !lead.facilityId)
    if (hasMockData) {
      clearMockData()
    }
  }, [])

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
    toast.success('Email sent successfully!')
  }

  const handleSaveFacilities = () => {
    if (selectedFacilities.length === 0) {
      toast.error('No facilities selected to save')
      return
    }
    if (!listName.trim()) {
      toast.error('Please enter a name for the list')
      return
    }

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
      authorized_person_name: lead.name || null,
      authorized_person_designation: lead.designation || null,
      authorized_person_phone: lead.phone || null,
      authorized_person_email: lead.email || null,
      authorized_person_number: lead.phone || null,
    }))

    addFacilityList({
      name: listName,
      description: listDescription,
      facilityIds: facilities.map(f => f.id.toString()),
      facilities: facilities,
      tags: ['workspace-saved'],
    })

    toast.success(`Saved ${facilities.length} facility(ies) to "${listName}"`)
    setSaveDialogOpen(false)
    setListName('')
    setListDescription('')
  }

  const handleImportList = (facilities: FacilityData[]) => {
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

  // Derive active news categories from user preferences
  const getActiveCategories = (): NewsCategory[] => {
    if (!userPreferences?.monitoredCategories) return ['all']
    
    const categories: NewsCategory[] = []
    const { monitoredCategories } = userPreferences
    
    if (monitoredCategories.expansion) categories.push('expansion')
    if (monitoredCategories.technology) categories.push('technology')
    if (monitoredCategories.funding) categories.push('funding')
    if (monitoredCategories.policy) categories.push('policy')
    if (monitoredCategories.marketTrend) categories.push('market-trends')
    if (monitoredCategories.mna) categories.push('market-trends')
    
    // If no categories selected, default to 'all'
    return categories.length > 0 ? [...new Set(categories)] : ['all']
  }

  const activeNewsCategories = getActiveCategories()

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
                <Briefcase className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  My Workspace
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                  Your central hub for news, contacts, outreach, and analysis
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsAnalysisOpen(true)}
                className="gap-2 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20 text-purple-700 dark:text-purple-300"
              >
                <BrainCircuit className="h-4 w-4" />
                Analysis Mode
              </Button>

              {selectedFacilities.length > 0 && (
                <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg">
                      <Bookmark className="h-4 w-4 mr-2" />
                      Save List ({selectedFacilities.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Save Facilities to List</DialogTitle>
                      <DialogDescription>
                        Save selected facilities with their details for future email campaigns
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="list-name">List Name *</Label>
                        <Input
                          id="list-name"
                          value={listName}
                          onChange={(e) => setListName(e.target.value)}
                          placeholder="e.g., Q4 Outreach Targets"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveFacilities}>Save List</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Lists
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

          {/* Overview Tab - New Aggregated View */}
          <TabsContent value="overview" className="space-y-6">
            {/* News Ticker Section */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Latest Market Intelligence</CardTitle>
                    <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
                      {activeNewsCategories.length} topic(s) monitored
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-8 gap-1" 
                      onClick={() => setIsNewsPrefsOpen(true)}
                    >
                      <Settings2 className="h-3 w-3" />
                      Customize Feed
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-8" asChild>
                      <a href="/insights" target="_blank">View All News</a>
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Real-time updates relevant to your workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NewsTicker 
                  category="all" 
                  customCategories={activeNewsCategories}
                />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-primary-50 border-dashed" onClick={() => setActiveTab('leads')}>
                    <Users className="h-6 w-6 text-primary" />
                    <span>Find Contacts</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-primary-50 border-dashed" onClick={() => setIsAnalysisOpen(true)}>
                    <BrainCircuit className="h-6 w-6 text-purple-600" />
                    <span>Start Analysis</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-primary-50 border-dashed" onClick={() => setActiveTab('compose')}>
                    <Send className="h-6 w-6 text-green-600" />
                    <span>Compose Email</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-primary-50 border-dashed" onClick={() => setActiveTab('saved')}>
                    <Bookmark className="h-6 w-6 text-orange-600" />
                    <span>Saved Lists</span>
                  </Button>
                </CardContent>
              </Card>

              {/* Mini Tracking */}
              <Suspense fallback={<ComponentLoader />}>
                <TrackingPanel />
              </Suspense>
            </div>
          </TabsContent>

          {/* Existing Tabs Content */}
          <TabsContent value="leads" className="space-y-6">
            <Suspense fallback={<ComponentLoader />}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <FacilitySelector />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <LeadDashboard
                  onSendEmail={handleSendEmail}
                  onBulkSend={handleBulkSend}
                  onCall={handleCall}
                />
              </motion.div>
            </Suspense>
          </TabsContent>

          <TabsContent value="compose">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
              <Send className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a lead to compose email</h3>
              <Button onClick={() => setActiveTab('leads')}>Go to Contacts</Button>
            </motion.div>
          </TabsContent>

          <TabsContent value="phone" className="space-y-6">
            <Suspense fallback={<ComponentLoader />}>
              <CallDialer
                leadId={selectedCallLead?.id}
                phoneNumber={selectedCallLead?.phone || ''}
                leadName={selectedCallLead?.name}
              />
              <CallHistory />
            </Suspense>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <Suspense fallback={<ComponentLoader />}>
              <SavedFacilityLists onImportList={handleImportList} />
            </Suspense>
          </TabsContent>

          <TabsContent value="tracking">
            <Suspense fallback={<ComponentLoader />}>
              <TrackingPanel />
            </Suspense>
          </TabsContent>
        </Tabs>

        {/* Email Composer Modal */}
        {isComposerOpen && (
          <EmailComposer
            leadId={selectedLeadId}
            leadIds={bulkLeadIds.length > 0 ? bulkLeadIds : undefined}
            isOpen={isComposerOpen}
            onClose={handleComposerClose}
            onSent={handleSent}
          />
        )}

        {/* Analysis Modal (Your "Analysis Mode") */}
        <AnalysisModal 
          isOpen={isAnalysisOpen}
          onClose={() => setIsAnalysisOpen(false)}
        />

        {/* News Preferences Dialog */}
        <NewsSubscriptionDialog 
          open={isNewsPrefsOpen} 
          onOpenChange={setIsNewsPrefsOpen} 
        />

        <Suspense fallback={null}>
          <EmailOnboardingTour />
        </Suspense>
      </div>
    </div>
  )
}
