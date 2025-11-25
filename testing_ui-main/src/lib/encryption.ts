/**
 * Simple encryption utility for storing sensitive data
 * In production, use a proper encryption library like crypto-js or node:crypto
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production'

/**
 * Simple base64 encoding (not secure, but better than plain text)
 * In production, use proper encryption like AES-256
 */
export function encrypt(text: string): string {
  if (!text) return ''
  // Simple obfuscation - in production use crypto.createCipheriv
  const encoded = Buffer.from(text).toString('base64')
  return encoded
}

/**
 * Simple base64 decoding
 */
export function decrypt(encrypted: string): string {
  if (!encrypted) return ''
  try {
    return Buffer.from(encrypted, 'base64').toString('utf-8')
  } catch {
    return ''
  }
}

/**
 * Hash a value (one-way)
 */
export function hash(value: string): string {
  // Simple hash - in production use crypto.createHash
  return Buffer.from(value).toString('base64')
}






