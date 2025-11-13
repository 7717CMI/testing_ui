'use client'

import { motion } from 'framer-motion'

interface WalkthroughProgressProps {
  currentStep: number
  totalSteps: number
  className?: string
}

export function WalkthroughProgress({ 
  currentStep, 
  totalSteps,
  className = '' 
}: WalkthroughProgressProps) {
  const percentage = (currentStep / totalSteps) * 100

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Progress Bar */}
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      
      {/* Step Counter */}
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground whitespace-nowrap">
        <span className="text-primary-600 dark:text-primary-400 font-semibold">
          {currentStep}
        </span>
        <span>/</span>
        <span>{totalSteps}</span>
      </div>
      
      {/* Percentage */}
      <div className="text-xs font-medium text-muted-foreground whitespace-nowrap">
        {Math.round(percentage)}%
      </div>
    </div>
  )
}

