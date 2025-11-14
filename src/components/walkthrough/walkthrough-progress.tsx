'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'

interface WalkthroughProgressProps {
  currentStep: number
  totalSteps: number
  className?: string
}

export function WalkthroughProgress({
  currentStep,
  totalSteps,
  className = '',
}: WalkthroughProgressProps) {
  const percentage = (currentStep / totalSteps) * 100

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Progress Bar with animated fill */}
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 rounded-full relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>
      </div>

      {/* Step Dots with Connectivity Lines */}
      <div className="flex items-center justify-between relative">
        {/* SVG Path for connecting lines */}
        <svg className="absolute inset-0 w-full h-1 pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)' }}>
          <motion.path
            d={`M 0 0 L ${totalSteps > 1 ? (100 / (totalSteps - 1)) * (currentStep - 1) : 0}% 0`}
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-primary-500"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: currentStep > 1 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            strokeDasharray="1"
            strokeDashoffset="0"
          />
        </svg>

        {/* Step Dots */}
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isActive = stepNumber === currentStep
          const isUpcoming = stepNumber > currentStep

          return (
            <div key={index} className="relative z-10 flex flex-col items-center gap-1">
              <motion.div
                className={`w-3 h-3 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-primary-600'
                    : isActive
                    ? 'bg-primary-500'
                    : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
                animate={
                  isActive
                    ? {
                        scale: [1, 1.3, 1.2],
                        boxShadow: [
                          '0 0 0 0px rgba(59, 130, 246, 0)',
                          '0 0 0 4px rgba(59, 130, 246, 0.4)',
                          '0 0 0 0px rgba(59, 130, 246, 0)',
                        ],
                      }
                    : {}
                }
                transition={{
                  duration: 1.5,
                  repeat: isActive ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              >
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <Check className="w-2 h-2 text-white" />
                  </motion.div>
                )}
              </motion.div>

              {/* Pulse wave effect */}
              {isActive && (
                <motion.div
                  className="absolute w-3 h-3 rounded-full bg-primary-500"
                  animate={{
                    scale: [1, 2, 2.5],
                    opacity: [0.6, 0.3, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Counter */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-primary-600 dark:text-primary-400 font-semibold">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}

