'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface WalkthroughOverlayProps {
  isVisible: boolean
  onClick?: () => void
  highlightedElement?: HTMLElement | null
}

export function WalkthroughOverlay({ 
  isVisible, 
  onClick,
  highlightedElement 
}: WalkthroughOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9998] pointer-events-auto"
          onClick={onClick}
        >
          {/* Glassmorphism Background */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            style={{
              WebkitBackdropFilter: 'blur(12px)',
              backdropFilter: 'blur(12px)',
            }}
          />
          
          {/* Highlighted Element Cutout */}
          {highlightedElement && (
            <HighlightCutout element={highlightedElement} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
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
      transition={{ duration: 0.3 }}
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
          0 0 20px rgba(59, 130, 246, 0.4)
        `,
        zIndex: 1,
      }}
    />
  )
}

