'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Upload, Link2, Loader2, CheckCircle2, AlertCircle, Mail, Plus } from 'lucide-react'
import { useEmailCRMStore } from '@/stores/email-crm-store'
import { toast } from 'sonner'

interface ParsedLead {
  name: string
  designation: string | null
  company: string | null
  profileUrl: string
}

export function LeadImporter() {
  const [urls, setUrls] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [importedCount, setImportedCount] = useState(0)
  const { addLead, importLeads } = useEmailCRMStore()

  // Mock LinkedIn URL parser - in production, this would call a backend service
  const parseLinkedInUrl = async (url: string): Promise<ParsedLead | null> => {
    try {
      // Extract basic info from URL structure
      const urlObj = new URL(url.trim())
      const pathParts = urlObj.pathname.split('/').filter(Boolean)

      // Mock parsing - in production, use a scraping service
      const name = pathParts[pathParts.length - 1]
        ?.split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') || 'Unknown'

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock data - in production, fetch from scraping service
      return {
        name: name || 'John Doe',
        designation: 'Senior Manager', // Would come from scraping
        company: 'Healthcare Corp', // Would come from scraping
        profileUrl: url.trim(),
      }
    } catch (error) {
      console.error('Failed to parse URL:', error)
      return null
    }
  }

  const handleImport = async () => {
    if (!urls.trim()) {
      toast.error('Please enter at least one URL')
      return
    }

    setIsImporting(true)
    setImportedCount(0)

    try {
      const urlList = urls
        .split('\n')
        .map((url) => url.trim())
        .filter(Boolean)

      const parsedLeads: ParsedLead[] = []
      const errors: string[] = []

      for (const url of urlList) {
        try {
          const lead = await parseLinkedInUrl(url)
          if (lead) {
            parsedLeads.push(lead)
            setImportedCount(parsedLeads.length)
          } else {
            errors.push(url)
          }
        } catch (error) {
          errors.push(url)
        }
      }

      if (parsedLeads.length > 0) {
        importLeads(
          parsedLeads.map((lead) => ({
            ...lead,
            email: null,
            enriched: false,
          }))
        )
        toast.success(`Successfully imported ${parsedLeads.length} lead(s)`)
        setUrls('')
      }

      if (errors.length > 0) {
        toast.warning(`Failed to import ${errors.length} URL(s)`)
      }
    } catch (error) {
      toast.error('Import failed. Please try again.')
    } finally {
      setIsImporting(false)
      setImportedCount(0)
    }
  }

  const handleQuickAdd = () => {
    const name = prompt('Enter lead name:')
    if (!name) return

    const company = prompt('Enter company (optional):') || null
    const designation = prompt('Enter designation (optional):') || null
    const email = prompt('Enter email (optional):') || null

    addLead({
      name,
      designation,
      company,
      email,
      profileUrl: '',
      enriched: !!email,
    })

    toast.success('Lead added successfully')
  }

  return (
    <Card className="p-6" data-tour="import">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
          <Upload className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Import Leads
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Paste LinkedIn profile URLs (one per line) or add manually
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            LinkedIn URLs
          </label>
          <textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder="https://linkedin.com/in/john-doe&#10;https://linkedin.com/in/jane-smith&#10;..."
            className="w-full min-h-[120px] px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            disabled={isImporting}
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Enter one URL per line. Public profiles only.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleImport}
            disabled={isImporting || !urls.trim()}
            className="flex-1"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing... ({importedCount})
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4 mr-2" />
                Import Leads
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleQuickAdd}
            disabled={isImporting}
          >
            <Plus className="h-4 w-4 mr-2" />
            Quick Add
          </Button>
        </div>

        <AnimatePresence>
          {isImporting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800"
            >
              <div className="flex items-center gap-2 text-sm text-primary-700 dark:text-primary-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Parsing URLs and extracting lead information...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}

