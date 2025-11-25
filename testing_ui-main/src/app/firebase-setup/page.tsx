"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Building2, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { toast } from "sonner"

export default function FirebaseTestPage() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>("")
  const [error, setError] = useState<string>("")

  async function createDemoUser() {
    setLoading(true)
    setError("")
    setStatus("Creating demo user...")

    try {
      // Create demo user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        "demo@healthdata.com",
        "demo123"
      )
      
      setStatus("✅ Demo user created in Firebase Authentication!")

      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: "demo@healthdata.com",
        name: "Demo User",
        createdAt: new Date().toISOString(),
        emailVerified: false,
        role: "Admin"
      })

      setStatus("✅ User document created in Firestore!")

      // Create subscription document with Enterprise plan
      await setDoc(doc(db, "subscriptions", userCredential.user.uid), {
        plan: "enterprise",
        status: "active",
        createdAt: new Date().toISOString(),
        note: "Demo account with full enterprise access"
      })

      setStatus("✅ DEMO USER CREATED SUCCESSFULLY! 🎉")
      toast.success("Demo user created! You can now login with demo@healthdata.com / demo123")

    } catch (error: any) {
      console.error("Error creating demo user:", error)
      
      if (error.code === "auth/email-already-in-use") {
        setStatus("✅ Demo user already exists!")
        toast.info("Demo user already exists. You can login now.")
      } else {
        setError(`Error: ${error.message}`)
        toast.error("Failed to create demo user. Check console for details.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-background to-secondary-50 dark:from-primary-950 dark:via-background dark:to-secondary-950 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-8 w-8 text-primary-500" />
            <CardTitle className="text-2xl">Firebase Authentication Setup</CardTitle>
          </div>
          <CardDescription>
            Create the demo user account in Firebase Authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Demo Credentials */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Demo Account Credentials
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Email</Badge>
                <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                  demo@healthdata.com
                </code>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Password</Badge>
                <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                  demo123
                </code>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Plan</Badge>
                <Badge className="bg-purple-600">ENTERPRISE</Badge>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <Button 
            onClick={createDemoUser} 
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Demo User...
              </>
            ) : (
              "Create Demo User in Firebase"
            )}
          </Button>

          {/* Status */}
          {status && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">Success!</p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">{status}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-100">Error</p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2">What This Does:</h3>
            <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
              <li>✓ Creates demo@healthdata.com user in Firebase Authentication</li>
              <li>✓ Sets password to: demo123</li>
              <li>✓ Creates user profile in Firestore</li>
              <li>✓ Assigns ENTERPRISE plan automatically</li>
              <li>✓ Enables full access to all features</li>
            </ul>
          </div>

          {/* Next Steps */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">After Creating Demo User:</h3>
            <ol className="text-sm space-y-2 text-gray-700 dark:text-gray-300 list-decimal list-inside">
              <li>Click "Create Demo User in Firebase" button above</li>
              <li>Wait for success message</li>
              <li>Go to <a href="/" className="text-primary-500 hover:underline">Home Page</a></li>
              <li>Click Login</li>
              <li>Use demo@healthdata.com / demo123</li>
              <li>You should see ENTERPRISE badge and full access!</li>
            </ol>
          </div>

          {/* Links */}
          <div className="flex gap-4 pt-4 border-t">
            <Button variant="outline" asChild className="flex-1">
              <a href="/">Back to Home</a>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <a href="/login">Go to Login</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}










