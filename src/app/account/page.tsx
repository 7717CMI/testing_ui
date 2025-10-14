"use client"

import { useState } from "react"
import { Navbar } from "@/components/shared/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useAuthStore } from "@/stores/auth-store"
import { toast } from "sonner"
import { 
  User, 
  CreditCard, 
  Key, 
  Bell, 
  Shield, 
  Users,
  Copy,
  Eye,
  EyeOff,
  Check
} from "lucide-react"

export default function AccountPage() {
  const { user } = useAuthStore()
  const [showApiKey, setShowApiKey] = useState(false)

  function handleSaveProfile() {
    toast.success("Profile updated successfully!")
  }

  function handleCopyApiKey() {
    toast.success("API key copied to clipboard!")
  }

  function handleGenerateApiKey() {
    toast.success("New API key generated!")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-6 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
            <p className="text-muted-foreground">
              Manage your account preferences and settings
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="subscription" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Subscription
              </TabsTrigger>
              <TabsTrigger value="api" className="gap-2">
                <Key className="h-4 w-4" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="sessions" className="gap-2">
                <Users className="h-4 w-4" />
                Sessions
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold">
                      {user?.name.charAt(0)}
                    </div>
                    <Button variant="outline">Change Avatar</Button>
                  </div>

                  <Input
                    label="Full Name"
                    defaultValue={user?.name}
                  />

                  <Input
                    label="Email"
                    type="email"
                    defaultValue={user?.email}
                  />

                  <Input
                    label="Job Title"
                    defaultValue={user?.jobTitle}
                  />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Email Verified</label>
                      <p className="text-sm text-muted-foreground">
                        Your email has been verified
                      </p>
                    </div>
                    <Badge variant="success" className="gap-1">
                      <Check className="h-3 w-3" />
                      Verified
                    </Badge>
                  </div>

                  <Button onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Plan</CardTitle>
                  <CardDescription>
                    Manage your subscription and billing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary-50 dark:bg-primary-950 border-2 border-primary-500">
                    <div>
                      <h3 className="font-semibold text-lg">{user?.plan} Plan</h3>
                      <p className="text-sm text-muted-foreground">
                        {user?.plan === "Free" 
                          ? "100 searches per month"
                          : user?.plan === "Pro"
                          ? "Unlimited searches, AI access"
                          : "Custom enterprise features"
                        }
                      </p>
                    </div>
                    <Badge className="bg-primary-500 text-white">Active</Badge>
                  </div>

                  {user?.plan !== "Enterprise" && (
                    <Button>Upgrade Plan</Button>
                  )}

                  <div className="space-y-3">
                    <h4 className="font-medium">Billing History</h4>
                    <div className="border rounded-lg">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Invoice</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          <tr>
                            <td className="px-4 py-3 text-sm">Oct 1, 2025</td>
                            <td className="px-4 py-3 text-sm">$99.00</td>
                            <td className="px-4 py-3">
                              <Badge variant="success">Paid</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Button variant="ghost" size="sm">Download</Button>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm">Sep 1, 2025</td>
                            <td className="px-4 py-3 text-sm">$99.00</td>
                            <td className="px-4 py-3">
                              <Badge variant="success">Paid</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Button variant="ghost" size="sm">Download</Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Keys Tab */}
            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>
                    Manage your API keys for programmatic access
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Production API Key</h4>
                        <p className="text-sm text-muted-foreground">
                          Created on Oct 1, 2025
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCopyApiKey}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="font-mono text-sm p-3 bg-background rounded border">
                      {showApiKey
                        ? "hd_live_1234567890abcdefghijklmnopqrstuvwxyz"
                        : "hd_live_••••••••••••••••••••••••••••••••••"}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleGenerateApiKey}>
                      Generate New Key
                    </Button>
                    <Button variant="destructive" variant="outline">
                      Revoke All Keys
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose what notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { label: "Email notifications for new insights", defaultChecked: true },
                    { label: "Weekly summary email", defaultChecked: true },
                    { label: "Market alert notifications", defaultChecked: false },
                    { label: "New facility listings", defaultChecked: true },
                    { label: "Product updates and announcements", defaultChecked: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <label className="text-sm font-medium">{item.label}</label>
                      <Switch defaultChecked={item.defaultChecked} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and two-factor authentication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Change Password</h4>
                    <Input
                      type="password"
                      label="Current Password"
                      placeholder="••••••••"
                    />
                    <Input
                      type="password"
                      label="New Password"
                      placeholder="••••••••"
                    />
                    <Input
                      type="password"
                      label="Confirm New Password"
                      placeholder="••••••••"
                    />
                    <Button>Update Password</Button>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Button variant="outline">Enable 2FA</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sessions Tab */}
            <TabsContent value="sessions">
              <Card>
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>
                    Manage your active sessions and devices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { device: "Windows PC", location: "San Francisco, US", ip: "192.168.1.1", current: true },
                    { device: "iPhone 14", location: "San Francisco, US", ip: "192.168.1.2", current: false },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{session.device}</h4>
                          {session.current && (
                            <Badge variant="success" className="text-xs">Current</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {session.location} • {session.ip}
                        </p>
                      </div>
                      {!session.current && (
                        <Button variant="outline" size="sm">Revoke</Button>
                      )}
                    </div>
                  ))}

                  <Button variant="destructive" variant="outline" className="w-full">
                    Revoke All Sessions
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

