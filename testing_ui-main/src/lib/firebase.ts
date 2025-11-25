import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore"

// Firebase configuration
// These values should be set via environment variables in production
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "healthdata-auth.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "healthdata-auth",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "healthdata-auth.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef",
}

// Initialize Firebase
let app: FirebaseApp
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

// Initialize Auth
export const auth: Auth = getAuth(app)

// Initialize Firestore
export const db: Firestore = getFirestore(app)

// Connect to Firebase Emulators in development mode
// This allows local development without needing real Firebase credentials
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Check if we should use emulators (when running locally)
  const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true"
  
  if (useEmulators) {
    // Only connect if not already connected
    try {
      if (!auth._delegate?._config?.emulator) {
        connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
        console.log("✅ Connected to Firebase Auth Emulator")
      }
    } catch (error) {
      console.warn("⚠️ Auth emulator already connected or connection failed:", error)
    }

    try {
      if (!(db as any)._delegate?._databaseId?.projectId?.includes("localhost")) {
        connectFirestoreEmulator(db, "localhost", 8080)
        console.log("✅ Connected to Firestore Emulator")
      }
    } catch (error) {
      console.warn("⚠️ Firestore emulator already connected or connection failed:", error)
    }
  }
}

export default app
