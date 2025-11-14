# 📧 Email Outreach CRM Module

A production-ready, lightweight email outreach module for lead management and personalized email campaigns. Built with Next.js, TypeScript, and Zustand.

## 🎯 Features

### Core Functionality
- **Lead Import**: Scrape leads from LinkedIn URLs or add manually
- **Email Enrichment**: Find email addresses for leads (mock integration ready for Hunter.io)
- **Email Composer**: Rich text editor with templates and merge tags
- **Bulk Sending**: Send to up to 20 leads at once with staggered delivery
- **Email Tracking**: Track opens, clicks, replies, and bounces
- **Performance Metrics**: Open rates, reply rates, and activity timeline
- **Template System**: 5 pre-built templates with merge tag support
- **Scheduling**: Schedule emails for future delivery
- **Onboarding Tour**: 3-step interactive tour for first-time users

## 📁 File Structure

```
src/
├── stores/
│   └── email-crm-store.ts          # Zustand store for state management
├── components/
│   └── email-crm/
│       ├── lead-importer.tsx       # Lead import component
│       ├── lead-dashboard.tsx      # Leads table and management
│       ├── email-composer.tsx      # Email composition modal
│       ├── tracking-panel.tsx      # Analytics and activity tracking
│       └── email-onboarding-tour.tsx # Onboarding tour
├── app/
│   ├── email-outreach/
│   │   └── page.tsx                # Main email outreach page
│   └── api/
│       └── email-crm/
│           └── send/
│               └── route.ts        # Email sending API endpoint
```

## 🚀 Getting Started

### 1. Access the Module

Navigate to `/email-outreach` in your application or click "Email Outreach" in the navigation bar.

### 2. Import Leads

**Option A: LinkedIn URLs**
- Paste LinkedIn profile URLs (one per line) in the import box
- Click "Import Leads"
- The system will extract name, designation, and company (mock parsing in development)

**Option B: Quick Add**
- Click "Quick Add" button
- Manually enter lead information
- Optionally add email address

### 3. Enrich Leads

- Click "Find Email" on any lead without an email
- System will attempt to find email (mock in development, ready for Hunter.io integration)

### 4. Send Emails

**Single Send:**
- Click the "Send Email" button on any lead
- Select a template or write custom email
- Use merge tags: `{{name}}`, `{{company}}`, `{{designation}}`
- Preview before sending
- Confirm consent and send

**Bulk Send:**
- Select multiple leads (checkbox)
- Click "Bulk Send" (max 20 leads)
- Compose email with merge tags
- System will personalize for each lead

### 5. Track Performance

- View stats: Total sent, open rate, reply rate, sent today
- See recent activity timeline
- Monitor email status: Sent → Opened → Clicked → Replied

## 🔧 Configuration

### Environment Variables

Add these to your `.env.local`:

```bash
# Email Service Provider (choose one)
EMAIL_ESP_PROVIDER=mock  # Options: 'sendgrid', 'resend', 'smtp', 'mock'

# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Resend Configuration
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_EMAIL=noreply@yourdomain.com

# App URL (for unsubscribe links)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### ESP Integration

The module supports three email service providers:

#### SendGrid
1. Sign up at [SendGrid](https://sendgrid.com)
2. Get API key from Settings → API Keys
3. Set `EMAIL_ESP_PROVIDER=sendgrid`
4. Add `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL`

#### Resend
1. Sign up at [Resend](https://resend.com)
2. Get API key from API Keys section
3. Set `EMAIL_ESP_PROVIDER=resend`
4. Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL`

#### SMTP
1. Configure SMTP settings
2. Set `EMAIL_ESP_PROVIDER=smtp`
3. Add SMTP configuration variables

**Note**: Currently using mock sending. To enable real sending, uncomment the ESP code in `/api/email-crm/send/route.ts` and install the required packages:

```bash
# For SendGrid
npm install @sendgrid/mail

# For Resend
npm install resend

# For SMTP
npm install nodemailer
```

## 📊 Merge Tags

Use these merge tags in email templates:

- `{{name}}` - Lead's name
- `{{company}}` - Lead's company
- `{{designation}}` - Lead's job title

Example:
```
Hi {{name}},

I noticed you're the {{designation}} at {{company}}...
```

## 🎨 Customization

### Adding Email Templates

Templates are stored in `email-crm-store.ts`. Add new templates:

```typescript
{
  name: 'Your Template Name',
  subject: 'Your subject with {{name}}',
  body: `Your email body
  with {{company}} and {{designation}}`,
}
```

### Styling

All components use Tailwind CSS and follow your existing design system. Customize colors, spacing, and animations in component files.

## 🔒 Security & Compliance

### Rate Limiting
- 10 emails per minute per user (configurable in API route)
- Prevents abuse and ensures deliverability

### Consent Management
- Users must confirm outreach consent before sending
- Unsubscribe links automatically added to all emails
- Unsubscribe endpoint: `/unsubscribe?email=...&token=...`

### Data Privacy
- All lead data stored locally (IndexedDB via Zustand persist)
- No data sent to external services except email ESP
- GDPR-compliant unsubscribe mechanism

## 🧪 Testing

### Mock Mode (Development)
- Set `EMAIL_ESP_PROVIDER=mock` (default)
- Emails are logged to console
- No actual emails sent

### Production Testing
1. Use a test ESP account
2. Send to your own email addresses first
3. Verify deliverability and tracking

## 📈 Performance

- **Optimistic UI**: Instant feedback on actions
- **Lazy Loading**: Tables load progressively
- **Efficient State**: Zustand with persistence
- **Rate Limiting**: Prevents API abuse

## 🐛 Troubleshooting

### Emails Not Sending
1. Check ESP configuration in `.env.local`
2. Verify API keys are correct
3. Check browser console for errors
4. Ensure rate limit not exceeded

### Leads Not Importing
1. Verify URL format (must be valid LinkedIn URL)
2. Check browser console for parsing errors
3. Try "Quick Add" as alternative

### Tracking Not Working
- Tracking requires ESP webhook integration
- Currently using mock tracking in development
- Implement webhooks for production (see ESP documentation)

## 🚀 Deployment

### Vercel
1. Add environment variables in Vercel dashboard
2. Deploy as usual
3. Email API routes work automatically

### Other Platforms
1. Ensure Node.js 18+ runtime
2. Set all environment variables
3. Install dependencies: `npm install`
4. Build: `npm run build`
5. Start: `npm start`

## 📝 Future Enhancements

- [ ] Real LinkedIn scraping integration
- [ ] Hunter.io email enrichment API
- [ ] Email webhook handling for tracking
- [ ] Advanced analytics dashboard
- [ ] A/B testing for email templates
- [ ] Email sequence automation
- [ ] CRM integration (Salesforce, HubSpot)
- [ ] Export leads to CSV
- [ ] Email scheduling calendar view

## 📄 License

Part of the HealthData AI platform.

## 🤝 Support

For issues or questions, check the main project documentation or contact the development team.

