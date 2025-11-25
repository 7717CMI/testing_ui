"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Navbar } from "@/components/shared/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useAuthStore } from "@/stores/auth-store"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/hooks/use-profile"
import { useSubscription } from "@/hooks/use-subscription"
import { useNotificationPreferences } from "@/hooks/use-notification-preferences"
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
  Check,
  Upload,
  Loader2
} from "lucide-react"

export default function AccountPage() {
  const { user } = useAuthStore()
  const { changePassword } = useAuth()
  const { profile, loading: profileLoading, saving, uploadingAvatar, saveProfile, handleAvatarUpload } = useProfile()
  const { plan, planInfo, loading: subscriptionLoading } = useSubscription()
  const { preferences, loading: prefsLoading, updatePreference } = useNotificationPreferences()
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    jobTitle: "",
    company: "",
    phone: "",
  })
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [changingPassword, setChangingPassword] = useState(false)
  
  // Avatar upload
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [showApiKey, setShowApiKey] = useState(false)

  // Initialize form when profile loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || "",
        jobTitle: profile.jobTitle || "",
        company: profile.company || "",
        phone: profile.phone || "",
      })
    }
  }, [profile])

  async function handleSaveProfile() {
    try {
      await saveProfile(profileForm)
    } catch (error) {
      // Error handled in hook
    }
  }

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    
    try {
      await handleAvatarUpload(file)
    } catch (error) {
      // Error handled in hook
    }
    
    // Reset input
    if (avatarInputRef.current) {
      avatarInputRef.current.value = ""
    }
  }

  async function handlePasswordChange() {
    // Validate all fields are filled
    if (!passwordForm.currentPassword.trim()) {
      toast.error("Please enter your current password")
      return
    }
    
    if (!passwordForm.newPassword.trim()) {
      toast.error("Please enter a new password")
      return
    }
    
    if (!passwordForm.confirmPassword.trim()) {
      toast.error("Please confirm your new password")
      return
    }
    
    // Check password length
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    
    // Check passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    
    // Check if new password is same as current password
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast.error("New password must be different from your current password")
      return
    }

    try {
      setChangingPassword(true)
      await changePassword(passwordForm.currentPassword.trim(), passwordForm.newPassword.trim())
      // Clear form on success
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      // Error is already handled in auth context with toast
      // Don't clear form on error so user can retry
    } finally {
      setChangingPassword(false)
    }
  }

  function handleCopyApiKey() {
    toast.info("API key management coming soon")
  }

  function handleGenerateApiKey() {
    toast.info("API key generation coming soon")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-6 max-w-4xl">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Please log in to view your account settings.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
                  {profileLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {profile?.avatar ? (
                            <img
                              src={profile.avatar}
                              alt="Avatar"
                              className="h-20 w-20 rounded-full object-cover border-2 border-primary-500"
                            />
                          ) : (
                            <div className="h-20 w-20 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold border-2 border-primary-500">
                              {profileForm.name.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                          )}
                          {uploadingAvatar && (
                            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                              <Loader2 className="h-6 w-6 animate-spin text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            onClick={() => avatarInputRef.current?.click()}
                            disabled={uploadingAvatar}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadingAvatar ? "Uploading..." : "Change Avatar"}
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">
                            Max 5MB, JPG/PNG
                          </p>
                        </div>
                  </div>

                  <Input
                    label="Full Name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        disabled={saving}
                  />

                  <Input
                    label="Email"
                    type="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-muted"
                  />

                  <Input
                    label="Job Title"
                        value={profileForm.jobTitle}
                        onChange={(e) => setProfileForm({ ...profileForm, jobTitle: e.target.value })}
                        placeholder="e.g., Healthcare Analyst"
                        disabled={saving}
                      />

                      <Input
                        label="Company"
                        value={profileForm.company}
                        onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                        placeholder="Optional"
                        disabled={saving}
                      />

                      <Input
                        label="Phone"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="Optional"
                        disabled={saving}
                  />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Email Verified</label>
                      <p className="text-sm text-muted-foreground">
                            {user?.emailVerified ? "Your email has been verified" : "Please verify your email"}
                      </p>
                    </div>
                        {user?.emailVerified ? (
                    <Badge variant="success" className="gap-1">
                      <Check className="h-3 w-3" />
                      Verified
                    </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            Unverified
                          </Badge>
                        )}
                  </div>

                      <Button onClick={handleSaveProfile} disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                  </Button>
                    </>
                  )}
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
                  {subscriptionLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary-50 dark:bg-primary-950 border-2 border-primary-500">
                    <div>
                          <h3 className="font-semibold text-lg">{planInfo.name} Plan</h3>
                      <p className="text-sm text-muted-foreground">
                            {planInfo.description}
                      </p>
                    </div>
                    <Badge className="bg-primary-500 text-white">Active</Badge>
                  </div>

                      {plan !== "enterprise" && (
                        <Button onClick={() => toast.info("Upgrade functionality coming soon")}>
                          Upgrade Plan
                        </Button>
                  )}

                  <div className="space-y-3">
                    <h4 className="font-medium">Billing History</h4>
                    <div className="border rounded-lg">
                          <div className="p-8 text-center text-muted-foreground">
                            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>No billing history yet</p>
                            <p className="text-sm mt-1">Billing history will appear here once payment is integrated</p>
                          </div>
                    </div>
                  </div>
                    </>
                  )}
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
                  <div className="p-8 text-center text-muted-foreground">
                    <Key className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>API Key management coming soon</p>
                    <p className="text-sm mt-1">This feature will be available in Phase 3</p>
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
                    {plan === "free" 
                      ? "Upgrade to Pro or Enterprise to enable notifications"
                      : "Choose what notifications you want to receive"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {plan === "free" ? (
                    <div className="text-center py-8">
                      <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                      <h3 className="text-lg font-semibold mb-2">Notifications Available for Premium Users</h3>
                      <p className="text-muted-foreground mb-4">
                        Upgrade to Pro or Enterprise plan to receive email notifications, market alerts, and more.
                      </p>
                      <Button asChild>
                        <Link href="/pricing">Upgrade to Pro</Link>
                      </Button>
                    </div>
                  ) : prefsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Email notifications for new insights</label>
                        <Switch
                          checked={preferences.emailNotifications}
                          onCheckedChange={(checked) => updatePreference("emailNotifications", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Weekly summary email</label>
                        <Switch
                          checked={preferences.weeklySummary}
                          onCheckedChange={(checked) => updatePreference("weeklySummary", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Market alert notifications</label>
                        <Switch
                          checked={preferences.marketAlerts}
                          onCheckedChange={(checked) => updatePreference("marketAlerts", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">New facility listings</label>
                        <Switch
                          checked={preferences.newListings}
                          onCheckedChange={(checked) => updatePreference("newListings", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Product updates and announcements</label>
                        <Switch
                          checked={preferences.productUpdates}
                          onCheckedChange={(checked) => updatePreference("productUpdates", checked)}
                        />
                      </div>
                    </>
                  )}
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
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      disabled={changingPassword}
                    />
                    <Input
                      type="password"
                      label="New Password"
                      placeholder="••••••••"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      disabled={changingPassword}
                    />
                    <Input
                      type="password"
                      label="Confirm New Password"
                      placeholder="••••••••"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      disabled={changingPassword}
                    />
                    <Button onClick={handlePasswordChange} disabled={changingPassword}>
                      {changingPassword ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Button variant="outline" onClick={() => toast.info("2FA coming soon")}>
                        Enable 2FA
                      </Button>
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
                  <div className="p-8 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Session management coming soon</p>
                    <p className="text-sm mt-1">This feature will be available in Phase 6</p>
                    </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
