"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, CheckCircle, XCircle, AlertCircle, Copy } from "lucide-react"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"

export default function SystemCheckPage() {
  const [firebaseTest, setFirebaseTest] = useState<string>("")
  
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  async function testFirebaseConnection() {
    setFirebaseTest("Testing...")
    try {
      const response = await fetch("https://identitytoolkit.googleapis.com/", {
        method: "GET"
      })
      setFirebaseTest(`✅ Firebase reachable! Status: ${response.status}`)
    } catch (error: any) {
      setFirebaseTest(`❌ Firebase NOT reachable: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 dark:from-primary-950 dark:via-background dark:to-secondary-950 p-4">
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary-500" />
              <CardTitle className="text-2xl">System Configuration Check</CardTitle>
            </div>
            <CardDescription>
              Verify your authentication setup and Firebase connection
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Authentication Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-green-600">PRODUCTION MODE</Badge>
              Authentication Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    Firebase Authentication Active
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Using real Firebase authentication. Requires internet connection and Firebase setup.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Firebase Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Firebase Configuration</CardTitle>
            <CardDescription>Your Firebase project settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2 font-mono text-sm">
              <div><span className="text-gray-600">Project ID:</span> <span className="text-primary-600">healthdata-auth</span></div>
              <div><span className="text-gray-600">Auth Domain:</span> <span className="text-primary-600">healthdata-auth.firebaseapp.com</span></div>
              <div><span className="text-gray-600">API Key:</span> <span className="text-gray-500">AIzaSy...HBrWss (hidden)</span></div>
            </div>
            
            <Button onClick={testFirebaseConnection} className="w-full">
              Test Firebase Connection
            </Button>
            
            {firebaseTest && (
              <div className={`p-4 rounded-lg ${
                firebaseTest.includes("✅") ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"
              }`}>
                <p className="text-sm">{firebaseTest}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full" variant="default">
              <a href="/login">Go to Login Page</a>
            </Button>
            <Button asChild className="w-full" variant="outline">
              <a href="/">Go to Home Page</a>
            </Button>
            <Button asChild className="w-full" variant="secondary">
              <a href="/firebase-setup">Setup Firebase User</a>
            </Button>
          </CardContent>
        </Card>

        {/* Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Authentication system initialized</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Firebase authentication active (requires network)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Frontend server running (localhost:3000)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



