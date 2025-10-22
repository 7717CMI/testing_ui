"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/shared/navbar"
import { FacilityCard } from "@/components/shared/facility-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Search, 
  Filter, 
  Grid3x3, 
  List, 
  Download,
  ChevronDown,
  ChevronUp,
  X,
  Bookmark,
  Loader2
} from "lucide-react"
import { Facility } from "@/types"
import { useFiltersStore } from "@/stores/filters-store"
import { useSavedSearchesStore } from "@/stores/saved-searches-store"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ParticleBackground } from "@/components/three"

// Provider type from database
interface Provider {
  id: number
  npi_number: string
  provider_name: string
  business_address_line1: string | null
  business_city: string | null
  business_state: string | null
  business_state_code: string | null
  business_zip_code: string | null
  business_phone: string | null
  entity_type_name: string | null
  facility_category_name: string | null
  facility_type_name: string | null
}

// Convert Provider to Facility for compatibility
function providerToFacility(provider: Provider): Facility {
  return {
    id: provider.id.toString(),
    name: provider.provider_name,
    type: provider.facility_type_name || provider.facility_category_name || 'Unknown',
    city: provider.business_city || '',
    state: provider.business_state_code || '',
    address: provider.business_address_line1 || '',
    phone: provider.business_phone || '',
    ownership: provider.entity_type_name || 'Unknown',
    bedCount: 0,
    rating: 0,
    accreditation: [],
    specialties: []
  }
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const prefilterType = searchParams.get('type')
  const prefilterCategory = searchParams.get('category')
  
  const [providers, setProviders] = useState<Provider[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    facilityType: true,
    ownership: true,
    accreditation: false,
    bedCount: false,
    rating: false,
  })
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [searchName, setSearchName] = useState("")
  const [searchDescription, setSearchDescription] = useState("")
  const [availableTypes, setAvailableTypes] = useState<string[]>([])
  const [availableOwnership, setAvailableOwnership] = useState<string[]>([])

  const { filters, updateFilters, resetFilters } = useFiltersStore()
  const { addSavedSearch } = useSavedSearchesStore()

  // Load providers from PostgreSQL database
  useEffect(() => {
    async function fetchProviders() {
      setIsLoading(true)
      try {
        // Fetch from database via API
        const response = await fetch('/api/v1/catalog/providers?limit=100&offset=0')
        const data = await response.json()
        
        if (data.success && data.data.providers) {
          setProviders(data.data.providers)
          const facilityData = data.data.providers.map(providerToFacility)
          setFacilities(facilityData)
          setFilteredFacilities(facilityData)
          
          // Extract unique types and ownership for filters
          const types = new Set<string>()
          const ownership = new Set<string>()
          
          data.data.providers.forEach((p: Provider) => {
            if (p.facility_type_name) types.add(p.facility_type_name)
            if (p.facility_category_name) types.add(p.facility_category_name)
            if (p.entity_type_name) ownership.add(p.entity_type_name)
          })
          
          setAvailableTypes(Array.from(types).sort())
          setAvailableOwnership(Array.from(ownership).sort())
        }
      } catch (error) {
        console.error('Error fetching providers:', error)
        toast.error('Failed to load providers from database')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProviders()
  }, [])

  // Apply prefilters from URL
  useEffect(() => {
    if (prefilterType && availableTypes.includes(prefilterType)) {
      updateFilters({ facilityType: [prefilterType] })
    }
    if (prefilterCategory && availableTypes.includes(prefilterCategory)) {
      updateFilters({ facilityType: [prefilterCategory] })
    }
  }, [prefilterType, prefilterCategory, availableTypes, updateFilters])

  // Filter facilities
  useEffect(() => {
    let filtered = facilities

    // Search query
    if (searchQuery) {
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.state.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Facility type
    if (filters.facilityType.length > 0) {
      filtered = filtered.filter((f) => filters.facilityType.includes(f.type))
    }

    // Ownership
    if (filters.ownership.length > 0) {
      filtered = filtered.filter((f) => filters.ownership.includes(f.ownership))
    }

    // Accreditation
    if (filters.accreditation.length > 0) {
      filtered = filtered.filter((f) =>
        f.accreditation.some((acc) => filters.accreditation.includes(acc))
      )
    }

    // Bed count
    filtered = filtered.filter(
      (f) =>
        f.bedCount >= filters.bedCountRange[0] &&
        f.bedCount <= filters.bedCountRange[1]
    )

    // Rating
    filtered = filtered.filter(
      (f) =>
        f.rating >= filters.ratingRange[0] && f.rating <= filters.ratingRange[1]
    )

    setFilteredFacilities(filtered)
  }, [searchQuery, filters, facilities])

  function toggleSection(section: keyof typeof expandedSections) {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  function toggleFilter(key: keyof typeof filters, value: string) {
    const currentValues = filters[key] as string[]
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value]
    updateFilters({ [key]: newValues })
  }

  function handleSaveFacility(facility: Facility) {
    toast.success(`${facility.name} saved to your list`)
  }

  function handleExport() {
    toast.success("Exporting data to CSV...")
  }

  function handleSaveSearch() {
    if (!searchName.trim()) {
      toast.error("Please enter a name for your search")
      return
    }

    addSavedSearch({
      name: searchName,
      description: searchDescription,
      criteria: {
        query: searchQuery,
        facilityType: filters.facilityType.length > 0 ? filters.facilityType.join(", ") : undefined,
        ownership: filters.ownership.length > 0 ? filters.ownership.join(", ") : undefined,
      },
      resultsCount: filteredFacilities.length,
      color: "#3B82F6",
      autoRefresh: false,
      notifyOnNewResults: false,
    })

    toast.success(`Search "${searchName}" saved successfully`)
    setSearchName("")
    setSearchDescription("")
    setSaveDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      
      {/* Three.js Background Animation */}
      <div className="fixed inset-0 opacity-10 pointer-events-none z-0">
        <Suspense fallback={null}>
          <ParticleBackground 
            particleCount={300} 
            color="#3B82F6" 
            speed={0.0002}
          />
        </Suspense>
      </div>

      <div className="container py-6 relative z-10">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside
            className={cn(
              "w-80 flex-shrink-0 space-y-4 transition-all",
              !sidebarOpen && "hidden"
            )}
          >
            <div className="sticky top-20 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg divide-y">
                {/* Facility Type */}
                <div className="p-4">
                  <button
                    onClick={() => toggleSection("facilityType")}
                    className="flex items-center justify-between w-full text-sm font-medium"
                  >
                    Facility Type
                    {expandedSections.facilityType ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {expandedSections.facilityType && (
                    <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                      {isLoading ? (
                        <p className="text-sm text-gray-500">Loading types...</p>
                      ) : availableTypes.length > 0 ? (
                        availableTypes.slice(0, 20).map((type) => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={filters.facilityType.includes(type)}
                              onCheckedChange={() => toggleFilter("facilityType", type)}
                            />
                            <span className="text-sm">{type}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No types available</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Ownership */}
                <div className="p-4">
                  <button
                    onClick={() => toggleSection("ownership")}
                    className="flex items-center justify-between w-full text-sm font-medium"
                  >
                    Ownership
                    {expandedSections.ownership ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {expandedSections.ownership && (
                    <div className="mt-3 space-y-2">
                      {isLoading ? (
                        <p className="text-sm text-gray-500">Loading...</p>
                      ) : availableOwnership.length > 0 ? (
                        availableOwnership.map((type) => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={filters.ownership.includes(type)}
                              onCheckedChange={() => toggleFilter("ownership", type)}
                            />
                            <span className="text-sm">{type}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No ownership data</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Accreditation */}
                <div className="p-4">
                  <button
                    onClick={() => toggleSection("accreditation")}
                    className="flex items-center justify-between w-full text-sm font-medium"
                  >
                    Accreditation
                    {expandedSections.accreditation ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {expandedSections.accreditation && (
                    <div className="mt-3 space-y-2">
                      {["Joint Commission", "NCQA", "CARF", "UCAOA"].map((acc) => (
                        <label key={acc} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={filters.accreditation.includes(acc)}
                            onCheckedChange={() => toggleFilter("accreditation", acc)}
                          />
                          <span className="text-sm">{acc}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bed Count */}
                <div className="p-4">
                  <button
                    onClick={() => toggleSection("bedCount")}
                    className="flex items-center justify-between w-full text-sm font-medium"
                  >
                    Bed Count
                    {expandedSections.bedCount ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {expandedSections.bedCount && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{filters.bedCountRange[0]}</span>
                        <span>{filters.bedCountRange[1]}</span>
                      </div>
                      <Slider
                        min={0}
                        max={1000}
                        step={10}
                        value={filters.bedCountRange}
                        onValueChange={(value) =>
                          updateFilters({ bedCountRange: value as [number, number] })
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="p-4">
                  <button
                    onClick={() => toggleSection("rating")}
                    className="flex items-center justify-between w-full text-sm font-medium"
                  >
                    Rating
                    {expandedSections.rating ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {expandedSections.rating && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{filters.ratingRange[0]} ★</span>
                        <span>{filters.ratingRange[1]} ★</span>
                      </div>
                      <Slider
                        min={0}
                        max={5}
                        step={0.1}
                        value={filters.ratingRange}
                        onValueChange={(value) =>
                          updateFilters({ ratingRange: value as [number, number] })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4">
              {!sidebarOpen && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              )}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search facilities by name, city, or state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("table")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                </Button>
                <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" title="Save Search">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Search</DialogTitle>
                      <DialogDescription>
                        Save your current search criteria to quickly access it later
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="search-name" className="text-sm font-medium">
                          Search Name *
                        </label>
                        <Input
                          id="search-name"
                          placeholder="e.g., California Hospitals"
                          value={searchName}
                          onChange={(e) => setSearchName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="search-description" className="text-sm font-medium">
                          Description (optional)
                        </label>
                        <Textarea
                          id="search-description"
                          placeholder="Add a description..."
                          value={searchDescription}
                          onChange={(e) => setSearchDescription(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm font-medium mb-2">Current Criteria:</p>
                        <div className="space-y-1 text-sm">
                          {searchQuery && (
                            <p className="text-muted-foreground">
                              Query: <span className="text-foreground">"{searchQuery}"</span>
                            </p>
                          )}
                          {filters.facilityType.length > 0 && (
                            <p className="text-muted-foreground">
                              Types: <span className="text-foreground">{filters.facilityType.join(", ")}</span>
                            </p>
                          )}
                          {filters.ownership.length > 0 && (
                            <p className="text-muted-foreground">
                              Ownership: <span className="text-foreground">{filters.ownership.join(", ")}</span>
                            </p>
                          )}
                          <p className="text-muted-foreground">
                            Results: <span className="text-foreground font-semibold">{filteredFacilities.length} facilities</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveSearch}>
                        <Bookmark className="h-4 w-4 mr-2" />
                        Save Search
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.facilityType.length > 0 ||
              filters.ownership.length > 0 ||
              filters.accreditation.length > 0) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {filters.facilityType.map((type) => (
                  <Badge key={type} variant="secondary">
                    {type}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => toggleFilter("facilityType", type)}
                    />
                  </Badge>
                ))}
                {filters.ownership.map((type) => (
                  <Badge key={type} variant="secondary">
                    {type}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => toggleFilter("ownership", type)}
                    />
                  </Badge>
                ))}
                {filters.accreditation.map((acc) => (
                  <Badge key={acc} variant="secondary">
                    {acc}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => toggleFilter("accreditation", acc)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading facilities from database...
                </div>
              ) : (
                `Found ${filteredFacilities.length} facilities`
              )}
            </div>

            {/* Results Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-[#006AFF]" />
                  <p className="text-gray-600">Loading real data from PostgreSQL database...</p>
                </div>
              </div>
            ) : filteredFacilities.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600">No facilities found matching your criteria</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredFacilities.map((facility) => (
                  <FacilityCard
                    key={facility.id}
                    facility={facility}
                    onSave={() => handleSaveFacility(facility)}
                  />
                ))}
              </div>
            ) : (
              /* Results Table */
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Beds</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Rating</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredFacilities.map((facility) => (
                        <tr key={facility.id} className="hover:bg-muted/50">
                          <td className="px-4 py-3">
                            <div className="font-medium">{facility.name}</div>
                            <div className="text-xs text-muted-foreground">{facility.ownership}</div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline">{facility.type}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">{facility.bedCount || "N/A"}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">★</span>
                              <span className="text-sm font-medium">{facility.rating}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {facility.city}, {facility.state}
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSaveFacility(facility)}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

