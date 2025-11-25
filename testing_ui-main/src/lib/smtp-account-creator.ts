import { encrypt } from '@/lib/encryption'
import { getAdminDb } from '@/lib/firebase-admin'

/**
 * Create a free SMTP account for a user
 * Returns the SMTP account data or null if creation fails
 */
export async function createUserSmtpAccount(userId: string, userEmail: string) {
  try {
    // Use Admin SDK for server-side operations (bypasses security rules)
    const adminDb = getAdminDb()
    
    // Check if user already has SMTP account
    const existingAccountRef = adminDb.collection('emailAccounts').doc(userId)
    const existingAccount = await existingAccountRef.get()
    
    if (existingAccount.exists) {
      const accountData = existingAccount.data()
      return {
        success: true,
        message: 'SMTP account already exists',
        account: {
          id: existingAccount.id,
          ...accountData,
        }
      }
    }
    
    // Create Ethereal Email account (free, no API key needed)
    let smtpAccount
    try {
      smtpAccount = await createEtherealAccount()
      console.log(`✅ Created Ethereal SMTP account for user ${userId}`)
    } catch (error: any) {
      console.error('[Create SMTP] Ethereal account creation failed:', error)
      // Fallback: Try Mailtrap if configured
      if (process.env.MAILTRAP_API_TOKEN) {
        try {
          smtpAccount = await createMailtrapAccount(userEmail)
          console.log(`✅ Created Mailtrap SMTP account for user ${userId}`)
        } catch (mailtrapError: any) {
          throw new Error(`Failed to create SMTP account: ${error.message}`)
        }
      } else {
        throw error
      }
    }
    
    // Store SMTP credentials in Firestore using Admin SDK
    await existingAccountRef.set({
      userId,
      email: userEmail, // User's login email
      provider: 'smtp',
      displayName: userEmail.split('@')[0], // Use email prefix as display name
      smtpConfig: {
        host: smtpAccount.host,
        port: smtpAccount.port,
        secure: smtpAccount.secure,
        user: smtpAccount.user,
        pass: encrypt(smtpAccount.pass) // Encrypt password
      },
      isDefault: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      smtpProvider: smtpAccount.provider || 'ethereal'
    })
    
    return {
      success: true,
      message: 'SMTP account created successfully',
      account: {
        id: userId,
        email: userEmail,
        smtpHost: smtpAccount.host,
        provider: smtpAccount.provider || 'ethereal'
      }
    }
    
  } catch (error: any) {
    console.error('[Create SMTP] Error:', error)
    return {
      success: false,
      error: error.message || 'Failed to create SMTP account',
      account: null
    }
  }
}

/**
 * Create Ethereal Email account (free, temporary test accounts)
 * No API key needed - works out of the box
 */
async function createEtherealAccount() {
  try {
    const response = await fetch('https://api.nodemailer.com/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Ethereal API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    return {
      provider: 'ethereal',
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // TLS
      user: data.user,
      pass: data.pass
    }
  } catch (error: any) {
    throw new Error(`Ethereal account creation failed: ${error.message}`)
  }
}

/**
 * Create Mailtrap account (free tier: 500 emails/month)
 * Requires: MAILTRAP_API_TOKEN in .env
 */
async function createMailtrapAccount(userEmail: string) {
  const apiToken = process.env.MAILTRAP_API_TOKEN
  
  if (!apiToken) {
    throw new Error('MAILTRAP_API_TOKEN not configured')
  }
  
  try {
    // Create inbox via Mailtrap API
    const response = await fetch('https://mailtrap.io/api/v1/inboxes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `User: ${userEmail}`,
        email_username: userEmail.split('@')[0] // Use part before @
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Mailtrap API error: ${response.statusText} - ${JSON.stringify(errorData)}`)
    }
    
    const inbox = await response.json()
    
    return {
      provider: 'mailtrap',
      host: 'smtp.mailtrap.io',
      port: 2525,
      secure: false,
      user: inbox.username,
      pass: inbox.password
    }
  } catch (error: any) {
    throw new Error(`Mailtrap account creation failed: ${error.message}`)
  }
}

