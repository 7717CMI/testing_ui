"use client"

import { Lock, Sparkles, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { motion } from "framer-motion"

interface PremiumLockProps {
  featureName: string
  featureDescription?: string
  benefits?: string[]
}

export function PremiumLock({ 
  featureName, 
  featureDescription = "This feature is available for Pro and Enterprise subscribers.",
  benefits = []
}: PremiumLockProps) {
  const defaultBenefits = [
    "Unlimited access to all features",
    "Advanced analytics and insights",
    "Priority support",
    "Export capabilities",
    "API access"
  ]

  const displayBenefits = benefits.length > 0 ? benefits : defaultBenefits

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-background to-secondary-50 dark:from-primary-950 dark:via-background dark:to-secondary-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-2 border-primary/20 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Lock className="h-20 w-20 text-muted-foreground opacity-20" />
                <Sparkles className="h-8 w-8 text-primary absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
            <CardTitle className="text-3xl mb-2">Premium Feature</CardTitle>
            <CardDescription className="text-lg">
              {featureName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center text-muted-foreground">
              <p className="text-base mb-4">{featureDescription}</p>
              <p className="text-sm">Upgrade to Pro or Enterprise to unlock this feature and more.</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-center mb-4">What you'll get with Premium:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {displayBenefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/pricing">
                  View Pricing Plans
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/account">
                  Manage Subscription
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  Pro: $99/month
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Enterprise: Custom
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}



