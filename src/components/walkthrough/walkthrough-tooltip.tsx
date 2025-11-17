'use client'

import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, SkipForward, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WalkthroughProgress } from './walkthrough-progress'
import { WalkthroughStep } from '@/config/walkthrough-config'
import { tooltipVariants, contentVariants } from '@/lib/animations'
import { useEffect, useRef, useState } from 'react'

interface WalkthroughTooltipProps {
  step: WalkthroughStep
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  onClose: () => void
  position: { top?: number; bottom?: number; left?: number; right?: number }
  arrowPosition?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  isFirst: boolean
  isLast: boolean
}

// Trailing particles component
function TrailingParticles({ count = 5 }: { count?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary-500 rounded-full blur-sm"
          initial={{
            x: -20 - i * 10,
            y: -20 - i * 10,
            opacity: 0.8,
            scale: 0.5,
          }}
          animate={{
            x: 0,
            y: 0,
            opacity: 0,
            scale: 0,
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.1,
            ease: 'easeOut',
          }}
          style={{
            left: '50%',
            top: '50%',
          }}
        />
      ))}
    </div>
  )
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
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 380, height: 250 })
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // 3D tilt effect based on mouse position
  const rotateX = useTransform(mouseY, [-200, 200], [5, -5])
  const rotateY = useTransform(mouseX, [-200, 200], [-5, 5])

  useEffect(() => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect()
      setDimensions({ width: rect.width, height: rect.height })
    }
  }, [step])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tooltipRef.current) return
    const rect = tooltipRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set(e.clientX - centerX)
    mouseY.set(e.clientY - centerY)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const arrowClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 border-b-8 border-t-0 border-b-white dark:border-b-neutral-900',
    bottom: 'top-full left-1/2 -translate-x-1/2 border-t-8 border-b-0 border-t-white dark:border-t-neutral-900',
    left: 'right-full top-1/2 -translate-y-1/2 border-r-8 border-l-0 border-r-white dark:border-r-neutral-900',
    right: 'left-full top-1/2 -translate-y-1/2 border-l-8 border-r-0 border-l-white dark:border-l-neutral-900',
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step.id}
        ref={tooltipRef}
        custom={dimensions}
        variants={tooltipVariants}
        initial="enter"
        animate="enter"
        exit="exit"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          perspective: 1000,
          ...(position.top !== undefined && { top: `${position.top}px` }),
          ...(position.bottom !== undefined && { bottom: `${position.bottom}px` }),
          ...(position.left !== undefined && { left: `${position.left}px` }),
          ...(position.right !== undefined && { right: `${position.right}px` }),
        } as React.CSSProperties}
        className="fixed z-[9999] max-w-sm w-[90vw] sm:w-[380px]"
      >
        {/* Trailing Particles */}
        <TrailingParticles count={5} />

        {/* Tooltip Card */}
        <motion.div
          className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden backdrop-blur-xl bg-opacity-95 dark:bg-opacity-95"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Animated Gradient Accent Border */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-1"
            initial={{ backgroundPosition: '0% 50%' }}
            animate={{ backgroundPosition: '100% 50%' }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)',
              backgroundSize: '200% 100%',
            }}
          />

          {/* Floating glow effect */}
          <motion.div
            className="absolute inset-0 bg-primary-500/10 rounded-2xl blur-2xl"
            animate={{
              opacity: [0.3, 0.6],
              scale: [1, 1.1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: 'easeInOut',
            }}
          />

          {/* Close Button with enhanced animation */}
          <motion.button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors z-10"
            aria-label="Close tour"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <X className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          </motion.button>

          {/* Content with staggered animation */}
          <motion.div
            variants={contentVariants.container}
            initial="hidden"
            animate="visible"
            className="p-6 pt-5 relative z-10"
          >
            {/* Title with icon */}
            <motion.div variants={contentVariants.item} className="flex items-center gap-2 mb-2 pr-8">
              {step.icon && (
                <motion.span
                  className="text-2xl"
                  animate={{
                    rotate: [0, 10],
                    scale: [1, 1.1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 3,
                  }}
                >
                  {step.icon}
                </motion.span>
              )}
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {step.title}
              </h3>
            </motion.div>

            {/* Description */}
            <motion.p
              variants={contentVariants.item}
              className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4"
            >
              {step.description}
            </motion.p>

            {/* Progress */}
            <motion.div variants={contentVariants.item} className="mb-4">
              <WalkthroughProgress currentStep={currentStep} totalSteps={totalSteps} />
            </motion.div>

            {/* Actions */}
            <motion.div
              variants={contentVariants.item}
              className="flex items-center justify-between gap-2"
            >
              {/* Skip Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSkip}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <SkipForward className="w-3 h-3 mr-1" />
                  Skip Tour
                </Button>
              </motion.div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
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
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Button
                    size="sm"
                    onClick={onNext}
                    className="gap-1.5 bg-primary-600 hover:bg-primary-700 relative overflow-hidden"
                  >
                    {/* Shimmer effect on button */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                    {isLast ? (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Finish
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Arrow with animation */}
          {arrowPosition && arrowPosition !== 'center' && (
            <motion.div
              className={`absolute ${arrowClasses[arrowPosition]} border-transparent`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
