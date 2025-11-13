import { create } from 'zustand'

export interface GraphNode {
  id: string
  name: string
  type: 'state' | 'county' | 'zipcode' | 'hospital' | 'drug' | string
  value: number
  group?: number
  x?: number
  y?: number
  z?: number
}

export interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  value?: number
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

interface GraphState {
  graphData: GraphData | null
  totalNodes: number
  totalLinks: number
  selectedNode: GraphNode | null
  hoveredNode: GraphNode | null
  isLoading: boolean

  // Actions
  fetchGraphData: () => Promise<void>
  setSelectedNode: (node: GraphNode | null) => void
  setHoveredNode: (node: GraphNode | null) => void
  exportGraph: () => void
}

export const useGraphStore = create<GraphState>((set, get) => ({
  graphData: null,
  totalNodes: 0,
  totalLinks: 0,
  selectedNode: null,
  hoveredNode: null,
  isLoading: false,

  fetchGraphData: async () => {
    set({ isLoading: true })
    
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock data - replace with actual API response
      const mockData: GraphData = {
        nodes: [
          { id: '1', name: 'California', type: 'state', value: 1200 },
          { id: '2', name: 'Texas', type: 'state', value: 1100 },
          { id: '3', name: 'New York', type: 'state', value: 1050 },
          { id: '4', name: 'Mayo Clinic', type: 'hospital', value: 950 },
          { id: '5', name: 'Cleveland Clinic', type: 'hospital', value: 900 },
          { id: '6', name: 'Johns Hopkins', type: 'hospital', value: 850 },
          { id: '7', name: 'Aspirin', type: 'drug', value: 800 },
          { id: '8', name: 'Ibuprofen', type: 'drug', value: 750 },
        ],
        links: [
          { source: '1', target: '4' },
          { source: '1', target: '5' },
          { source: '2', target: '4' },
          { source: '3', target: '6' },
          { source: '4', target: '7' },
          { source: '5', target: '8' },
          { source: '6', target: '7' },
        ],
      }

      set({
        graphData: mockData,
        totalNodes: mockData.nodes.length,
        totalLinks: mockData.links.length,
        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to fetch graph data:', error)
      set({ isLoading: false })
    }
  },

  setSelectedNode: (node) => {
    set({ selectedNode: node })
  },

  setHoveredNode: (node) => {
    set({ hoveredNode: node })
  },

  exportGraph: () => {
    const { graphData } = get()
    if (!graphData) return

    const dataStr = JSON.stringify(graphData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `graph-data-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  },
}))

