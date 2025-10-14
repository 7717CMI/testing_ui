import { create } from 'zustand'

export interface GraphNode {
  id: string
  name: string
  type: 'state' | 'county' | 'zipcode' | 'hospital' | 'drug'
  value: number
  color?: string
  x?: number
  y?: number
  z?: number
}

export interface GraphLink {
  source: string
  target: string
  value: number
  type?: string
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

interface GraphState {
  // Graph data
  graphData: GraphData | null
  
  // Selected node
  selectedNode: GraphNode | null
  hoveredNode: GraphNode | null
  
  // Filters
  showStates: boolean
  showCounties: boolean
  showZipcodes: boolean
  showHospitals: boolean
  showDrugs: boolean
  
  // Stats
  totalNodes: number
  totalLinks: number
  
  // Loading
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchGraphData: () => Promise<void>
  setSelectedNode: (node: GraphNode | null) => void
  setHoveredNode: (node: GraphNode | null) => void
  toggleFilter: (filterType: 'states' | 'counties' | 'zipcodes' | 'hospitals' | 'drugs') => void
  exportGraph: (format: 'json' | 'csv') => void
}

export const useGraphStore = create<GraphState>((set, get) => ({
  graphData: null,
  selectedNode: null,
  hoveredNode: null,
  showStates: true,
  showCounties: true,
  showZipcodes: true,
  showHospitals: true,
  showDrugs: true,
  totalNodes: 0,
  totalLinks: 0,
  isLoading: false,
  error: null,

  fetchGraphData: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch('/api/graph/linkage')
      if (response.ok) {
        const data = await response.json()
        set({
          graphData: data,
          totalNodes: data.nodes.length,
          totalLinks: data.links.length,
          isLoading: false,
        })
      } else {
        throw new Error('Failed to fetch graph data')
      }
    } catch (error) {
      // Silently fall back to mock data (no backend API yet)
      
      // Use mock data on failure
      const mockData: GraphData = {
        nodes: [
          // States
          { id: 'state-ca', name: 'California', type: 'state', value: 1200, color: '#2563EB' },
          { id: 'state-ny', name: 'New York', type: 'state', value: 980, color: '#2563EB' },
          { id: 'state-tx', name: 'Texas', type: 'state', value: 850, color: '#2563EB' },
          
          // Counties
          { id: 'county-la', name: 'Los Angeles County', type: 'county', value: 450, color: '#10B981' },
          { id: 'county-sd', name: 'San Diego County', type: 'county', value: 320, color: '#10B981' },
          { id: 'county-ny', name: 'New York County', type: 'county', value: 520, color: '#10B981' },
          { id: 'county-harris', name: 'Harris County', type: 'county', value: 380, color: '#10B981' },
          
          // Zipcodes
          { id: 'zip-90001', name: '90001', type: 'zipcode', value: 120, color: '#FACC15' },
          { id: 'zip-92101', name: '92101', type: 'zipcode', value: 95, color: '#FACC15' },
          { id: 'zip-10001', name: '10001', type: 'zipcode', value: 180, color: '#FACC15' },
          { id: 'zip-77001', name: '77001', type: 'zipcode', value: 140, color: '#FACC15' },
          
          // Hospitals
          { id: 'hosp-1', name: 'Memorial Hospital', type: 'hospital', value: 45, color: '#8B5CF6' },
          { id: 'hosp-2', name: 'General Medical Center', type: 'hospital', value: 38, color: '#8B5CF6' },
          { id: 'hosp-3', name: 'St. Mary Medical', type: 'hospital', value: 52, color: '#8B5CF6' },
          { id: 'hosp-4', name: 'City Hospital', type: 'hospital', value: 41, color: '#8B5CF6' },
          { id: 'hosp-5', name: 'Regional Healthcare', type: 'hospital', value: 36, color: '#8B5CF6' },
          
          // Drugs
          { id: 'drug-1', name: 'Lipitor', type: 'drug', value: 850, color: '#EC4899' },
          { id: 'drug-2', name: 'Metformin', type: 'drug', value: 720, color: '#EC4899' },
          { id: 'drug-3', name: 'Amlodipine', type: 'drug', value: 680, color: '#EC4899' },
          { id: 'drug-4', name: 'Lisinopril', type: 'drug', value: 640, color: '#EC4899' },
        ],
        links: [
          // State to County
          { source: 'state-ca', target: 'county-la', value: 10 },
          { source: 'state-ca', target: 'county-sd', value: 8 },
          { source: 'state-ny', target: 'county-ny', value: 12 },
          { source: 'state-tx', target: 'county-harris', value: 9 },
          
          // County to Zipcode
          { source: 'county-la', target: 'zip-90001', value: 7 },
          { source: 'county-sd', target: 'zip-92101', value: 6 },
          { source: 'county-ny', target: 'zip-10001', value: 8 },
          { source: 'county-harris', target: 'zip-77001', value: 7 },
          
          // Zipcode to Hospital
          { source: 'zip-90001', target: 'hosp-1', value: 5 },
          { source: 'zip-90001', target: 'hosp-2', value: 4 },
          { source: 'zip-92101', target: 'hosp-3', value: 5 },
          { source: 'zip-10001', target: 'hosp-4', value: 6 },
          { source: 'zip-77001', target: 'hosp-5', value: 5 },
          
          // Hospital to Drug
          { source: 'hosp-1', target: 'drug-1', value: 15 },
          { source: 'hosp-1', target: 'drug-2', value: 12 },
          { source: 'hosp-2', target: 'drug-2', value: 10 },
          { source: 'hosp-2', target: 'drug-3', value: 8 },
          { source: 'hosp-3', target: 'drug-1', value: 14 },
          { source: 'hosp-3', target: 'drug-4', value: 11 },
          { source: 'hosp-4', target: 'drug-3', value: 13 },
          { source: 'hosp-4', target: 'drug-4', value: 10 },
          { source: 'hosp-5', target: 'drug-1', value: 12 },
          { source: 'hosp-5', target: 'drug-2', value: 9 },
        ],
      }
      
      set({
        graphData: mockData,
        totalNodes: mockData.nodes.length,
        totalLinks: mockData.links.length,
        isLoading: false,
        error: null,
      })
    }
  },

  setSelectedNode: (node) => {
    set({ selectedNode: node })
  },

  setHoveredNode: (node) => {
    set({ hoveredNode: node })
  },

  toggleFilter: (filterType) => {
    const state = get()
    switch (filterType) {
      case 'states':
        set({ showStates: !state.showStates })
        break
      case 'counties':
        set({ showCounties: !state.showCounties })
        break
      case 'zipcodes':
        set({ showZipcodes: !state.showZipcodes })
        break
      case 'hospitals':
        set({ showHospitals: !state.showHospitals })
        break
      case 'drugs':
        set({ showDrugs: !state.showDrugs })
        break
    }
  },

  exportGraph: (format) => {
    const state = get()
    if (!state.graphData) return

    if (format === 'json') {
      const dataStr = JSON.stringify(state.graphData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'graph-data.json'
      link.click()
      URL.revokeObjectURL(url)
    } else if (format === 'csv') {
      // Convert to CSV format
      let csv = 'Type,Source,Target,Value\n'
      if (state.graphData?.links) {
        state.graphData.links.forEach((link) => {
          csv += `link,${link.source},${link.target},${link.value}\n`
        })
      }
      const dataBlob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'graph-data.csv'
      link.click()
      URL.revokeObjectURL(url)
    }
  },
}))

