'use client'

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

interface ScrollRevealProps {
  children: React.ReactNode
  delay?: number
  direction?: "up" | "down" | "left" | "right"
  className?: string
  once?: boolean
  amount?: number
}

export function ScrollReveal({ 
  children, 
  delay = 0,
  direction = "up",
  className = "",
  once = true,
  amount = 0.3
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once, 
    amount,
    margin: "0px 0px -100px 0px"
  })

  const directions = {
    up: { y: 50, opacity: 0 },
    down: { y: -50, opacity: 0 },
    left: { x: 50, opacity: 0 },
    right: { x: -50, opacity: 0 },
  }

  return (
    <motion.div
      ref={ref}
      initial={directions[direction]}
      animate={isInView ? { 
        x: 0, 
        y: 0, 
        opacity: 1 
      } : directions[direction]}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.33, 1, 0.68, 1] // Smooth easing curve
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

