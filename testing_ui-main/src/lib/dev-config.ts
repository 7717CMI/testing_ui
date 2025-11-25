/**
 * Development Configuration
 * 
 * This file contains development-only settings that can be toggled
 * to switch between mock and real services.
 */

/**
 * Enable mock authentication to bypass Firebase
 * Set to true to use local mock users (no network required)
 * Set to false to use real Firebase authentication
 */
export const USE_MOCK_AUTH = true

/**
 * Mock users for development/testing
 * These users work offline and don't require Firebase
 */
export const MOCK_USERS = {
  // Demo Account - Full Enterprise Access
  "demo@healthdata.com": {
    uid: "mock-demo-uid",
    email: "demo@healthdata.com",
    password: "demo123",
    name: "Demo User",
    plan: "enterprise" as const, // 🏆 ALL FEATURES!
  },
  
  // Test Account - Free Access (for testing paywalls)
  "test@healthdata.com": {
    uid: "mock-test-uid",
    email: "test@healthdata.com",
    password: "test123",
    name: "Test User",
    plan: "free" as const, // 🔒 Limited features
  },
} as const

/**
 * Type for mock user
 */
export type MockUser = typeof MOCK_USERS[keyof typeof MOCK_USERS]




