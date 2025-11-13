"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useAuthStore } from "@/stores/auth-store"
import { useSubscriptionStore } from "@/stores/subscription-store"
import { User } from "@/types"
import { toast } from "sonner"
import { USE_MOCK_AUTH, MOCK_USERS } from "@/lib/dev-config"

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const { user, setUser, setLoading: setAuthLoading } = useAuthStore()
  const { setPlan } = useSubscriptionStore()

  useEffect(() => {
    // Skip Firebase auth listener if using mock auth
    if (USE_MOCK_AUTH) {
      console.log('🔧 Using mock authentication - skipping Firebase listener')
      setLoading(false)
      setAuthLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
        const userData = userDoc.data()

        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: userData?.name || firebaseUser.displayName || null,
          avatar: firebaseUser.photoURL || undefined,
          emailVerified: firebaseUser.emailVerified,
          role: userData?.role,
        }

        setUser(user)

        // Load subscription data
        const subscriptionDoc = await getDoc(doc(db, "subscriptions", firebaseUser.uid))
        if (subscriptionDoc.exists()) {
          const subscriptionData = subscriptionDoc.data()
          setPlan(subscriptionData.plan || "free")
        } else {
          // Give demo user ENTERPRISE access by default
          if (firebaseUser.email === "demo@healthdata.com") {
            setPlan("enterprise")
            // Create subscription document for demo user
            await setDoc(doc(db, "subscriptions", firebaseUser.uid), {
              plan: "enterprise",
              status: "active",
              createdAt: new Date().toISOString(),
              note: "Demo account with full enterprise access"
            })
          } else {
            setPlan("free")
          }
        }
      } else {
        // User is signed out
        setUser(null)
      }
      setLoading(false)
      setAuthLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setAuthLoading, setPlan])

  async function signUp(email: string, password: string, name: string) {
    try {
      console.log("📝 Creating new account...")
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Send verification email immediately after account creation
      await sendEmailVerification(firebaseUser)
      console.log("✅ Verification email sent to:", email)

      // Create user document in Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        email: firebaseUser.email,
        name,
        createdAt: new Date().toISOString(),
        emailVerified: false,
        authProvider: "email",
      })

      // Create subscription document with free plan
      await setDoc(doc(db, "subscriptions", firebaseUser.uid), {
        plan: "free",
        status: "active",
        createdAt: new Date().toISOString(),
      })
      
      console.log("✅ User account created successfully")

      // Show comprehensive success message
      toast.success("🎉 Account Created Successfully!", {
        duration: 8000,
        description: "Check your email inbox (and spam folder) to verify your account before signing in."
      })
      
      // Show email verification reminder
      setTimeout(() => {
        toast.info("📧 Verification Email Sent", {
          duration: 10000,
          description: "Look for an email from HealthData AI. If you don't see it in your inbox, check your spam/junk folder!",
        })
      }, 1500)
      
      // Additional spam folder tip
      setTimeout(() => {
        toast("💡 Pro Tip", {
          duration: 10000,
          description: "If the email is in spam, mark it as 'Not Spam' to receive future emails in your inbox.",
        })
      }, 3000)
      
    } catch (error: any) {
      console.error("❌ Sign up error:", error)
      
      // Handle specific errors with clear messages
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email Already Registered", {
          description: "This email is already in use. Try logging in instead."
        })
      } else if (error.code === "auth/weak-password") {
        toast.error("Weak Password", {
          description: "Please use at least 6 characters with letters and numbers."
        })
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid Email", {
          description: "Please enter a valid email address."
        })
      } else {
        toast.error("Signup Failed", {
          description: error.message || "Please try again or contact support."
        })
      }
      
      throw error
    }
  }

  async function signIn(email: string, password: string) {
    // DEVELOPMENT MODE: Use mock authentication to bypass network issues
    if (USE_MOCK_AUTH) {
      console.log("🔧 DEV MODE: Using mock authentication")
      
      const mockUser = Object.values(MOCK_USERS).find(u => u.email === email)
      
      if (!mockUser) {
        toast.error("User not found. Try: demo@healthdata.com or test@healthdata.com")
        throw new Error("User not found")
      }
      
      if (mockUser.password !== password) {
        toast.error("Incorrect password")
        throw new Error("Incorrect password")
      }
      
      // Create mock user object
      const user: User = {
        id: mockUser.uid,
        email: mockUser.email,
        name: mockUser.name,
        emailVerified: true,
      }
      
      setUser(user)
      setPlan(mockUser.plan as any)
      
      // Check if user has completed or skipped tour - if not, show it automatically
      setTimeout(() => {
        // Import dynamically to avoid circular dependencies
        import('@/stores/onboarding-store').then(({ useOnboardingStore }) => {
          const { hasCompletedTour, hasSkippedTour, startTour } = useOnboardingStore.getState()
          // Start tour if user hasn't completed or skipped it yet
          if (!hasCompletedTour && !hasSkippedTour) {
            startTour()
          }
        })
      }, 1500)
      
      toast.success(`Welcome back! (DEV MODE - ${mockUser.plan.toUpperCase()})`)
      console.log("✅ Mock login successful:", mockUser)
      return
    }
    
    // PRODUCTION MODE: Use Firebase
    try {
      console.log("🔐 Attempting sign in with Firebase...")
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log("✅ Sign in successful!")
      
      // IMPORTANT: Force Enterprise plan for demo user immediately
      if (email === "demo@healthdata.com") {
        console.log("🏆 Demo user detected - setting Enterprise plan...")
        setPlan("enterprise")
        // Update Firestore
        await setDoc(doc(db, "subscriptions", userCredential.user.uid), {
          plan: "enterprise",
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          note: "Demo account with full enterprise access"
        })
      }
      
      toast.success("Welcome back!")
    } catch (error: any) {
      console.error("❌ Sign in error:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      
      // Handle specific error cases
      if (error.code === "auth/user-not-found") {
        toast.error("No account found with this email. Please create an account first.")
      } else if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password. Please try again.")
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address format")
      } else if (error.code === "auth/invalid-credential") {
        toast.error("Invalid email or password. The password might be different than 'demo123'. Try resetting it in Firebase Console or use the test page.")
      } else if (error.code === "auth/network-request-failed") {
        toast.error("⚠️ NETWORK ERROR: Your firewall/antivirus is blocking Firebase. Check FIREBASE_SSL_ERROR_FIX.md for solutions. Using DEV MODE instead - set USE_MOCK_AUTH=true in src/lib/dev-config.ts")
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Too many failed attempts. Please try again later.")
      } else {
        toast.error(error.message || "Failed to sign in. Check console for details.")
      }
      throw error
    }
  }

  async function signInWithGoogle() {
    if (USE_MOCK_AUTH) {
      toast.error("Google Sign-In not available in mock mode. Use demo@healthdata.com / demo123")
      return
    }

    try {
      console.log("🔐 Attempting Google Sign-In...")
      const provider = new GoogleAuthProvider()
      // Add these settings for better UX
      provider.setCustomParameters({
        prompt: 'select_account'  // Always show account picker
      })
      
      const userCredential = await signInWithPopup(auth, provider)
      const firebaseUser = userCredential.user
      
      console.log("✅ Google authentication successful!")

      // Check if this is a new user or returning user
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      const isNewUser = !userDoc.exists()
      
      if (isNewUser) {
        console.log("🆕 New user detected - creating account...")
        
        // Create user document
        await setDoc(doc(db, "users", firebaseUser.uid), {
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          avatar: firebaseUser.photoURL,
          createdAt: new Date().toISOString(),
          emailVerified: true,  // Google accounts are pre-verified
          authProvider: "google",
        })

        // Create subscription document with free plan
        await setDoc(doc(db, "subscriptions", firebaseUser.uid), {
          plan: "free",
          status: "active",
          createdAt: new Date().toISOString(),
        })
        
        console.log("✅ New user account created in Firestore")
        
        // Welcome message for new users
        toast.success("🎉 Welcome to HealthData AI!", {
          duration: 6000,
          description: `Account created for ${firebaseUser.email}. You're on the Free plan.`
        })
        
        // Start onboarding tour for new users (if not completed or skipped)
        setTimeout(() => {
          import('@/stores/onboarding-store').then(({ useOnboardingStore }) => {
            const { hasCompletedTour, hasSkippedTour, startTour } = useOnboardingStore.getState()
            // Start tour if user hasn't completed or skipped it yet
            if (!hasCompletedTour && !hasSkippedTour) {
              startTour()
            }
          })
        }, 2000)
        
        // Additional info toast
        setTimeout(() => {
          toast.info("🚀 Getting Started", {
            duration: 8000,
            description: "Explore 6M+ healthcare facilities, AI-powered search, and real-time insights!"
          })
        }, 3000)
        
      } else {
        console.log("👋 Returning user - welcome back!")
        
        // Welcome back message
        toast.success("Welcome back!", {
          duration: 3000,
          description: `Signed in as ${firebaseUser.email}`
        })
        
        // Check if returning user has completed tour - if not, show it
        setTimeout(() => {
          import('@/stores/onboarding-store').then(({ useOnboardingStore }) => {
            const { hasCompletedTour, hasSkippedTour, startTour } = useOnboardingStore.getState()
            // Start tour if user hasn't completed or skipped it yet
            if (!hasCompletedTour && !hasSkippedTour) {
              startTour()
            }
          })
        }, 1500)
      }
      
    } catch (error: any) {
      console.error("❌ Google sign in error:", error)
      console.error("Error code:", error.code)
      
      // Handle specific errors
      if (error.code === "auth/popup-closed-by-user") {
        toast.info("Sign-in cancelled")
      } else if (error.code === "auth/popup-blocked") {
        toast.error("Popup blocked! Please allow popups for this site.")
      } else if (error.code === "auth/network-request-failed") {
        toast.error("Network error. Check your internet connection.")
      } else if (error.code === "auth/account-exists-with-different-credential") {
        toast.error("An account already exists with this email using a different sign-in method.")
      } else {
        toast.error(error.message || "Failed to sign in with Google")
      }
      throw error
    }
  }

  async function handleSignOut() {
    if (USE_MOCK_AUTH) {
      setUser(null)
      setPlan("free")
      toast.success("Signed out successfully (Mock Mode)")
      return
    }

    try {
      await signOut(auth)
      toast.success("Signed out successfully")
    } catch (error: any) {
      console.error("Sign out error:", error)
      toast.error("Failed to sign out")
      throw error
    }
  }

  async function resetPassword(email: string) {
    if (USE_MOCK_AUTH) {
      // In mock mode, just show a success message
      toast.info("Password reset not available in mock mode. Use demo@healthdata.com / demo123 or test@healthdata.com / test123")
      return
    }

    try {
      await sendPasswordResetEmail(auth, email)
      toast.success("Password reset email sent!")
    } catch (error: any) {
      console.error("Password reset error:", error)
      toast.error(error.message || "Failed to send reset email")
      throw error
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut: handleSignOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
