'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Mail, 
  Phone, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Search,
  X,
  User
} from 'lucide-react'
import { useEmailCRMStore } from '@/stores/email-crm-store'
import { toast } from 'sonner'

interface ContactEnricherProps {
  leadId: string
  facilityName: string
  address: string
  city: string
  state: string
  zipCode?: string
  existingPhone?: string | null
  websiteUrl?: string
  onEnriched?: () => void
}

interface EnrichmentResult {
  emails: string[]
  phones: string[]
  contacts: Array<{
    name: string
    title: string
    email: string | null
    phone: string | null
  }>
  confidence: 'high' | 'medium' | 'low'
}

export function ContactEnricher({
  leadId,
  facilityName,
  address,
  city,
  state,
  zipCode,
  existingPhone,
  websiteUrl,
  onEnriched,
}: ContactEnricherProps) {
  const [isEnriching, setIsEnriching] = useState(false)
  const [result, setResult] = useState<EnrichmentResult | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<string>('')
  const [selectedPhone, setSelectedPhone] = useState<string>('')
  const { updateLead, enrichLead } = useEmailCRMStore()

  const handleEnrich = async () => {
    setIsEnriching(true)
    setResult(null)

    try {
      const response = await fetch('/api/email-crm/enrich-facility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityName,
          address,
          city,
          state,
          zipCode,
          phone: existingPhone,
          websiteUrl: websiteUrl || '',
        }),
      })

      // Check if response is ok before parsing
      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch (e) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to search for contact information`)
      }

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        // Auto-select first email and phone if available
        if (data.data.emails.length > 0) {
          setSelectedEmail(data.data.emails[0])
        }
        if (data.data.phones.length > 0) {
          setSelectedPhone(data.data.phones[0])
        }
        toast.success(`Found ${data.data.emails.length} email(s) and ${data.data.phones.length} phone(s)`)
      } else {
        const errorMsg = data.error || 'Failed to enrich contacts'
        console.error('Enrichment API error:', errorMsg, data.details)
        toast.error(errorMsg)
      }
    } catch (error: any) {
      console.error('Enrichment error:', error)
      const errorMsg = error.message || 'Failed to search for contact information'
      toast.error(errorMsg)
    } finally {
      setIsEnriching(false)
    }
  }

  const handleSave = () => {
    if (!selectedEmail && !selectedPhone) {
      toast.error('Please select at least one email or phone number')
      return
    }

    if (selectedEmail) {
      enrichLead(leadId, selectedEmail)
    }

    if (selectedPhone) {
      updateLead(leadId, { phone: selectedPhone })
    }

    toast.success('Contact information saved')
    onEnriched?.()
  }

  const confidenceColors = {
    high: 'text-green-600 dark:text-green-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    low: 'text-red-600 dark:text-red-400',
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-primary-600" />
          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
            Find Contact Information
          </h4>
        </div>
        <Button
          onClick={handleEnrich}
          disabled={isEnriching}
          size="sm"
          variant="outline"
        >
          {isEnriching ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Search Contacts
            </>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Confidence Indicator */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Confidence:</span>
              <span className={`font-medium ${confidenceColors[result.confidence]}`}>
                {result.confidence.toUpperCase()}
              </span>
            </div>

            {/* Emails */}
            {result.emails.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Addresses ({result.emails.length})
                </label>
                <div className="space-y-2">
                  {result.emails.map((email, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                    >
                      <input
                        type="radio"
                        name="email"
                        value={email}
                        checked={selectedEmail === email}
                        onChange={(e) => setSelectedEmail(e.target.value)}
                        className="text-primary-600"
                      />
                      <span className="text-sm text-neutral-900 dark:text-neutral-100">{email}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Phones */}
            {result.phones.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Numbers ({result.phones.length})
                </label>
                <div className="space-y-2">
                  {result.phones.map((phone, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                    >
                      <input
                        type="radio"
                        name="phone"
                        value={phone}
                        checked={selectedPhone === phone}
                        onChange={(e) => setSelectedPhone(e.target.value)}
                        className="text-primary-600"
                      />
                      <span className="text-sm text-neutral-900 dark:text-neutral-100">
                        {phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Contacts */}
            {result.contacts.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Key Contacts ({result.contacts.length})
                </label>
                <div className="space-y-2">
                  {result.contacts.map((contact, index) => (
                    <div
                      key={index}
                      className="p-2 border rounded-lg text-sm"
                    >
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        {contact.name}
                      </div>
                      <div className="text-neutral-600 dark:text-neutral-400">
                        {contact.title}
                      </div>
                      {contact.email && (
                        <div className="text-xs text-neutral-500 mt-1">
                          {contact.email}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {result.emails.length === 0 && result.phones.length === 0 && (
              <div className="text-center py-4 text-neutral-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No contact information found. Try manual entry.</p>
              </div>
            )}

            {/* Save Button */}
            {(selectedEmail || selectedPhone) && (
              <Button onClick={handleSave} className="w-full">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Selected Contacts
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

