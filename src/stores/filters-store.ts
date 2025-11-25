import { create } from "zustand"
import { SearchFilters } from "@/types"

interface FiltersState {
  filters: SearchFilters
  updateFilters: (filters: Partial<SearchFilters>) => void
  resetFilters: () => void
}

const defaultFilters: SearchFilters = {
  facilityType: [],
  ownership: [],
  accreditation: [],
  bedCountRange: [0, 1000],
  ratingRange: [0, 5],
  revenueRange: [0, 500], // 0 to 500 million
  states: [],
  cities: [],
}

export const useFiltersStore = create<FiltersState>((set) => ({
  filters: defaultFilters,
  updateFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}))

