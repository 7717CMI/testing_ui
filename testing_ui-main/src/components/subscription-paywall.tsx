"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, Building2, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { SubscriptionFeatures } from "@/stores/subscription-store"

interface SubscriptionPaywallProps {
  isOpen: boolean
  onClose: () => void
  feature: keyof SubscriptionFeatures
  featureName: string
}

export function SubscriptionPaywall({
  isOpen,
  onClose,
  feature,
  featureName,
}: SubscriptionPaywallProps) {
  const router = useRouter()

  function handleUpgrade(plan: "pro" | "enterprise") {
    onClose()
    router.push(`/pricing?plan=${plan}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Unlock {featureName}</DialogTitle>
          <DialogDescription>
            This feature requires a subscription. Choose a plan to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Pro Plan */}
          <div className="border-2 border-primary-500 rounded-xl p-6 relative">
            <Badge className="absolute -top-3 left-4 bg-primary-500">Most Popular</Badge>
            <div className="flex items-center gap-3 mb-4">
              <Zap className="h-8 w-8 text-primary-500" />
              <div>
                <h3 className="text-xl font-bold">Pro</h3>
                <p className="text-sm text-muted-foreground">For professionals</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold">$99</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <Button onClick={() => handleUpgrade("pro")} className="w-full mb-6" size="lg">
              Upgrade to Pro
            </Button>

            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm">Unlimited searches</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm">Advanced filters & analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm">AI Assistant access</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm">Data export (CSV, Excel)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm">Real-time insights</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm">Priority support</span>
              </li>
            </ul>
          </div>

          {/* Enterprise Plan */}
          <div className="border-2 rounded-xl p-6 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="h-8 w-8 text-accent-500" />
              <div>
                <h3 className="text-xl font-bold">Enterprise</h3>
                <p className="text-sm text-muted-foreground">For large teams</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold">Custom</span>
            </div>

            <Button onClick={() => handleUpgrade("enterprise")} variant="outline" className="w-full mb-6" size="lg">
              Contact Sales
            </Button>

            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-accent-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-semibold">Everything in Pro, plus:</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm">API access</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm">Custom integrations</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm">Custom reports</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm">Dedicated support</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm">SLA guarantee</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm">Training & onboarding</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            Need more information?{" "}
            <button
              onClick={() => router.push("/pricing")}
              className="text-primary-500 hover:underline font-medium"
            >
              Compare all plans
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
