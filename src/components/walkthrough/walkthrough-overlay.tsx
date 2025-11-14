'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'

interface WalkthroughOverlayProps {
  isVisible: boolean
  onClick?: () => void
  highlightedElement?: HTMLElement | null
  progress?: number // 0-1 for particle density
}

// Reactive particle component
function ReactiveParticle({ 
  index, 
  mouseX, 
  mouseY, 
  progress = 0 
}: { 
  index: number
  mouseX: any
  mouseY: any
  progress: number
}) {
  const x = useTransform(mouseX, (val) => val + (Math.sin(index) * 50))
  const y = useTransform(mouseY, (val) => val + (Math.cos(index) * 50))
  const opacity = useTransform(() => 0.3 + progress * 0.4)

  return (
    <motion.div
      className="absolute w-1 h-1 bg-primary-500 rounded-full blur-sm"
      style={{
        x,
        y,
        opacity,
      }}
      animate={{
        scale: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 2 + index * 0.2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

function HighlightCutout({ element }: { element: HTMLElement }) {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const updateRect = () => {
      if (element) {
        setRect(element.getBoundingClientRect())
      }
    }

    updateRect()
    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)

    return () => {
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [element])

  if (!rect) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
      className="absolute pointer-events-none"
      style={{
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        borderRadius: '8px',
        boxShadow: `
          0 0 0 9999px rgba(0, 0, 0, 0.6),
          0 0 0 2px rgba(59, 130, 246, 0.8),
          0 0 20px rgba(59, 130, 246, 0.4),
          0 0 40px rgba(59, 130, 246, 0.2)
        `,
        zIndex: 1,
      }}
    />
  )
}

export function WalkthroughOverlay({
  isVisible,
  onClick,
  highlightedElement,
  progress = 0,
}: WalkthroughOverlayProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isVisible) return

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [isVisible, mouseX, mouseY])

  const particleCount = Math.floor(10 + progress * 20) // 10-30 particles based on progress

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9998] pointer-events-auto"
          onClick={onClick}
        >
          {/* Animated Gradient Background */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, rgba(0, 0, 0, 0.6) 50%)',
                'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.1) 0%, rgba(0, 0, 0, 0.6) 50%)',
                'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, rgba(0, 0, 0, 0.6) 50%)',
              ],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Glassmorphism Blur */}
          <motion.div
            className="absolute inset-0 backdrop-blur-md"
            animate={{
              backdropFilter: [`blur(12px)`, `blur(16px)`, `blur(12px)`],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              WebkitBackdropFilter: 'blur(12px)',
            }}
          />

          {/* Reactive Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: particleCount }).map((_, i) => (
              <ReactiveParticle
                key={i}
                index={i}
                mouseX={mouseX}
                mouseY={mouseY}
                progress={progress}
              />
            ))}
          </div>

          {/* Highlighted Element Cutout */}
          {highlightedElement && <HighlightCutout element={highlightedElement} />}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

