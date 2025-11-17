"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Check, X, Zap, Crown, Sparkles, ArrowRight } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useSubscriptionStore } from "@/stores/subscription-store"
import { toast } from "sonner"

export default function PricingPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { plan: currentPlan } = useSubscriptionStore()
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly")

  function handleUpgrade(planType: "free" | "pro" | "enterprise") {
    if (!user) {
      toast.info("Please sign in to upgrade your plan")
      router.push("/login")
      return
    }

    if (currentPlan === planType) {
      toast.info(`You're already on the ${planType.toUpperCase()} plan`)
      return
    }

    if (planType === "free") {
      toast.info("You're already on the Free plan. Explore our paid plans for more features!")
      return
    }

    // In production, this would redirect to Stripe checkout
    toast.success(`Initiating ${planType.toUpperCase()} plan subscription...`)
    console.log(`User ${user.email} wants to upgrade to ${planType}`)
    
    // Simulate redirect to payment
    // router.push(`/api/stripe/checkout?plan=${planType}&period=${billingPeriod}`)
  }

  const plans = [
    {
      id: "free",
      name: "Free",
      description: "Perfect for exploring",
      monthlyPrice: 0,
      annualPrice: 0,
      badge: null,
      popular: false,
      features: [
        { text: "100 searches per month", included: true },
        { text: "Basic facility data", included: true },
        { text: "Limited filters", included: true },
        { text: "Community support", included: true },
        { text: "Advanced analytics", included: false },
        { text: "AI assistant", included: false },
        { text: "Export data", included: false },
        { text: "API access", included: false },
      ],
      cta: "Get Started Free",
      color: "border-gray-300 dark:border-gray-700",
      buttonVariant: "outline" as const,
    },
    {
      id: "pro",
      name: "Pro",
      description: "For professionals",
      monthlyPrice: 99,
      annualPrice: 990,
      badge: "Most Popular",
      popular: true,
      features: [
        { text: "Unlimited searches", included: true },
        { text: "Complete facility database", included: true },
        { text: "Advanced filters", included: true },
        { text: "Priority support", included: true },
        { text: "Advanced analytics", included: true },
        { text: "AI assistant access", included: true },
        { text: "Export to CSV/Excel", included: true },
        { text: "Saved searches", included: true },
        { text: "API access", included: false },
        { text: "Custom integrations", included: false },
      ],
      cta: "Upgrade to Pro",
      color: "border-blue-500 dark:border-blue-400",
      buttonVariant: "default" as const,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For large organizations",
      monthlyPrice: null,
      annualPrice: null,
      badge: "Custom",
      popular: false,
      features: [
        { text: "Everything in Pro", included: true },
        { text: "Unlimited team members", included: true },
        { text: "API access", included: true },
        { text: "Custom integrations", included: true },
        { text: "Dedicated support", included: true },
        { text: "Custom reports", included: true },
        { text: "SLA guarantee", included: true },
        { text: "Training & onboarding", included: true },
        { text: "Custom contract", included: true },
      ],
      cta: "Contact Sales",
      color: "border-purple-500 dark:border-purple-400",
      buttonVariant: "outline" as const,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary-50/5 to-muted dark:via-primary-950/10">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary-500" />
              <span className="font-bold text-xl gradient-text">HealthData</span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Badge className={
                    currentPlan === "enterprise" ? "bg-purple-600" :
                    currentPlan === "pro" ? "bg-blue-600" : "bg-gray-600"
                  }>
                    {currentPlan?.toUpperCase() || "FREE"}
                  </Badge>
                  <Link href="/">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button>Start Free Trial</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Transparent Pricing
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              Choose the plan that's{" "}
              <span className="gradient-text">right for you</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Start free, scale as you grow. All plans include access to our comprehensive healthcare database.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm font-medium ${billingPeriod === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "annual" : "monthly")}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                style={{ backgroundColor: billingPeriod === "annual" ? "#3B82F6" : "#D1D5DB" }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingPeriod === "annual" ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${billingPeriod === "annual" ? "text-foreground" : "text-muted-foreground"}`}>
                Annual
                <Badge className="ml-2 bg-green-500 text-white">Save 20%</Badge>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="w-full px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const price = billingPeriod === "monthly" ? plan.monthlyPrice : plan.annualPrice
              const isCurrentPlan = user && currentPlan === plan.id

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative ${plan.popular ? "md:-mt-4" : ""}`}
                >
                  <Card className={`h-full relative overflow-hidden ${plan.color} ${
                    plan.popular ? "border-2 shadow-2xl" : "border"
                  }`}>
                    {plan.popular && (
                      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-2 text-sm font-semibold">
                        🔥 {plan.badge}
                      </div>
                    )}
                    
                    <CardHeader className={plan.popular ? "pt-12" : ""}>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        {plan.badge && !plan.popular && (
                          <Badge variant="secondary">{plan.badge}</Badge>
                        )}
                      </div>
                      <CardDescription>{plan.description}</CardDescription>
                      
                      <div className="mt-4">
                        {price !== null ? (
                          <>
                            <div className="flex items-baseline gap-2">
                              <span className="text-5xl font-bold">${price}</span>
                              <span className="text-muted-foreground">
                                /{billingPeriod === "monthly" ? "mo" : "year"}
                              </span>
                            </div>
                            {billingPeriod === "annual" && plan.monthlyPrice !== 0 && (
                              <p className="text-sm text-muted-foreground mt-2">
                                ${(price / 12).toFixed(0)}/month billed annually
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="text-4xl font-bold">Custom</div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <Button
                        onClick={() => handleUpgrade(plan.id as any)}
                        variant={plan.buttonVariant}
                        className={`w-full mb-6 ${
                          plan.popular ? "bg-blue-600 hover:bg-blue-700 text-white" : ""
                        } ${isCurrentPlan ? "bg-green-600 hover:bg-green-700" : ""}`}
                        size="lg"
                        disabled={isCurrentPlan}
                      >
                        {isCurrentPlan ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Current Plan
                          </>
                        ) : (
                          <>
                            {plan.cta}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>

                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-muted-foreground mb-3">
                          What's included:
                        </p>
                        {plan.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-3">
                            {feature.included ? (
                              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            )}
                            <span className={`text-sm ${
                              feature.included ? "text-foreground" : "text-muted-foreground"
                            }`}>
                              {feature.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid gap-6">
            {[
              {
                q: "Can I switch plans anytime?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards (Visa, MasterCard, Amex) and offer invoicing for Enterprise customers.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes! Our Free plan is available forever with no credit card required. You can upgrade anytime.",
              },
              {
                q: "Do you offer refunds?",
                a: "Yes, we offer a 30-day money-back guarantee for all paid plans.",
              },
              {
                q: "What happens if I cancel?",
                a: "You can cancel anytime. You'll retain access until the end of your billing period.",
              },
              {
                q: "Do you offer discounts for non-profits?",
                a: "Yes! We offer special pricing for non-profits and educational institutions. Contact us for details.",
              },
            ].map((faq, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of healthcare professionals using HealthData AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gradient-primary">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 HealthData AI. All rights reserved.</p>
            <div className="flex justify-center gap-6 mt-4">
              <Link href="/terms" className="hover:text-foreground">Terms</Link>
              <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
              <Link href="/contact" className="hover:text-foreground">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}







