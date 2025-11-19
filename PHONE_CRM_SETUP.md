# 📞 Phone CRM Setup Guide

This guide will help you set up the Phone CRM feature using Twilio API.

## Prerequisites

1. **Twilio Account**: Sign up at [twilio.com](https://www.twilio.com)
2. **Twilio Phone Number**: Purchase a phone number from Twilio
3. **API Credentials**: Get your Account SID, Auth Token, and API Key

## Step 1: Get Twilio Credentials

### Account SID and Auth Token
1. Log in to [Twilio Console](https://console.twilio.com)
2. Go to **Account** → **Account Info**
3. Copy:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click to reveal)

### API Key
- **API Key SID**: `SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (get from Twilio Console)
- **API Key Secret**: `your_api_key_secret_here` (get from Twilio Console)

### Phone Number
1. Go to **Phone Numbers** → **Manage** → **Active Numbers**
2. Copy your Twilio phone number (format: `+1234567890`)

### TwiML App SID (For Browser Calling)
1. Go to **TwiML** → **TwiML Apps**
2. Click **Create new TwiML App**
3. Name it: `Phone CRM App`
4. Set **Voice Configuration**:
   - **Request URL**: `https://your-domain.com/api/phone-crm/webhook/voice`
   - **HTTP Method**: `POST`
5. Copy the **App SID** (starts with `AP...`)

## Step 2: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SECRET=your_api_key_secret_here
TWILIO_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# App URL (for webhooks)
NEXT_PUBLIC_APP_URL=http://localhost:3010
```

**Important**: 
- Replace `your_auth_token_here` with your actual Auth Token
- Replace `+1234567890` with your Twilio phone number
- Replace `APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with your TwiML App SID
- For production, update `NEXT_PUBLIC_APP_URL` to your production domain

## Step 3: Install Dependencies

Dependencies are already installed. If needed, run:

```bash
npm install twilio @twilio/voice-sdk
```

## Step 4: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/email-outreach` → **Phone** tab

3. Try making a test call:
   - Enter a phone number (format: `+1234567890`)
   - Click **Call**
   - The call should be initiated

## Features

### ✅ Implemented Features

1. **Call Dialer**: Make outbound calls from the browser
2. **Call History**: View all past calls with details
3. **Call Controls**: Mute, hold, and end calls
4. **Call Notes**: Add notes after calls
5. **Call Analytics**: View call statistics (total calls, success rate, average duration)
6. **Click-to-Call**: Call leads directly from the lead dashboard
7. **Call Recording**: Automatic call recording (optional)

### 📋 Call Status Tracking

- **initiated**: Call is being set up
- **ringing**: Phone is ringing
- **in-progress**: Call is active
- **completed**: Call ended successfully
- **failed**: Call failed
- **no-answer**: No answer
- **busy**: Line busy
- **canceled**: Call was canceled

## API Endpoints

### Generate Access Token
```
POST /api/phone-crm/token
Body: { identity: string }
Response: { success: true, token: string }
```

### Initiate Call
```
POST /api/phone-crm/call
Body: { to: string, from?: string, leadId?: string, record?: boolean }
Response: { success: true, callSid: string, status: string }
```

### Webhooks (Called by Twilio)

- **Voice Webhook**: `/api/phone-crm/webhook/voice` - Handles call instructions
- **Status Webhook**: `/api/phone-crm/webhook/status` - Receives call status updates
- **Recording Webhook**: `/api/phone-crm/webhook/recording` - Receives recording URLs

## Usage

### Making a Call

1. **From Phone Tab**:
   - Go to Email Outreach → Phone tab
   - Enter phone number
   - Click "Call"

2. **From Lead Dashboard**:
   - Go to Email Outreach → Leads tab
   - Click the phone icon (📞) next to a lead with a phone number
   - You'll be taken to the Phone tab with the number pre-filled

### During a Call

- **Mute**: Click the microphone icon to mute/unmute
- **Hold**: Click the pause icon to hold/resume
- **End Call**: Click "End Call" button

### After a Call

- View call in **Call History**
- Add notes by clicking "Add Note"
- View call duration and status

## Troubleshooting

### "Device not ready" Error
- Check that all environment variables are set correctly
- Verify Twilio credentials are valid
- Check browser console for detailed errors

### "Failed to get access token" Error
- Verify `TWILIO_ACCOUNT_SID`, `TWILIO_API_KEY_SID`, and `TWILIO_API_KEY_SECRET` are correct
- Check that `TWILIO_APP_SID` is set

### Calls Not Connecting
- Verify `TWILIO_PHONE_NUMBER` is correct
- Check that phone numbers are in E.164 format (`+1234567890`)
- Verify TwiML App is configured correctly
- Check webhook URLs are accessible (for production)

### Webhook Errors
- Ensure `NEXT_PUBLIC_APP_URL` is set correctly
- For local development, use a tool like [ngrok](https://ngrok.com) to expose your local server
- Verify webhook URLs in Twilio Console match your API routes

## Security Notes

- ⚠️ **Never commit `.env.local` to git**
- ⚠️ **Keep Twilio credentials server-side only**
- ⚠️ **Use environment variables, never hardcode credentials**
- ⚠️ **Rotate API keys if exposed**

## Cost Considerations

- Twilio charges per minute for outbound calls
- Recording storage has additional costs
- Phone number has monthly fees
- Consider setting call limits per user/plan

## Next Steps

1. Complete the environment variable setup
2. Test with a real phone number
3. Configure webhooks for production
4. Set up call recording (optional)
5. Add call scheduling (future feature)

## Support

For Twilio-specific issues, refer to:
- [Twilio Documentation](https://www.twilio.com/docs)
- [Twilio Voice SDK](https://www.twilio.com/docs/voice/sdks/javascript)
- [Twilio Console](https://console.twilio.com)


