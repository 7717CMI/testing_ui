/**
 * Article Reader API - Fetches and extracts article content for reader mode
 * 
 * This API endpoint:
 * 1. Fetches the article HTML from the source URL
 * 2. Extracts main content using multiple fallback strategies
 * 3. Cleans and formats the content for display
 * 4. Returns structured data for the reader UI
 */

import { NextRequest, NextResponse } from 'next/server'
import { JSDOM } from 'jsdom'
import { Readability } from '@mozilla/readability'

export async function POST(request: NextRequest) {
  try {
    const { url, title } = await request.json()

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      )
    }

    console.log('📰 Fetching article:', url)

    // Try multiple fetch strategies
    let response: Response | null = null
    let lastError: string | null = null

    // Strategy 1: Direct fetch with realistic browser headers
    try {
      console.log('🔄 Strategy 1: Direct fetch with browser headers')
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'max-age=0',
          'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          'Referer': new URL(url).origin + '/',
        },
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        console.log('✅ Strategy 1 succeeded')
      } else {
        lastError = `${response.status} ${response.statusText}`
        console.warn(`⚠️ Strategy 1 failed: ${lastError}`)
        response = null
      }
    } catch (err: any) {
      lastError = err.message
      console.warn('⚠️ Strategy 1 error:', lastError)
    }

    // Strategy 2: Try with a proxy service (for 403 errors)
    if (!response && lastError?.includes('403')) {
      try {
        console.log('🔄 Strategy 2: Using CORS proxy')
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
        response = await fetch(proxyUrl, {
          signal: AbortSignal.timeout(15000),
        })

        if (response.ok) {
          console.log('✅ Strategy 2 (proxy) succeeded')
        } else {
          console.warn('⚠️ Strategy 2 (proxy) failed')
          response = null
        }
      } catch (err: any) {
        console.warn('⚠️ Strategy 2 error:', err.message)
      }
    }

    // If all strategies failed, return error
    if (!response || !response.ok) {
      console.error('❌ All fetch strategies failed. Last error:', lastError)
      
      // Special handling for 403 Forbidden
      if (lastError?.includes('403')) {
        return NextResponse.json({
          success: false,
          error: 'This website blocks automated access (403 Forbidden). The site requires authentication or blocks content extraction for security reasons.',
          errorCode: 403,
          fallbackUrl: url
        }, { status: 403 })
      }

      return NextResponse.json({
        success: false,
        error: `Failed to fetch article: ${lastError || 'Unknown error'}`,
        fallbackUrl: url
      }, { status: response?.status || 500 })
    }

    const html = await response.text()
    console.log('✅ Fetched HTML:', html.length, 'characters')

    // Parse with JSDOM
    const dom = new JSDOM(html, { url })
    const document = dom.window.document

    // Use Mozilla's Readability to extract article content
    const reader = new Readability(document, {
      debug: false,
      maxElemsToParse: 0, // No limit
      nbTopCandidates: 5,
      charThreshold: 500,
    })

    const article = reader.parse()

    if (!article || !article.content) {
      console.warn('⚠️ Readability failed to extract content, using fallback')
      
      // Fallback: Try to extract content manually
      const fallbackContent = extractContentFallback(document)
      
      if (fallbackContent) {
        return NextResponse.json({
          success: true,
          data: {
            title: title || article?.title || document.title || 'Article',
            byline: article?.byline || extractByline(document),
            content: fallbackContent,
            textContent: stripHtml(fallbackContent),
            length: fallbackContent.length,
            excerpt: generateExcerpt(stripHtml(fallbackContent)),
            siteName: article?.siteName || extractSiteName(document, url),
            publishedTime: extractPublishedTime(document),
            sourceUrl: url,
          }
        })
      }

      return NextResponse.json({
        success: false,
        error: 'Could not extract article content',
        fallbackUrl: url
      }, { status: 422 })
    }

    console.log('✅ Article extracted successfully')
    console.log('   Title:', article.title)
    console.log('   Length:', article.length, 'characters')
    console.log('   Text excerpt:', article.textContent?.substring(0, 100) + '...')

    // Clean the HTML content
    const cleanedContent = cleanArticleContent(article.content)

    return NextResponse.json({
      success: true,
      data: {
        title: title || article.title,
        byline: article.byline,
        content: cleanedContent,
        textContent: article.textContent,
        length: article.length,
        excerpt: article.excerpt || generateExcerpt(article.textContent),
        siteName: article.siteName || extractSiteName(document, url),
        publishedTime: extractPublishedTime(document),
        sourceUrl: url,
      }
    })

  } catch (error: any) {
    console.error('❌ Article reader error:', error)

    // Handle timeout
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return NextResponse.json({
        success: false,
        error: 'Request timed out. The article source may be slow or unavailable.',
        fallbackUrl: request.body ? JSON.parse(await request.text()).url : undefined
      }, { status: 504 })
    }

    // Handle network errors
    if (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND')) {
      return NextResponse.json({
        success: false,
        error: 'Could not connect to article source. Please check the URL.',
        fallbackUrl: request.body ? JSON.parse(await request.text()).url : undefined
      }, { status: 502 })
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch article',
      fallbackUrl: request.body ? JSON.parse(await request.text()).url : undefined
    }, { status: 500 })
  }
}

/**
 * Fallback content extraction when Readability fails
 */
function extractContentFallback(document: Document): string | null {
  // Try common article selectors (in order of specificity)
  const selectors = [
    'article',
    '[role="article"]',
    '[role="main"]',
    '.article-content',
    '.article-body',
    '.post-content',
    '.entry-content',
    '.story-body',
    '.article__content',
    '.content-body',
    '#article-content',
    '#main-content',
    '.main-content',
    'main article',
    'main section',
    'main div[class*="content"]',
    'main div[class*="article"]',
    'main div[class*="story"]',
    'main div[class*="post"]',
    'main',
    '.content',
    '#content',
  ]

  for (const selector of selectors) {
    const element = document.querySelector(selector)
    if (element && element.textContent && element.textContent.trim().length > 300) {
      console.log('✅ Fallback extraction successful with selector:', selector)
      
      // Clean up the extracted content
      const clone = element.cloneNode(true) as HTMLElement
      
      // Remove unwanted elements
      const unwantedSelectors = [
        'script',
        'style',
        'iframe',
        'nav',
        'aside',
        'header',
        'footer',
        '.advertisement',
        '.ad',
        '.social-share',
        '.related-articles',
        '.comments',
        '[class*="sidebar"]',
        '[class*="widget"]',
        '[id*="sidebar"]',
      ]
      
      unwantedSelectors.forEach(sel => {
        clone.querySelectorAll(sel).forEach(el => el.remove())
      })
      
      return clone.innerHTML
    }
  }

  // Last resort: try to find the longest text block
  console.warn('⚠️ All specific selectors failed, trying longest text block...')
  const textBlocks = Array.from(document.querySelectorAll('p, div'))
    .filter(el => {
      const text = el.textContent?.trim() || ''
      return text.length > 200 && !el.querySelector('p, div') // No nested content
    })
    .sort((a, b) => (b.textContent?.length || 0) - (a.textContent?.length || 0))

  if (textBlocks.length > 0) {
    // Get the parent container of the longest text block
    const longestBlock = textBlocks[0]
    const parent = longestBlock.parentElement
    
    if (parent && parent.textContent && parent.textContent.length > 500) {
      console.log('✅ Fallback successful using longest text block parent')
      return parent.innerHTML
    }
  }

  console.warn('⚠️ All fallback strategies failed')
  return null
}

/**
 * Extract byline/author from document
 */
function extractByline(document: Document): string | null {
  const selectors = [
    '[rel="author"]',
    '.author',
    '.byline',
    '[itemprop="author"]',
    'meta[name="author"]',
  ]

  for (const selector of selectors) {
    const element = document.querySelector(selector)
    if (element) {
      if (element.tagName === 'META') {
        return element.getAttribute('content')
      }
      return element.textContent?.trim() || null
    }
  }

  return null
}

/**
 * Extract site name from document or URL
 */
function extractSiteName(document: Document, url: string): string {
  // Try meta tags
  const ogSiteName = document.querySelector('meta[property="og:site_name"]')
  if (ogSiteName) {
    return ogSiteName.getAttribute('content') || ''
  }

  // Fallback to hostname
  try {
    const hostname = new URL(url).hostname
    return hostname.replace('www.', '').split('.')[0]
  } catch {
    return 'Article Source'
  }
}

/**
 * Extract published time from document
 */
function extractPublishedTime(document: Document): string | null {
  const selectors = [
    'meta[property="article:published_time"]',
    'meta[name="publishdate"]',
    'time[datetime]',
    '[itemprop="datePublished"]',
  ]

  for (const selector of selectors) {
    const element = document.querySelector(selector)
    if (element) {
      const datetime = element.getAttribute('content') || 
                      element.getAttribute('datetime') ||
                      element.textContent
      if (datetime) {
        return datetime.trim()
      }
    }
  }

  return null
}

/**
 * Clean article HTML content
 */
function cleanArticleContent(html: string): string {
  // Remove inline styles
  html = html.replace(/style="[^"]*"/gi, '')
  
  // Remove inline event handlers
  html = html.replace(/on\w+="[^"]*"/gi, '')
  
  // Remove script tags
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove iframe tags
  html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
  
  return html
}

/**
 * Strip HTML tags to get plain text
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ')
             .replace(/\s+/g, ' ')
             .trim()
}

/**
 * Generate excerpt from text content
 */
function generateExcerpt(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength).trim() + '...'
}

