import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SearchCriteria {
  query?: string
  state?: string
  city?: string
  facilityType?: string
  ownership?: string
  bedSize?: string
  specialty?: string
  // Add more filter fields as needed
}

export interface SavedSearch {
  id: string
  name: string
  description?: string
  criteria: SearchCriteria
  createdAt: Date
  updatedAt: Date
  resultsCount?: number
  color?: string
  autoRefresh?: boolean
  notifyOnNewResults?: boolean
}

export interface FacilityData {
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
  authorized_person_name?: string
  authorized_person_designation?: string
  authorized_person_phone?: string
  authorized_person_email?: string
  authorized_person_number?: string
  [key: string]: any
}

export interface FacilityList {
  id: string
  name: string
  description?: string
  facilityIds: string[]
  facilities: FacilityData[]
  createdAt: Date
  updatedAt: Date
  color?: string
  shared?: boolean
  tags?: string[]
}

interface SavedSearchesState {
  // Saved Searches
  savedSearches: SavedSearch[]
  addSavedSearch: (search: Omit<SavedSearch, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateSavedSearch: (id: string, updates: Partial<SavedSearch>) => void
  deleteSavedSearch: (id: string) => void
  getSavedSearch: (id: string) => SavedSearch | undefined
  
  // Facility Lists
  facilityLists: FacilityList[]
  addFacilityList: (list: Omit<FacilityList, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateFacilityList: (id: string, updates: Partial<FacilityList>) => void
  deleteFacilityList: (id: string) => void
  addFacilityToList: (listId: string, facilityId: string) => void
  removeFacilityFromList: (listId: string, facilityId: string) => void
  getFacilityList: (id: string) => FacilityList | undefined
  
  // Utilities
  duplicateSavedSearch: (id: string) => void
  exportList: (listId: string, format: 'json' | 'csv') => void
}

export const useSavedSearchesStore = create<SavedSearchesState>()(
  persist(
    (set, get) => ({
      savedSearches: [],
      facilityLists: [],

      // Saved Searches
      addSavedSearch: (search) => {
        const newSearch: SavedSearch = {
          ...search,
          id: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          savedSearches: [...state.savedSearches, newSearch],
        }))
      },

      updateSavedSearch: (id, updates) => {
        set((state) => ({
          savedSearches: state.savedSearches.map((search) =>
            search.id === id
              ? { ...search, ...updates, updatedAt: new Date() }
              : search
          ),
        }))
      },

      deleteSavedSearch: (id) => {
        set((state) => ({
          savedSearches: state.savedSearches.filter((search) => search.id !== id),
        }))
      },

      getSavedSearch: (id) => {
        return get().savedSearches.find((search) => search.id === id)
      },

      duplicateSavedSearch: (id) => {
        const original = get().getSavedSearch(id)
        if (original) {
          get().addSavedSearch({
            ...original,
            name: `${original.name} (Copy)`,
          })
        }
      },

      // Facility Lists
      addFacilityList: (list) => {
        const newList: FacilityList = {
          ...list,
          facilities: list.facilities || [],
          facilityIds: list.facilityIds || list.facilities?.map(f => f.id.toString()) || [],
          id: `list-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          facilityLists: [...state.facilityLists, newList],
        }))
      },

      updateFacilityList: (id, updates) => {
        set((state) => ({
          facilityLists: state.facilityLists.map((list) =>
            list.id === id
              ? { ...list, ...updates, updatedAt: new Date() }
              : list
          ),
        }))
      },

      deleteFacilityList: (id) => {
        set((state) => ({
          facilityLists: state.facilityLists.filter((list) => list.id !== id),
        }))
      },

      addFacilityToList: (listId, facilityId) => {
        set((state) => ({
          facilityLists: state.facilityLists.map((list) =>
            list.id === listId && !list.facilityIds.includes(facilityId)
              ? {
                  ...list,
                  facilityIds: [...list.facilityIds, facilityId],
                  updatedAt: new Date(),
                }
              : list
          ),
        }))
      },

      removeFacilityFromList: (listId, facilityId) => {
        set((state) => ({
          facilityLists: state.facilityLists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  facilityIds: list.facilityIds.filter((id) => id !== facilityId),
                  updatedAt: new Date(),
                }
              : list
          ),
        }))
      },

      getFacilityList: (id) => {
        return get().facilityLists.find((list) => list.id === id)
      },

      exportList: (listId, format) => {
        const list = get().getFacilityList(listId)
        if (!list) return

        if (format === 'json') {
          const dataStr = JSON.stringify(list, null, 2)
          const dataBlob = new Blob([dataStr], { type: 'application/json' })
          const url = URL.createObjectURL(dataBlob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${list.name.toLowerCase().replace(/\s+/g, '-')}.json`
          link.click()
          URL.revokeObjectURL(url)
        } else if (format === 'csv') {
          // Enhanced CSV export with facility details
          let csv = 'ID,NPI Number,Provider Name,Facility Type,Address,City,State,Phone,Authorized Person,Authorized Person Email,Authorized Person Number\n'
          list.facilities.forEach((facility) => {
            csv += `${facility.id},"${facility.npi_number}","${facility.provider_name}","${facility.facility_type}","${facility.business_address_line1}","${facility.business_city}","${facility.business_state}","${facility.business_phone || ''}","${facility.authorized_person_name || ''}","${facility.authorized_person_email || ''}","${facility.authorized_person_number || ''}"\n`
          })
          const dataBlob = new Blob([csv], { type: 'text/csv' })
          const url = URL.createObjectURL(dataBlob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${list.name.toLowerCase().replace(/\s+/g, '-')}.csv`
          link.click()
          URL.revokeObjectURL(url)
        }
      },
    }),
    {
      name: 'saved-searches-storage',
    }
  )
)


