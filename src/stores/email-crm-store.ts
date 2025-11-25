import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Lead {
  id: string
  name: string
  designation: string | null
  company: string | null
  email: string | null
  profileUrl: string
  enriched: boolean
  createdAt: Date
  updatedAt: Date
  // Facility-specific fields
  facilityId?: number
  npiNumber?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  phone?: string | null
  websiteUrl?: string
}

export interface Email {
  id: string
  leadId: string
  subject: string
  body: string
  status: 'draft' | 'sent' | 'opened' | 'clicked' | 'replied' | 'bounced'
  sentAt: Date | null
  openedAt: Date | null
  clickedAt: Date | null
  repliedAt: Date | null
  bouncedAt: Date | null
  scheduledFor: Date | null
  templateId: string | null
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  createdAt: Date
}

interface EmailCRMState {
  leads: Lead[]
  emails: Email[]
  templates: EmailTemplate[]
  selectedLeads: string[]
  isLoading: boolean
  error: string | null

  // Lead actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateLead: (id: string, updates: Partial<Lead>) => void
  deleteLead: (id: string) => void
  enrichLead: (id: string, email: string) => void
  importLeads: (leads: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[]) => void

  // Email actions
  sendEmail: (leadId: string, subject: string, body: string, templateId?: string, scheduledFor?: Date) => Promise<string | null>
  updateEmailStatus: (emailId: string, status: Email['status'], timestamp?: Date) => void
  saveDraft: (leadId: string, subject: string, body: string) => string

  // Template actions
  addTemplate: (template: Omit<EmailTemplate, 'id' | 'createdAt'>) => string
  updateTemplate: (id: string, updates: Partial<EmailTemplate>) => void
  deleteTemplate: (id: string) => void

  // Selection
  toggleLeadSelection: (id: string) => void
  selectAllLeads: () => void
  clearSelection: () => void

  // Stats
  getStats: () => {
    totalLeads: number
    totalSent: number
    openRate: number
    replyRate: number
    sentToday: number
  }
}

const defaultTemplates: Omit<EmailTemplate, 'id' | 'createdAt'>[] = [
  {
    name: 'Intro Pitch',
    subject: 'Quick question about {{company}}',
    body: `Hi {{name}},

I noticed you're the {{designation}} at {{company}}. I thought you might be interested in learning about how we help healthcare organizations like yours optimize their data strategies.

Would you be open to a quick 15-minute conversation this week?

Best regards,
[Your Name]`,
  },
  {
    name: 'Follow-Up',
    subject: 'Following up on my previous email',
    body: `Hi {{name}},

I wanted to follow up on my previous email about {{company}}'s data needs. I know you're busy, so I'll keep this brief.

Would you be available for a quick call this week to discuss how we can help?

Best regards,
[Your Name]`,
  },
  {
    name: 'Value Proposition',
    subject: 'How {{company}} can leverage healthcare data',
    body: `Hi {{name}},

As {{designation}} at {{company}}, you're likely always looking for ways to make data-driven decisions. 

We specialize in providing comprehensive healthcare facility data that helps organizations like yours:
• Identify market opportunities
• Analyze competitor landscapes
• Make informed strategic decisions

Would you be interested in a brief demo?

Best regards,
[Your Name]`,
  },
  {
    name: 'Case Study',
    subject: 'How [Similar Company] improved their strategy',
    body: `Hi {{name}},

I thought you might find this interesting: we recently helped a company similar to {{company}} identify $2M in new opportunities using our healthcare data platform.

As {{designation}}, you might appreciate how they used our insights to:
• Expand into underserved markets
• Optimize their service offerings
• Outperform competitors

Would you like to see how this could apply to {{company}}?

Best regards,
[Your Name]`,
  },
  {
    name: 'Meeting Request',
    subject: '15-minute call to discuss {{company}}',
    body: `Hi {{name}},

I'd love to show you how our healthcare data platform could benefit {{company}}. 

As {{designation}}, I think you'd find our insights particularly valuable for strategic planning.

Are you available for a quick 15-minute call this week? I'm flexible with timing.

Best regards,
[Your Name]`,
  },
]

// Custom serializer for Date objects
const dateReviver = (key: string, value: any) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value)
  }
  return value
}

export const useEmailCRMStore = create<EmailCRMState>()(
  persist(
    (set, get) => ({
      leads: [],
      emails: [],
      templates: defaultTemplates.map((t, i) => ({
        ...t,
        id: `template-${i + 1}`,
        createdAt: new Date(),
      })),
      selectedLeads: [],
      isLoading: false,
      error: null,

      addLead: (leadData) => {
        const id = `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const now = new Date()
        const lead: Lead = {
          ...leadData,
          id,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          leads: [...state.leads, lead],
        }))
        return id
      },

      updateLead: (id, updates) => {
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === id
              ? { ...lead, ...updates, updatedAt: new Date() }
              : lead
          ),
        }))
      },

      deleteLead: (id) => {
        set((state) => ({
          leads: state.leads.filter((lead) => lead.id !== id),
          emails: state.emails.filter((email) => email.leadId !== id),
          selectedLeads: state.selectedLeads.filter((leadId) => leadId !== id),
        }))
      },

      enrichLead: (id, email) => {
        get().updateLead(id, { email, enriched: true })
      },

      importLeads: (leadsData) => {
        const now = new Date()
        const newLeads: Lead[] = leadsData.map((leadData, index) => ({
          ...leadData,
          id: `lead-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now,
        }))
        set((state) => ({
          leads: [...state.leads, ...newLeads],
        }))
      },

      // Clear old mock data (leads without facilityId)
      clearMockData: () => {
        set((state) => ({
          leads: state.leads.filter((lead) => lead.facilityId !== undefined),
        }))
      },

      sendEmail: async (leadId, subject, body, templateId, scheduledFor) => {
        const id = `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const lead = get().leads.find((l) => l.id === leadId)
        
        if (!lead || !lead.email) {
          throw new Error('Lead not found or has no email address')
        }

        const email: Email = {
          id,
          leadId,
          subject,
          body,
          status: scheduledFor ? 'draft' : 'sent',
          sentAt: scheduledFor ? null : new Date(),
          openedAt: null,
          clickedAt: null,
          repliedAt: null,
          bouncedAt: null,
          scheduledFor: scheduledFor || null,
          templateId: templateId || null,
        }

        set((state) => ({
          emails: [...state.emails, email],
        }))

        if (!scheduledFor) {
          // Real API call to send email
          try {
            const userId = typeof window !== 'undefined' ? localStorage.getItem('user-id') || 'anonymous' : 'anonymous'
            
            const response = await fetch('/api/email-crm/send', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'x-user-id': userId,
              },
              body: JSON.stringify({
                emailId: id,
                leadId,
                subject,
                body,
                to: lead.email,
              }),
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
              throw new Error(data.error || 'Failed to send email')
            }

            // Update with message ID from provider
            if (data.messageId) {
              // Store messageId if needed for tracking
            }
          } catch (error: any) {
            get().updateEmailStatus(id, 'bounced', new Date())
            throw error
          }
        }

        return id
      },

      updateEmailStatus: (emailId, status, timestamp) => {
        const update: Partial<Email> = { status }
        if (status === 'opened' && !timestamp) update.openedAt = new Date()
        if (status === 'clicked' && !timestamp) update.clickedAt = new Date()
        if (status === 'replied' && !timestamp) update.repliedAt = new Date()
        if (status === 'bounced' && !timestamp) update.bouncedAt = new Date()
        if (timestamp) {
          if (status === 'opened') update.openedAt = timestamp
          if (status === 'clicked') update.clickedAt = timestamp
          if (status === 'replied') update.repliedAt = timestamp
          if (status === 'bounced') update.bouncedAt = timestamp
        }

        set((state) => ({
          emails: state.emails.map((email) =>
            email.id === emailId ? { ...email, ...update } : email
          ),
        }))
      },

      saveDraft: (leadId, subject, body) => {
        const id = `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const email: Email = {
          id,
          leadId,
          subject,
          body,
          status: 'draft',
          sentAt: null,
          openedAt: null,
          clickedAt: null,
          repliedAt: null,
          bouncedAt: null,
          scheduledFor: null,
          templateId: null,
        }
        set((state) => ({
          emails: [...state.emails, email],
        }))
        return id
      },

      addTemplate: (templateData) => {
        const id = `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const template: EmailTemplate = {
          ...templateData,
          id,
          createdAt: new Date(),
        }
        set((state) => ({
          templates: [...state.templates, template],
        }))
        return id
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id ? { ...template, ...updates } : template
          ),
        }))
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id),
        }))
      },

      toggleLeadSelection: (id) => {
        set((state) => ({
          selectedLeads: state.selectedLeads.includes(id)
            ? state.selectedLeads.filter((leadId) => leadId !== id)
            : [...state.selectedLeads, id],
        }))
      },

      selectAllLeads: () => {
        set((state) => ({
          selectedLeads: state.leads.map((lead) => lead.id),
        }))
      },

      clearSelection: () => {
        set({ selectedLeads: [] })
      },

      getStats: () => {
        const state = get()
        const totalLeads = state.leads.length
        const totalSent = state.emails.filter((e) => e.status === 'sent' || e.status === 'opened' || e.status === 'clicked' || e.status === 'replied').length
        const opened = state.emails.filter((e) => e.openedAt).length
        const replied = state.emails.filter((e) => e.repliedAt).length
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const sentToday = state.emails.filter((e) => e.sentAt && new Date(e.sentAt) >= today).length

        return {
          totalLeads,
          totalSent,
          openRate: totalSent > 0 ? (opened / totalSent) * 100 : 0,
          replyRate: totalSent > 0 ? (replied / totalSent) * 100 : 0,
          sentToday,
        }
      },
    }),
    {
      name: 'email-crm-storage',
      // Optimize storage - only persist essential data
      partialize: (state) => ({
        leads: state.leads.map(lead => ({
          ...lead,
          createdAt: lead.createdAt.toISOString(),
          updatedAt: lead.updatedAt.toISOString(),
          // Include facility fields
          facilityId: lead.facilityId,
          npiNumber: lead.npiNumber,
          address: lead.address,
          city: lead.city,
          state: lead.state,
          zipCode: lead.zipCode,
          phone: lead.phone,
          websiteUrl: lead.websiteUrl,
        })),
        emails: state.emails.map(email => ({
          ...email,
          sentAt: email.sentAt?.toISOString() || null,
          openedAt: email.openedAt?.toISOString() || null,
          clickedAt: email.clickedAt?.toISOString() || null,
          repliedAt: email.repliedAt?.toISOString() || null,
          bouncedAt: email.bouncedAt?.toISOString() || null,
          scheduledFor: email.scheduledFor?.toISOString() || null,
        })),
        templates: state.templates.map(template => ({
          ...template,
          createdAt: template.createdAt.toISOString(),
        })),
      }),
      // Custom merge function to restore Date objects
      merge: (persistedState: any, currentState: any) => {
        if (!persistedState) return currentState
        
        return {
          ...currentState,
          leads: (persistedState.leads || []).map((lead: any) => ({
            ...lead,
            createdAt: new Date(lead.createdAt),
            updatedAt: new Date(lead.updatedAt),
            // Restore facility fields
            facilityId: lead.facilityId,
            npiNumber: lead.npiNumber,
            address: lead.address,
            city: lead.city,
            state: lead.state,
            zipCode: lead.zipCode,
            phone: lead.phone,
            websiteUrl: lead.websiteUrl,
          })),
          emails: (persistedState.emails || []).map((email: any) => ({
            ...email,
            sentAt: email.sentAt ? new Date(email.sentAt) : null,
            openedAt: email.openedAt ? new Date(email.openedAt) : null,
            clickedAt: email.clickedAt ? new Date(email.clickedAt) : null,
            repliedAt: email.repliedAt ? new Date(email.repliedAt) : null,
            bouncedAt: email.bouncedAt ? new Date(email.bouncedAt) : null,
            scheduledFor: email.scheduledFor ? new Date(email.scheduledFor) : null,
          })),
          templates: (persistedState.templates || []).map((template: any) => ({
            ...template,
            createdAt: new Date(template.createdAt),
          })),
        }
      },
    }
  )
)

