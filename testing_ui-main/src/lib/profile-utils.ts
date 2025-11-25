import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from './firebase'
import { UserProfile } from '@/types'

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(userId: string) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      return null
    }
    return userDoc.data()
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}

/**
 * Update user profile in Firestore
 */
export async function updateUserProfile(
  userId: string,
  profileData: Partial<UserProfile>
) {
  try {
    const userRef = doc(db, 'users', userId)
    
    // Check if document exists
    const userDoc = await getDoc(userRef)
    
    const updateData = {
      ...profileData,
      updatedAt: serverTimestamp(),
    }
    
    if (userDoc.exists()) {
      // Update existing document
      await updateDoc(userRef, updateData)
    } else {
      // Create new document with required fields
      await setDoc(userRef, {
        ...updateData,
        createdAt: serverTimestamp(),
      })
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

/**
 * Upload avatar image to Firebase Storage
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error('Image size must be less than 5MB')
    }
    
    // Create storage reference
    const storageRef = ref(storage, `avatars/${userId}/${Date.now()}_${file.name}`)
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file)
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return downloadURL
  } catch (error) {
    console.error('Error uploading avatar:', error)
    throw error
  }
}

/**
 * Delete old avatar from Storage (optional cleanup)
 */
export async function deleteAvatar(avatarUrl: string) {
  try {
    // Extract path from URL
    const url = new URL(avatarUrl)
    const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0])
    const storageRef = ref(storage, path)
    
    await deleteObject(storageRef)
  } catch (error) {
    // Don't throw - avatar deletion is not critical
    console.warn('Error deleting old avatar:', error)
  }
}

/**
 * Get notification preferences from Firestore
 */
export async function getNotificationPreferences(userId: string) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      return null
    }
    return userDoc.data()?.preferences || null
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    throw error
  }
}

/**
 * Update notification preferences in Firestore
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Record<string, boolean>
) {
  try {
    const userRef = doc(db, 'users', userId)
    
    await updateDoc(userRef, {
      preferences,
      updatedAt: serverTimestamp(),
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    throw error
  }
}









