import { create } from "zustand"
import { persist } from "zustand/middleware"

export type SubscriptionPlan = "free" | "pro" | "enterprise"

export interface SubscriptionFeatures {
  maxSearches: number
  advancedFilters: boolean
  apiAccess: boolean
  exportData: boolean
  insights: boolean
  aiAssistant: boolean
  customReports: boolean
  prioritySupport: boolean
  dataCatalog: boolean
  entityNews: boolean
  savedSearches: boolean
  intentSignals: boolean
}

interface SubscriptionState {
  plan: SubscriptionPlan
  features: SubscriptionFeatures
  isSubscribed: boolean
  stripeCustomerId: string | null
  subscriptionId: string | null
  currentPeriodEnd: Date | null
  
  // Actions
  setPlan: (plan: SubscriptionPlan) => void
  updateSubscription: (data: Partial<SubscriptionState>) => void
  checkFeatureAccess: (feature: keyof SubscriptionFeatures) => boolean
  canAccessFeature: (feature: keyof SubscriptionFeatures) => boolean
}

const PLAN_FEATURES: Record<SubscriptionPlan, SubscriptionFeatures> = {
  free: {
    maxSearches: 10,
    advancedFilters: false,
    apiAccess: false,
    exportData: false,
    insights: false,
    aiAssistant: false,
    customReports: false,
    prioritySupport: false,
    dataCatalog: false,
    entityNews: false,
    savedSearches: false,
    intentSignals: false,
  },
  pro: {
    maxSearches: 1000,
    advancedFilters: true,
    apiAccess: true,
    exportData: true,
    insights: true,
    aiAssistant: true,
    customReports: false,
    prioritySupport: false,
    dataCatalog: true,
    entityNews: true,
    savedSearches: true,
    intentSignals: true,
  },
  enterprise: {
    maxSearches: Infinity,
    advancedFilters: true,
    apiAccess: true,
    exportData: true,
    insights: true,
    aiAssistant: true,
    customReports: true,
    prioritySupport: true,
    dataCatalog: true,
    entityNews: true,
    savedSearches: true,
    intentSignals: true,
  },
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      plan: "free",
      features: PLAN_FEATURES.free,
      isSubscribed: false,
      stripeCustomerId: null,
      subscriptionId: null,
      currentPeriodEnd: null,

      setPlan: (plan) => {
        console.log("📊 Setting plan to:", plan)
        set({
          plan,
          features: PLAN_FEATURES[plan],
          isSubscribed: plan !== "free",
        })
      },

      updateSubscription: (data) => {
        set(data)
      },

      checkFeatureAccess: (feature) => {
        const { features, plan } = get()
        // Enterprise and Pro users have full access to everything
        if (plan === "enterprise" || plan === "pro") {
          return true
        }
        return features[feature] === true || features[feature] > 0
      },

      canAccessFeature: (feature) => {
        const { plan } = get()
        // Enterprise and Pro users bypass all checks
        if (plan === "enterprise" || plan === "pro") {
          return true
        }
        return get().checkFeatureAccess(feature)
      },
    }),
    {
      name: "subscription-storage",
    }
  )
)
