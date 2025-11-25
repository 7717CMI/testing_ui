'use client'

import { useEffect, Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { Download, Network, TrendingUp, Filter, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useGraphStore } from '@/lib/store/graph-store'
import { DashboardShell } from '@/components/dashboard-shell'
import { ParticleBackground } from '@/components/three'

// Lazy load the 3D graph component
const GraphVisualization = lazy(() => import('@/components/graph-visualization'))

function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center h-[600px] bg-muted/50 rounded-lg">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="text-muted-foreground">Loading 3D graph...</p>
      </div>
    </div>
  )
}

function GraphStats() {
  const { totalNodes, totalLinks, selectedNode } = useGraphStore()

  const stats = [
    { label: 'Total Entities', value: totalNodes, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Connections', value: totalLinks, color: 'text-green-600 dark:text-green-400' },
    { label: 'Selected', value: selectedNode ? 1 : 0, color: 'text-yellow-600 dark:text-yellow-400' },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${stat.color} counter-animate`}>
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

function NodeDetails() {
  const { selectedNode, hoveredNode } = useGraphStore()
  const node = selectedNode || hoveredNode

  if (!node) {
    return (
      <Card className="glass h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Network className="h-5 w-5" />
            Node Details
          </CardTitle>
          <CardDescription>Select a node to view details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Click on any node in the graph to see its details
          </div>
        </CardContent>
      </Card>
    )
  }

  const typeColors = {
    state: 'bg-blue-500',
    county: 'bg-green-500',
    zipcode: 'bg-yellow-500',
    hospital: 'bg-purple-500',
    drug: 'bg-pink-500',
  }

  return (
    <Card className="glass h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Network className="h-5 w-5" />
          {selectedNode ? 'Selected Node' : 'Hovered Node'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Badge className={typeColors[node.type]}>{node.type}</Badge>
        </div>
        
        <div>
          <div className="text-sm text-muted-foreground">Name</div>
          <div className="text-lg font-semibold">{node.name}</div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">Entity ID</div>
          <div className="font-mono text-sm">{node.id}</div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground mb-2">Activity Score</div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                initial={{ width: 0 }}
                animate={{ width: `${(node.value / 1200) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <span className="text-sm font-semibold">{node.value}</span>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button variant="outline" size="sm" className="w-full gap-2">
            <TrendingUp className="h-4 w-4" />
            View Full Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function GraphLinkagePage() {
  const { fetchGraphData, graphData, exportGraph } = useGraphStore()

  useEffect(() => {
    fetchGraphData()
  }, [fetchGraphData])

  return (
    <DashboardShell>
      {/* Three.js Background Animation */}
      <div className="fixed inset-0 opacity-10 pointer-events-none z-0">
        <Suspense fallback={null}>
          <ParticleBackground 
            particleCount={250} 
            color="#EC4899" 
            speed={0.0002}
          />
        </Suspense>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 relative z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Entity Relationship Graph</h1>
            <p className="text-muted-foreground mt-2">
              Interactive 3D visualization of healthcare entity relationships
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => exportGraph('json')}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <GraphStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Graph Visualization */}
          <div className="lg:col-span-3">
            <Card className="glass-heavy p-0 overflow-hidden">
              <CardHeader className="border-b bg-gradient-to-r from-background/50 to-background/30">
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-primary-500" />
                  3D Entity Graph
                </CardTitle>
                <CardDescription>
                  State → County → Zipcode → Hospital → Drugs
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Suspense fallback={<LoadingSkeleton />}>
                  {graphData && <GraphVisualization data={graphData} />}
                </Suspense>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <NodeDetails />

            {/* Legend */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">Entity Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { type: 'State', color: 'bg-blue-500', count: 3 },
                  { type: 'County', color: 'bg-green-500', count: 4 },
                  { type: 'Zipcode', color: 'bg-yellow-500', count: 4 },
                  { type: 'Hospital', color: 'bg-purple-500', count: 5 },
                  { type: 'Drug', color: 'bg-pink-500', count: 4 },
                ].map((item) => (
                  <div key={item.type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${item.color}`} />
                      <span>{item.type}</span>
                    </div>
                    <span className="text-muted-foreground">{item.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </DashboardShell>
  )
}

