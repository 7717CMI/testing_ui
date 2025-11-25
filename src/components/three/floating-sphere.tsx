'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface FloatingSphereProps {
  size?: number
  color?: string
  className?: string
}

export function FloatingSphere({ 
  size = 300,
  color = '#3B82F6',
  className = ''
}: FloatingSphereProps) {
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

    // Create wireframe sphere
    const geometry = new THREE.IcosahedronGeometry(1.2, 1)
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      wireframe: true,
      transparent: true,
      opacity: 0.3
    })
    const sphere = new THREE.Mesh(geometry, material)
    scene.add(sphere)

    // Add inner sphere
    const innerGeometry = new THREE.IcosahedronGeometry(1, 0)
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.1
    })
    const innerSphere = new THREE.Mesh(innerGeometry, innerMaterial)
    scene.add(innerSphere)

    // Add particles
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 100
    const positions = new Float32Array(particlesCount * 3)

    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 4
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const particlesMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particlesMesh)

    // Animation
    let animationId: number
    let time = 0

    const animate = () => {
      animationId = requestAnimationFrame(animate)
      time += 0.01

      // Rotate spheres
      sphere.rotation.x += 0.005
      sphere.rotation.y += 0.005
      
      innerSphere.rotation.x -= 0.003
      innerSphere.rotation.y -= 0.003

      // Pulsing effect
      const scale = 1 + Math.sin(time) * 0.05
      sphere.scale.set(scale, scale, scale)

      // Rotate particles
      particlesMesh.rotation.y += 0.002

      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      innerGeometry.dispose()
      innerMaterial.dispose()
      particlesGeometry.dispose()
      particlesMaterial.dispose()
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [size, color])

  return <div ref={containerRef} className={className} />
}

