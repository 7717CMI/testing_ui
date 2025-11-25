'use client'

import { motion } from "framer-motion"
import { ReactNode, Children } from "react"

interface StaggeredListProps {
  children: ReactNode
  staggerDelay?: number
  className?: string
}

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const item = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.33, 1, 0.68, 1]
    }
  },
}

export function StaggeredList({ 
  children, 
  staggerDelay = 0.1,
  className = ""
}: StaggeredListProps) {
  const containerVariants = {
    ...container,
    visible: {
      ...container.visible,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.2,
      },
    },
  }

  const childrenArray = Children.toArray(children)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {childrenArray.map((child, index) => (
        <motion.div
          key={index}
          variants={item}
          whileHover={{ 
            x: 4,
            transition: { duration: 0.2 }
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

