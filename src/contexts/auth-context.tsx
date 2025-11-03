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
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useAuthStore } from "@/stores/auth-store"
import { useSubscriptionStore } from "@/stores/subscription-store"
import { User } from "@/types"
import { toast } from "sonner"

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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Create user document in Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        email: firebaseUser.email,
        name,
        createdAt: new Date().toISOString(),
        emailVerified: false,
      })

      // Create subscription document with free plan
      await setDoc(doc(db, "subscriptions", firebaseUser.uid), {
        plan: "free",
        status: "active",
        createdAt: new Date().toISOString(),
      })

      toast.success("Account created successfully!")
    } catch (error: any) {
      console.error("Sign up error:", error)
      toast.error(error.message || "Failed to create account")
      throw error
    }
  }

  async function signIn(email: string, password: string) {
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
        toast.error("Network error. Please check: 1) Internet connection 2) Demo user exists in Firebase Console 3) Firebase config is correct")
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Too many failed attempts. Please try again later.")
      } else {
        toast.error(error.message || "Failed to sign in. Check console for details.")
      }
      throw error
    }
  }

  async function signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      const firebaseUser = userCredential.user

      // Check if user document exists, if not create it
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", firebaseUser.uid), {
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          avatar: firebaseUser.photoURL,
          createdAt: new Date().toISOString(),
          emailVerified: firebaseUser.emailVerified,
        })

        // Create subscription document
        await setDoc(doc(db, "subscriptions", firebaseUser.uid), {
          plan: "free",
          status: "active",
          createdAt: new Date().toISOString(),
        })
      }

      toast.success("Signed in with Google!")
    } catch (error: any) {
      console.error("Google sign in error:", error)
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error(error.message || "Failed to sign in with Google")
      }
      throw error
    }
  }

  async function handleSignOut() {
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
