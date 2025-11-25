import { useState } from "react"
import { useSubscriptionStore, SubscriptionFeatures } from "@/stores/subscription-store"
import { toast } from "sonner"

export function useFeatureGate() {
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [blockedFeature, setBlockedFeature] = useState<{
    key: keyof SubscriptionFeatures
    name: string
  } | null>(null)
  
  const { canAccessFeature } = useSubscriptionStore()

  function checkAccess(feature: keyof SubscriptionFeatures, featureName: string): boolean {
    if (canAccessFeature(feature)) {
      return true
    }

    // Show paywall
    setBlockedFeature({ key: feature, name: featureName })
    setPaywallOpen(true)
    toast.error(`${featureName} requires a subscription`)
    return false
  }

  function closePaywall() {
    setPaywallOpen(false)
    setBlockedFeature(null)
  }

  return {
    checkAccess,
    paywallOpen,
    blockedFeature,
    closePaywall,
  }
}
