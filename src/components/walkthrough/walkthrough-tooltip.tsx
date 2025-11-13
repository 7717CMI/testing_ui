'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WalkthroughProgress } from './walkthrough-progress'
import { WalkthroughStep } from '@/config/walkthrough-config'

interface WalkthroughTooltipProps {
  step: WalkthroughStep
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  onClose: () => void
  position: { top?: number; bottom?: number; left?: number; right?: number }
  arrowPosition?: 'top' | 'bottom' | 'left' | 'right'
  isFirst: boolean
  isLast: boolean
}

export function WalkthroughTooltip({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  onClose,
  position,
  arrowPosition = 'bottom',
  isFirst,
  isLast,
}: WalkthroughTooltipProps) {
  const arrowClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 border-b-8 border-t-0 border-b-white dark:border-b-neutral-900',
    bottom: 'top-full left-1/2 -translate-x-1/2 border-t-8 border-b-0 border-t-white dark:border-t-neutral-900',
    left: 'right-full top-1/2 -translate-y-1/2 border-r-8 border-l-0 border-r-white dark:border-r-neutral-900',
    right: 'left-full top-1/2 -translate-y-1/2 border-l-8 border-r-0 border-l-white dark:border-l-neutral-900',
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ 
          duration: 0.4,
          ease: [0.34, 1.56, 0.64, 1] // Bouncy ease
        }}
        className="fixed z-[9999] max-w-sm w-[90vw] sm:w-[380px]"
        style={{
          ...(position.top !== undefined && { top: `${position.top}px` }),
          ...(position.bottom !== undefined && { bottom: `${position.bottom}px` }),
          ...(position.left !== undefined && { left: `${position.left}px` }),
          ...(position.right !== undefined && { right: `${position.right}px` }),
        }}
      >
        {/* Tooltip Card */}
        <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden backdrop-blur-xl bg-opacity-95 dark:bg-opacity-95">
          {/* Gradient Accent Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors z-10"
            aria-label="Close tour"
          >
            <X className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          </button>

          {/* Content */}
          <div className="p-6 pt-5">
            {/* Title */}
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2 pr-8">
              {step.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              {step.description}
            </p>

            {/* Progress */}
            <div className="mb-4">
              <WalkthroughProgress 
                currentStep={currentStep} 
                totalSteps={totalSteps}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2">
              {/* Skip Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <SkipForward className="w-3 h-3 mr-1" />
                Skip Tour
              </Button>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrevious}
                  disabled={isFirst}
                  className="gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  size="sm"
                  onClick={onNext}
                  className="gap-1.5 bg-primary-600 hover:bg-primary-700"
                >
                  {isLast ? 'Finish' : 'Next'}
                  {!isLast && <ChevronRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Arrow */}
          {arrowPosition && arrowPosition !== 'center' && (
            <div
              className={`absolute ${arrowClasses[arrowPosition]} border-transparent`}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

