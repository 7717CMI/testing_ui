'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import Lenis from 'lenis'
import { walkthroughConfig, defaultWalkthroughSteps, WalkthroughStep } from '@/config/walkthrough-config'
import { WalkthroughOverlay } from './walkthrough-overlay'
import { WalkthroughTooltip } from './walkthrough-tooltip'
import { ElementHighlighter } from './element-highlighter'

export function DynamicWalkthrough() {
  const pathname = usePathname()
  const { isTourActive, completeTour, closeTour, skipTour } = useOnboardingStore()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ top?: number; bottom?: number; left?: number; right?: number }>({})
  const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom')
  const lenisRef = useRef<Lenis | null>(null)
  const stepTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Get steps for current page
  const steps = walkthroughConfig[pathname] || defaultWalkthroughSteps
  const progress = steps.length > 0 ? currentStepIndex / steps.length : 0
  const currentStep = steps[currentStepIndex]
  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === steps.length - 1

  // Initialize Lenis for smooth scrolling
  useEffect(() => {
    if (isTourActive && !lenisRef.current) {
      lenisRef.current = new Lenis({
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.8,
      })

      function raf(time: number) {
        if (lenisRef.current) {
          lenisRef.current.raf(time)
          requestAnimationFrame(raf)
        }
      }
      requestAnimationFrame(raf)
    }

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }
    }
  }, [isTourActive])

  // Calculate tooltip position
  const calculateTooltipPosition = useCallback((element: HTMLElement | null, step: WalkthroughStep) => {
    if (!element || step.position === 'center') {
      // Center position for steps without element
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const tooltipWidth = 380
      const tooltipHeight = 250
      return {
        top: (viewportHeight / 2 - tooltipHeight / 2),
        left: (viewportWidth / 2 - tooltipWidth / 2),
      }
    }

    const rect = element.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const tooltipWidth = 380
    const tooltipHeight = 250
    const spacing = 16

    let position: { top?: number; bottom?: number; left?: number; right?: number } = {}
    let arrow: 'top' | 'bottom' | 'left' | 'right' = step.position || 'bottom'

    // Determine best position based on available space
    const spaceTop = rect.top
    const spaceBottom = viewportHeight - rect.bottom
    const spaceLeft = rect.left
    const spaceRight = viewportWidth - rect.right

    // Auto-adjust position if not enough space
    if (step.position === 'bottom' && spaceBottom < tooltipHeight + spacing) {
      arrow = 'top'
    } else if (step.position === 'top' && spaceTop < tooltipHeight + spacing) {
      arrow = 'bottom'
    } else if (step.position === 'right' && spaceRight < tooltipWidth + spacing) {
      arrow = 'left'
    } else if (step.position === 'left' && spaceLeft < tooltipWidth + spacing) {
      arrow = 'right'
    } else {
      arrow = step.position || 'bottom'
    }

    // Calculate position based on arrow direction
    switch (arrow) {
      case 'bottom':
        position = {
          top: rect.bottom + spacing,
          left: step.align === 'center' 
            ? rect.left + rect.width / 2 - tooltipWidth / 2
            : step.align === 'end'
            ? rect.right - tooltipWidth
            : rect.left,
        }
        break
      case 'top':
        position = {
          bottom: viewportHeight - rect.top + spacing,
          left: step.align === 'center'
            ? rect.left + rect.width / 2 - tooltipWidth / 2
            : step.align === 'end'
            ? rect.right - tooltipWidth
            : rect.left,
        }
        break
      case 'right':
        position = {
          left: rect.right + spacing,
          top: step.align === 'center'
            ? rect.top + rect.height / 2 - tooltipHeight / 2
            : step.align === 'end'
            ? rect.bottom - tooltipHeight
            : rect.top,
        }
        break
      case 'left':
        position = {
          right: viewportWidth - rect.left + spacing,
          top: step.align === 'center'
            ? rect.top + rect.height / 2 - tooltipHeight / 2
            : step.align === 'end'
            ? rect.bottom - tooltipHeight
            : rect.top,
        }
        break
    }

    // Ensure tooltip stays within viewport
    if (position.left !== undefined) {
      position.left = Math.max(16, Math.min(position.left, viewportWidth - tooltipWidth - 16))
    }
    if (position.top !== undefined) {
      position.top = Math.max(16, Math.min(position.top, viewportHeight - tooltipHeight - 16))
    }

    setArrowPosition(arrow)
    return position
  }, [])

  // Highlight element and position tooltip
  useEffect(() => {
    if (!isTourActive || !currentStep) return

    const delay = currentStep.delay || 0

    stepTimeoutRef.current = setTimeout(() => {
      let element: HTMLElement | null = null

      if (currentStep.elementSelector) {
        element = document.querySelector(currentStep.elementSelector) as HTMLElement
      }

      if (element && currentStep.highlight) {
        // Scroll to element if needed
        if (currentStep.scrollIntoView && lenisRef.current) {
          const rect = element.getBoundingClientRect()
          const scrollY = window.scrollY + rect.top - window.innerHeight / 2 + rect.height / 2
          
          lenisRef.current.scrollTo(scrollY, {
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          })
        }

        // Add highlight effect
        element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        element.style.zIndex = '9999'
        element.style.position = 'relative'
        
        // Pulse animation
        const pulseInterval = setInterval(() => {
          element?.style.setProperty('transform', 'scale(1.02)')
          setTimeout(() => {
            element?.style.setProperty('transform', 'scale(1)')
          }, 300)
        }, 2000)

        setHighlightedElement(element)

        // Calculate tooltip position
        const position = calculateTooltipPosition(element, currentStep)
        setTooltipPosition(position)

        return () => {
          clearInterval(pulseInterval)
          if (element) {
            element.style.zIndex = ''
            element.style.position = ''
            element.style.transform = ''
          }
        }
      } else {
        // Center position for steps without element
        setHighlightedElement(null)
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const tooltipWidth = 380
        const tooltipHeight = 250
        setTooltipPosition({
          top: (viewportHeight / 2 - tooltipHeight / 2),
          left: (viewportWidth / 2 - tooltipWidth / 2),
        })
        setArrowPosition('center' as any)
      }
    }, delay)

    return () => {
      if (stepTimeoutRef.current) {
        clearTimeout(stepTimeoutRef.current)
      }
      if (highlightedElement) {
        highlightedElement.style.zIndex = ''
        highlightedElement.style.position = ''
        highlightedElement.style.transform = ''
      }
    }
  }, [isTourActive, currentStepIndex, currentStep, calculateTooltipPosition, highlightedElement])

  // Reset on tour start
  useEffect(() => {
    if (isTourActive) {
      setCurrentStepIndex(0)
    }
  }, [isTourActive])

  const handleNext = () => {
    if (isLast) {
      completeTour()
    } else {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirst) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }

  const handleSkip = () => {
    skipTour()
    closeTour()
  }

  if (!isTourActive || !currentStep) return null

  return (
    <>
      <WalkthroughOverlay
        isVisible={isTourActive}
        highlightedElement={highlightedElement}
        progress={progress}
      />
      <ElementHighlighter
        element={highlightedElement}
        isActive={isTourActive && !!highlightedElement}
        stepColor="#3b82f6"
      />
      <WalkthroughTooltip
        step={currentStep}
        currentStep={currentStepIndex + 1}
        totalSteps={steps.length}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSkip={handleSkip}
        onClose={closeTour}
        position={tooltipPosition}
        arrowPosition={arrowPosition}
        isFirst={isFirst}
        isLast={isLast}
      />
    </>
  )
}

