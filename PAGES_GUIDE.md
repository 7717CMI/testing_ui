# 📄 Pages Visual Guide

## Quick Reference for All Pages

### 1. 🏠 Landing Page (`/`)

**URL**: `http://localhost:3000/`

**Sections**:
- Navigation bar with logo and CTA buttons
- Hero section: "Healthcare Data. Reimagined."
- Stats ticker: 6M+ facilities, 99.9% accuracy, 50K+ updates, 24/7 support
- Feature grid (6 cards):
  - Advanced Search
  - AI Assistant
  - Real-Time Insights
  - Geographic Mapping
  - Advanced Analytics
  - Verified Data
- Pricing section (3 tiers):
  - Free: $0/month
  - Pro: $99/month (Most Popular)
  - Enterprise: Custom
- Footer with links

**Actions**:
- "Start Free Trial" → `/signup`
- "Explore Insights" → `/search`
- "Login" → `/login`

---

### 2. 🔐 Login Page (`/login`)

**URL**: `http://localhost:3000/login`

**Features**:
- Email input with validation
- Password input
- "Remember me" checkbox
- "Forgot password?" link → `/forgot-password`
- Social login buttons (Google, GitHub) - Placeholder
- "Sign up" link → `/signup`

**Mock Login**: Any email/password works!

---

### 3. ✍️ Signup Page (`/signup`)

**URL**: `http://localhost:3000/signup`

**Step 1: Account Info**
- Full name
- Email
- Password with strength meter
- Confirm password
- Social signup options

**Step 2: Role Selection**
- Admin (full access)
- Analyst (search & analytics)
- Viewer (read-only)

**Step 3: Plan Selection**
- Free ($0)
- Pro ($99) - Popular
- Enterprise (Custom)

**Progress**: Visual 3-step indicator

---

### 4. 🔑 Forgot Password (`/forgot-password`)

**URL**: `http://localhost:3000/forgot-password`

**Features**:
- Email input
- "Send Reset Link" button
- Success state with confirmation
- "Resend" option
- "Back to login" link

---

### 5. 🔍 Search Interface (`/search`)

**URL**: `http://localhost:3000/search`

**Layout**: 3-column (collapsible)

**Left Sidebar - Filters**:
- Facility Type (Hospital, Clinic, Urgent Care, Mental Health)
- Ownership (Public, Private, Non-Profit)
- Accreditation (Joint Commission, NCQA, CARF, UCAOA)
- Bed Count (0-1000 slider)
- Rating (0-5 stars slider)
- Reset all button

**Center - Results**:
- Search bar with icon
- View toggle (Grid/Table)
- Export button
- Active filter badges
- Results count
- 6 facility cards OR table

**Right - AI Assistant** (floating button):
- Click sparkle icon
- Chat interface slides in
- Suggested prompts
- Real-time responses

**Facility Cards Show**:
- Name + verification badge
- Type + ownership badges
- Rating (stars)
- Address
- Bed count
- Summary
- Accreditation badges
- Action buttons: Call, Email, Website, Save, News

---

### 6. 📰 Insights Page (`/insights`)

**URL**: `http://localhost:3000/insights`

**Layout**: 2-column

**Left - Main Feed**:
- Title: "Healthcare Insights"
- Tabs: All, Hospitals, Clinics, Mental Health, Urgent Care, Policy
- Insight cards (6 items):
  - Category badge (colored)
  - Title
  - Summary
  - Views count + date
  - Tags (3 max)
  - Bookmark + Share + Read More buttons

**Right Sidebar**:
- **Trending Topics** (top 5):
  - Numbered list
  - Topic name
  - Count badge
- **Saved Articles**:
  - Empty state with message

---

### 7. ⚙️ Account Settings (`/account`)

**URL**: `http://localhost:3000/account`

**Tabs** (6 total):

**🧑 Profile Tab**:
- Avatar circle (initials)
- Change avatar button
- Full name input
- Email input
- Job title input
- Email verification badge
- Save changes button

**💳 Subscription Tab**:
- Current plan card (highlighted)
- Plan details
- Active badge
- Upgrade button
- Billing history table:
  - Date, Amount, Status, Invoice download

**🔑 API Keys Tab**:
- Production API key card
- Creation date
- Show/hide toggle
- Copy button
- Masked key display
- Generate new key button
- Revoke all button

**🔔 Notifications Tab**:
- 5 notification toggles:
  - Email notifications
  - Weekly summary
  - Market alerts
  - New listings
  - Product updates

**🛡️ Security Tab**:
- Change password section:
  - Current password
  - New password
  - Confirm password
  - Update button
- Two-factor auth:
  - Description
  - Enable 2FA button

**👥 Sessions Tab**:
- Active sessions list (2 shown):
  - Device name
  - Location + IP
  - "Current" badge
  - Revoke button
- Revoke all sessions button

---

## 🎯 Navigation Flow

```
Landing (/)
  ├─ Login (/login) → Search (/search)
  ├─ Signup (/signup) → Login (/login)
  └─ Forgot Password (/forgot-password) → Login (/login)

Authenticated Pages (after login):
  ├─ Search (/search)
  │   └─ AI Assistant (drawer)
  ├─ Insights (/insights)
  │   └─ AI Assistant (drawer)
  └─ Account (/account)
      └─ 6 tabs
```

## 🎨 Color Legend

### Badges & States
- **Primary (Blue)**: Main actions, active states
- **Secondary (Green)**: Success, verification
- **Accent (Yellow)**: Highlights, warnings
- **Destructive (Red)**: Errors, delete actions
- **Muted**: Inactive, disabled states

### Category Colors (Insights)
- **Expansion**: Blue
- **Technology**: Purple
- **Funding**: Green
- **M&A**: Orange
- **Regulation**: Red

## ⌨️ Keyboard Shortcuts

### AI Assistant
- `Shift + Enter`: New line in message
- `Ctrl + K`: Clear chat history
- `Esc`: Close drawer

### General
- `Tab`: Navigate between elements
- `Enter`: Submit forms/activate buttons
- `Esc`: Close modals/dialogs

## 📱 Responsive Behavior

### Mobile (< 768px)
- Filter sidebar: Collapsible
- Grid: Single column
- Table: Horizontal scroll
- AI drawer: Full width

### Tablet (768px - 1024px)
- Filter sidebar: Collapsed by default
- Grid: 2 columns
- Insights sidebar: Hidden

### Desktop (1024px+)
- Filter sidebar: Always visible
- Grid: 2-3 columns
- All sidebars visible

## 🎭 Mock Data Locations

```
/public/mock-data/
  ├─ facilities.json (6 facilities)
  └─ insights.json (6 insights)
```

## 🚀 Quick Test Checklist

- [ ] Visit landing page
- [ ] Sign up (3 steps)
- [ ] Login (any credentials)
- [ ] Search facilities
- [ ] Apply filters
- [ ] Toggle grid/table view
- [ ] Open AI assistant
- [ ] Browse insights
- [ ] Change tabs
- [ ] Visit account settings
- [ ] Check all tabs
- [ ] Toggle dark mode
- [ ] Test responsive (resize window)

## 💡 Pro Tips

1. **Fast Navigation**: Use browser back/forward
2. **Dark Mode**: Toggle in navbar (persists)
3. **AI Shortcuts**: Use keyboard for faster interaction
4. **Filter Reset**: Click "Reset" to clear all filters
5. **Export**: Click download icon to export data

---

**All pages are fully functional with mock data! 🎉**

