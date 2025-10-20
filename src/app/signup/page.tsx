"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Chrome, Github, Check, X } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"Admin" | "Analyst" | "Viewer" | null>(null)
  const [plan, setPlan] = useState<"Free" | "Pro" | "Enterprise" | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const router = useRouter()

  function validateStep1() {
    const newErrors: Record<string, string> = {}
    
    if (!name) {
      newErrors.name = "Name is required"
    }
    
    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format"
    }
    
    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleNext() {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && role) {
      setStep(3)
    }
  }

  async function handleSubmit() {
    if (!plan) return
    
    setLoading(true)
    try {
      // Mock signup API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Account created! Check your email for verification.")
      router.push("/login")
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function getPasswordStrength() {
    if (!password) return { strength: 0, label: "", color: "" }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    
    if (strength <= 2) return { strength, label: "Weak", color: "bg-destructive" }
    if (strength <= 3) return { strength, label: "Fair", color: "bg-warning" }
    if (strength <= 4) return { strength, label: "Good", color: "bg-info" }
    return { strength, label: "Strong", color: "bg-success" }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-background to-secondary-50 dark:from-primary-950 dark:via-background dark:to-secondary-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary-500" />
            <span className="font-bold text-2xl gradient-text">HealthData</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
            <CardDescription className="text-center">
              Step {step} of 3 - {step === 1 ? "Account Info" : step === 2 ? "Role Selection" : "Choose Plan"}
            </CardDescription>
            {/* Progress Bar */}
            <div className="flex gap-2 pt-4">
              <div className={`h-1 flex-1 rounded ${step >= 1 ? "bg-primary-500" : "bg-muted"}`} />
              <div className={`h-1 flex-1 rounded ${step >= 2 ? "bg-primary-500" : "bg-muted"}`} />
              <div className={`h-1 flex-1 rounded ${step >= 3 ? "bg-primary-500" : "bg-muted"}`} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                />
                
                <Input
                  type="email"
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />
                
                <div>
                  <Input
                    type="password"
                    label="Password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                  />
                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded ${
                              i < passwordStrength.strength ? passwordStrength.color : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Password strength: {passwordStrength.label}
                      </p>
                    </div>
                  )}
                </div>
                
                <Input
                  type="password"
                  label="Confirm Password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                />

                <Button onClick={handleNext} className="w-full" size="lg">
                  Continue
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" disabled>
                    <Chrome className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                  <Button variant="outline" disabled>
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <button
                    onClick={() => setRole("Admin")}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      role === "Admin" ? "border-primary-500 bg-primary-50 dark:bg-primary-950" : "border-border hover:border-primary-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">Admin</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Full access to all features and settings
                        </p>
                      </div>
                      {role === "Admin" && <Check className="h-5 w-5 text-primary-500" />}
                    </div>
                  </button>

                  <button
                    onClick={() => setRole("Analyst")}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      role === "Analyst" ? "border-primary-500 bg-primary-50 dark:bg-primary-950" : "border-border hover:border-primary-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">Analyst</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Access to search, insights, and analytics
                        </p>
                      </div>
                      {role === "Analyst" && <Check className="h-5 w-5 text-primary-500" />}
                    </div>
                  </button>

                  <button
                    onClick={() => setRole("Viewer")}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      role === "Viewer" ? "border-primary-500 bg-primary-50 dark:bg-primary-950" : "border-border hover:border-primary-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">Viewer</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          View-only access to reports and data
                        </p>
                      </div>
                      {role === "Viewer" && <Check className="h-5 w-5 text-primary-500" />}
                    </div>
                  </button>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setStep(1)} variant="outline" className="w-full">
                    Back
                  </Button>
                  <Button onClick={handleNext} className="w-full" disabled={!role}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <button
                    onClick={() => setPlan("Free")}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      plan === "Free" ? "border-primary-500 bg-primary-50 dark:bg-primary-950" : "border-border hover:border-primary-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">Free</h4>
                        <p className="text-2xl font-bold mt-1">$0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                        <p className="text-sm text-muted-foreground mt-2">
                          100 searches, basic data access
                        </p>
                      </div>
                      {plan === "Free" && <Check className="h-5 w-5 text-primary-500" />}
                    </div>
                  </button>

                  <button
                    onClick={() => setPlan("Pro")}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all relative ${
                      plan === "Pro" ? "border-primary-500 bg-primary-50 dark:bg-primary-950" : "border-border hover:border-primary-300"
                    }`}
                  >
                    <Badge className="absolute -top-2 right-4 bg-primary-500 text-white">Popular</Badge>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">Pro</h4>
                        <p className="text-2xl font-bold mt-1">$99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Unlimited searches, AI assistant, full analytics
                        </p>
                      </div>
                      {plan === "Pro" && <Check className="h-5 w-5 text-primary-500" />}
                    </div>
                  </button>

                  <button
                    onClick={() => setPlan("Enterprise")}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      plan === "Enterprise" ? "border-primary-500 bg-primary-50 dark:bg-primary-950" : "border-border hover:border-primary-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">Enterprise</h4>
                        <p className="text-2xl font-bold mt-1">Custom</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          API access, custom integrations, dedicated support
                        </p>
                      </div>
                      {plan === "Enterprise" && <Check className="h-5 w-5 text-primary-500" />}
                    </div>
                  </button>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setStep(2)} variant="outline" className="w-full">
                    Back
                  </Button>
                  <Button onClick={handleSubmit} className="w-full" disabled={!plan} loading={loading}>
                    Create Account
                  </Button>
                </div>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary-500 hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}

