'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface ScrollRevealTextProps {
  text: string
  className?: string
  delay?: number
  once?: boolean
}

export function ScrollRevealText({ 
  text, 
  className = '', 
  delay = 0,
  once = false 
}: ScrollRevealTextProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount: 0.3 })
  
  const words = text.split(' ')

  return (
    <div ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{
            duration: 0.6,
            delay: delay + (i * 0.08),
            ease: [0.33, 1, 0.68, 1]
          }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </div>
  )
}



