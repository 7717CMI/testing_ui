'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface NeuralNetworkProps {
  width?: number
  height?: number
  className?: string
}

export function NeuralNetwork({ 
  width = 600,
  height = 400,
  className = ''
}: NeuralNetworkProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)

    // Create neural network nodes
    const layers = [5, 7, 7, 5, 3]
    const nodes: THREE.Mesh[] = []
    const connections: THREE.Line[] = []

    const nodeGeometry = new THREE.SphereGeometry(0.15, 16, 16)
    
    // Create nodes
    layers.forEach((nodeCount, layerIndex) => {
      const layerX = (layerIndex - layers.length / 2) * 2
      
      for (let i = 0; i < nodeCount; i++) {
        const nodeY = (i - nodeCount / 2) * 0.8
        
        const nodeMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(layerIndex / layers.length, 0.8, 0.6),
          transparent: true,
          opacity: 0.8
        })
        
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial)
        node.position.set(layerX, nodeY, 0)
        scene.add(node)
        nodes.push(node)

        // Create connections to previous layer
        if (layerIndex > 0) {
          const prevLayerStart = layers.slice(0, layerIndex - 1).reduce((a, b) => a + b, 0)
          const prevLayerCount = layers[layerIndex - 1]
          
          for (let j = 0; j < prevLayerCount; j++) {
            const prevNode = nodes[prevLayerStart + j]
            
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
              prevNode.position,
              node.position
            ])
            
            const lineMaterial = new THREE.LineBasicMaterial({
              color: 0x3B82F6,
              transparent: true,
              opacity: 0.2
            })
            
            const line = new THREE.Line(lineGeometry, lineMaterial)
            scene.add(line)
            connections.push(line)
          }
        }
      }
    })

    // Animation
    let animationId: number
    let time = 0

    const animate = () => {
      animationId = requestAnimationFrame(animate)
      time += 0.02

      // Pulse nodes
      nodes.forEach((node, index) => {
        const scale = 1 + Math.sin(time + index * 0.5) * 0.2
        node.scale.set(scale, scale, scale)
        
        // Glow effect
        const material = node.material as THREE.MeshBasicMaterial
        material.opacity = 0.6 + Math.sin(time + index * 0.5) * 0.2
      })

      // Pulse connections
      connections.forEach((line, index) => {
        const material = line.material as THREE.LineBasicMaterial
        material.opacity = 0.1 + Math.sin(time + index * 0.3) * 0.1
      })

      // Gentle rotation
      scene.rotation.y = Math.sin(time * 0.3) * 0.2

      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
      renderer.dispose()
      nodeGeometry.dispose()
      nodes.forEach(node => (node.material as THREE.Material).dispose())
      connections.forEach(line => {
        line.geometry.dispose()
        ;(line.material as THREE.Material).dispose()
      })
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [width, height])

  return <div ref={containerRef} className={className} />
}

