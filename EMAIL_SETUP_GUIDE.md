# 📧 Production Email Setup Guide

Complete guide to setting up real email sending with tracking, webhooks, and unsubscribe functionality.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install @sendgrid/mail resend nodemailer validator
```

### 2. Choose Your Email Provider

**Recommended: SendGrid** (most reliable, best tracking)
- Free tier: 100 emails/day
- Easy setup
- Excellent deliverability
- Built-in tracking

**Alternative: Resend** (modern, developer-friendly)
- Free tier: 3,000 emails/month
- Simple API
- Good tracking

**Alternative: SMTP** (any email provider)
- Gmail, Outlook, custom SMTP
- More configuration needed
- Limited tracking

## 📋 Environment Variables

Add these to your `.env.local`:

```bash
# Email Provider (choose one: 'sendgrid', 'resend', 'smtp', or 'mock' for testing)
EMAIL_ESP_PROVIDER=sendgrid

# SendGrid Configuration
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# OR Resend Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# OR SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_EMAIL=noreply@yourdomain.com

# App URL (for tracking links and unsubscribe)
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# From Address (fallback)
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
```

## 🔧 SendGrid Setup (Recommended)

### Step 1: Create SendGrid Account

1. Go to [SendGrid](https://sendgrid.com)
2. Sign up for free account (100 emails/day)
3. Verify your email

### Step 2: Create API Key

1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it: "Email Outreach API"
4. Select **Full Access** (or **Restricted Access** with Mail Send permissions)
5. Copy the API key (you'll only see it once!)
6. Add to `.env.local`: `SENDGRID_API_KEY=SG.your_key_here`

### Step 3: Verify Sender Identity

**Option A: Single Sender Verification (Quick)**
1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details
4. Verify the email sent to you
5. Use this email as `SENDGRID_FROM_EMAIL`

**Option B: Domain Authentication (Production)**
1. Go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Follow DNS setup instructions
4. Add DNS records to your domain
5. Wait for verification (can take 24-48 hours)
6. Use any email from your domain as `SENDGRID_FROM_EMAIL`

### Step 4: Set Up Webhooks (For Tracking)

1. Go to **Settings** → **Mail Settings** → **Event Webhook**
2. Click **Create Webhook**
3. Set **HTTP POST URL**: `https://yourdomain.com/api/email-crm/webhook/sendgrid`
4. Select events:
   - ✅ **Open** (email opened)
   - ✅ **Click** (link clicked)
   - ✅ **Bounce** (email bounced)
   - ✅ **Dropped** (email dropped)
   - ✅ **Spam Report** (marked as spam)
   - ✅ **Unsubscribe** (user unsubscribed)
   - ✅ **Delivered** (email delivered)
5. Click **Save**

**For Local Development:**
- Use [ngrok](https://ngrok.com) to expose localhost
- Run: `ngrok http 3000`
- Use the ngrok URL in webhook: `https://your-ngrok-url.ngrok.io/api/email-crm/webhook/sendgrid`

## 🔧 Resend Setup

### Step 1: Create Resend Account

1. Go to [Resend](https://resend.com)
2. Sign up (3,000 emails/month free)
3. Verify your email

### Step 2: Create API Key

1. Go to **API Keys**
2. Click **Create API Key**
3. Name it: "Email Outreach"
4. Copy the API key
5. Add to `.env.local`: `RESEND_API_KEY=re_your_key_here`

### Step 3: Verify Domain

1. Go to **Domains**
2. Click **Add Domain**
3. Add your domain
4. Add DNS records (SPF, DKIM, DMARC)
5. Wait for verification
6. Use email from your domain as `RESEND_FROM_EMAIL`

### Step 4: Set Up Webhooks

1. Go to **API Keys** → **Webhooks**
2. Click **Add Webhook**
3. Set URL: `https://yourdomain.com/api/email-crm/webhook/resend`
4. Select events:
   - ✅ email.sent
   - ✅ email.delivered
   - ✅ email.opened
   - ✅ email.clicked
   - ✅ email.bounced
   - ✅ email.complained
5. Save

## 🔧 SMTP Setup (Gmail Example)

### Step 1: Enable 2-Factor Authentication

1. Go to Google Account settings
2. Enable 2FA

### Step 2: Create App Password

1. Go to **Security** → **2-Step Verification** → **App passwords**
2. Select **Mail** and **Other (Custom name)**
3. Name it: "Email Outreach"
4. Copy the 16-character password
5. Add to `.env.local`: `SMTP_PASS=your_app_password`

### Step 3: Configure Environment

```bash
EMAIL_ESP_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
```

## ✅ Testing

### Test Single Email

1. Go to `/email-outreach`
2. Import a lead with your email address
3. Click "Send Email"
4. Compose and send
5. Check your inbox!

### Test Tracking

1. Send an email to yourself
2. Open the email (tracking pixel fires)
3. Click a link in the email (click tracking fires)
4. Go to **Tracking** tab in the app
5. You should see "Opened" and "Clicked" status

### Test Unsubscribe

1. Click unsubscribe link in email footer
2. Should redirect to unsubscribe confirmation page
3. Future emails to that address should be blocked

## 🔒 Security Best Practices

### 1. Webhook Signature Verification

**SendGrid:**
```typescript
// In webhook route, verify signature
const signature = request.headers.get('x-twilio-email-event-webhook-signature')
// Implement verification (see SendGrid docs)
```

**Resend:**
```typescript
// In webhook route, verify signature
const signature = request.headers.get('resend-signature')
// Implement verification (see Resend docs)
```

### 2. Rate Limiting

- Current: 10 emails/minute per user
- For production, use Redis for distributed rate limiting
- Consider user subscription tier limits

### 3. Email Validation

- All emails are validated before sending
- Invalid emails are rejected immediately

### 4. Unsubscribe Compliance

- All emails include unsubscribe link
- Unsubscribed users are blocked from future sends
- Complies with CAN-SPAM, GDPR, CASL

## 📊 Tracking Features

### Automatic Tracking

- **Opens**: Via 1x1 tracking pixel
- **Clicks**: Via link wrapping with redirect
- **Bounces**: Via webhook events
- **Unsubscribes**: Via unsubscribe link

### Dashboard Metrics

- Total sent
- Open rate
- Click rate
- Reply rate (manual entry)
- Bounce rate

## 🚨 Troubleshooting

### Emails Not Sending

1. **Check API Key**: Verify it's correct in `.env.local`
2. **Check From Address**: Must be verified in SendGrid/Resend
3. **Check Rate Limits**: You may have hit daily limit
4. **Check Console**: Look for error messages
5. **Check Provider Status**: SendGrid/Resend status page

### Tracking Not Working

1. **Webhook Not Set Up**: Configure webhook in provider dashboard
2. **Webhook URL Wrong**: Must be publicly accessible
3. **HTTPS Required**: Webhooks require HTTPS (use ngrok for local)
4. **Check Webhook Logs**: Provider dashboard shows webhook events

### Emails Going to Spam

1. **Verify Domain**: Set up SPF, DKIM, DMARC records
2. **Warm Up Domain**: Start with small volumes
3. **Content Quality**: Avoid spam trigger words
4. **List Quality**: Only send to opted-in recipients
5. **Unsubscribe Link**: Must be present and working

## 📈 Production Checklist

- [ ] Domain verified in email provider
- [ ] SPF, DKIM, DMARC records configured
- [ ] Webhooks configured and tested
- [ ] Rate limiting implemented
- [ ] Error handling and retry logic
- [ ] Unsubscribe functionality tested
- [ ] Email templates reviewed
- [ ] Tracking verified (opens, clicks)
- [ ] Bounce handling tested
- [ ] Monitoring and alerts set up

## 🎯 Next Steps

1. **Set up domain authentication** (for better deliverability)
2. **Implement email sequences** (automated follow-ups)
3. **Add A/B testing** (test subject lines, content)
4. **Set up monitoring** (track delivery rates, errors)
5. **Implement reply detection** (IMAP/POP3 integration)
6. **Add email scheduling** (send at optimal times)
7. **Create email templates library** (reusable templates)

## 📚 Resources

- [SendGrid Documentation](https://docs.sendgrid.com)
- [Resend Documentation](https://resend.com/docs)
- [Email Deliverability Guide](https://www.mailgun.com/blog/email-deliverability-guide/)
- [CAN-SPAM Compliance](https://www.ftc.gov/tips-advice/business-center/guidance/can-spam-act-compliance-guide-business)


