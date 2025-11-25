/**
 * Iframe Whitelist - Domains that allow iframe embedding
 * 
 * These sites don't use X-Frame-Options or CSP frame-ancestors,
 * so we can safely embed them in an iframe with our header.
 */

export const iframeFriendlySites = [
  // Blogging platforms (generally allow embedding)
  'medium.com',
  'substack.com',
  'wordpress.com',
  'blogger.com',
  'tumblr.com',
  'ghost.io',
  
  // Developer/tech sites
  'github.io',
  'vercel.app',
  'netlify.app',
  
  // Some news aggregators
  'feedburner.com',
  
  // Healthcare-specific (add as you discover them)
  // 'example-healthcare-blog.com',
]

/**
 * Check if a URL's domain is iframe-friendly
 */
export function canUseIframe(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    
    // Remove www. prefix for matching
    const domain = hostname.replace(/^www\./, '')
    
    // Check if domain or any parent domain is in whitelist
    return iframeFriendlySites.some(friendly => {
      return domain === friendly || domain.endsWith('.' + friendly)
    })
  } catch (error) {
    console.error('Invalid URL for iframe check:', error)
    return false
  }
}

/**
 * Get the display name for a domain
 */
export function getDomainName(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    return 'website'
  }
}

/**
 * Add a domain to the whitelist (for admin use)
 * This could be persisted to localStorage or database
 */
export function addToWhitelist(domain: string): void {
  const cleanDomain = domain.toLowerCase().replace(/^www\./, '')
  if (!iframeFriendlySites.includes(cleanDomain)) {
    iframeFriendlySites.push(cleanDomain)
    console.log('✅ Added to iframe whitelist:', cleanDomain)
  }
}

/**
 * Remove a domain from the whitelist
 */
export function removeFromWhitelist(domain: string): void {
  const cleanDomain = domain.toLowerCase().replace(/^www\./, '')
  const index = iframeFriendlySites.indexOf(cleanDomain)
  if (index > -1) {
    iframeFriendlySites.splice(index, 1)
    console.log('❌ Removed from iframe whitelist:', cleanDomain)
  }
}
















