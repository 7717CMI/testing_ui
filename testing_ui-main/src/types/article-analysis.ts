export interface StructuredData {
  events: Array<{
    date: string
    organization: string
    layoffs?: number
    closures?: number
    investment?: number
    marketSize?: number
    adoptionRate?: number
    growthRate?: number
    value?: number
    location: string
    type: string
    source?: string
  }>
  totals: {
    totalLayoffs?: number
    totalClosures?: number
    totalInvestment?: number
    totalMarketSize?: number
    averageAdoptionRate?: number
    totalValue?: number
    affectedOrganizations: number
    affectedStates: number
  }
  byOrganization: Array<{
    name: string
    layoffs?: number
    closures?: number
    investment?: number
    marketShare?: number
    adoptionRate?: number
    value?: number
    location: string
    source?: string
  }>
  byLocation: Array<{
    state: string
    layoffs?: number
    closures?: number
    investment?: number
    marketSize?: number
    adoptionRate?: number
    value?: number
    organizations: string[]
    source?: string
  }>
  timeline: Array<{
    date: string
    events: number
    totalLayoffs?: number
    investment?: number
    marketSize?: number
    adoptionRate?: number
    value?: number
    source?: string
  }>
  marketData?: {
    usMarketSize2024?: number
    usMarketProjection2030?: number
    usMarketProjection2032?: number
    cagr20242030?: string
    northAmericaMarketSize2024?: number
    northAmericaMarketProjection2032?: number
    northAmericaCagr?: string
    inpatientRehabCagr?: string
    largestTherapySegment?: string
    fastestGrowingSegment?: string
  }
  dataSources?: string[]
}

export interface ArticleAnalysis {
  summary: string
  analysis: string
  recommendations: string[]
  structuredData?: StructuredData
}

