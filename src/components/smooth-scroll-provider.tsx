'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { usePathname, useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding-store'

// Export Lenis instance for use in other components
let globalLenisInstance: Lenis | null = null

export function getLenisInstance(): Lenis | null {
  return globalLenisInstance
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const lenisRef = useRef<Lenis | null>(null)
  const rafRef = useRef<number | null>(null)
  const { isTourActive } = useOnboardingStore()

  useEffect(() => {
    // Don't initialize if tour is active (tour has its own Lenis instance)
    if (isTourActive) {
      if (lenisRef.current) {
        lenisRef.current.stop()
      }
      return
    }

    // Initialize Lenis with industrial-level buttery smooth settings
    if (!lenisRef.current) {
      lenisRef.current = new Lenis({
        duration: 1.5, // Slightly longer for more buttery feel
        easing: (t) => {
          // Ultra-smooth easing function - industrial grade
          return 1 - Math.pow(1 - t, 3) // Cubic ease-out for natural deceleration
        },
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.8, // Reduced for more control
        smoothTouch: true, // Enable smooth touch scrolling
        touchMultiplier: 1.5, // Optimized for touch devices
        infinite: false,
        lerp: 0.1, // Lower lerp for smoother interpolation
        syncTouch: true, // Sync touch events
        syncTouchLerp: 0.075, // Smooth touch lerp
        touchInertiaMultiplier: 30, // Natural touch inertia
      })

      globalLenisInstance = lenisRef.current

      // Make Lenis available globally for smooth navigation
      if (typeof window !== 'undefined') {
        (window as any).lenis = lenisRef.current
      }

      // Enhanced animation frame loop with performance optimization
      function raf(time: number) {
        if (lenisRef.current) {
          lenisRef.current.raf(time)
          rafRef.current = requestAnimationFrame(raf)
        }
      }

      rafRef.current = requestAnimationFrame(raf)

      // Smooth scroll to top on route change
      const handleRouteChange = () => {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(0, {
            duration: 1.2,
            easing: (t) => 1 - Math.pow(1 - t, 3),
          })
        }
      }

      // Listen for route changes
      handleRouteChange()
    }

    // Handle pathname changes
    if (lenisRef.current && !isTourActive) {
      lenisRef.current.start()
      // Smooth scroll to top on navigation
      setTimeout(() => {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(0, {
            duration: 1.0,
            easing: (t) => 1 - Math.pow(1 - t, 3),
          })
        }
      }, 100)
    }

    // Cleanup
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      if (lenisRef.current && !isTourActive) {
        lenisRef.current.stop()
        lenisRef.current.destroy()
        lenisRef.current = null
        globalLenisInstance = null
        if (typeof window !== 'undefined') {
          delete (window as any).lenis
        }
      }
    }
  }, [pathname, isTourActive])

  // Handle smooth scroll for anchor links
  useEffect(() => {
    if (isTourActive || !lenisRef.current) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a[href^="#"]')
      
      if (anchor) {
        const href = anchor.getAttribute('href')
        if (href && href.startsWith('#')) {
          e.preventDefault()
          const id = href.slice(1)
          const element = document.getElementById(id)
          
          if (element && lenisRef.current) {
            const rect = element.getBoundingClientRect()
            const scrollY = window.scrollY + rect.top - 100 // Offset for header
            
            lenisRef.current.scrollTo(scrollY, {
              duration: 1.5,
              easing: (t) => 1 - Math.pow(1 - t, 3),
            })
          }
        }
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [isTourActive])

  return <>{children}</>
}

