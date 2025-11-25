/**
 * Email Queue System
 * 
 * Handles queuing and processing of bulk email sends
 * Prevents rate limiting and ensures reliable delivery
 */

import { emailService, EmailOptions } from './email-service'

export interface QueuedEmail {
  id: string
  options: EmailOptions
  retries: number
  scheduledFor?: Date
  createdAt: Date
}

class EmailQueue {
  private queue: QueuedEmail[] = []
  private processing = false
  private maxRetries = 3
  private delayBetweenEmails = 1000 // 1 second between emails
  private batchSize = 10 // Process 10 emails at a time

  /**
   * Add email to queue
   */
  enqueue(email: QueuedEmail): void {
    this.queue.push(email)
    this.processQueue()
  }

  /**
   * Add multiple emails to queue
   */
  enqueueBatch(emails: QueuedEmail[]): void {
    this.queue.push(...emails)
    this.processQueue()
  }

  /**
   * Process queue with rate limiting
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true

    try {
      while (this.queue.length > 0) {
        const batch = this.queue.splice(0, this.batchSize)

        // Process batch in parallel with delay
        const promises = batch.map(async (email, index) => {
          // Stagger sends to avoid rate limiting
          if (index > 0) {
            await new Promise((resolve) => setTimeout(resolve, this.delayBetweenEmails * index))
          }

          // Check if scheduled for future
          if (email.scheduledFor && email.scheduledFor > new Date()) {
            // Re-queue for later
            this.queue.push(email)
            return
          }

          return this.sendWithRetry(email)
        })

        await Promise.allSettled(promises)

        // Small delay between batches
        if (this.queue.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }
    } finally {
      this.processing = false
    }
  }

  /**
   * Send email with retry logic
   */
  private async sendWithRetry(email: QueuedEmail): Promise<void> {
    try {
      const result = await emailService.send(email.options)

      if (!result.success) {
        throw new Error(result.error || 'Send failed')
      }
    } catch (error: any) {
      email.retries++

      if (email.retries < this.maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, email.retries) * 1000
        setTimeout(() => {
          this.queue.push(email)
          this.processQueue()
        }, delay)
      } else {
        console.error(`[Email Queue] Failed after ${this.maxRetries} retries:`, email.id, error)
        // Could emit event or store failed email for manual review
      }
    }
  }

  /**
   * Get queue status
   */
  getStatus(): { queued: number; processing: boolean } {
    return {
      queued: this.queue.length,
      processing: this.processing,
    }
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue = []
  }
}

// Export singleton instance
export const emailQueue = new EmailQueue()







