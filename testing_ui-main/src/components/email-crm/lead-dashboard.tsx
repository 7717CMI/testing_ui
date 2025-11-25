'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Mail,
  Send,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  UserPlus,
  Building2,
  Briefcase,
  Search as SearchIcon,
  X,
  Phone,
} from 'lucide-react'
import { useEmailCRMStore, type Lead } from '@/stores/email-crm-store'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { ContactEnricher } from './contact-enricher'

interface LeadDashboardProps {
  onSendEmail: (leadId: string) => void
  onBulkSend: (leadIds: string[]) => void
  onCall?: (leadId: string, phoneNumber: string) => void
}

export function LeadDashboard({ onSendEmail, onBulkSend, onCall }: LeadDashboardProps) {
  const {
    leads,
    selectedLeads,
    toggleLeadSelection,
    selectAllLeads,
    clearSelection,
    deleteLead,
    enrichLead,
  } = useEmailCRMStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterEmail, setFilterEmail] = useState<'all' | 'with-email' | 'without-email'>('all')
  const [enrichingLeadId, setEnrichingLeadId] = useState<string | null>(null)

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFilter =
        filterEmail === 'all' ||
        (filterEmail === 'with-email' && lead.email) ||
        (filterEmail === 'without-email' && !lead.email)

      return matchesSearch && matchesFilter
    })
  }, [leads, searchQuery, filterEmail])

  const handleEnrich = (leadId: string) => {
    setEnrichingLeadId(enrichingLeadId === leadId ? null : leadId)
  }

  const handleEnriched = () => {
    setEnrichingLeadId(null)
  }

  const handleDelete = (leadId: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      deleteLead(leadId)
      toast.success('Lead deleted')
    }
  }

  const handleBulkDelete = () => {
    if (selectedLeads.length === 0) return
    if (confirm(`Delete ${selectedLeads.length} selected lead(s)?`)) {
      selectedLeads.forEach((id) => deleteLead(id))
      clearSelection()
      toast.success(`${selectedLeads.length} lead(s) deleted`)
    }
  }

  const handleBulkSendClick = () => {
    if (selectedLeads.length === 0) {
      toast.error('Please select at least one lead')
      return
    }
    if (selectedLeads.length > 20) {
      toast.error('Maximum 20 leads can be selected for bulk send')
      return
    }
    onBulkSend(selectedLeads)
  }

  if (leads.length === 0) {
    return (
      <Card className="p-12 text-center">
        <UserPlus className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          No leads yet
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Import your first lead to get started
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6" data-tour="dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Leads ({filteredLeads.length})
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Manage and send emails to your leads
          </p>
        </div>

        {selectedLeads.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {selectedLeads.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkSendClick}
              disabled={selectedLeads.length > 20}
            >
              <Send className="h-4 w-4 mr-2" />
              Bulk Send ({selectedLeads.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-400" />
          <select
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value as any)}
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Leads</option>
            <option value="with-email">With Email</option>
            <option value="without-email">Without Email</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <th className="px-4 py-3 text-left">
                <Checkbox
                  checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      selectAllLeads()
                    } else {
                      clearSelection()
                    }
                  }}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Designation
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Company
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Email
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead, index) => (
              <React.Fragment key={lead.id}>
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedLeads.includes(lead.id)}
                      onCheckedChange={() => toggleLeadSelection(lead.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      {lead.name}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Briefcase className="h-3 w-3" />
                      {lead.designation || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Building2 className="h-3 w-3" />
                      <div>
                        <div>{lead.company || '—'}</div>
                        {lead.city && lead.state && (
                          <div className="text-xs text-neutral-500">
                            {lead.city}, {lead.state}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {lead.email ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-green-500" />
                        <span className="text-neutral-900 dark:text-neutral-100">{lead.email}</span>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEnrich(lead.id)}
                        className="text-xs"
                      >
                        <SearchIcon className="h-3 w-3 mr-1" />
                        Find Contacts
                      </Button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {lead.profileUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(lead.profileUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      {onCall && lead.phone && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onCall(lead.id, lead.phone!)
                            toast.success('Opening phone dialer...')
                          }}
                          title="Call this lead"
                        >
                          <Phone className="h-4 w-4 text-primary" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSendEmail(lead.id)}
                        disabled={!lead.email}
                        title={!lead.email ? 'Add email first' : 'Send email'}
                        data-tour={lead.id === leads[0]?.id ? 'send' : undefined}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(lead.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
                {/* Contact Enricher */}
                {enrichingLeadId === lead.id && lead.facilityId && (
                  <motion.tr
                    key={`enricher-${lead.id}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <td colSpan={6} className="px-4 py-4 bg-neutral-50 dark:bg-neutral-800/30">
                      <ContactEnricher
                        leadId={lead.id}
                        facilityName={lead.name}
                        address={lead.address || ''}
                        city={lead.city || ''}
                        state={lead.state || ''}
                        zipCode={lead.zipCode || ''}
                        existingPhone={lead.phone}
                        websiteUrl={lead.websiteUrl}
                        onEnriched={handleEnriched}
                      />
                    </td>
                  </motion.tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {filteredLeads.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            No leads match your search criteria
          </p>
        </div>
      )}
    </Card>
  )
}

