"use client"

import { useSubscriptionStore } from "@/stores/subscription-store"
import { PremiumLock } from "./premium-lock"
import { PremiumPreview } from "./premium-preview"
import { ReactNode } from "react"

interface PremiumGuardProps {
  children: ReactNode
  featureName: string
  featureDescription?: string
  benefits?: string[]
  fallback?: ReactNode
  showPreview?: boolean
  previewContent?: ReactNode
}

export function PremiumGuard({ 
  children, 
  featureName, 
  featureDescription,
  benefits,
  fallback,
  showPreview = true,
  previewContent
}: PremiumGuardProps) {
  const { plan } = useSubscriptionStore()

  // Free users see preview or lock screen
  if (plan === "free") {
    if (fallback) {
      return <>{fallback}</>
    }
    
    // Show preview mode if enabled
    if (showPreview && previewContent) {
      return (
        <PremiumPreview
          featureName={featureName}
          featureDescription={featureDescription || ""}
          pageContent={previewContent}
          benefits={benefits}
        />
      )
    }
    
    // Otherwise show lock screen
    return (
      <PremiumLock 
        featureName={featureName}
        featureDescription={featureDescription}
        benefits={benefits}
      />
    )
  }

  // Pro and Enterprise users see the actual content
  return <>{children}</>
}

