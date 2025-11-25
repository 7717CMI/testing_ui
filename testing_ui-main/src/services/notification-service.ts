import { useNotificationsStore } from '@/stores/notifications-store'
import { useSavedSearchesStore } from '@/stores/saved-searches-store'
import { useAuthStore } from '@/stores/auth-store'
import { NotificationCheckResult } from '@/types/notifications'

/**
 * Real Notification Service
 * Checks for new healthcare news every 6 hours and creates notifications
 * Uses real data from /api/entity-news and /api/insights APIs
 */
class RealNotificationService {
  private static instance: RealNotificationService
  private checkInterval: NodeJS.Timeout | null = null
  private lastCheck: Date | null = null
  private seenArticleIds: Set<string> = new Set()
  
  // Check every 6 hours (9 AM, 3 PM, 9 PM, 3 AM)
  private HOURS_BETWEEN_CHECKS = 6

  private constructor() {
    this.loadLastCheckTime()
    this.loadSeenArticles()
  }

  static getInstance(): RealNotificationService {
    if (!RealNotificationService.instance) {
      RealNotificationService.instance = new RealNotificationService()
    }
    return RealNotificationService.instance
  }

  // ========================================
  // INITIALIZATION & LIFECYCLE
  // ========================================

  private loadLastCheckTime() {
    // Only access localStorage in the browser
    if (typeof window === 'undefined') return
    
    const stored = localStorage.getItem('notification_last_check')
    if (stored) {
      this.lastCheck = new Date(stored)
      console.log('📅 Last notification check:', this.lastCheck.toLocaleString())
    }
  }

  private saveLastCheckTime() {
    // Only access localStorage in the browser
    if (typeof window === 'undefined') return
    
    this.lastCheck = new Date()
    localStorage.setItem('notification_last_check', this.lastCheck.toISOString())
  }

  private loadSeenArticles() {
    // Only access localStorage in the browser
    if (typeof window === 'undefined') return
    
    const stored = localStorage.getItem('notification_seen_articles')
    if (stored) {
      try {
        const array = JSON.parse(stored)
        this.seenArticleIds = new Set(array)
        console.log(`📚 Loaded ${this.seenArticleIds.size} seen articles from storage`)
      } catch (e) {
        console.error('Error loading seen articles:', e)
        this.seenArticleIds = new Set()
      }
    }
  }

  private saveSeenArticles() {
    // Only access localStorage in the browser
    if (typeof window === 'undefined') return
    
    // Keep only last 1000 articles to prevent storage bloat
    const array = Array.from(this.seenArticleIds).slice(-1000)
    this.seenArticleIds = new Set(array)
    localStorage.setItem('notification_seen_articles', JSON.stringify(array))
  }

  // ========================================
  // PUBLIC API
  // ========================================

  /**
   * Initialize the notification service
   * Starts monitoring for new articles
   */
  initialize() {
    console.log('🔔 Real Notification Service: Starting...')
    
    const { userPreferences } = useNotificationsStore.getState()
    if (!userPreferences?.enabled) {
      console.log('⚠️  Notifications are disabled in user preferences')
      return
    }
    
    // Check immediately on startup if needed
    this.checkIfShouldRun()
    
    // Check every hour to see if 6 hours have passed
    this.checkInterval = setInterval(() => {
      this.checkIfShouldRun()
    }, 60 * 60 * 1000) // Every hour
    
    console.log('✅ Notification service initialized - checking every hour for 6-hour intervals')
  }

  /**
   * Stop the notification service
   */
  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
      console.log('🔕 Notification service stopped')
    }
  }

  /**
   * Manually check for new articles (for "Check Now" button)
   */
  async checkNow(): Promise<NotificationCheckResult> {
    console.log('🔄 Manual notification check triggered by user')
    return await this.runRealCheck()
  }

  /**
   * Clear all notification history (for testing/debugging)
   */
  clearHistory() {
    this.seenArticleIds.clear()
    this.lastCheck = null
    
    // Only access localStorage in the browser
    if (typeof window !== 'undefined') {
      localStorage.removeItem('notification_seen_articles')
      localStorage.removeItem('notification_last_check')
    }
    
    console.log('🗑️  Notification history cleared')
  }

  /**
   * Get time until next check
   */
  getNextCheckTime(): Date | null {
    if (!this.lastCheck) return new Date() // Check now if never checked
    
    const nextCheck = new Date(this.lastCheck.getTime() + (this.HOURS_BETWEEN_CHECKS * 60 * 60 * 1000))
    return nextCheck
  }

  // ========================================
  // INTERNAL LOGIC
  // ========================================

  private async checkIfShouldRun() {
    const { user } = useAuthStore.getState()
    const { userPreferences } = useNotificationsStore.getState()
    
    if (!user) {
      console.log('⚠️  No user logged in - skipping notification check')
      return
    }
    
    if (!userPreferences?.enabled) {
      console.log('⚠️  Notifications disabled - skipping check')
      return
    }

    if (!this.lastCheck) {
      console.log('🔔 First notification check - running now')
      await this.runRealCheck()
      return
    }

    const hoursSinceLastCheck = (Date.now() - this.lastCheck.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceLastCheck >= this.HOURS_BETWEEN_CHECKS) {
      console.log(`⏰ ${hoursSinceLastCheck.toFixed(1)} hours since last check - checking for news now`)
      await this.runRealCheck()
    } else {
      const hoursUntilNext = this.HOURS_BETWEEN_CHECKS - hoursSinceLastCheck
      console.log(`✅ Already checked recently. Next check in ${hoursUntilNext.toFixed(1)} hours`)
    }
  }

  /**
   * Main function: Check for real news and create notifications
   */
  private async runRealCheck(): Promise<NotificationCheckResult> {
    console.log('\n🔍 ===== CHECKING FOR REAL HEALTHCARE NEWS =====')
    
    const { user } = useAuthStore.getState()
    const { facilityLists } = useSavedSearchesStore.getState()
    const { addAlert, userPreferences } = useNotificationsStore.getState()

    const result: NotificationCheckResult = {
      success: false,
      newNotificationsCount: 0,
      totalArticlesFound: 0,
      errors: [],
      checkedAt: new Date(),
    }

    if (!user) {
      result.errors.push('No user logged in')
      return result
    }

    try {
      const notifications: any[] = []

      // ========================================
      // 1. CHECK SAVED FACILITIES FOR NEWS
      // ========================================
      console.log(`\n📋 Checking ${facilityLists.length} saved facility lists...`)

      for (const list of facilityLists) {
        try {
          // Use the list NAME as the entity (works with your API)
          const articles = await this.fetchRealFacilityNews(list.name)
          result.totalArticlesFound += articles.length
          
          // Filter out articles we've already seen
          const newArticles = articles.filter(article => {
            const articleId = this.generateArticleId(article)
            return !this.seenArticleIds.has(articleId)
          })

          if (newArticles.length > 0) {
            console.log(`  ✅ Found ${newArticles.length} NEW articles for "${list.name}"`)
            
            newArticles.forEach(article => {
              const articleId = this.generateArticleId(article)
              this.seenArticleIds.add(articleId)
              
              notifications.push({
                type: 'facility_news',
                priority: this.determinePriority(article),
                title: `📰 ${list.name}`,
                message: article.title || article.summary,
                link: `/entity-news?entity=${encodeURIComponent(list.name)}`,
                metadata: {
                  facilityList: list.name,
                  articleId: articleId,
                  category: article.category,
                  sourceUrl: article.sourceUrl,
                  date: article.date
                }
              })
            })
          } else if (articles.length > 0) {
            console.log(`  ℹ️  Found ${articles.length} articles for "${list.name}" (already seen)`)
          }
        } catch (error: any) {
          console.error(`  ❌ Error checking ${list.name}:`, error.message)
          result.errors.push(`Failed to check ${list.name}`)
        }
      }

      // ========================================
      // 2. CHECK TRENDING HEALTHCARE NEWS
      // ========================================
      if (userPreferences?.monitoredCategories) {
        console.log('\n📊 Checking trending healthcare news...')
        
        try {
          const trendingArticles = await this.fetchRealTrendingNews()
          result.totalArticlesFound += trendingArticles.length
          
          // Filter by user's selected categories
          const enabledCategories = Object.entries(userPreferences.monitoredCategories)
            .filter(([_, enabled]) => enabled)
            .map(([cat]) => cat.toLowerCase())
          
          const relevantArticles = trendingArticles.filter(article => {
            const category = (article.category || '').toLowerCase()
            return enabledCategories.some(cat => 
              category.includes(cat) || category.includes(cat.replace('mna', 'm&a'))
            )
          })
          
          const newTrending = relevantArticles.filter(article => {
            const articleId = this.generateArticleId(article)
            return !this.seenArticleIds.has(articleId)
          })

          if (newTrending.length > 0) {
            console.log(`  ✅ Found ${newTrending.length} NEW trending articles (filtered by your preferences)`)
            
            // Group by category for better UX
            const byCategory: { [key: string]: any[] } = {}
            newTrending.forEach(article => {
              const category = article.category || 'General'
              if (!byCategory[category]) byCategory[category] = []
              byCategory[category].push(article)
              
              const articleId = this.generateArticleId(article)
              this.seenArticleIds.add(articleId)
            })

            // Create notifications per category
            Object.entries(byCategory).forEach(([category, articles]) => {
              notifications.push({
                type: 'market_trend',
                priority: 'medium',
                title: `📈 ${category}: ${articles.length} new ${articles.length > 1 ? 'articles' : 'article'}`,
                message: articles[0].title,
                link: `/insights?category=${encodeURIComponent(category)}`,
                metadata: {
                  category,
                  articleCount: articles.length,
                  articles: articles.slice(0, 5).map((a: any) => ({
                    title: a.title,
                    sourceUrl: a.sourceUrl
                  }))
                }
              })
            })
          } else if (relevantArticles.length > 0) {
            console.log(`  ℹ️  Found ${relevantArticles.length} trending articles (already seen)`)
          }
        } catch (error: any) {
          console.error('  ❌ Error checking trending news:', error.message)
          result.errors.push('Failed to check trending news')
        }
      }

      // ========================================
      // 3. CREATE NOTIFICATIONS
      // ========================================
      console.log(`\n📤 Creating ${notifications.length} notifications...`)
      
      notifications.forEach(notification => {
        addAlert(notification)
      })

      result.newNotificationsCount = notifications.length
      result.success = true

      // ========================================
      // 4. SAVE STATE
      // ========================================
      this.saveSeenArticles()
      this.saveLastCheckTime()

      // ========================================
      // 5. SUMMARY
      // ========================================
      console.log('\n📊 ===== NOTIFICATION CHECK COMPLETE =====')
      console.log(`Total articles found: ${result.totalArticlesFound}`)
      console.log(`New notifications created: ${result.newNotificationsCount}`)
      console.log(`Errors: ${result.errors.length}`)
      console.log('============================================\n')

      // Show summary notification if articles found
      if (result.newNotificationsCount > 0) {
        addAlert({
          type: 'system',
          priority: 'low',
          title: '🔔 News Digest',
          message: `Found ${result.newNotificationsCount} new healthcare ${result.newNotificationsCount === 1 ? 'update' : 'updates'}`,
          link: '/notifications'
        } as any)
      }

    } catch (error: any) {
      console.error('❌ Critical error in notification check:', error)
      result.errors.push(error.message)
    }

    return result
  }

  // ========================================
  // API INTEGRATION
  // ========================================

  /**
   * Fetch real news for a specific facility from your API
   */
  private async fetchRealFacilityNews(facilityName: string): Promise<any[]> {
    try {
      console.log(`  → Fetching news for: ${facilityName}`)
      
      const response = await fetch('/api/entity-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityName: facilityName,
          entityType: 'facility',
          timeRange: '24h', // Last 24 hours only
        }),
      })

      if (!response.ok) {
        console.log(`  ⚠️  No news found for ${facilityName} (${response.status})`)
        return []
      }

      const data = await response.json()
      
      if (data.success && data.data && Array.isArray(data.data)) {
        const articles = data.data.slice(0, 5) // Max 5 per facility
        console.log(`  ✅ API returned ${articles.length} articles`)
        return articles
      }
      
      return []
    } catch (error: any) {
      console.error(`  ❌ Error fetching news for ${facilityName}:`, error.message)
      return []
    }
  }

  /**
   * Fetch real trending healthcare news from your API
   */
  private async fetchRealTrendingNews(): Promise<any[]> {
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityType: 'healthcare',
          category: 'all',
        }),
      })

      if (!response.ok) {
        console.log(`  ⚠️  Failed to fetch trending news (${response.status})`)
        return []
      }

      const data = await response.json()
      
      if (data.success && data.data?.articles && Array.isArray(data.data.articles)) {
        const articles = data.data.articles.slice(0, 10) // Top 10
        console.log(`  ✅ API returned ${articles.length} trending articles`)
        return articles
      }
      
      return []
    } catch (error: any) {
      console.error('  ❌ Error fetching trending news:', error.message)
      return []
    }
  }

  // ========================================
  // UTILITIES
  // ========================================

  /**
   * Generate unique ID for articles to prevent duplicates
   */
  private generateArticleId(article: any): string {
    // Use URL if available
    if (article.sourceUrl) {
      return `url-${article.sourceUrl}`
    }
    // Use ID if available
    if (article.id) {
      return `id-${article.id}`
    }
    // Fallback: hash of title + date
    const hash = `${article.title || 'untitled'}-${article.date || Date.now()}`
      .replace(/\s+/g, '-')
      .toLowerCase()
      .substring(0, 100)
    return `hash-${hash}`
  }

  /**
   * Determine notification priority based on article content
   */
  private determinePriority(article: any): 'low' | 'medium' | 'high' | 'urgent' {
    const title = (article.title || '').toLowerCase()
    const category = (article.category || '').toLowerCase()
    
    // Urgent keywords
    if (title.includes('emergency') || title.includes('crisis') || title.includes('shutdown')) {
      return 'urgent'
    }
    
    // High priority keywords
    if (title.includes('acquisition') || title.includes('merger') || 
        title.includes('closes') || title.includes('bankruptcy') ||
        category.includes('m&a') || category.includes('acquisition')) {
      return 'high'
    }
    
    // Medium priority
    if (category.includes('expansion') || category.includes('funding') || 
        category.includes('technology') || title.includes('expands')) {
      return 'medium'
    }
    
    // Default
    return 'low'
  }
}

// Export singleton instance
export const notificationService = RealNotificationService.getInstance()
