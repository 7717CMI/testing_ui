import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useSubscriptionStore } from '@/stores/subscription-store'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from 'sonner'

export function useSubscription() {
  const { user } = useAuthStore()
  const { plan, setPlan } = useSubscriptionStore()
  const [loading, setLoading] = useState(true)
  const [subscriptionData, setSubscriptionData] = useState<any>(null)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    async function loadSubscription() {
      try {
        setLoading(true)
        const subscriptionDoc = await getDoc(doc(db, 'subscriptions', user.id))
        
        if (subscriptionDoc.exists()) {
          const data = subscriptionDoc.data()
          setSubscriptionData(data)
          
          // Sync with subscription store
          if (data.plan) {
            setPlan(data.plan)
          }
        } else {
          // No subscription found - default to free
          setSubscriptionData({
            plan: 'free',
            status: 'active',
          })
          setPlan('free')
        }
      } catch (error: any) {
        console.error('Error loading subscription:', error)
        toast.error('Failed to load subscription data')
        // Default to free on error
        setPlan('free')
      } finally {
        setLoading(false)
      }
    }

    loadSubscription()
  }, [user?.id, setPlan])

  const planFeatures = {
    free: {
      name: 'Free',
      description: '100 searches per month',
      features: [
        '100 searches per month',
        'Basic data access',
        'Standard support',
      ],
    },
    pro: {
      name: 'Pro',
      description: 'Unlimited searches, AI access',
      features: [
        'Unlimited searches',
        'AI assistant access',
        'Full analytics',
        'Priority support',
        'Export capabilities',
      ],
    },
    enterprise: {
      name: 'Enterprise',
      description: 'Custom enterprise features',
      features: [
        'Unlimited everything',
        'API access',
        'Custom integrations',
        'Dedicated support',
        'Custom reports',
        'Advanced analytics',
      ],
    },
  }

  return {
    plan,
    subscriptionData,
    loading,
    planInfo: planFeatures[plan] || planFeatures.free,
  }
}



