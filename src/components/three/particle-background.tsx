'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface ParticleBackgroundProps {
  particleCount?: number
  color?: string
  speed?: number
  className?: string
}

export function ParticleBackground({ 
  particleCount = 1000, 
  color = '#3B82F6',
  speed = 0.0005,
  className = ''
}: ParticleBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 2

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)

    // Particles
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10
      positions[i + 1] = (Math.random() - 0.5) * 10
      positions[i + 2] = (Math.random() - 0.5) * 10

      velocities[i] = (Math.random() - 0.5) * 0.02
      velocities[i + 1] = (Math.random() - 0.5) * 0.02
      velocities[i + 2] = (Math.random() - 0.5) * 0.02
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    // Animation
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      const positions = particles.geometry.attributes.position.array as Float32Array

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i]
        positions[i + 1] += velocities[i + 1]
        positions[i + 2] += velocities[i + 2]

        // Wrap around
        if (Math.abs(positions[i]) > 5) velocities[i] *= -1
        if (Math.abs(positions[i + 1]) > 5) velocities[i + 1] *= -1
        if (Math.abs(positions[i + 2]) > 5) velocities[i + 2] *= -1
      }

      particles.geometry.attributes.position.needsUpdate = true
      particles.rotation.y += speed
      particles.rotation.x += speed * 0.5

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [particleCount, color, speed])

  return <div ref={containerRef} className={`absolute inset-0 ${className}`} />
}

