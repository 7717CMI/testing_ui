import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

/**
 * Firebase Admin SDK for server-side operations
 * This bypasses Firestore security rules and is used in API routes
 */

let adminApp: App | null = null
let adminDb: Firestore | null = null

export function getAdminDb(): Firestore {
  if (adminDb) {
    return adminDb
  }

  // Check if we're using emulators
  const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true'
  
  // Set emulator host BEFORE initializing (if using emulators)
  if (useEmulators && !process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
  }
  
  if (useEmulators) {
    // For emulators, use the default app without credentials
    if (getApps().length === 0) {
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'healthdata-auth',
      })
    } else {
      adminApp = getApps()[0]
    }
    
    adminDb = getFirestore(adminApp)
  } else {
    // For production, use service account credentials
    // You'll need to set GOOGLE_APPLICATION_CREDENTIALS or use environment variables
    if (getApps().length === 0) {
      try {
        // Try to initialize with credentials if available
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
        if (serviceAccount) {
          adminApp = initializeApp({
            credential: cert(JSON.parse(serviceAccount)),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'healthdata-auth',
          })
        } else {
          // Fallback: use default credentials (for production with GOOGLE_APPLICATION_CREDENTIALS)
          adminApp = initializeApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'healthdata-auth',
          })
        }
      } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error)
        // Fallback to default initialization
        adminApp = initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'healthdata-auth',
        })
      }
    } else {
      adminApp = getApps()[0]
    }
    
    adminDb = getFirestore(adminApp)
  }

  return adminDb
}

