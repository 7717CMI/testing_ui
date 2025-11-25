'use client'

import { motion } from "framer-motion"

interface AnimatedGradientTextProps {
  children: React.ReactNode
  className?: string
  duration?: number
}

export function AnimatedGradientText({ 
  children, 
  className = "",
  duration = 5
}: AnimatedGradientTextProps) {
  return (
    <motion.span
      className={`inline-block font-bold ${className}`}
      style={{
        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)',
        backgroundSize: '300% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%'],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: 'linear',
      }}
    >
      {children}
    </motion.span>
  )
}


