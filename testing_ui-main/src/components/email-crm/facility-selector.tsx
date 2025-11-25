'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { 
  Building2, 
  Search, 
  Loader2, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail,
  Plus,
  Filter,
  X,
  AlertCircle
} from 'lucide-react'
import { useEmailCRMStore } from '@/stores/email-crm-store'
import { toast } from 'sonner'

interface Facility {
  id: number
  npi_number: string
  provider_name: string
  facility_type: string
  category: string
  business_address_line1: string
  business_city: string
  business_state: string
  business_postal_code: string
  business_phone: string | null
  business_fax: string | null
}

export function FacilitySelector() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [selectedFacilities, setSelectedFacilities] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('')
  const [state, setState] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const { importLeads } = useEmailCRMStore()

  const fetchFacilities = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })

      if (searchQuery) params.append('search', searchQuery)
      if (category) params.append('category', category)
      if (state) params.append('state', state)

      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 25000) // 25 second timeout

      let response
      try {
        response = await fetch(`/api/email-crm/facilities?${params}`, {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. The database may be slow or unreachable.')
        }
        throw fetchError
      }
      
      // Always try to parse the response, even if status is not ok
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        // If JSON parsing fails, throw with status
        throw new Error(`HTTP ${response.status}: Failed to parse response`)
      }
      
      if (!response.ok) {
        // Extract error message from response
        const errorMsg = data?.error || data?.message || `HTTP error! status: ${response.status}`
        const errorCode = data?.errorCode || response.status
        
        // Check if it's a connection-related error
        const isConnectionError = 
          errorMsg.includes('EHOSTUNREACH') ||
          errorMsg.includes('connection timeout') ||
          errorMsg.includes('Connection terminated') ||
          errorMsg.includes('ECONNREFUSED') ||
          errorMsg.includes('ETIMEDOUT') ||
          errorCode === 'ECONNREFUSED' ||
          errorCode === 'ETIMEDOUT' ||
          errorCode === 'EHOSTUNREACH'
        
        // Log full error details for debugging
        console.error('Facilities API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMsg,
          errorCode: errorCode,
          isConnectionError,
          details: data?.details,
        })
        
        // Set user-friendly error message for connection issues
        if (isConnectionError) {
          const friendlyError = 'Database connection unavailable. The facility search feature requires database access. Please check your network connection or contact support.'
          setError(friendlyError)
          toast.error('Unable to connect to database. Facility search is temporarily unavailable.')
          return // Don't throw, just show the error
        }
        
        throw new Error(errorMsg)
      }

      if (data.success) {
        setFacilities(data.data.facilities)
        setTotalPages(data.data.pagination.totalPages)
        setError(null)
      } else {
        const errorMsg = data.error || 'Failed to load facilities'
        console.error('Facilities API error:', errorMsg, data.details)
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error: any) {
      // Handle AbortError (timeout)
      if (error.name === 'AbortError') {
        const errorMsg = 'Request timed out. The database may be slow or unreachable.'
        setError(errorMsg)
        toast.error(errorMsg)
        return
      }
      
      console.error('Error fetching facilities:', error)
      const errorMsg = error.message || 'Failed to load facilities. Please check your database connection.'
      
      // Check if it's a connection-related error
      const isConnectionError = 
        errorMsg.includes('EHOSTUNREACH') ||
        errorMsg.includes('connection timeout') ||
        errorMsg.includes('Connection terminated') ||
        errorMsg.includes('ECONNREFUSED') ||
        errorMsg.includes('ETIMEDOUT')
      
      if (isConnectionError) {
        const friendlyError = 'Database connection unavailable. The facility search feature requires database access. Please check your network connection or contact support.'
        setError(friendlyError)
        toast.error('Unable to connect to database. Facility search is temporarily unavailable.')
      } else {
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch if we don't have a persistent connection error
    if (!error || !error.includes('Database connection unavailable')) {
      fetchFacilities()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, category, state])

  const handleSelectFacility = (facilityId: number) => {
    const newSelected = new Set(selectedFacilities)
    if (newSelected.has(facilityId)) {
      newSelected.delete(facilityId)
    } else {
      newSelected.add(facilityId)
    }
    setSelectedFacilities(newSelected)
  }

  const handleImportSelected = async () => {
    if (selectedFacilities.size === 0) {
      toast.error('Please select at least one facility')
      return
    }

    const selected = facilities.filter((f) => selectedFacilities.has(f.id))
    
    // Convert facilities to leads
    const leads = selected.map((facility) => ({
      name: facility.provider_name,
      designation: null,
      company: facility.provider_name,
      email: null, // Will be enriched later
      profileUrl: '',
      enriched: false,
      facilityId: facility.id,
      npiNumber: facility.npi_number,
      address: facility.business_address_line1,
      city: facility.business_city,
      state: facility.business_state,
      zipCode: facility.business_postal_code,
      phone: facility.business_phone,
      websiteUrl: '', // Will be constructed or searched
    }))

    importLeads(leads)
    toast.success(`Imported ${leads.length} facility(ies) as leads`)
    setSelectedFacilities(new Set())
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchFacilities()
  }

  return (
    <Card className="p-6" data-tour="import">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
          <Building2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Select Facilities
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Search and select healthcare facilities from the database
          </p>
        </div>
        {selectedFacilities.size > 0 && (
          <Button onClick={handleImportSelected} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Import {selectedFacilities.size} Selected
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <form onSubmit={handleSearch} className="space-y-4 mb-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by facility name or NPI..."
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Hospitals"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <Input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g., CA"
                  maxLength={2}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Error Message */}
      {error && !isLoading && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                Database Connection Unavailable
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">{error}</p>
              <div className="flex gap-2 items-center">
                <button
                  onClick={fetchFacilities}
                  className="text-sm px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-100 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900 transition-colors"
                >
                  Try again
                </button>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  You can still use the Email Outreach features by manually adding leads.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Facilities List */}
      {isLoading && facilities.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
        </div>
      ) : error && facilities.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-red-500" />
          <p className="font-medium mb-2">Unable to load facilities</p>
          <p className="text-sm">{error}</p>
          <Button onClick={fetchFacilities} className="mt-4" variant="outline">
            Retry
          </Button>
        </div>
      ) : facilities.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No facilities found. Try adjusting your search.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {facilities.map((facility) => (
            <motion.div
              key={facility.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedFacilities.has(facility.id)
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-primary-300'
              }`}
              onClick={() => handleSelectFacility(facility.id)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {selectedFacilities.has(facility.id) ? (
                    <CheckCircle2 className="h-5 w-5 text-primary-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-neutral-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {facility.provider_name}
                    </h4>
                    <span className="text-xs px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">
                      {facility.category}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">
                        {facility.business_address_line1}, {facility.business_city}, {facility.business_state}
                      </span>
                    </div>
                    {facility.business_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{facility.business_phone}</span>
                      </div>
                    )}
                    <div className="text-xs text-neutral-500">
                      NPI: {facility.npi_number} • {facility.facility_type}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </Card>
  )
}

