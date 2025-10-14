'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface DNAHelixProps {
  width?: number
  height?: number
  className?: string
}

export function DNAHelix({ 
  width = 400,
  height = 600,
  className = ''
}: DNAHelixProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.z = 8

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)

    // Create DNA helix
    const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16)
    const material1 = new THREE.MeshBasicMaterial({ 
      color: 0x3B82F6,
      transparent: true,
      opacity: 0.8
    })
    const material2 = new THREE.MeshBasicMaterial({ 
      color: 0x10B981,
      transparent: true,
      opacity: 0.8
    })

    const group = new THREE.Group()
    const pairs: THREE.Mesh[][] = []

    const segments = 20
    const radius = 2
    const helixHeight = 10

    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 4
      const y = (i / segments) * helixHeight - helixHeight / 2

      // First strand
      const sphere1 = new THREE.Mesh(sphereGeometry, material1)
      sphere1.position.set(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      )
      group.add(sphere1)

      // Second strand (opposite side)
      const sphere2 = new THREE.Mesh(sphereGeometry, material2)
      sphere2.position.set(
        Math.cos(angle + Math.PI) * radius,
        y,
        Math.sin(angle + Math.PI) * radius
      )
      group.add(sphere2)

      // Connection between pairs
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        sphere1.position,
        sphere2.position
      ])
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xFACC15,
        transparent: true,
        opacity: 0.3
      })
      const line = new THREE.Line(lineGeometry, lineMaterial)
      group.add(line)

      pairs.push([sphere1, sphere2])
    }

    scene.add(group)

    // Animation
    let animationId: number
    let time = 0

    const animate = () => {
      animationId = requestAnimationFrame(animate)
      time += 0.01

      // Rotate helix
      group.rotation.y += 0.01

      // Pulse effect
      pairs.forEach((pair, index) => {
        const scale = 1 + Math.sin(time + index * 0.5) * 0.2
        pair[0].scale.set(scale, scale, scale)
        pair[1].scale.set(scale, scale, scale)
      })

      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
      renderer.dispose()
      sphereGeometry.dispose()
      material1.dispose()
      material2.dispose()
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [width, height])

  return <div ref={containerRef} className={className} />
}

