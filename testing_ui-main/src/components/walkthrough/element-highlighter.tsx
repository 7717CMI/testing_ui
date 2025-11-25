'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'

interface ElementHighlighterProps {
  element: HTMLElement | null
  isActive: boolean
  stepColor?: string
}

// Fractal ripple component
function FractalRipple({ isActive }: { isActive: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-2 border-primary-500/40"
          initial={{ scale: 0, opacity: 0.8 }}
          animate={
            isActive
              ? {
                  scale: [1, 3],
                  opacity: [0.8, 0],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            delay: i * 0.3,
            ease: 'easeOut',
          }}
          style={{
            left: '50%',
            top: '50%',
            x: '-50%',
            y: '-50%',
          }}
        />
      ))}
    </div>
  )
}

export function ElementHighlighter({ element, isActive, stepColor = '#3b82f6' }: ElementHighlighterProps) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 500, damping: 30 })
  const springY = useSpring(mouseY, { stiffness: 500, damping: 30 })

  // 3D tilt based on mouse position
  const rotateY = useTransform(springX, [-100, 100], [-5, 5])
  const rotateX = useTransform(springY, [-100, 100], [5, -5])

  useEffect(() => {
    if (!element) {
      setRect(null)
      return
    }

    const updateRect = () => {
      if (element) {
        const newRect = element.getBoundingClientRect()
        setRect((prevRect) => {
          if (!prevRect ||
              prevRect.left !== newRect.left ||
              prevRect.top !== newRect.top ||
              prevRect.width !== newRect.width ||
              prevRect.height !== newRect.height) {
            return newRect
          }
          return prevRect
        })
      }
    }

    updateRect()
    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)

    // Magnetic pull effect - move nearby elements slightly
    const handleMouseMove = (e: MouseEvent) => {
      if (!element) return
      const currentRect = element.getBoundingClientRect()
      const centerX = currentRect.left + currentRect.width / 2
      const centerY = currentRect.top + currentRect.height / 2
      mouseX.set((e.clientX - centerX) * 0.1)
      mouseY.set((e.clientY - centerY) * 0.1)
    }

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [element, mouseX, mouseY])

  if (!rect || !isActive) return null

  return (
    <motion.div
      className="fixed pointer-events-none z-[9997]"
      style={{
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
    >
      {/* Multi-layer glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg"
        animate={{
          boxShadow: [
            `0 0 0 0px ${stepColor}40, 0 0 0 0px ${stepColor}20`,
            `0 0 0 8px ${stepColor}40, 0 0 0 16px ${stepColor}20`,
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: 'easeInOut',
        }}
      />

      {/* Color-shift spectrum background */}
      <motion.div
        className="absolute inset-0 rounded-lg opacity-20"
        animate={{
          background: [
            `linear-gradient(135deg, ${stepColor}00, ${stepColor}40)`,
            `linear-gradient(135deg, ${stepColor}40, ${stepColor}80)`,
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
          ease: 'easeInOut',
        }}
      />

      {/* Fractal ripple effect */}
      <FractalRipple isActive={isActive} />

      {/* Border extrusion effect */}
      <motion.div
        className="absolute inset-0 rounded-lg border-2"
        style={{ borderColor: stepColor }}
        animate={{
          boxShadow: [
            `0 0 0 0px ${stepColor}`,
            `0 0 20px 2px ${stepColor}80`,
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  )
}

