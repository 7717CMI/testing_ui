import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { getUserProfile, updateUserProfile, uploadAvatar, deleteAvatar } from '@/lib/profile-utils'
import { UserProfile } from '@/types'
import { toast } from 'sonner'
import { updateProfile as updateFirebaseProfile } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function useProfile() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Load profile data
  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    async function loadProfile() {
      try {
        setLoading(true)
        const profileData = await getUserProfile(user.id)
        if (profileData) {
          setProfile({
            name: profileData.name || user.name || '',
            jobTitle: profileData.jobTitle || '',
            company: profileData.company || '',
            phone: profileData.phone || '',
            avatar: profileData.avatar || user.avatar || '',
            role: profileData.role || user.role,
          })
        } else {
          // Initialize with user data from auth store
          setProfile({
            name: user.name || '',
            jobTitle: '',
            company: '',
            phone: '',
            avatar: user.avatar || '',
            role: user.role,
          })
        }
      } catch (error: any) {
        console.error('Error loading profile:', error)
        toast.error('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user?.id])

  // Save profile
  async function saveProfile(profileData: Partial<UserProfile>) {
    if (!user?.id) {
      toast.error('You must be logged in to update your profile')
      return
    }

    try {
      setSaving(true)
      
      // Update Firestore
      await updateUserProfile(user.id, profileData)
      
      // Update Firebase Auth profile (for displayName)
      const firebaseUser = auth.currentUser
      if (firebaseUser && profileData.name) {
        await updateFirebaseProfile(firebaseUser, {
          displayName: profileData.name,
          photoURL: profileData.avatar || firebaseUser.photoURL || undefined,
        })
      }
      
      // Update local state
      setProfile((prev) => ({
        ...prev,
        ...profileData,
      } as UserProfile))
      
      // Update auth store
      const { setUser } = useAuthStore.getState()
      const currentUser = useAuthStore.getState().user
      if (currentUser) {
        setUser({
          ...currentUser,
          name: profileData.name || currentUser.name,
          avatar: profileData.avatar || currentUser.avatar,
          jobTitle: profileData.jobTitle || currentUser.jobTitle,
          company: profileData.company || currentUser.company,
          phone: profileData.phone || currentUser.phone,
        })
      }
      
      toast.success('Profile updated successfully!')
      return { success: true }
    } catch (error: any) {
      console.error('Error saving profile:', error)
      toast.error(error.message || 'Failed to update profile')
      throw error
    } finally {
      setSaving(false)
    }
  }

  // Upload avatar
  async function handleAvatarUpload(file: File) {
    if (!user?.id) {
      toast.error('You must be logged in to upload an avatar')
      return
    }

    try {
      setUploadingAvatar(true)
      
      // Delete old avatar if exists
      if (profile?.avatar) {
        await deleteAvatar(profile.avatar).catch(() => {
          // Ignore errors - old avatar deletion is not critical
        })
      }
      
      // Upload new avatar
      const avatarUrl = await uploadAvatar(user.id, file)
      
      // Update profile with new avatar URL
      await saveProfile({ avatar: avatarUrl })
      
      toast.success('Avatar uploaded successfully!')
      return avatarUrl
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      toast.error(error.message || 'Failed to upload avatar')
      throw error
    } finally {
      setUploadingAvatar(false)
    }
  }

  return {
    profile,
    loading,
    saving,
    uploadingAvatar,
    saveProfile,
    handleAvatarUpload,
  }
}

