'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface FadeInWhenVisibleProps {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  once?: boolean
  className?: string
}

export function FadeInWhenVisible({ 
  children, 
  delay = 0,
  direction = 'up',
  once = false,
  className = ''
}: FadeInWhenVisibleProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount: 0.3 })

  const directions = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: 50 },
    right: { x: -50 }
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directions[direction] }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, ...directions[direction] }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.33, 1, 0.68, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}



