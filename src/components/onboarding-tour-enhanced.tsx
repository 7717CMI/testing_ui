'use client'

import { useEffect, useRef, useState } from 'react'
import { driver, DriveStep, Config } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Lenis from 'lenis'

export function OnboardingTourEnhanced() {
  const pathname = usePathname()
  const router = useRouter()
  const { isTourActive, hasCompletedTour, completeTour, closeTour } = useOnboardingStore()
  const driverObj = useRef<ReturnType<typeof driver> | null>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  // Initialize Lenis for smooth scrolling during tour
  useEffect(() => {
    if (isTourActive && !lenisRef.current) {
      lenisRef.current = new Lenis({
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.8,
      })

      function raf(time: number) {
        if (lenisRef.current) {
          lenisRef.current.raf(time)
          requestAnimationFrame(raf)
        }
      }
      requestAnimationFrame(raf)
    }

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }
    }
  }, [isTourActive])

  useEffect(() => {
    if (!isTourActive) {
      if (driverObj.current) {
        driverObj.current.destroy()
        driverObj.current = null
      }
      return
    }

    // Get steps for current page
    const steps: DriveStep[] = getStepsForPage(pathname)

    // Enhanced driver.js configuration with buttery smooth animations
    const driverConfig: Config = {
      showProgress: true,
      animate: true,
      overlayOpacity: 0.85,
      smoothScroll: true,
      allowClose: true,
      showButtons: ['next', 'previous', 'close'],
      progressText: 'Step {{current}} of {{total}}',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Finish ✓',
      
      // Smooth scroll to element
      onHighlightStarted: (element) => {
        if (lenisRef.current && element) {
          const rect = element.getBoundingClientRect()
          const scrollY = window.scrollY + rect.top - window.innerHeight / 2 + rect.height / 2
          
          lenisRef.current.scrollTo(scrollY, {
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          })
        }
      },

      onHighlighted: (element) => {
        // Add smooth pulse animation to highlighted element
        if (element) {
          element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          element.style.transform = 'scale(1.02)'
          setTimeout(() => {
            element.style.transform = 'scale(1)'
          }, 300)
        }
      },

      onDeselected: (element) => {
        if (element) {
          element.style.transform = 'scale(1)'
        }
      },

      onDestroyed: () => {
        completeTour()
        if (lenisRef.current) {
          lenisRef.current.destroy()
          lenisRef.current = null
        }
      },

      onCloseClick: () => {
        closeTour()
        if (driverObj.current) {
          driverObj.current.destroy()
        }
        if (lenisRef.current) {
          lenisRef.current.destroy()
          lenisRef.current = null
        }
      },

      onNextClick: () => {
        setCurrentStep((prev) => prev + 1)
      },

      onPreviousClick: () => {
        setCurrentStep((prev) => Math.max(0, prev - 1))
      },

      steps,
    }

    // Initialize driver with delay for smooth entrance
    setTimeout(() => {
      driverObj.current = driver(driverConfig)
      driverObj.current.drive()
    }, 300)

    return () => {
      if (driverObj.current) {
        driverObj.current.destroy()
        driverObj.current = null
      }
    }
  }, [isTourActive, pathname, completeTour, closeTour])

  return null
}

// Enhanced tour steps with smooth transitions
function getStepsForPage(pathname: string): DriveStep[] {
  // Home/Dashboard page - Comprehensive tour
  if (pathname === '/' || pathname === '/dashboard') {
    return [
      {
        element: 'nav',
        popover: {
          title: '👋 Welcome to HealthData AI!',
          description: 'Let me guide you through the most comprehensive healthcare intelligence platform. This smooth tour will show you everything you need to know.',
          side: 'bottom',
          align: 'center',
          className: 'tour-popover-enhanced',
        },
      },
      {
        element: '[href="/data-catalog"]',
        popover: {
          title: '📚 Data Catalog - Your Starting Point',
          description: 'Access verified data on 658,859+ healthcare providers across the US. Browse by category, filter by location, and export custom datasets. This is where your journey begins!',
          side: 'bottom',
          align: 'start',
          className: 'tour-popover-enhanced',
        },
      },
      {
        element: '[href="/insights"]',
        popover: {
          title: '📰 Healthcare Insights - Stay Ahead',
          description: 'Real-time healthcare news, market intelligence, and industry trends powered by AI. Get sales-focused recommendations and identify opportunities before your competitors.',
          side: 'bottom',
          align: 'start',
          className: 'tour-popover-enhanced',
        },
      },
      {
        element: '[href="/bookmarks"]',
        popover: {
          title: '🔖 Bookmarks - Track What Matters',
          description: 'Save and monitor your favorite healthcare facilities. View news timelines, search within bookmarks, and track competitor activity. Your personal intelligence hub!',
          side: 'bottom',
          align: 'start',
          className: 'tour-popover-enhanced',
        },
      },
      {
        element: '[href="/search"]',
        popover: {
          title: '🔍 Smart Search - Ask Naturally',
          description: 'Use natural language to find facilities. Try "urgent care centers in Texas" or "hospitals with over 500 beds". Our AI understands context and intent.',
          side: 'bottom',
          align: 'start',
          className: 'tour-popover-enhanced',
        },
      },
      {
        element: '.fixed.bottom-8.right-8, [data-ai-assistant]',
        popover: {
          title: '💬 AI Assistant - Your Guide',
          description: 'Need help? Click here anytime to chat with our AI assistant. Ask questions, get feature guidance, or navigate the platform. Available 24/7!',
          side: 'left',
          align: 'center',
          className: 'tour-popover-enhanced',
        },
      },
      {
        popover: {
          title: '🎉 You\'re All Set!',
          description: 'You now know the essentials of HealthData AI. Start exploring any feature—each one is designed to help you make data-driven decisions. You can replay this tour anytime from the Help button!',
          className: 'tour-popover-enhanced',
        },
      },
    ]
  }

  // Data Catalog page
  if (pathname === '/data-catalog') {
    return [
      {
        element: '.container',
        popover: {
          title: '📚 Data Catalog Overview',
          description: 'Welcome to the heart of HealthData AI! Here you\'ll find 658,859+ verified healthcare providers organized by category. Let\'s explore what you can do here.',
          side: 'top',
          align: 'center',
          className: 'tour-popover-enhanced',
        },
      },
      {
        element: 'input[type="text"]',
        popover: {
          title: '🔍 Quick Search',
          description: 'Type here to instantly find specific facility categories. Try "hospital", "pharmacy", or "clinic". The search is fast and intelligent!',
          side: 'bottom',
          align: 'start',
          className: 'tour-popover-enhanced',
        },
      },
      {
        element: '.bg-gradient-to-br',
        popover: {
          title: '🎯 Custom Dataset Builder',
          description: 'Create filtered datasets by state, city, facility type, and more. Perfect for targeted campaigns, market analysis, and competitive intelligence.',
          side: 'top',
          align: 'center',
          className: 'tour-popover-enhanced',
        },
      },
      {
        element: '.grid',
        popover: {
          title: '📋 Browse Categories',
          description: 'Each card shows a category with live provider counts. Click any card to drill down into specific facility types and explore detailed information.',
          side: 'top',
          align: 'center',
          className: 'tour-popover-enhanced',
        },
      },
    ]
  }

  // Insights page
  if (pathname === '/insights') {
    return [
      {
        element: '.max-w-7xl, .container',
        popover: {
          title: '📰 Healthcare Insights Hub',
          description: 'Real-time news and market intelligence powered by advanced AI. Stay ahead of industry trends, identify sales opportunities, and make informed decisions.',
          side: 'top',
          align: 'center',
          className: 'tour-popover-enhanced',
        },
      },
      {
        element: '[role="tablist"]',
        popover: {
          title: '🏷️ Filter by Category',
          description: 'Browse insights by type: Expansion, Technology, M&A, Policy, Funding, and more. Focus on what matters most to your business goals.',
          side: 'bottom',
          align: 'center',
          className: 'tour-popover-enhanced',
        },
      },
      {
        popover: {
          title: '💡 Pro Tip',
          description: 'Use the Refresh button to get the latest news. Click "Read More" on any article for detailed AI-powered analysis with actionable sales recommendations.',
          side: 'bottom',
          align: 'center',
          className: 'tour-popover-enhanced',
        },
      },
    ]
  }

  // Bookmarks page
  if (pathname === '/bookmarks') {
    return [
      {
        element: '.max-w-7xl, .container',
        popover: {
          title: '🔖 Your Bookmarks',
          description: 'Track competitor facilities, monitor prospects, and stay updated on organizations in your territory. Your personal intelligence dashboard!',
          side: 'top',
          align: 'center',
          className: 'tour-popover-enhanced',
        },
      },
      {
        element: 'input[type="text"]',
        popover: {
          title: '🔍 Search Bookmarks',
          description: 'Quickly find specific facilities in your saved bookmarks by name, location, or category. You can also search news specifically for bookmarked facilities.',
          side: 'bottom',
          align: 'start',
          className: 'tour-popover-enhanced',
        },
      },
    ]
  }

  // Smart Search page
  if (pathname === '/search') {
    return [
      {
        element: '.max-w-4xl, .container',
        popover: {
          title: '🔍 Smart Search',
          description: 'Our AI-powered search understands natural language. No need for complex filters—just ask what you\'re looking for in plain English.',
          side: 'top',
          align: 'center',
          className: 'tour-popover-enhanced',
        },
      },
      {
        element: 'input[type="text"], textarea',
        popover: {
          title: '💬 Natural Language Queries',
          description: 'Try queries like "urgent care centers in California" or "hospitals with over 500 beds in New York". The AI understands context and finds perfect matches.',
          side: 'bottom',
          align: 'center',
          className: 'tour-popover-enhanced',
        },
      },
    ]
  }

  // Default tour
  return [
    {
      popover: {
        title: '🎯 HealthData AI Tour',
        description: 'Navigate to the home page, data catalog, insights, bookmarks, or search to explore specific features with guided tours. Each page has its own interactive walkthrough!',
        className: 'tour-popover-enhanced',
      },
    },
  ]
}



