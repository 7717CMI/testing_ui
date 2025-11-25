'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import {
  X,
  Send,
  Save,
  Clock,
  Paperclip,
  Bold,
  Italic,
  Link as LinkIcon,
  Eye,
  FileText,
  Calendar,
  CheckCircle2,
} from 'lucide-react'
import { useEmailCRMStore, type Lead } from '@/stores/email-crm-store'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface EmailComposerProps {
  leadId: string | null
  leadIds?: string[] // For bulk send
  isOpen: boolean
  onClose: () => void
  onSent: () => void
}

export function EmailComposer({ leadId, leadIds, isOpen, onClose, onSent }: EmailComposerProps) {
  const { leads, templates, sendEmail, saveDraft, updateLead } = useEmailCRMStore()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [isPreview, setIsPreview] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [scheduledFor, setScheduledFor] = useState<Date | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')

  const lead = leadId ? leads.find((l) => l.id === leadId) : null
  const isBulk = leadIds && leadIds.length > 1

  useEffect(() => {
    if (isOpen && lead) {
      // Reset form
      setSubject('')
      setBody('')
      setSelectedTemplate('')
      setScheduledFor(null)
      setShowSchedule(false)
      setConsentChecked(false)
      setCc('')
      setBcc('')
      setIsPreview(false)
    }
  }, [isOpen, lead])

  const replaceMergeTags = (text: string, lead: Lead): string => {
    return text
      .replace(/\{\{name\}\}/g, lead.name)
      .replace(/\{\{company\}\}/g, lead.company || 'your company')
      .replace(/\{\{designation\}\}/g, lead.designation || 'your role')
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (!template || !lead) return

    setSelectedTemplate(templateId)
    setSubject(replaceMergeTags(template.subject, lead))
    setBody(replaceMergeTags(template.body, lead))
  }

  const handleSend = async () => {
    if (!lead && !isBulk) {
      toast.error('No lead selected')
      return
    }

    if (!subject.trim() || !body.trim()) {
      toast.error('Please fill in subject and body')
      return
    }

    if (!consentChecked) {
      toast.error('Please confirm outreach consent')
      return
    }

    if (isBulk && leadIds) {
      // Bulk send
      if (leadIds.length > 20) {
        toast.error('Maximum 20 leads for bulk send')
        return
      }

      setIsSending(true)
      try {
        let successCount = 0
        let failCount = 0

        // Use Promise.allSettled for parallel processing with rate limiting
        const sendPromises = leadIds.map(async (id, index) => {
          const bulkLead = leads.find((l) => l.id === id)
          if (!bulkLead || !bulkLead.email) {
            failCount++
            return
          }

          try {
            // Stagger sends to avoid rate limiting (1 second between each)
            if (index > 0) {
              await new Promise((resolve) => setTimeout(resolve, 1000 * index))
            }

            const subjectReplaced = replaceMergeTags(subject, bulkLead)
            const bodyReplaced = replaceMergeTags(body, bulkLead)
            await sendEmail(id, subjectReplaced, bodyReplaced, selectedTemplate || undefined, scheduledFor || undefined)
            successCount++
          } catch (error) {
            failCount++
            console.error(`Failed to send to ${bulkLead.name}:`, error)
          }
        })

        await Promise.allSettled(sendPromises)

        toast.success(`Sent to ${successCount} lead(s)${failCount > 0 ? `, ${failCount} failed` : ''}`)
        onSent()
        onClose()
      } catch (error) {
        toast.error('Failed to send emails')
      } finally {
        setIsSending(false)
      }
    } else if (lead) {
      // Single send
      if (!lead.email) {
        toast.error('Lead does not have an email address')
        return
      }

      setIsSending(true)
      try {
        await sendEmail(lead.id, subject, body, selectedTemplate || undefined, scheduledFor || undefined)
        toast.success(`Email sent to ${lead.name}`)
        onSent()
        onClose()
      } catch (error) {
        toast.error('Failed to send email')
      } finally {
        setIsSending(false)
      }
    }
  }

  const handleSaveDraft = () => {
    if (!lead) return
    saveDraft(lead.id, subject, body)
    toast.success('Draft saved')
  }

  const formatBodyPreview = (text: string, trackingId?: string): string => {
    let html = text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Wrap links with click tracking if trackingId is provided
    if (trackingId) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
        const trackingUrl = `${appUrl}/api/email-crm/track/click?token=${trackingId}&url=${encodeURIComponent(url)}`
        return `<a href="${trackingUrl}" style="color: #3b82f6; text-decoration: underline;">${linkText}</a>`
      })
    }
    
    return html
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-6xl max-h-[90vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {isBulk ? `Send Email to ${leadIds?.length} Leads` : `Send Email to ${lead?.name || 'Lead'}`}
              </h2>
              {lead && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  {lead.email} {lead.company && `• ${lead.company}`}
                </p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex">
            {/* Editor */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Template Selector */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Template
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a template...</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Subject
                  </label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject..."
                    className="w-full"
                  />
                </div>

                {/* Body Editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Body
                    </label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBody((b) => b + ' **bold**')}
                        title="Bold"
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBody((b) => b + ' *italic*')}
                        title="Italic"
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsPreview(!isPreview)}
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {isPreview ? (
                    <div
                      className="w-full min-h-[300px] px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                      dangerouslySetInnerHTML={{
                        __html: formatBodyPreview(lead ? replaceMergeTags(body, lead) : body, 'preview'),
                      }}
                    />
                  ) : (
                    <Textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Email body... Use {{name}}, {{company}}, {{designation}} for merge tags"
                      className="w-full min-h-[300px] font-mono text-sm"
                    />
                  )}
                </div>

                {/* CC/BCC */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      CC (optional)
                    </label>
                    <Input
                      value={cc}
                      onChange={(e) => setCc(e.target.value)}
                      placeholder="cc@example.com"
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      BCC (optional)
                    </label>
                    <Input
                      value={bcc}
                      onChange={(e) => setBcc(e.target.value)}
                      placeholder="bcc@example.com"
                      type="email"
                    />
                  </div>
                </div>

                {/* Schedule */}
                {showSchedule && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Schedule Send
                    </label>
                    <Input
                      type="datetime-local"
                      value={scheduledFor ? format(scheduledFor, "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => setScheduledFor(e.target.value ? new Date(e.target.value) : null)}
                      min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                    />
                  </div>
                )}

                {/* Consent Checkbox */}
                <div className="flex items-start gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="consent" className="text-sm text-neutral-700 dark:text-neutral-300">
                    I confirm that I have consent to send this outreach email and will include an unsubscribe link.
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveDraft}
                    disabled={!subject || !body}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSchedule(!showSchedule)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={onClose} disabled={isSending}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={isSending || !subject || !body || !consentChecked}
                  >
                    {isSending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : scheduledFor ? (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Send
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview Pane */}
            {lead && (
              <div className="w-80 border-l border-neutral-200 dark:border-neutral-800 p-6 overflow-y-auto bg-neutral-50 dark:bg-neutral-800/30">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Preview
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">To:</div>
                    <div className="text-neutral-900 dark:text-neutral-100">{lead.email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Subject:</div>
                    <div className="text-neutral-900 dark:text-neutral-100">{replaceMergeTags(subject, lead)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Body:</div>
                    <div
                      className="text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: formatBodyPreview(replaceMergeTags(body, lead)),
                      }}
                    />
                  </div>
                  <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      Footer will include unsubscribe link automatically
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

