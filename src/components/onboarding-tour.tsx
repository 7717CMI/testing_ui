'use client'

import { useEffect, useRef } from 'react'
import { driver, DriveStep, Config } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { usePathname } from 'next/navigation'

export function OnboardingTour() {
  const pathname = usePathname()
  const { isTourActive, hasCompletedTour, completeTour, closeTour } = useOnboardingStore()
  const driverObj = useRef<ReturnType<typeof driver> | null>(null)

  useEffect(() => {
    // Don't initialize if tour is not active
    if (!isTourActive) {
      if (driverObj.current) {
        driverObj.current.destroy()
        driverObj.current = null
      }
      return
    }

    // Define tour steps based on current page
    const steps: DriveStep[] = getStepsForPage(pathname)

    // Configure driver.js with professional styling
    const driverConfig: Config = {
      showProgress: true,
      animate: true,
      overlayOpacity: 0.75,
      smoothScroll: true,
      allowClose: true,
      showButtons: ['next', 'previous', 'close'],
      progressText: 'Step {{current}} of {{total}}',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Finish ✓',
      
      onDestroyed: () => {
        completeTour()
      },
      
      onCloseClick: () => {
        closeTour()
        if (driverObj.current) {
          driverObj.current.destroy()
        }
      },
      
      steps,
    }

    // Initialize driver
    driverObj.current = driver(driverConfig)
    driverObj.current.drive()

    // Cleanup on unmount
    return () => {
      if (driverObj.current) {
        driverObj.current.destroy()
        driverObj.current = null
      }
    }
  }, [isTourActive, pathname, completeTour, closeTour])

  return null
}

// Define steps for each page
function getStepsForPage(pathname: string): DriveStep[] {
  // Home/Dashboard page
  if (pathname === '/' || pathname === '/dashboard') {
    return [
      {
        element: 'nav',
        popover: {
          title: 'Welcome to HealthData AI! 👋',
          description: 'Let me show you around the most comprehensive healthcare intelligence platform in America. This quick tour will help you get started.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '[href="/data-catalog"]',
        popover: {
          title: 'Data Catalog 📚',
          description: 'Access verified data on 658,859+ healthcare providers across the US. Browse by category, filter by location, and export custom datasets as CSV.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[href="/insights"]',
        popover: {
          title: 'Healthcare Insights 📰',
          description: 'Stay updated with real-time healthcare news, market intelligence, and industry trends. Get AI-powered analysis with sales-focused recommendations.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[href="/bookmarks"]',
        popover: {
          title: 'Bookmarks 🔖',
          description: 'Save and track your favorite healthcare facilities. View news timelines, search within your bookmarks, and monitor competitor activity.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[href="/search"]',
        popover: {
          title: 'Smart Search 🔍',
          description: 'Use natural language to find facilities. Our AI understands queries like "urgent care centers in Texas" and combines database + web knowledge.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '.fixed.bottom-8.right-8',
        popover: {
          title: 'AI Assistant 💬',
          description: 'Need help? Click here anytime to chat with our AI assistant. Ask questions about features, get guidance, or navigate the platform.',
          side: 'left',
          align: 'center',
        },
      },
      {
        popover: {
          title: 'You\'re All Set! 🎉',
          description: 'You now know the basics of HealthData AI. Click on any feature to get started. You can replay this tour anytime from the Help button in the navigation bar.',
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
          title: 'Data Catalog Overview 📚',
          description: 'Welcome to the heart of HealthData AI! Here you\'ll find 658,859+ verified healthcare providers organized by category.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: 'input[type="text"]',
        popover: {
          title: 'Search Categories 🔍',
          description: 'Quickly find specific facility categories by typing here. Try searching for "hospital" or "pharmacy".',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '.bg-gradient-to-br',
        popover: {
          title: 'Custom Dataset Builder 🎯',
          description: 'Create filtered datasets by state, city, facility type, and more. Perfect for targeted campaigns and market analysis.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '.grid',
        popover: {
          title: 'Browse by Category 📋',
          description: 'Each card shows a category with live provider counts. Click any card to drill down into specific facility types.',
          side: 'top',
          align: 'center',
        },
      },
    ]
  }

  // Insights page
  if (pathname === '/insights') {
    return [
      {
        element: '.max-w-7xl',
        popover: {
          title: 'Healthcare Insights Hub 📰',
          description: 'Real-time news and market intelligence powered by Perplexity AI. Stay ahead of industry trends and identify sales opportunities.',
          side: 'top',
          align: 'center',
        },
      },
      {
        popover: {
          title: 'Insights Page Features 🎯',
          description: 'Use the Refresh button to get latest news, filter by category tabs, and click "Read More" on articles for detailed analysis with sales recommendations.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '[role="tablist"]',
        popover: {
          title: 'Filter by Category 🏷️',
          description: 'Browse insights by type: Expansion, Technology, M&A, Policy, Funding, and more. Focus on what matters to your business.',
          side: 'bottom',
          align: 'center',
        },
      },
    ]
  }

  // Bookmarks page
  if (pathname === '/bookmarks') {
    return [
      {
        element: '.max-w-7xl',
        popover: {
          title: 'Your Bookmarks 🔖',
          description: 'Track competitor facilities, monitor prospects, and stay updated on organizations in your territory.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: 'input[type="text"]',
        popover: {
          title: 'Search Bookmarks 🔍',
          description: 'Quickly find specific facilities in your saved bookmarks by name, location, or category. You can also search news for bookmarked facilities.',
          side: 'bottom',
          align: 'start',
        },
      },
    ]
  }

  // Smart Search page
  if (pathname === '/search') {
    return [
      {
        element: '.max-w-4xl',
        popover: {
          title: 'Smart Search 🔍',
          description: 'Our AI-powered search understands natural language. No need for complex filters—just ask what you\'re looking for.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: 'input[type="text"]',
        popover: {
          title: 'Natural Language Queries 💬',
          description: 'Try queries like "urgent care centers in California" or "hospitals with over 500 beds". The AI will understand and find matches.',
          side: 'bottom',
          align: 'center',
        },
      },
    ]
  }

  // Default tour for other pages
  return [
    {
      popover: {
        title: 'HealthData AI Tour 🎯',
        description: 'Navigate to the home page, data catalog, insights, bookmarks, or search to explore specific features with guided tours.',
      },
    },
  ]
}

