'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { usePathname } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding-store'

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const lenisRef = useRef<Lenis | null>(null)
  const { isTourActive } = useOnboardingStore()

  useEffect(() => {
    // Don't initialize if tour is active (tour has its own Lenis instance)
    if (isTourActive) {
      return
    }

    // Initialize Lenis for smooth scrolling
    if (!lenisRef.current) {
      lenisRef.current = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth easing
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
      })

      // Animation frame loop
      function raf(time: number) {
        if (lenisRef.current) {
          lenisRef.current.raf(time)
          requestAnimationFrame(raf)
        }
      }

      requestAnimationFrame(raf)
    }

    // Cleanup
    return () => {
      if (lenisRef.current && !isTourActive) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }
    }
  }, [pathname, isTourActive])

  return <>{children}</>
}

