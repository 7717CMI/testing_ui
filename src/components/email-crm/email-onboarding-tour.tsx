'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useEmailCRMStore } from '@/stores/email-crm-store'

interface TourStep {
  id: string
  title: string
  description: string
  selector: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

const tourSteps: TourStep[] = [
  {
    id: 'import',
    title: '📥 Import Your First Lead',
    description: 'Paste LinkedIn profile URLs here (one per line) or click "Quick Add" to manually enter lead information. The system will automatically extract name, designation, and company.',
    selector: '[data-tour="import"]',
    position: 'bottom',
  },
  {
    id: 'dashboard',
    title: '👥 Manage Your Leads',
    description: 'View all your imported leads in this table. You can search, filter, select multiple leads for bulk actions, and send emails directly from here.',
    selector: '[data-tour="dashboard"]',
    position: 'top',
  },
  {
    id: 'send',
    title: '✉️ Send Your First Email',
    description: 'Click the "Send Email" button on any lead to open the composer. Use templates, merge tags ({{name}}, {{company}}), and schedule sends for later.',
    selector: '[data-tour="send"]',
    position: 'left',
  },
]

export function EmailOnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const { leads } = useEmailCRMStore()

  useEffect(() => {
    // Show tour if user has no leads and hasn't seen it before
    const hasSeenTour = localStorage.getItem('email-crm-tour-completed')
    if (!hasSeenTour && leads.length === 0) {
      setTimeout(() => setIsVisible(true), 1000)
    }
  }, [leads.length])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    setIsVisible(false)
    localStorage.setItem('email-crm-tour-completed', 'true')
  }

  if (!isVisible) return null

  const step = tourSteps[currentStep]
  const element = typeof document !== 'undefined' ? document.querySelector(step.selector) : null
  const rect = element?.getBoundingClientRect()

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Tooltip */}
          {rect && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed z-[10000] max-w-sm w-[90vw] sm:w-[400px]"
              style={{
                top: step.position === 'bottom' ? `${rect.bottom + 16}px` : undefined,
                bottom: step.position === 'top' ? `${window.innerHeight - rect.top + 16}px` : undefined,
                left: step.position === 'right' ? `${rect.right + 16}px` : step.position === 'left' ? `${rect.left - 416}px` : `${rect.left + rect.width / 2 - 200}px`,
                right: step.position === 'left' ? undefined : undefined,
              }}
            >
              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6">
                {/* Progress */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {tourSteps.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 rounded-full transition-all ${
                          index <= currentStep
                            ? 'bg-primary-500 w-8'
                            : 'bg-neutral-200 dark:bg-neutral-700 w-2'
                        }`}
                      />
                    ))}
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleSkip}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                  {step.description}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Button variant="ghost" onClick={handleSkip} size="sm">
                    Skip Tour
                  </Button>
                  <div className="flex items-center gap-2">
                    {currentStep > 0 && (
                      <Button variant="outline" onClick={handlePrevious} size="sm">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                      </Button>
                    )}
                    <Button onClick={handleNext} size="sm">
                      {currentStep === tourSteps.length - 1 ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Get Started
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div
                className={`absolute w-0 h-0 border-8 ${
                  step.position === 'bottom'
                    ? 'bottom-full left-1/2 -translate-x-1/2 border-b-white dark:border-b-neutral-900 border-t-transparent border-l-transparent border-r-transparent'
                    : step.position === 'top'
                    ? 'top-full left-1/2 -translate-x-1/2 border-t-white dark:border-t-neutral-900 border-b-transparent border-l-transparent border-r-transparent'
                    : step.position === 'right'
                    ? 'right-full top-1/2 -translate-y-1/2 border-r-white dark:border-r-neutral-900 border-l-transparent border-t-transparent border-b-transparent'
                    : 'left-full top-1/2 -translate-y-1/2 border-l-white dark:border-l-neutral-900 border-r-transparent border-t-transparent border-b-transparent'
                }`}
              />
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  )
}



