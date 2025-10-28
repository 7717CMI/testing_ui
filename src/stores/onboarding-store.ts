import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OnboardingState {
  hasCompletedTour: boolean
  tourStep: number
  isTourActive: boolean
  startTour: () => void
  completeTour: () => void
  resetTour: () => void
  setTourStep: (step: number) => void
  closeTour: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompletedTour: false,
      tourStep: 0,
      isTourActive: false,
      
      startTour: () => set({ isTourActive: true, tourStep: 0 }),
      
      completeTour: () => set({ 
        hasCompletedTour: true, 
        isTourActive: false,
        tourStep: 0 
      }),
      
      resetTour: () => set({ 
        hasCompletedTour: false, 
        tourStep: 0,
        isTourActive: false 
      }),
      
      setTourStep: (step: number) => set({ tourStep: step }),
      
      closeTour: () => set({ isTourActive: false }),
    }),
    {
      name: 'healthdata-onboarding',
    }
  )
)

