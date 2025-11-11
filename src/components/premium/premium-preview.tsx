"use client"

import { Lock, Sparkles, Check, Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { motion } from "framer-motion"
import { Navbar } from "@/components/shared/navbar"

interface PremiumPreviewProps {
  featureName: string
  featureDescription: string
  pageContent?: React.ReactNode
  previewData?: {
    headers?: string[]
    sampleRows?: number
    blurred?: boolean
  }
  benefits?: string[]
}

export function PremiumPreview({ 
  featureName, 
  featureDescription,
  pageContent,
  previewData,
  benefits = []
}: PremiumPreviewProps) {
  const defaultBenefits = [
    "Unlimited access to all features",
    "Advanced analytics and insights",
    "Priority support",
    "Export capabilities",
    "API access"
  ]

  const displayBenefits = benefits.length > 0 ? benefits : defaultBenefits

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 dark:from-background dark:via-primary-950 dark:to-secondary-950">
        <div className="container mx-auto px-4 lg:px-8 py-12 max-w-7xl">
          {/* Page Description Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{featureName}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {featureDescription}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p className="text-base leading-relaxed">
                    {featureDescription}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview Content */}
          {pageContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8 relative"
            >
              <div className="relative">
                {/* Preview content with blur */}
                <div className="opacity-40 blur-md pointer-events-none select-none overflow-hidden" style={{ maxHeight: '600px' }}>
                  {pageContent}
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background z-10 pointer-events-none" />

                {/* Overlay message - centered */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <Card className="border-2 border-primary shadow-2xl max-w-lg mx-4 bg-background/95 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                      <div className="flex justify-center mb-4">
                        <div className="relative">
                          <EyeOff className="h-16 w-16 text-muted-foreground opacity-50" />
                          <Lock className="h-8 w-8 text-primary absolute -top-2 -right-2 animate-pulse" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Preview Data</h3>
                      <p className="text-muted-foreground mb-6 text-base">
                        To preview the full data and access all features, you need to buy a subscription.
                      </p>
                      <Button asChild size="lg" className="w-full">
                        <Link href="/pricing">
                          Buy Subscription
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>What you'll get with Premium:</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayBenefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 text-center"
          >
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
            <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                Pro: $99/month
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Enterprise: Custom
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

