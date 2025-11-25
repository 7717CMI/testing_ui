'use client'

import { useState, useEffect } from 'react'
import { useSavedSearchesStore, FacilityData } from '@/stores/saved-searches-store'
import { useBookmarksStore } from '@/stores/bookmarks-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, MapPin, Phone, Mail, Trash2, Download, Plus, User, Bookmark } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface SavedFacilityListsProps {
  onImportList: (facilities: FacilityData[]) => void
}

interface EnrichedBookmark {
  bookmark: ReturnType<typeof useBookmarksStore>['bookmarks'][0]
  authorized_person_name?: string | null
  authorized_person_designation?: string | null
  authorized_person_phone?: string | null
}

export function SavedFacilityLists({ onImportList }: SavedFacilityListsProps) {
  const { facilityLists, deleteFacilityList, exportList } = useSavedSearchesStore()
  const { bookmarks } = useBookmarksStore()
  const [enrichedBookmarks, setEnrichedBookmarks] = useState<EnrichedBookmark[]>([])

  // Filter for email-outreach lists, but also show all lists if no email-outreach tag exists
  // This helps with backward compatibility and debugging
  const emailOutreachLists = facilityLists.filter(list => 
    !list.tags || list.tags.length === 0 || list.tags.includes('email-outreach')
  )

  // Fetch authorized official data for bookmarks that don't have it
  useEffect(() => {
    const fetchAuthorizedOfficialData = async () => {
      const bookmarksToEnrich = bookmarks.filter(
        bookmark => !bookmark.authorized_person_name && !bookmark.authorized_person_designation
      )

      if (bookmarksToEnrich.length === 0) {
        // All bookmarks already have data, just map them
        setEnrichedBookmarks(
          bookmarks.map(bookmark => ({
            bookmark,
            authorized_person_name: bookmark.authorized_person_name || null,
            authorized_person_designation: bookmark.authorized_person_designation || null,
            authorized_person_phone: bookmark.authorized_person_phone || bookmark.phone || null,
          }))
        )
        return
      }

      // Fetch data for bookmarks that need enrichment
      const enriched = await Promise.all(
        bookmarks.map(async (bookmark) => {
          // If bookmark already has authorized person data, use it
          if (bookmark.authorized_person_name || bookmark.authorized_person_designation) {
            return {
              bookmark,
              authorized_person_name: bookmark.authorized_person_name || null,
              authorized_person_designation: bookmark.authorized_person_designation || null,
              authorized_person_phone: bookmark.authorized_person_phone || bookmark.phone || null,
            }
          }

          // Otherwise, fetch from API
          try {
            const response = await fetch(`/api/email-crm/facility-details?npi=${encodeURIComponent(bookmark.npi)}`)
            if (response.ok) {
              const data = await response.json()
              if (data.success && data.data) {
                return {
                  bookmark,
                  authorized_person_name: data.data.authorized_person_name || null,
                  authorized_person_designation: data.data.authorized_person_designation || null,
                  authorized_person_phone: data.data.authorized_person_phone || bookmark.phone || null,
                }
              }
            }
          } catch (error) {
            console.error(`Failed to fetch authorized official data for NPI ${bookmark.npi}:`, error)
          }

          // Fallback: return bookmark without enrichment
          return {
            bookmark,
            authorized_person_name: null,
            authorized_person_designation: null,
            authorized_person_phone: bookmark.phone || null,
          }
        })
      )

      setEnrichedBookmarks(enriched)
    }

    if (bookmarks.length > 0) {
      fetchAuthorizedOfficialData()
    } else {
      setEnrichedBookmarks([])
    }
  }, [bookmarks])

  // Convert enriched bookmarks to FacilityData format for display
  const bookmarkedFacilitiesAsData: FacilityData[] = enrichedBookmarks.map(({ bookmark, authorized_person_name, authorized_person_designation, authorized_person_phone }) => ({
    id: parseInt(bookmark.npi) || 0,
    npi_number: bookmark.npi,
    provider_name: bookmark.name,
    facility_type: bookmark.facilityType,
    category: bookmark.category,
    business_address_line1: '',
    business_city: bookmark.city,
    business_state: bookmark.state,
    business_postal_code: '',
    business_phone: bookmark.phone || null,
    business_fax: null,
    authorized_person_name: authorized_person_name || undefined,
    authorized_person_designation: authorized_person_designation || undefined,
    authorized_person_phone: authorized_person_phone || undefined,
    authorized_person_email: bookmark.authorized_person_email || undefined,
    authorized_person_number: bookmark.authorized_person_number || bookmark.phone || undefined,
  }))

  // Debug logging (only in development)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('[SavedFacilityLists] Total facility lists:', facilityLists.length)
    console.log('[SavedFacilityLists] Email outreach lists:', emailOutreachLists.length)
    console.log('[SavedFacilityLists] Bookmarked facilities:', bookmarks.length)
    console.log('[SavedFacilityLists] All lists:', facilityLists.map(l => ({ 
      id: l.id, 
      name: l.name, 
      tags: l.tags, 
      facilityCount: l.facilities.length 
    })))
  }

  // Show empty state only if there are no lists AND no bookmarks
  if (emailOutreachLists.length === 0 && enrichedBookmarks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No saved facility lists yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Save facilities from the Leads tab to create lists
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Click the "Save X Facility(ies)" button in the header to save your selected facilities
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Saved Facility Lists */}
      {emailOutreachLists.length > 0 && (
        <div className="space-y-4">
          {emailOutreachLists.map((list) => (
        <Card key={list.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {list.name}
                </CardTitle>
                {list.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {list.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{list.facilities.length} facilities</span>
                  <span>•</span>
                  <span>Saved {format(new Date(list.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportList(list.id, 'csv')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onImportList(list.facilities)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Import to Leads
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    deleteFacilityList(list.id)
                    toast.success('List deleted')
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {/* Show ALL facilities - removed slice limit */}
              {list.facilities.map((facility) => (
                <div
                  key={facility.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base mb-2">{facility.provider_name}</h4>
                      
                      {/* Basic Info Row */}
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {facility.business_city}, {facility.business_state}
                        </span>
                        {facility.business_phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            {facility.business_phone}
                          </span>
                        )}
                        {facility.authorized_person_email && (
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            {facility.authorized_person_email}
                          </span>
                        )}
                      </div>

                      {/* Authorized Person Information - Prominently Displayed */}
                      {(facility.authorized_person_name || facility.authorized_person_designation || facility.authorized_person_number) && (
                        <div className="mt-3 p-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            <span className="text-sm font-semibold text-primary-900 dark:text-primary-100">
                              Authorized Person
                            </span>
                          </div>
                          <div className="space-y-1.5 text-sm">
                            {facility.authorized_person_name && (
                              <div className="text-foreground">
                                <span className="font-medium">Name:</span>{' '}
                                <span className="text-primary-600 dark:text-primary-400 font-semibold">
                                  {facility.authorized_person_name}
                                </span>
                              </div>
                            )}
                            {facility.authorized_person_designation && (
                              <div className="text-foreground">
                                <span className="font-medium">Designation:</span>{' '}
                                <span className="text-primary-600 dark:text-primary-400 font-semibold">
                                  {facility.authorized_person_designation}
                                </span>
                              </div>
                            )}
                            {facility.authorized_person_number && (
                              <div className="text-foreground">
                                <span className="font-medium">Number:</span>{' '}
                                <span className="text-primary-600 dark:text-primary-400 font-semibold">
                                  {facility.authorized_person_number}
                                </span>
                              </div>
                            )}
                            {facility.authorized_person_phone && facility.authorized_person_phone !== facility.authorized_person_number && (
                              <div className="text-foreground">
                                <span className="font-medium">Phone:</span> {facility.authorized_person_phone}
                              </div>
                            )}
                            {facility.authorized_person_email && (
                              <div className="text-foreground">
                                <span className="font-medium">Email:</span>{' '}
                                <span className="text-primary-600 dark:text-primary-400">
                                  {facility.authorized_person_email}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0">
                      {facility.facility_type || facility.category || 'N/A'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
        </div>
      )}

      {/* Bookmarked Facilities Section */}
      {enrichedBookmarks.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5" />
                  Bookmarked Facilities ({enrichedBookmarks.length})
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Facilities bookmarked from the Data Catalog
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onImportList(bookmarkedFacilitiesAsData)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Import All to Leads
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {bookmarkedFacilitiesAsData.map((facility) => (
                <div
                  key={facility.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base mb-2">{facility.provider_name}</h4>
                      
                      {/* Basic Info Row */}
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {facility.business_city}, {facility.business_state}
                        </span>
                        {facility.business_phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            {facility.business_phone}
                          </span>
                        )}
                      </div>

                      {/* Authorized Person Information - Prominently Displayed */}
                      {(facility.authorized_person_name || facility.authorized_person_designation || facility.authorized_person_number) && (
                        <div className="mt-3 p-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            <span className="text-sm font-semibold text-primary-900 dark:text-primary-100">
                              Authorized Person
                            </span>
                          </div>
                          <div className="space-y-1.5 text-sm">
                            {facility.authorized_person_name && (
                              <div className="text-foreground">
                                <span className="font-medium">Name:</span>{' '}
                                <span className="text-primary-600 dark:text-primary-400 font-semibold">
                                  {facility.authorized_person_name}
                                </span>
                              </div>
                            )}
                            {facility.authorized_person_designation && (
                              <div className="text-foreground">
                                <span className="font-medium">Designation:</span>{' '}
                                <span className="text-primary-600 dark:text-primary-400 font-semibold">
                                  {facility.authorized_person_designation}
                                </span>
                              </div>
                            )}
                            {facility.authorized_person_number && (
                              <div className="text-foreground">
                                <span className="font-medium">Number:</span>{' '}
                                <span className="text-primary-600 dark:text-primary-400 font-semibold">
                                  {facility.authorized_person_number}
                                </span>
                              </div>
                            )}
                            {facility.authorized_person_phone && facility.authorized_person_phone !== facility.authorized_person_number && (
                              <div className="text-foreground">
                                <span className="font-medium">Phone:</span> {facility.authorized_person_phone}
                              </div>
                            )}
                            {facility.authorized_person_email && (
                              <div className="text-foreground">
                                <span className="font-medium">Email:</span>{' '}
                                <span className="text-primary-600 dark:text-primary-400">
                                  {facility.authorized_person_email}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0">
                      {facility.facility_type || facility.category || 'N/A'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


