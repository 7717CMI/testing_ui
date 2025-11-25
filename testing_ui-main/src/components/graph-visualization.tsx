'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useGraphStore, GraphData, GraphNode } from '@/lib/store/graph-store'

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
})

interface GraphVisualizationProps {
  data: GraphData
}

export default function GraphVisualization({ data }: GraphVisualizationProps) {
  const fgRef = useRef<any>(null)
  const { setSelectedNode, setHoveredNode, selectedNode } = useGraphStore()

  // Early return if data is not available
  if (!data || !data.nodes || !data.links) {
    return (
      <div className="h-[600px] w-full bg-gradient-to-br from-background via-primary-50/5 to-secondary-50/5 dark:from-background dark:via-primary-950/20 dark:to-secondary-950/20 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Loading graph data...</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (fgRef.current) {
      // Auto-rotate camera
      const fg = fgRef.current
      let angle = 0
      const distance = 400

      const interval = setInterval(() => {
        angle += 0.005
        fg.cameraPosition({
          x: distance * Math.sin(angle),
          z: distance * Math.cos(angle),
        })
      }, 50)

      return () => clearInterval(interval)
    }
  }, [])

  function handleNodeClick(node: GraphNode) {
    setSelectedNode(node)
    
    // Focus camera on node
    if (fgRef.current) {
      const distance = 150
      const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0)
      fgRef.current.cameraPosition(
        {
          x: (node.x || 0) * distRatio,
          y: (node.y || 0) * distRatio,
          z: (node.z || 0) * distRatio,
        },
        node,
        1000
      )
    }
  }

  function handleNodeHover(node: GraphNode | null) {
    setHoveredNode(node)
    if (fgRef.current) {
      fgRef.current.controls().enabled = true
    }
  }

  return (
    <div className="h-[600px] w-full bg-gradient-to-br from-background via-primary-50/5 to-secondary-50/5 dark:from-background dark:via-primary-950/20 dark:to-secondary-950/20">
      <ForceGraph3D
        ref={fgRef}
        graphData={data}
        nodeLabel="name"
        nodeColor={(node: any) => node.color || '#999'}
        nodeVal={(node: any) => node.value / 20}
        nodeOpacity={0.9}
        linkWidth={1}
        linkOpacity={0.6}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.005}
        onNodeClick={(node: any) => handleNodeClick(node as GraphNode)}
        onNodeHover={(node: any) => handleNodeHover(node as GraphNode | null)}
        backgroundColor="rgba(0,0,0,0)"
        showNavInfo={false}
        nodeThreeObject={(node: any) => {
          if (selectedNode && selectedNode.id === node.id) {
            // Highlight selected node
            const sprite = new (window as any).THREE.Sprite(
              new (window as any).THREE.SpriteMaterial({
                color: '#FACC15',
                transparent: true,
                opacity: 0.5,
              })
            )
            sprite.scale.set(node.value / 10, node.value / 10, 1)
            return sprite
          }
          return undefined
        }}
      />
    </div>
  )
}

