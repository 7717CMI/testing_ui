/**
 * Production Email Service
 * 
 * Handles real email sending via SendGrid, Resend, or SMTP
 * Includes HTML templates, tracking, and unsubscribe support
 */

import sgMail from '@sendgrid/mail'
import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import validator from 'validator'
import * as brevo from '@getbrevo/brevo'
import { UserEmailAccount } from '@/types/email-accounts'
import { decrypt } from './encryption'

export interface EmailOptions {
  to: string | string[]
  from: string
  subject: string
  html: string
  text?: string
  cc?: string | string[]
  bcc?: string | string[]
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: string | Buffer
    type?: string
  }>
  // Tracking
  trackingId?: string
  unsubscribeUrl?: string
  // Custom headers
  headers?: Record<string, string>
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  provider?: string
}

class EmailService {
  private provider: 'sendgrid' | 'resend' | 'smtp' | 'professional' | 'mock'
  private sendgridApiKey?: string
  private resendApiKey?: string
  private professionalEmailApiKey?: string
  private professionalEmailApiInstance?: brevo.TransactionalEmailsApi
  private smtpConfig?: {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
  }
  private fromEmail: string
  private appUrl: string

  constructor() {
    this.provider = (process.env.EMAIL_ESP_PROVIDER as any) || 'mock'
    this.sendgridApiKey = process.env.SENDGRID_API_KEY
    this.resendApiKey = process.env.RESEND_API_KEY
    this.professionalEmailApiKey = process.env.PROFESSIONAL_EMAIL_API_KEY
    this.fromEmail = process.env.EMAIL_FROM_ADDRESS || process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com'
    this.appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Initialize SendGrid
    if (this.provider === 'sendgrid' && this.sendgridApiKey) {
      sgMail.setApiKey(this.sendgridApiKey)
    }

    // Initialize Professional Email Service (Brevo - white-labeled)
    if (this.provider === 'professional' && this.professionalEmailApiKey) {
      const defaultClient = brevo.ApiClient.instance
      const apiKey = defaultClient.authentications['api-key']
      apiKey.apiKey = this.professionalEmailApiKey
      this.professionalEmailApiInstance = new brevo.TransactionalEmailsApi()
    }

    // Initialize SMTP config
    if (this.provider === 'smtp') {
      this.smtpConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      }
    }
  }

  /**
   * Validate email address
   */
  validateEmail(email: string): boolean {
    return validator.isEmail(email)
  }

  /**
   * Create HTML email template with tracking pixels and unsubscribe link
   */
  createEmailTemplate(
    content: string,
    options: {
      trackingId?: string
      unsubscribeUrl?: string
      footerText?: string
    } = {}
  ): string {
    const { trackingId, unsubscribeUrl, footerText } = options

    // Convert markdown-style formatting to HTML
    let htmlContent = content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')

    // Wrap links with click tracking
    if (trackingId) {
      htmlContent = htmlContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        // Wrap markdown links with click tracking
        const trackingUrl = `${this.appUrl}/api/email-crm/track/click?token=${trackingId}&url=${encodeURIComponent(url)}`
        return `<a href="${trackingUrl}" style="color: #3b82f6; text-decoration: underline;">${text}</a>`
      })
      
      // Also wrap existing HTML links
      htmlContent = htmlContent.replace(/<a\s+href="([^"]+)"([^>]*)>([^<]+)<\/a>/g, (match, url, attrs, text) => {
        // Skip if already a tracking URL
        if (url.includes('/api/email-crm/track/click')) {
          return match
        }
        const trackingUrl = `${this.appUrl}/api/email-crm/track/click?token=${trackingId}&url=${encodeURIComponent(url)}`
        return `<a href="${trackingUrl}"${attrs} style="color: #3b82f6; text-decoration: underline;">${text}</a>`
      })
    }

    // Tracking pixel (1x1 transparent image)
    const trackingPixel = trackingId
      ? `<img src="${this.appUrl}/api/email-crm/track/open?token=${trackingId}" width="1" height="1" style="display:none;" alt="" />`
      : ''

    // Unsubscribe link
    const unsubscribeSection = unsubscribeUrl
      ? `
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
          ${footerText || 'You\'re receiving this email because you were contacted through our platform.'}
          <br>
          <a href="${unsubscribeUrl}" style="color: #3b82f6; text-decoration: none;">Unsubscribe</a>
        </div>
      `
      : ''

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #1f2937; background-color: #f9fafb;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="padding: 40px;">
                      <div style="color: #1f2937; line-height: 1.8;">
                        ${htmlContent}
                      </div>
                      ${unsubscribeSection}
                      ${trackingPixel}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  }

  /**
   * Send email via SendGrid
   */
  private async sendViaSendGrid(options: EmailOptions): Promise<EmailResult> {
    if (!this.sendgridApiKey) {
      throw new Error('SENDGRID_API_KEY not configured')
    }

    try {
      const msg: any = {
        to: Array.isArray(options.to) ? options.to : [options.to],
        from: options.from,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined,
        replyTo: options.replyTo,
        attachments: options.attachments,
        trackingSettings: {
          clickTracking: {
            enable: true,
          },
          openTracking: {
            enable: true,
          },
          subscriptionTracking: {
            enable: false, // We handle unsubscribe ourselves
          },
        },
        customArgs: {
          trackingId: options.trackingId || '',
        },
      }

      // Add custom headers
      if (options.headers) {
        msg.headers = options.headers
      }

      const [response] = await sgMail.send(msg)

      return {
        success: true,
        messageId: response.headers['x-message-id'] || `sg-${Date.now()}`,
        provider: 'sendgrid',
      }
    } catch (error: any) {
      console.error('[SendGrid] Error:', error)
      return {
        success: false,
        error: error.message || 'SendGrid send failed',
        provider: 'sendgrid',
      }
    }
  }

  /**
   * Send email via Resend
   */
  private async sendViaResend(options: EmailOptions): Promise<EmailResult> {
    if (!this.resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    try {
      const resend = new Resend(this.resendApiKey)

      const { data, error } = await resend.emails.send({
        from: options.from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined,
        replyTo: options.replyTo,
        attachments: options.attachments?.map((att) => ({
          filename: att.filename,
          content: att.content,
        })),
        headers: options.headers,
      })

      if (error) {
        throw new Error(error.message)
      }

      return {
        success: true,
        messageId: data?.id || `resend-${Date.now()}`,
        provider: 'resend',
      }
    } catch (error: any) {
      console.error('[Resend] Error:', error)
      return {
        success: false,
        error: error.message || 'Resend send failed',
        provider: 'resend',
      }
    }
  }

  /**
   * Send email via Professional Email Service (Brevo - white-labeled)
   */
  private async sendViaProfessionalEmail(options: EmailOptions): Promise<EmailResult> {
    if (!this.professionalEmailApiKey || !this.professionalEmailApiInstance) {
      throw new Error('Professional Email API key not configured')
    }

    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail()
      
      sendSmtpEmail.subject = options.subject
      sendSmtpEmail.htmlContent = options.html
      sendSmtpEmail.textContent = options.text || this.stripHtml(options.html)
      sendSmtpEmail.sender = { email: options.from, name: options.from.split('@')[0] }
      
      // Handle recipients
      const toEmails = Array.isArray(options.to) ? options.to : [options.to]
      sendSmtpEmail.to = toEmails.map(email => ({ email }))
      
      if (options.cc) {
        const ccEmails = Array.isArray(options.cc) ? options.cc : [options.cc]
        sendSmtpEmail.cc = ccEmails.map(email => ({ email }))
      }
      
      if (options.bcc) {
        const bccEmails = Array.isArray(options.bcc) ? options.bcc : [options.bcc]
        sendSmtpEmail.bcc = bccEmails.map(email => ({ email }))
      }
      
      if (options.replyTo) {
        sendSmtpEmail.replyTo = { email: options.replyTo }
      }
      
      // Add custom headers for tracking
      if (options.headers) {
        sendSmtpEmail.headers = options.headers
      }
      
      // Add attachments if any
      if (options.attachments) {
        sendSmtpEmail.attachment = options.attachments.map(att => ({
          name: att.filename,
          content: typeof att.content === 'string' 
            ? Buffer.from(att.content).toString('base64')
            : att.content.toString('base64'),
        }))
      }

      const data = await this.professionalEmailApiInstance.sendTransacEmail(sendSmtpEmail)

      return {
        success: true,
        messageId: data.messageId || `professional-${Date.now()}`,
        provider: 'professional',
      }
    } catch (error: any) {
      console.error('[Professional Email Service] Error:', error)
      const errorMessage = error.response?.body?.message || error.message || 'Professional Email send failed'
      return {
        success: false,
        error: errorMessage,
        provider: 'professional',
      }
    }
  }

  /**
   * Send email via SMTP
   */
  private async sendViaSMTP(options: EmailOptions): Promise<EmailResult> {
    if (!this.smtpConfig) {
      throw new Error('SMTP configuration not set')
    }

    try {
      const transporter = nodemailer.createTransport({
        host: this.smtpConfig.host,
        port: this.smtpConfig.port,
        secure: this.smtpConfig.secure,
        auth: this.smtpConfig.auth,
      })

      const mailOptions = {
        from: options.from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
        replyTo: options.replyTo,
        attachments: options.attachments,
        headers: options.headers,
      }

      const info = await transporter.sendMail(mailOptions)

      return {
        success: true,
        messageId: info.messageId || `smtp-${Date.now()}`,
        provider: 'smtp',
      }
    } catch (error: any) {
      console.error('[SMTP] Error:', error)
      return {
        success: false,
        error: error.message || 'SMTP send failed',
        provider: 'smtp',
      }
    }
  }

  /**
   * Send email via Gmail API using OAuth token
   */
  private async sendViaGmailAPI(options: EmailOptions, accessToken: string): Promise<EmailResult> {
    try {
      // Gmail API requires base64url encoding
      const toEmails = Array.isArray(options.to) ? options.to : [options.to]
      const message = {
        raw: this.createGmailMessage(options, toEmails),
      }

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Gmail API send failed')
      }

      const data = await response.json()
      return {
        success: true,
        messageId: data.id,
        provider: 'gmail',
      }
    } catch (error: any) {
      console.error('[Gmail API] Error:', error)
      return {
        success: false,
        error: error.message || 'Gmail API send failed',
        provider: 'gmail',
      }
    }
  }

  /**
   * Create Gmail API message format
   */
  private createGmailMessage(options: EmailOptions, toEmails: string[]): string {
    const lines: string[] = []
    lines.push(`To: ${toEmails.join(', ')}`)
    if (options.cc) {
      const ccEmails = Array.isArray(options.cc) ? options.cc : [options.cc]
      lines.push(`Cc: ${ccEmails.join(', ')}`)
    }
    if (options.bcc) {
      const bccEmails = Array.isArray(options.bcc) ? options.bcc : [options.bcc]
      lines.push(`Bcc: ${bccEmails.join(', ')}`)
    }
    lines.push(`From: ${options.from}`)
    lines.push(`Subject: ${options.subject}`)
    lines.push('MIME-Version: 1.0')
    lines.push('Content-Type: text/html; charset=utf-8')
    lines.push('')
    lines.push(options.html || options.text || '')

    // Base64url encode (Gmail API requirement)
    const message = lines.join('\r\n')
    return Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  /**
   * Send email via user's SMTP config
   */
  private async sendViaUserSMTP(options: EmailOptions, smtpConfig: UserEmailAccount['smtpConfig']): Promise<EmailResult> {
    if (!smtpConfig) {
      return {
        success: false,
        error: 'SMTP configuration not provided',
        provider: 'smtp',
      }
    }

    // Validate required fields
    if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
      return {
        success: false,
        error: 'SMTP configuration incomplete. Missing host, username, or password.',
        provider: 'smtp',
      }
    }

    try {
      // Decrypt password
      let decryptedPass: string
      try {
        decryptedPass = decrypt(smtpConfig.pass)
        if (!decryptedPass) {
          console.error('[User SMTP] Password decryption returned empty string')
          return {
            success: false,
            error: 'Failed to decrypt SMTP password. Please reconnect your email account.',
            provider: 'smtp',
          }
        }
      } catch (decryptError: any) {
        console.error('[User SMTP] Password decryption error:', decryptError)
        return {
          success: false,
          error: 'Failed to decrypt SMTP password. Please reconnect your email account.',
          provider: 'smtp',
        }
      }

      // Validate port
      const port = typeof smtpConfig.port === 'number' ? smtpConfig.port : parseInt(String(smtpConfig.port || '587'))
      if (isNaN(port) || port < 1 || port > 65535) {
        return {
          success: false,
          error: `Invalid SMTP port: ${smtpConfig.port}`,
          provider: 'smtp',
        }
      }

      console.log('[User SMTP] Creating transporter:', {
        host: smtpConfig.host,
        port: port,
        secure: smtpConfig.secure || port === 465,
        user: smtpConfig.user,
        hasPassword: !!decryptedPass,
      })

      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: port,
        secure: smtpConfig.secure || port === 465,
        auth: {
          user: smtpConfig.user,
          pass: decryptedPass,
        },
        // Add connection timeout
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
      })

      // Verify connection before sending
      try {
        console.log('[User SMTP] Verifying SMTP connection...')
        await transporter.verify()
        console.log('[User SMTP] ✅ SMTP connection verified')
      } catch (verifyError: any) {
        console.error('[User SMTP] Connection verification failed:', verifyError)
        return {
          success: false,
          error: `SMTP connection failed: ${verifyError.message || 'Unable to connect to SMTP server. Please check your credentials and network connection.'}`,
          provider: 'smtp',
        }
      }

      const toEmails = Array.isArray(options.to) ? options.to : [options.to]
      const mailOptions = {
        from: options.from || smtpConfig.user, // Fallback to SMTP user if from not provided
        to: toEmails.join(', '),
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html || ''),
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
        replyTo: options.replyTo,
        attachments: options.attachments,
        headers: options.headers,
      }

      console.log('[User SMTP] Sending email:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
      })

      const info = await transporter.sendMail(mailOptions)

      console.log('[User SMTP] ✅ Email sent successfully:', info.messageId)

      return {
        success: true,
        messageId: info.messageId || `smtp-${Date.now()}`,
        provider: 'smtp',
      }
    } catch (error: any) {
      console.error('[User SMTP] Send error:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
      })
      
      // Provide user-friendly error messages
      let errorMessage = 'SMTP send failed'
      if (error.code === 'EAUTH') {
        errorMessage = 'SMTP authentication failed. Please check your email and password. For Gmail, use an App Password (not your regular password).'
      } else if (error.code === 'ECONNECTION') {
        errorMessage = 'Unable to connect to SMTP server. Please check your SMTP host and port settings.'
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = 'SMTP connection timed out. Please check your network connection.'
      } else if (error.response) {
        errorMessage = `SMTP error: ${error.response}`
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return {
        success: false,
        error: errorMessage,
        provider: 'smtp',
      }
    }
  }

  /**
   * Main send method - routes to appropriate provider
   * Can use user's email account if provided
   */
  async send(options: EmailOptions, userEmailAccount?: UserEmailAccount): Promise<EmailResult> {
    // Validate email
    const toEmails = Array.isArray(options.to) ? options.to : [options.to]
    for (const email of toEmails) {
      if (!this.validateEmail(email)) {
        return {
          success: false,
          error: `Invalid email address: ${email}`,
        }
      }
    }

    // If user email account is provided, use it
    if (userEmailAccount) {
      // Ensure from email is set to user's email
      options.from = userEmailAccount.email

      // Create HTML template if plain text
      if (!options.html && options.text) {
        options.html = this.createEmailTemplate(options.text, {
          trackingId: options.trackingId,
          unsubscribeUrl: options.unsubscribeUrl,
        })
      } else if (options.html && !options.text) {
        options.text = this.stripHtml(options.html)
      }

      // Route based on user's email provider
      switch (userEmailAccount.provider) {
        case 'gmail':
          if (userEmailAccount.accessToken) {
            // Check if token is expired and refresh if needed
            if (userEmailAccount.expiresAt && new Date(userEmailAccount.expiresAt) < new Date()) {
              // Token expired - would need to refresh (implement refresh logic)
              return {
                success: false,
                error: 'Gmail access token expired. Please reconnect your account.',
                provider: 'gmail',
              }
            }
            return this.sendViaGmailAPI(options, userEmailAccount.accessToken)
          }
          return {
            success: false,
            error: 'Gmail access token not available',
            provider: 'gmail',
          }

        case 'smtp':
          if (userEmailAccount.smtpConfig) {
            return this.sendViaUserSMTP(options, userEmailAccount.smtpConfig)
          }
          return {
            success: false,
            error: 'SMTP configuration not available',
            provider: 'smtp',
          }

        case 'outlook':
          // Outlook implementation would go here (similar to Gmail)
          return {
            success: false,
            error: 'Outlook OAuth not yet implemented',
            provider: 'outlook',
          }

        default:
          return {
            success: false,
            error: `Unsupported provider: ${userEmailAccount.provider}`,
          }
      }
    }

    // Fallback to platform email service
    // Ensure from email is set
    if (!options.from) {
      options.from = this.fromEmail
    }

    // Create HTML template if plain text
    if (!options.html && options.text) {
      options.html = this.createEmailTemplate(options.text, {
        trackingId: options.trackingId,
        unsubscribeUrl: options.unsubscribeUrl,
      })
    } else if (options.html && !options.text) {
      options.text = this.stripHtml(options.html)
    }

    // Route to appropriate provider
    switch (this.provider) {
      case 'sendgrid':
        return this.sendViaSendGrid(options)
      case 'resend':
        return this.sendViaResend(options)
      case 'smtp':
        return this.sendViaSMTP(options)
      case 'professional':
        return this.sendViaProfessionalEmail(options)
      default:
        // Mock mode for development
        console.log('[Email Service] Mock send:', {
          to: options.to,
          from: options.from,
          subject: options.subject,
          htmlLength: options.html?.length,
        })
        return {
          success: true,
          messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          provider: 'mock',
        }
    }
  }

  /**
   * Strip HTML tags to create plain text version
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
  }
}

// Export singleton instance
export const emailService = new EmailService()

