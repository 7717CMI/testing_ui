'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Filter, X } from 'lucide-react'
import type { StructuredData } from '@/types/article-analysis'

interface Filters {
  dateRange: { start: string; end: string }
  organizations: string[]
  locations: string[]
  types: string[]
}

interface FilterPanelProps {
  data: StructuredData
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

export function FilterPanel({ data, filters, onFiltersChange }: FilterPanelProps) {
  // Extract unique values for filters
  const uniqueOrganizations = Array.from(new Set(data.events?.map(e => e.organization).filter(Boolean) || []))
  const uniqueLocations = Array.from(new Set(data.events?.map(e => e.location).filter(Boolean) || []))
  const uniqueTypes = Array.from(new Set(data.events?.map(e => e.type).filter(Boolean) || []))

  const toggleFilter = (type: 'organizations' | 'locations' | 'types', value: string) => {
    const current = filters[type]
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    
    onFiltersChange({
      ...filters,
      [type]: updated
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      dateRange: { start: '', end: '' },
      organizations: [],
      locations: [],
      types: []
    })
  }

  const hasActiveFilters = 
    filters.dateRange.start || 
    filters.dateRange.end || 
    filters.organizations.length > 0 || 
    filters.locations.length > 0 || 
    filters.types.length > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start-date" className="text-xs">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => onFiltersChange({
                ...filters,
                dateRange: { ...filters.dateRange, start: e.target.value }
              })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="end-date" className="text-xs">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => onFiltersChange({
                ...filters,
                dateRange: { ...filters.dateRange, end: e.target.value }
              })}
              className="mt-1"
            />
          </div>
        </div>

        {/* Organizations */}
        {uniqueOrganizations.length > 0 && (
          <div>
            <Label className="text-xs mb-2 block">Organizations</Label>
            <div className="flex flex-wrap gap-2">
              {uniqueOrganizations.slice(0, 10).map(org => (
                <Badge
                  key={org}
                  variant={filters.organizations.includes(org) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleFilter('organizations', org)}
                >
                  {org}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Locations */}
        {uniqueLocations.length > 0 && (
          <div>
            <Label className="text-xs mb-2 block">Locations</Label>
            <div className="flex flex-wrap gap-2">
              {uniqueLocations.slice(0, 10).map(loc => (
                <Badge
                  key={loc}
                  variant={filters.locations.includes(loc) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleFilter('locations', loc)}
                >
                  {loc}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Types */}
        {uniqueTypes.length > 0 && (
          <div>
            <Label className="text-xs mb-2 block">Event Types</Label>
            <div className="flex flex-wrap gap-2">
              {uniqueTypes.map(type => (
                <Badge
                  key={type}
                  variant={filters.types.includes(type) ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => toggleFilter('types', type)}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

