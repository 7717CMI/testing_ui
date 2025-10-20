'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface LoadingCubeProps {
  size?: number
  className?: string
}

export function LoadingCube({ 
  size = 100,
  className = ''
}: LoadingCubeProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    camera.position.z = 3

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    })
    renderer.setSize(size, size)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)

    // Create cube
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({
      color: 0x3B82F6,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    })
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    // Add edges
    const edges = new THREE.EdgesGeometry(geometry)
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x10B981,
      transparent: true,
      opacity: 0.6
    })
    const lineSegments = new THREE.LineSegments(edges, lineMaterial)
    cube.add(lineSegments)

    // Animation
    let animationId: number

    const animate = () => {
      animationId = requestAnimationFrame(animate)

      cube.rotation.x += 0.02
      cube.rotation.y += 0.02

      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      edges.dispose()
      lineMaterial.dispose()
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [size])

  return <div ref={containerRef} className={`inline-block ${className}`} />
}

