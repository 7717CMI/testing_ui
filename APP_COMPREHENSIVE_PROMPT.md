# Healthcare DaaS Platform - Comprehensive Application Prompt

## 📋 Executive Summary

A Next-generation Healthcare Data-as-a-Service (DaaS) intelligence platform designed for U.S. healthcare providers. The application provides comprehensive facility data, AI-powered search, real-time insights, geographic mapping, advanced analytics, and verified data for healthcare intelligence professionals. Built with Next.js 14, TypeScript, and TailwindCSS, featuring a modern, accessible, and responsive design system.

---

## 🎯 Application Overview

### Purpose
Enable healthcare professionals to search, analyze, and gain insights from 6M+ healthcare facilities across the United States. The platform serves market researchers, investment analysts, healthcare consultants, and executive decision-makers.

### Target Users
- **Admins**: Full platform access with management capabilities
- **Analysts**: Search, analytics, and insights access
- **Viewers**: Read-only access to data and insights

### Key Value Propositions
- 99.9% data accuracy with multi-source verification
- 50K+ daily data updates for real-time intelligence
- AI-powered search and analysis (GPT-4 integration)
- Interactive mapping and geographic analysis
- Advanced analytics with custom dashboards
- Verified, trustworthy data from authoritative sources

---

## 📱 Application Structure

### Pages & Routes (11 Total)

#### 1. **Landing Page** (`/`)
**Purpose**: Marketing homepage to attract and convert visitors

**Sections**:
- **Navigation Bar**
  - Logo: "HealthData" with building icon
  - Right side: "Login" button and "Start Free Trial" CTA
  - Sticky on scroll with backdrop blur

- **Hero Section**
  - Badge: "Over 6M healthcare facilities indexed"
  - Headline: "Healthcare Data. Reimagined." (with gradient on "Reimagined")
  - Subheadline: Description of platform value proposition
  - Two CTAs: "Start Free Trial" (primary) and "Explore Insights" (secondary)
  
- **Stats Ticker** (4 metrics in grid)
  - 6M+ Facilities Tracked
  - 99.9% Data Accuracy
  - 50K+ Daily Updates
  - 24/7 AI Support

- **Feature Grid** (6 clickable cards)
  1. **Advanced Search** → `/search`
     - Icon: Search (blue)
     - Description: Lightning-fast search with intelligent filtering
  
  2. **AI Assistant** → `/ai-assistant`
     - Icon: Brain (green)
     - Description: GPT-4 powered assistant for instant insights
  
  3. **Real-Time Insights** → `/insights`
     - Icon: Trending Up (yellow)
     - Description: Live updates on M&A, funding, market trends
  
  4. **Geographic Mapping** → `/mapping`
     - Icon: Globe (blue)
     - Description: Interactive maps with demographics and analysis
  
  5. **Advanced Analytics** → `/analytics`
     - Icon: Bar Chart (green)
     - Description: Interactive charts and visualizations
  
  6. **Verified Data** → `/verified-data`
     - Icon: Shield (yellow)
     - Description: Comprehensive verification for data quality

- **Pricing Section** (3 tiers)
  1. **Free**: $0/month
     - 100 searches/month
     - Basic facility data
     - Limited insights access
     - Community support
  
  2. **Pro**: $99/month (Most Popular - highlighted)
     - Unlimited searches
     - Full facility profiles
     - All insights & analytics
     - AI assistant access
     - Priority support
     - Export to CSV
  
  3. **Enterprise**: Custom pricing
     - Everything in Pro
     - API access
     - Custom integrations
     - Dedicated support
     - SLA guarantee
     - Training & onboarding

- **Footer**
  - Product links: Search, Insights, Pricing, API
  - Company links: About, Blog, Careers, Contact
  - Legal links: Privacy, Terms, Security
  - Copyright notice

**Design Features**:
- Gradient background (background to muted)
- Card hover effects (shadow + translate up)
- Responsive grid layouts
- Smooth transitions
- Dark mode support

---

#### 2. **Login Page** (`/login`)
**Purpose**: User authentication

**Features**:
- Centered card layout
- Email input with validation (real-time)
- Password input with show/hide toggle
- "Remember me" checkbox
- "Forgot password?" link → `/forgot-password`
- Primary CTA: "Sign In" button
- Social login options (Google, GitHub) - UI only
- "Don't have an account?" with Sign Up link → `/signup`

**Validation**:
- Email: Must be valid format
- Password: Minimum 6 characters
- Real-time error messages
- Form submission prevents with invalid data

**Mock Authentication**:
- Any valid email format works
- Any password (6+ chars) works
- Redirects to `/search` on success

---

#### 3. **Signup Page** (`/signup`)
**Purpose**: New user registration with progressive disclosure

**3-Step Flow**:

**Step 1: Account Information**
- Full name input
- Email input with validation
- Password input with strength meter
  - Weak: Red (< 8 chars)
  - Fair: Yellow (8+ chars, letters only)
  - Good: Green (8+ chars, letters + numbers)
  - Strong: Dark Green (8+ chars, letters + numbers + symbols)
- Confirm password input (must match)
- Social signup options (Google, GitHub) - UI only
- "Next" button to proceed

**Step 2: Role Selection**
Choose one of three roles:
1. **Admin** (recommended)
   - Full access to all features
   - User management capabilities
   - Analytics and reports
   
2. **Analyst**
   - Search and filter facilities
   - View insights and analytics
   - Export data
   
3. **Viewer**
   - Read-only access
   - View facilities and insights
   - No editing or export

**Step 3: Plan Selection**
Choose a plan (same as landing page pricing):
- Free (default)
- Pro (highlighted)
- Enterprise

**Progress Indicator**:
- Visual steps (1 → 2 → 3)
- Current step highlighted
- "Back" button on steps 2-3
- "Create Account" final button

**Redirects**: After completion → `/login`

---

#### 4. **Forgot Password Page** (`/forgot-password`)
**Purpose**: Password recovery initiation

**States**:

**Initial State**:
- Email input
- "Send Reset Link" button
- "Back to Login" link

**Success State** (after submission):
- Success icon (check circle)
- Confirmation message
- "Resend Link" button (with countdown)
- "Back to Login" link

**Features**:
- Email validation
- Loading state during submission
- Mock email sending (3-second delay)
- Countdown timer for resend (60 seconds)

---

#### 5. **Search Interface Page** (`/search`)
**Purpose**: Main facility search and discovery interface

**Layout**: 3-column responsive layout

**Left Sidebar - Filters** (collapsible on mobile):
1. **Facility Type** (multi-select checkboxes)
   - Hospital
   - Clinic
   - Urgent Care
   - Mental Health
   - Long-term Care
   - Specialty

2. **Ownership** (multi-select checkboxes)
   - Public
   - Private
   - Non-profit
   - Government

3. **Accreditation** (multi-select checkboxes)
   - Joint Commission
   - NCQA (National Committee for Quality Assurance)
   - CARF (Commission on Accreditation)
   - URAC

4. **Bed Count** (range slider)
   - Range: 0 - 1000 beds
   - Shows selected range

5. **Rating** (range slider)
   - Range: 0 - 5 stars
   - Shows selected range

**Filter Actions**:
- "Reset All Filters" button
- Active filter count badge
- Filters persist in Zustand store

**Center Column - Results**:

**Header**:
- Search input with magnifying glass icon
- Real-time search (debounced)
- View toggle buttons: Grid | Table
- Export button (download icon)
- Results count: "Showing X facilities"

**Active Filters Bar**:
- Badge for each active filter
- Click X to remove individual filter
- Only shows when filters are applied

**View Modes**:

**Grid View** (default):
- 2-column responsive grid
- Facility cards showing:
  - Facility name + verification badge (if verified)
  - Type badge (colored by category)
  - Ownership badge
  - Star rating (visual stars + number)
  - Address with location icon
  - Bed count with bed icon
  - Summary text (2 lines, truncated)
  - Accreditation badges (max 3, + more)
  - Action buttons row:
    - Call (phone icon)
    - Email (mail icon)
    - Website (external link icon)
    - Save (bookmark icon)
    - News (newspaper icon)
  - Hover effect: shadow + border color change

**Table View**:
- Sortable columns:
  - Name (with verification badge)
  - Type (badge)
  - Location (city, state)
  - Beds (number)
  - Rating (stars)
  - Accreditation (badges)
  - Actions (icon buttons)
- Sticky header on scroll
- Row hover effect
- Responsive: horizontal scroll on mobile

**Mock Data** (6 facilities):
1. St. Mary's Medical Center (Hospital, Public, California)
2. Green Valley Clinic (Clinic, Private, Texas)
3. Riverside Urgent Care (Urgent Care, Private, Florida)
4. Hope Springs Mental Health (Mental Health, Non-profit, New York)
5. Westside Community Hospital (Hospital, Non-profit, Washington)
6. Downtown Medical Plaza (Clinic, Private, Illinois)

**Right Column - AI Assistant** (floating button):
- Fixed position bottom-right
- Sparkle icon with pulse animation
- Badge showing "AI" text
- Click opens chat drawer

**AI Assistant Drawer** (slides from right):

**Header**:
- Title: "AI Assistant"
- Subtitle: "Ask me anything about healthcare facilities"
- Close button (X)

**Chat Area**:
- Messages list (scrollable)
- AI messages with avatar
- User messages aligned right
- Typing indicator (animated dots)
- Auto-scroll to latest message

**Input Area**:
- Text input with placeholder
- Send button (paper plane icon)
- Character count (optional)
- Keyboard shortcuts info:
  - Shift + Enter: New line
  - Ctrl + K: Clear chat

**Suggested Prompts** (4 chips):
- "Find hospitals in California with 500+ beds"
- "Show me non-profit mental health facilities"
- "Which facilities have the highest ratings?"
- "Compare urgent care centers by bed count"

**Features**:
- Message history persisted in Zustand
- Export chat to TXT file
- Clear chat history
- Typing indicators
- Error handling for failed messages

**State Management** (Zustand stores):
- Filters state: All active filters
- Search query state
- View mode: Grid or Table
- AI chat state: Messages array, isTyping

---

#### 6. **Insights Feed Page** (`/insights`)
**Purpose**: Industry news, trends, and analysis

**Layout**: 2-column (main feed + sidebar)

**Header**:
- Title: "Healthcare Insights"
- Subtitle: "Stay informed with the latest industry updates"

**Tab Navigation** (6 categories):
- All (default)
- Hospitals
- Clinics
- Mental Health
- Urgent Care
- Policy & Regulation

**Main Feed** (left column):
- Grid of insight cards (2 columns on desktop)
- Each card shows:
  - Category badge (top-left, colored by type)
  - Title (bold, 2 lines max)
  - Summary (3 lines, truncated with ellipsis)
  - Metadata row:
    - Views count (eye icon + number)
    - Published date (relative: "2 days ago")
  - Tags (3 max, as badges)
  - Action buttons row:
    - Bookmark (bookmark icon, toggle state)
    - Share (share icon)
    - Read More (arrow right icon)
  - Hover effect: shadow + lift up

**Category Colors**:
- Expansion: Blue (#1E6AFF)
- Technology: Purple (#8B5CF6)
- Funding: Green (#1B9E77)
- M&A: Orange (#F97316)
- Regulation: Red (#EF4444)
- Policy: Indigo (#6366F1)

**Mock Data** (6 insights):
1. "Hospital Chain Expands to Rural Markets" (Expansion)
2. "AI-Powered Diagnostics on the Rise" (Technology)
3. "Series B Funding for Telehealth Startup" (Funding)
4. "Major Healthcare Merger Announced" (M&A)
5. "New CMS Regulations Affect Pricing" (Regulation)
6. "Mental Health Facilities See Growth" (Expansion)

**Right Sidebar**:

**Trending Topics** (card):
- Title: "Trending Topics"
- Numbered list (1-5):
  1. Hospital Mergers (127)
  2. AI in Healthcare (98)
  3. Telehealth Expansion (76)
  4. Rural Healthcare (54)
  5. Mental Health Access (42)
- Number in badge shows mentions

**Saved Articles** (card):
- Title: "Saved Articles"
- Empty state: "No saved articles yet"
- Icon: Bookmark with slash
- Message: "Bookmark articles to read later"

**AI Assistant**:
- Same floating button as search page
- Context-aware prompts:
  - "Summarize this week's top insights"
  - "What are the key trends in hospital M&A?"
  - "Analyze telehealth adoption rates"
  - "Compare funding rounds by category"

---

#### 7. **Account Settings Page** (`/account`)
**Purpose**: User profile and account management

**Layout**: Tabbed interface (6 tabs)

**Tab 1: Profile**

**Avatar Section**:
- Large circle with user initials
- Background: Primary gradient
- "Change Avatar" button (disabled in mock)

**Form Fields**:
- Full Name (input)
- Email (input, read-only)
  - "Verified" badge next to email
  - Green checkmark icon
- Job Title (input)
- Company (input, optional)
- Phone (input, optional)

**Actions**:
- "Save Changes" button (primary)
- "Cancel" button (secondary)
- Success toast on save

**Tab 2: Subscription**

**Current Plan Card** (highlighted with border):
- Plan name: "Pro Plan"
- Active badge (green)
- Price: $99/month
- Features list (checkmarks):
  - Unlimited searches
  - Full facility profiles
  - AI assistant access
  - Priority support
  - Export capabilities
- Billing cycle: "Billed monthly"
- Next billing date
- "Upgrade to Enterprise" button
- "Manage Subscription" link

**Billing History**:
- Table with columns:
  - Date (formatted: "Jan 1, 2025")
  - Amount ($99.00)
  - Status badge (Paid - green, Pending - yellow, Failed - red)
  - Invoice (Download link with icon)
- Shows last 5 transactions
- "View All" link at bottom

**Tab 3: API Keys**

**Production API Key Card**:
- Label: "Production API Key"
- Created date
- Key display: Masked by default (••••••••••••••••1a2b3c4d)
- Actions:
  - "Show" toggle button (eye icon)
  - "Copy" button (clipboard icon)
  - Success feedback on copy
- Usage stats (if available):
  - Requests this month
  - Rate limit info

**Actions**:
- "Generate New Key" button
- "Revoke All Keys" button (destructive)
- Confirmation dialog before revocation

**Documentation Link**:
- "View API Documentation" external link

**Tab 4: Notifications**

**Email Notifications Section**:
- Toggle switches for each setting:
  1. **Email Notifications** (master switch)
     - "Receive email updates and notifications"
  
  2. **Weekly Summary**
     - "Get a weekly summary of platform activity"
  
  3. **Market Alerts**
     - "Notifications about significant market changes"
  
  4. **New Facility Listings**
     - "Alert me when new facilities match my criteria"
  
  5. **Product Updates**
     - "Learn about new features and updates"

**Actions**:
- Changes save automatically
- Success toast on update
- Toggle states persist

**Tab 5: Security**

**Change Password Section**:
- Current Password input (password type)
- New Password input (with strength indicator)
- Confirm New Password input
- "Update Password" button
- Validation:
  - Current password required
  - New password min 8 characters
  - Passwords must match

**Two-Factor Authentication**:
- Status badge: "Disabled" (yellow) or "Enabled" (green)
- Description: "Add an extra layer of security"
- "Enable 2FA" button (primary)
- Setup flow (mock):
  1. Scan QR code
  2. Enter verification code
  3. Save backup codes

**Login History** (optional):
- Recent login attempts
- Timestamps and locations

**Tab 6: Sessions**

**Active Sessions List**:
Shows 2 sample sessions:

1. **Current Session** (highlighted):
   - Device: "Chrome on Windows"
   - Location: "San Francisco, CA"
   - IP: 192.168.1.1
   - Last active: "Just now"
   - Badge: "Current" (green)
   - No revoke button

2. **Other Session**:
   - Device: "Safari on iPhone"
   - Location: "Oakland, CA"
   - IP: 192.168.1.100
   - Last active: "2 hours ago"
   - "Revoke" button (destructive)

**Actions**:
- "Revoke All Other Sessions" button
- Confirmation dialog before revocation
- Current session cannot be revoked

---

#### 8. **AI Assistant Feature Page** (`/ai-assistant`)
**Purpose**: Detailed information about AI capabilities

**Sections**:

**Hero**:
- Badge: "Powered by GPT-4"
- Title: "AI Assistant for Healthcare Intelligence"
- Description: Value proposition and capabilities
- Interactive query demo box:
  - Input field: "Ask anything about healthcare facilities..."
  - Send button
  - Processing state with animation
  - Suggested queries (2 visible)
- CTAs: "Try with Search Data" and "Start Free Trial"

**Key Capabilities** (4 cards):
1. Natural Language Query - Ask in plain English
2. Data Analysis - Automatic trend analysis
3. Report Generation - Comprehensive reports with citations
4. API Integration - Seamless workflow integration

**Use Cases** (3 detailed cards):
1. Market Research - Quick market insights
2. Due Diligence - Facility analysis and ownership
3. Strategic Planning - Identify opportunities

**What Makes It Special** (6 features grid):
- Healthcare-Trained model
- Real-Time Data access
- Multi-Turn Conversations
- Source Citations
- Export & Share
- Privacy First

**CTA Section**:
- Large call-to-action card
- Brain icon
- "Experience the Future" message
- Two buttons: "Get Started Free" and "See It In Action"

---

#### 9. **Geographic Mapping Feature Page** (`/mapping`)
**Purpose**: Showcase mapping and location intelligence

**Sections**:

**Hero**:
- Badge: "Interactive Mapping Platform"
- Title: "Geographic Mapping & Market Intelligence"
- Description: Visualize facilities and analyze demographics
- Map preview (placeholder with animated pins):
  - Multiple MapPin icons bouncing
  - View mode selector: Heat Map, Clusters, Individual Markers
  - Gradient background simulating map
- CTAs: "View with Data" and "Start Free Trial"

**Mapping Features** (4 cards):
1. Facility Locations - 6M+ facilities visualized
2. Data Layers - Demographics, market data, competition
3. Advanced Filtering - Sophisticated filters
4. Market Analysis - Trends, gaps, opportunities

**Use Cases** (3 cards):
1. Site Selection - Optimal location finding
2. Territory Planning - Define and analyze territories
3. Market Research - Visual market dynamics

**Data Layers** (4 available):
1. Demographics - Population, age, income, insurance
2. Facilities - All facility types by category
3. Market Trends - Growth, M&A, new openings
4. Service Areas - Drive time, catchment areas

**Technical Capabilities** (3 features):
- Export & Share - Maps as images/PDFs
- Multiple Basemaps - Street, satellite, terrain, dark
- Custom Boundaries - Draw regions and territories

---

#### 10. **Advanced Analytics Feature Page** (`/analytics`)
**Purpose**: Showcase data visualization and analytics

**Sections**:

**Hero**:
- Badge: "Advanced Analytics Engine"
- Title: "Advanced Analytics & Visualization"
- Description: Transform data into actionable insights
- Chart preview with type selector:
  - Trend Analysis (LineChart icon)
  - Comparative Analysis (BarChart icon)
  - Distribution Charts (PieChart icon)
  - Animated chart bars simulation
  - Action buttons: Export, Share, Date Range
- CTAs: "View Sample Data" and "Start Free Trial"

**Analytics Features** (4 cards):
1. Interactive Charts - Multiple chart types with drill-down
2. Trend Analysis - Track changes and forecasting
3. Custom Dashboards - Personalized metric views
4. Export Reports - Multiple formats (PDF, Excel, CSV)

**Available Metrics** (3 categories):
1. **Facility Metrics**:
   - Bed count and utilization
   - Patient volume trends
   - Service line mix
   - Quality scores and ratings

2. **Market Metrics**:
   - Market share analysis
   - Competitor benchmarking
   - Growth rates by region
   - Demographic trends

3. **Financial Metrics**:
   - Revenue trends
   - Cost per bed
   - Profitability indicators
   - M&A valuations

**Use Cases** (3 cards with features):
1. Executive Reporting - Real-time updates, custom metrics
2. Competitive Analysis - Peer comparisons, positioning
3. Portfolio Management - Multi-site views, alerts

**Visualization Types** (4 types):
1. Time Series Charts - Trends over time
2. Comparison Charts - Facility/region comparisons
3. Distribution Charts - Data composition
4. Advanced Visualizations - Scatter, bubble, heatmaps

**Dashboard Capabilities**:
- Customizable Layout - Drag and drop widgets
- Real-Time Updates - Automatic data refresh
- Collaboration - Share and export

---

#### 11. **Verified Data Feature Page** (`/verified-data`)
**Purpose**: Explain data quality and verification process

**Sections**:

**Hero**:
- Badge: "Industry-Leading Data Quality"
- Title: "Verified, Accurate, Reliable Data"
- Description: 99.9% accuracy through rigorous verification
- Quality stats grid (4 metrics):
  - 99.9% Data Accuracy
  - 50K+ Daily Updates
  - 6M+ Facilities Tracked
  - 24/7 Quality Monitoring
- CTAs: "Explore Verified Data" and "Start Free Trial"

**4-Step Verification Process**:
1. **Automated Collection**
   - Data from CMS, state agencies, facility records
   - Database icon

2. **Cross-Validation**
   - Multiple sources cross-referenced
   - RefreshCw icon

3. **Expert Review**
   - Healthcare specialists review complex cases
   - Users icon

4. **Quality Assurance**
   - Final automated and manual checks
   - CheckCircle icon

**What We Verify** (3 categories):
1. **Facility Information**:
   - Official names and DBAs
   - Locations and addresses
   - License numbers and types
   - Operating status and dates

2. **Operational Data**:
   - Bed counts and utilization
   - Service lines and specialties
   - Accreditation status
   - Quality ratings and scores

3. **Ownership & Financial**:
   - Ownership structure
   - Parent organizations
   - M&A transaction history
   - Financial indicators

**Trusted Data Sources**:
- Centers for Medicare & Medicaid Services (CMS) - Federal
- State Health Departments (SHD) - State
- The Joint Commission (TJC) - Accreditation
- American Hospital Association (AHA) - Industry
- + dozens more sources

**Quality Guarantees** (4 features):
1. Daily Updates - 50K+ refreshed daily
2. Change Alerts - Immediate notifications
3. Data Security - SOC 2 compliance
4. Audit Trail - Source attribution and timestamps

**Why Our Data Stands Out** (4 advantages):
- Multi-Source Verification
- Human-in-the-Loop review
- Continuous Monitoring 24/7
- Transparent Sourcing

---

## 🎨 Design System

### Color Palette

**Primary Colors**:
- Primary Blue: `#1E6AFF` (rgb: 30, 106, 255)
  - Shades: 50-900 scale
  - Use: Primary actions, links, focus states
  
- Secondary Green: `#1B9E77` (rgb: 27, 158, 119)
  - Shades: 50-900 scale
  - Use: Success states, verification, growth

- Accent Yellow: `#FFC300` (rgb: 255, 195, 0)
  - Shades: 50-900 scale
  - Use: Highlights, warnings, attention

**Semantic Colors**:
- Destructive: `#F64A4A` (Red) - Errors, delete actions
- Success: `#4ADE80` (Green) - Success messages
- Warning: `#F59E0B` (Orange) - Warnings
- Info: `#38BDF8` (Light Blue) - Information

**Neutral Colors**:
- Light mode:
  - Background: `#FFFFFF` (white)
  - Foreground: `#111827` (near black)
  - Muted: `#F9FAFB` (light gray)
  - Border: `#E5E7EB` (gray)

- Dark mode:
  - Background: `#111827` (dark blue-gray)
  - Foreground: `#F9FAFB` (off-white)
  - Muted: `#1F2937` (darker gray)
  - Border: `#374151` (gray)

### Typography

**Font Families**:
- UI Text: Inter (sans-serif)
  - Loaded via Next.js font optimization
  - Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

- Code/Monospace: JetBrains Mono
  - Used in API keys, code snippets
  - Weight: 400 (regular)

**Font Sizes** (with line heights):
- xs: 0.75rem / 1.5
- sm: 0.875rem / 1.5
- base: 1rem / 1.6
- lg: 1.125rem / 1.6
- xl: 1.25rem / 1.5
- 2xl: 1.5rem / 1.4
- 3xl: 1.875rem / 1.3
- 4xl: 2.25rem / 1.2
- 5xl: 3rem / 1.1

**Heading Styles**:
- H1: 3-5xl (responsive), bold, tight tracking
- H2: 2-4xl (responsive), bold
- H3: xl-2xl (responsive), semibold
- H4: lg-xl (responsive), semibold
- Body: base, regular

### Spacing System

**Spacing Scale** (Tailwind defaults + custom):
- 1 unit = 4px
- Common values: 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64

**Custom Spacing Tokens**:
- Desktop padding: 24px
- Tablet padding: 16px
- Mobile padding: 12px
- Container max-width: 1440px

### Component Patterns

**Borders**:
- Border width: 1px default
- Border radius tokens:
  - sm: 6px
  - md: 10px
  - lg: 16px
  - xl: 20px
  - Full: 9999px (pill shape)

**Shadows** (elevation system):
- sm: Subtle lift
- DEFAULT: Standard card shadow
- md: Medium elevation
- lg: High elevation (hovers)
- xl: Very high elevation (modals)
- 2xl: Maximum elevation
- focus: Blue ring for keyboard focus

**Transitions**:
- Duration: 200-300ms default
- Easing: ease-out for entrances, ease-in for exits
- Properties: transform, opacity, colors, shadows

### Layout Grid

**Breakpoints**:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+
- Wide: 1440px+

**Grid Columns**:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns (context dependent)

**Container**:
- Max-width: 1440px
- Padding: 2rem (default)
- Centered with margin: auto

---

## 🧩 Component Library

### UI Primitives (12 components)

#### 1. **Button**
**Variants**:
- default: Primary blue background
- secondary: Secondary green background
- outline: Border with transparent background
- ghost: Transparent, shows on hover
- destructive: Red for delete/cancel actions
- link: Underlined text link

**Sizes**:
- sm: Small (padding: 8px 12px)
- default: Medium (padding: 10px 16px)
- lg: Large (padding: 12px 24px)
- icon: Square (padding: 8px)

**States**:
- Disabled: Reduced opacity, no pointer
- Loading: Spinner icon, disabled state
- Active/Pressed: Slightly darker

**Props**:
- variant, size, disabled, loading, onClick, children

#### 2. **Input**
**Types**:
- text (default)
- email
- password (with show/hide toggle)
- number
- search (with icon)

**States**:
- Default
- Focus: Blue ring
- Error: Red border + error message
- Disabled: Muted background

**Features**:
- Label integration
- Error message display
- Helper text support
- Icon prefix/suffix

#### 3. **Textarea**
**Features**:
- Auto-resize capability
- Min/max height
- Character counter (optional)
- Label and error support

#### 4. **Badge**
**Variants**:
- default: Gray background
- primary: Blue background
- secondary: Green background
- accent: Yellow background
- destructive: Red background
- outline: Border, transparent background

**Sizes**:
- sm: Small (text-xs, px-2)
- default: Medium (text-sm, px-2.5)
- lg: Large (text-base, px-3)

#### 5. **Card**
**Components**:
- Card (wrapper)
- CardHeader
- CardTitle
- CardDescription
- CardContent
- CardFooter

**Variants**:
- Default: White background, border
- Interactive: Hover effect (shadow + lift)

**Usage**: Primary container for grouped content

#### 6. **Dialog** (Modal)
**Components**:
- Dialog (provider)
- DialogTrigger (opens modal)
- DialogContent (modal body)
- DialogHeader
- DialogTitle
- DialogDescription
- DialogFooter

**Features**:
- Backdrop overlay (semi-transparent)
- Esc to close
- Click outside to close
- Focus trap
- Accessible (ARIA)

#### 7. **Tabs**
**Components**:
- Tabs (provider)
- TabsList (tab buttons container)
- TabsTrigger (individual tab)
- TabsContent (content panel)

**Behavior**:
- Active tab highlighted
- Smooth transition between tabs
- Keyboard navigation (arrow keys)

#### 8. **Skeleton**
**Usage**: Loading placeholder

**Variants**:
- Text: Rounded lines
- Circle: Avatar placeholder
- Rectangle: Content blocks

**Animation**: Shimmer effect (left to right)

#### 9. **Checkbox**
**States**:
- Unchecked
- Checked (with checkmark icon)
- Indeterminate (dash icon)
- Disabled

**Features**:
- Label integration
- Accessible (ARIA)
- Keyboard navigation

#### 10. **Switch** (Toggle)
**States**:
- Off (left position)
- On (right position)
- Disabled

**Design**: Pill shape with sliding circle

#### 11. **Slider** (Range)
**Types**:
- Single value
- Range (min/max)

**Features**:
- Visual track
- Draggable thumb
- Current value display
- Min/max labels

#### 12. **Dropdown Menu**
**Components**:
- DropdownMenu (provider)
- DropdownMenuTrigger
- DropdownMenuContent
- DropdownMenuItem
- DropdownMenuSeparator
- DropdownMenuLabel

**Features**:
- Keyboard navigation
- Icons in menu items
- Submenus support
- Checkable items

---

### Shared Components (5 components)

#### 1. **Navbar**
**Layout**: Full-width, sticky header

**Left Side**:
- Logo (Building2 icon + "HealthData" text)
- Gradient text effect on name

**Right Side**:
- Theme toggle (Sun/Moon icon)
- Profile dropdown (if authenticated):
  - Profile link
  - Settings link
  - Logout link
- Login button (if not authenticated)

**Features**:
- Backdrop blur effect
- Dark mode toggle
- Responsive: Collapses on mobile
- Sticky positioning (top: 0)

#### 2. **FacilityCard**
**Displays**: Individual facility information

**Structure**:
- Header:
  - Facility name (bold)
  - Verification badge (if applicable)
- Body:
  - Type badge (colored)
  - Ownership badge
  - Star rating (visual + number)
  - Location (city, state) with pin icon
  - Bed count with bed icon
  - Summary text (truncated)
  - Accreditation badges
- Footer:
  - 5 action buttons (Call, Email, Website, Save, News)

**States**:
- Default
- Hover: Shadow + border color
- Saved: Bookmark filled

#### 3. **InsightCard**
**Displays**: Industry insight/article

**Structure**:
- Header:
  - Category badge (top-left, colored)
- Body:
  - Title (bold, 2 lines max)
  - Summary (3 lines, truncated)
  - Metadata:
    - Views count (eye icon)
    - Published date
  - Tags (3 max badges)
- Footer:
  - Bookmark button (toggle)
  - Share button
  - Read More button

**States**:
- Default
- Hover: Shadow + lift
- Bookmarked: Filled icon

#### 4. **AIAssistant**
**Type**: Floating button + drawer

**Floating Button**:
- Fixed position: bottom-right
- Sparkle icon
- "AI" badge
- Pulse animation
- Z-index: High (above content)

**Drawer** (opens from right):
- **Header**:
  - Title: "AI Assistant"
  - Subtitle
  - Close button

- **Chat Area**:
  - Message list (scrollable)
  - AI messages:
    - Avatar (left)
    - Message bubble (gray background)
    - Timestamp
  - User messages:
    - Aligned right
    - Blue background
    - Timestamp
  - Typing indicator (3 dots animation)

- **Input Area**:
  - Text input (multiline)
  - Send button
  - Keyboard shortcuts hint

- **Suggested Prompts**:
  - 4 clickable chips
  - Context-aware suggestions
  - Click to auto-fill input

**Features**:
- Message history (persisted)
- Export chat (TXT file)
- Clear history
- Keyboard shortcuts
- Smooth animations

#### 5. **Providers**
**Purpose**: App-level context providers

**Includes**:
- ThemeProvider (next-themes)
  - Dark mode persistence
  - System preference detection
- QueryClientProvider (TanStack Query)
  - Server state management
  - Caching configuration
- Toaster (sonner)
  - Toast notifications
  - Success, error, info toasts

---

## 🗄️ Data Structure

### Mock Data Files

Located in `/public/mock-data/`

#### facilities.json (6 facilities)

```typescript
interface Facility {
  id: string
  name: string
  type: "Hospital" | "Clinic" | "Urgent Care" | "Mental Health" | "Long-term Care"
  ownership: "Public" | "Private" | "Non-profit" | "Government"
  address: {
    street: string
    city: string
    state: string
    zip: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  beds: number
  rating: number // 0-5
  verified: boolean
  accreditation: Array<"Joint Commission" | "NCQA" | "CARF" | "URAC">
  summary: string
  phone: string
  email: string
  website: string
  services: string[]
  established: string // ISO date
}
```

**Sample Facilities**:
1. St. Mary's Medical Center
   - Type: Hospital
   - Location: San Francisco, CA
   - Beds: 450
   - Rating: 4.5
   - Accreditation: Joint Commission, NCQA

2. Green Valley Clinic
   - Type: Clinic
   - Location: Austin, TX
   - Beds: 25
   - Rating: 4.2
   - Accreditation: NCQA

3. Riverside Urgent Care
   - Type: Urgent Care
   - Location: Miami, FL
   - Beds: 15
   - Rating: 4.0
   - Accreditation: URAC

4. Hope Springs Mental Health
   - Type: Mental Health
   - Location: New York, NY
   - Beds: 80
   - Rating: 4.7
   - Accreditation: Joint Commission, CARF

5. Westside Community Hospital
   - Type: Hospital
   - Location: Seattle, WA
   - Beds: 320
   - Rating: 4.3
   - Accreditation: Joint Commission

6. Downtown Medical Plaza
   - Type: Clinic
   - Location: Chicago, IL
   - Beds: 40
   - Rating: 4.1
   - Accreditation: NCQA

#### insights.json (6 insights)

```typescript
interface Insight {
  id: string
  title: string
  category: "Expansion" | "Technology" | "Funding" | "M&A" | "Regulation" | "Policy"
  summary: string
  content: string // Full article text
  author: {
    name: string
    title: string
    avatar?: string
  }
  publishedAt: string // ISO date
  views: number
  tags: string[]
  imageUrl?: string
  readTime: number // minutes
}
```

**Sample Insights**:
1. "Hospital Chain Expands to Rural Markets"
   - Category: Expansion
   - Views: 1234
   - Tags: ["rural healthcare", "expansion", "access"]

2. "AI-Powered Diagnostics Transform Care"
   - Category: Technology
   - Views: 2156
   - Tags: ["AI", "diagnostics", "innovation"]

3. "Telehealth Startup Raises $50M Series B"
   - Category: Funding
   - Views: 987
   - Tags: ["telehealth", "funding", "startups"]

4. "Major Healthcare Merger Creates Regional Leader"
   - Category: M&A
   - Views: 1543
   - Tags: ["merger", "consolidation", "market"]

5. "CMS Announces New Payment Models"
   - Category: Regulation
   - Views: 876
   - Tags: ["CMS", "payments", "policy"]

6. "Mental Health Facilities See Record Growth"
   - Category: Expansion
   - Views: 1098
   - Tags: ["mental health", "growth", "demand"]

---

## 🔧 State Management

### Zustand Stores (3 stores)

#### 1. **Auth Store**
Located: `src/store/auth-store.ts`

```typescript
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  signup: (data: SignupData) => Promise<void>
}
```

**Features**:
- User authentication state
- Login/logout methods (mock)
- Signup flow (mock)
- Persisted to localStorage
- Automatic redirect on login/logout

#### 2. **Filters Store**
Located: `src/store/filters-store.ts`

```typescript
interface FiltersState {
  facilityTypes: string[]
  ownership: string[]
  accreditation: string[]
  bedCount: [number, number]
  rating: [number, number]
  searchQuery: string
  setFacilityTypes: (types: string[]) => void
  setOwnership: (ownership: string[]) => void
  setAccreditation: (accreditation: string[]) => void
  setBedCount: (range: [number, number]) => void
  setRating: (range: [number, number]) => void
  setSearchQuery: (query: string) => void
  resetFilters: () => void
  getActiveFiltersCount: () => number
}
```

**Features**:
- Search and filter state
- Individual setters for each filter
- Reset all filters
- Count active filters
- Used in search page

#### 3. **AI Store**
Located: `src/store/ai-store.ts`

```typescript
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIState {
  messages: Message[]
  isTyping: boolean
  isOpen: boolean
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void
  clearMessages: () => void
  setTyping: (isTyping: boolean) => void
  toggleDrawer: () => void
  exportChat: () => void
}
```

**Features**:
- Chat message history
- Typing indicator state
- Drawer open/close state
- Add/clear messages
- Export chat to file

---

## 🎯 Key Features & Interactions

### 1. Search & Filtering
- Real-time search with debouncing (300ms)
- Multiple filter types apply simultaneously
- Active filter badges with individual remove
- Filter count indicator
- Reset all filters button
- Filters persist in URL (optional for real implementation)
- Grid/Table view toggle
- Export filtered results

### 2. AI Assistant
- Context-aware prompts based on current page
- Message history with persistence
- Typing indicators during response
- Suggested prompts as clickable chips
- Keyboard shortcuts:
  - Shift+Enter: New line
  - Ctrl+K: Clear chat
  - Esc: Close drawer
- Export chat as TXT file
- Smooth drawer animation
- Message timestamps
- Auto-scroll to latest message

### 3. Authentication Flow
- Progressive signup (3 steps):
  1. Account info with password strength
  2. Role selection (visual cards)
  3. Plan selection (pricing comparison)
- Login with validation
- Forgot password flow with email
- Remember me functionality
- Mock authentication (any credentials work)
- Redirect logic (login → search, logout → landing)

### 4. Dark Mode
- System preference detection
- Manual toggle in navbar
- Persisted to localStorage
- Smooth transition
- All components support both modes
- WCAG AA+ contrast in both modes

### 5. Responsive Design
- Mobile-first approach
- Breakpoints: 768px (tablet), 1024px (desktop)
- Collapsible sidebars on mobile
- Horizontal scroll for tables
- Touch-friendly button sizes
- Adaptive grid layouts
- Hamburger menu (mobile nav)

### 6. Loading States
- Skeleton loaders for content
- Shimmer animation
- Spinner for async actions
- Button loading states
- Progress indicators for multi-step forms

### 7. Error Handling
- Form validation with real-time feedback
- Error messages with icons
- Toast notifications for actions
- Empty states with helpful messages
- 404 page (future)
- Error boundaries (future)

### 8. Accessibility
- Keyboard navigation throughout
- Focus visible styles (blue rings)
- ARIA labels and roles
- Semantic HTML structure
- Screen reader friendly
- Skip to content links
- Proper heading hierarchy
- Alt text for images
- Color contrast WCAG AA+

---

## 🚀 Technical Implementation

### Tech Stack

**Framework & Language**:
- Next.js 14 (App Router)
- TypeScript 5+
- React 19.1.0

**Styling**:
- TailwindCSS 3.4+
- PostCSS & Autoprefixer
- @tailwindcss/typography plugin
- CSS custom properties for theming

**UI Components**:
- Radix UI (primitives)
- Shadcn UI patterns
- Lucide React (icons)
- class-variance-authority (CVA)

**State Management**:
- Zustand (global state)
- TanStack Query (server state - ready)
- React hooks (local state)

**Form Handling**:
- React Hook Form
- @hookform/resolvers
- Zod (validation schemas)

**Utilities**:
- clsx & tailwind-merge (class management)
- date-fns (date formatting)
- sonner (toast notifications)
- next-themes (dark mode)

**Future Integrations** (installed, not implemented):
- Plotly.js (advanced charts)
- Recharts (sparklines)
- Mapbox GL (interactive maps)
- react-markdown (rich content)
- remark-gfm (GitHub Flavored Markdown)

### Project Structure

```
healthcare-daas/
├── public/
│   ├── mock-data/
│   │   ├── facilities.json
│   │   └── insights.json
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── account/
│   │   │   └── page.tsx
│   │   ├── ai-assistant/
│   │   │   └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── insights/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── mapping/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   ├── search/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── verified-data/
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx (Landing)
│   ├── components/
│   │   ├── shared/
│   │   │   ├── ai-assistant.tsx
│   │   │   ├── facility-card.tsx
│   │   │   ├── insight-card.tsx
│   │   │   └── navbar.tsx
│   │   └── ui/
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── skeleton.tsx
│   │       ├── slider.tsx
│   │       ├── switch.tsx
│   │       ├── tabs.tsx
│   │       └── textarea.tsx
│   ├── lib/
│   │   └── utils.ts (utility functions)
│   ├── store/
│   │   ├── auth-store.ts
│   │   ├── filters-store.ts
│   │   └── ai-store.ts
│   └── types/
│       └── index.ts (TypeScript interfaces)
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
├── package.json
└── README.md
```

### Performance Optimizations

**Next.js Features**:
- App Router for automatic code splitting
- Server Components by default
- Client Components only when necessary
- Font optimization (Inter, JetBrains Mono)
- Image optimization (next/image)

**React Patterns**:
- Lazy loading with Suspense
- Memoization (useMemo, useCallback) where needed
- Virtual scrolling ready for large lists
- Debounced search input

**CSS/Styling**:
- TailwindCSS JIT compiler
- Minimal custom CSS
- CSS-in-JS avoided for performance
- Critical CSS inlined

**State Management**:
- Zustand for minimal re-renders
- Shallow equality checks
- Selective subscriptions

### Development Workflow

**Commands**:
```bash
# Development server (port 3000)
npm run dev

# Production build
npm run build

# Start production server
npm start
```

**Environment**:
- Node.js 20+
- npm (package manager)
- Runs on Windows, macOS, Linux

**Browser Support**:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

---

## 📝 Mock Data & Authentication

### Authentication Behavior

**Mock Login**:
- Any email format accepted (must include @)
- Any password accepted (minimum 6 characters)
- No actual authentication server
- User state stored in Zustand + localStorage
- Persists across page reloads
- Redirects:
  - After login → `/search`
  - After logout → `/`

**Mock User Object**:
```typescript
{
  id: "mock-user-id",
  name: "John Doe",
  email: "user@example.com",
  role: "Admin" | "Analyst" | "Viewer",
  plan: "Free" | "Pro" | "Enterprise",
  verified: true,
  avatar: null
}
```

### Data Loading

**Facilities**:
- Loaded from `/public/mock-data/facilities.json`
- 6 sample facilities
- Filters applied client-side
- Search matches name, city, state
- No pagination (all loaded at once)

**Insights**:
- Loaded from `/public/mock-data/insights.json`
- 6 sample articles
- Category filtering client-side
- No bookmarking persistence (UI only)

**AI Responses**:
- Simulated delay (1-2 seconds)
- Predefined responses based on keywords
- No actual AI API calls
- Responses stored in Zustand

---

## 🎨 Custom CSS Classes

### Utility Classes (defined in globals.css)

**Shimmer Loading**:
```css
.shimmer {
  animation: shimmer 2s infinite;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
}
```

**Custom Scrollbar**:
```css
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: hsl(var(--muted));
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #99C2FF;
  border-radius: 10px;
}
```

**Focus Ring**:
```css
.focus-ring:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--ring));
}
```

**Glass Morphism**:
```css
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
}
```

**Card Hover**:
```css
.card-hover {
  transition: all 0.3s ease;
}
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
}
```

**Gradient Text**:
```css
.gradient-text {
  background: linear-gradient(to right, #1E6AFF, #1B9E77);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## 📋 Features Checklist

### Implemented Features ✅

**Pages**:
- ✅ Landing page with hero, features, pricing
- ✅ Login with validation
- ✅ Signup (3-step progressive)
- ✅ Forgot password flow
- ✅ Search with filters and views
- ✅ Insights feed with categories
- ✅ Account settings (6 tabs)
- ✅ AI Assistant feature page
- ✅ Geographic Mapping feature page
- ✅ Advanced Analytics feature page
- ✅ Verified Data feature page

**Components**:
- ✅ All 12 UI primitives
- ✅ Navbar with dark mode
- ✅ Facility cards
- ✅ Insight cards
- ✅ AI Assistant drawer
- ✅ Provider wrappers

**Features**:
- ✅ Dark mode (system + manual)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Search with real-time filtering
- ✅ Grid/Table view toggle
- ✅ AI chat interface
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications
- ✅ Keyboard shortcuts
- ✅ Accessibility (WCAG AA+)

### Future Enhancements (Phase 2) 🔄

**Backend Integration**:
- ⏳ Real API endpoints
- ⏳ WebSocket for real-time data
- ⏳ JWT authentication
- ⏳ Database integration

**Advanced Features**:
- ⏳ Mapbox maps implementation
- ⏳ Plotly charts for analytics
- ⏳ Recharts for sparklines
- ⏳ File upload for avatars
- ⏳ Email verification
- ⏳ Two-factor authentication

**Enhanced UX**:
- ⏳ Infinite scroll
- ⏳ Virtual scrolling
- ⏳ Advanced search (fuzzy matching)
- ⏳ Saved searches
- ⏳ Facility comparison
- ⏳ Export to PDF
- ⏳ Print layouts

**Testing**:
- ⏳ Unit tests (Jest)
- ⏳ Integration tests
- ⏳ E2E tests (Playwright)
- ⏳ Accessibility tests

---

## 🎯 User Journeys

### Journey 1: New User Onboarding
1. Land on homepage
2. See value proposition and features
3. Click "Start Free Trial"
4. Complete 3-step signup:
   - Enter account details
   - Select role (Admin/Analyst/Viewer)
   - Choose plan (Free/Pro/Enterprise)
5. Redirected to login
6. Enter credentials
7. Redirected to search page
8. See facility data and filters
9. Try AI Assistant
10. Explore other pages

### Journey 2: Search for Facilities
1. Navigate to Search page
2. Apply filters:
   - Select "Hospital" type
   - Choose "California" (via search)
   - Set bed count 200-500
   - Set rating 4.0+
3. See filtered results
4. Toggle to table view
5. Click facility card to see details
6. Save facility (bookmark)
7. Export results to CSV

### Journey 3: Explore Insights
1. Navigate to Insights page
2. Browse "All" category
3. Click "Funding" tab
4. Read article summaries
5. Bookmark interesting article
6. Share article via share button
7. Check trending topics sidebar
8. Navigate to saved articles

### Journey 4: AI-Powered Analysis
1. Open AI Assistant (click floating button)
2. View suggested prompts
3. Click prompt or type custom query
4. Wait for AI response
5. Ask follow-up question
6. Use keyboard shortcuts (Ctrl+K to clear)
7. Export chat history
8. Close drawer

### Journey 5: Account Management
1. Click profile icon in navbar
2. Navigate to Account Settings
3. Visit Profile tab:
   - Update name and job title
   - Save changes
4. Visit Subscription tab:
   - View current plan
   - Check billing history
5. Visit API Keys tab:
   - Generate new API key
   - Copy to clipboard
6. Visit Notifications tab:
   - Enable email notifications
   - Enable market alerts
7. Visit Security tab:
   - Change password
   - Enable 2FA (future)
8. Visit Sessions tab:
   - Review active sessions
   - Revoke old session

---

## 💡 Design Decisions & Rationale

### Why These Choices Were Made

**Next.js 14 App Router**:
- Server Components by default = better performance
- File-based routing = intuitive structure
- Built-in optimization (fonts, images)
- Great DX with TypeScript

**Tailwind CSS**:
- Rapid development with utility classes
- Consistent design system
- Purging unused CSS for small bundles
- Easy dark mode implementation
- No CSS-in-JS overhead

**Radix UI**:
- Unstyled, accessible primitives
- Full keyboard navigation
- ARIA attributes built-in
- Highly customizable
- Production-ready

**Zustand**:
- Minimal boilerplate vs Redux
- No providers needed
- Great TypeScript support
- Excellent performance
- Easy to test

**Progressive Signup**:
- Reduces cognitive load
- Higher completion rates
- Clear progress indication
- Easy to abandon and return

**Feature-Specific Pages**:
- Better SEO for each feature
- Detailed information for decision-making
- Clear CTAs for conversion
- Educational content

**Mock Data Approach**:
- Rapid prototyping
- No backend dependency
- Easy to demonstrate
- Clear API shape for future implementation

---

## 🎓 Best Practices Followed

### Code Quality
- ✅ TypeScript for type safety
- ✅ ESLint configuration
- ✅ Consistent naming conventions
- ✅ Component composition
- ✅ DRY principles
- ✅ Single Responsibility Principle

### Performance
- ✅ Server Components where possible
- ✅ Code splitting by route
- ✅ Lazy loading ready
- ✅ Optimized images
- ✅ Minimal re-renders
- ✅ Debounced search

### Accessibility
- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Color contrast (WCAG AA+)
- ✅ Screen reader tested (basic)

### UX
- ✅ Loading states
- ✅ Error messages
- ✅ Empty states
- ✅ Confirmation dialogs
- ✅ Toast notifications
- ✅ Responsive design

### Development
- ✅ Component documentation
- ✅ TypeScript interfaces
- ✅ Reusable patterns
- ✅ Clear file structure
- ✅ Git-friendly (merge-safe)

---

## 📊 Application Statistics

**Project Metrics**:
- Total Lines of Code: ~8,000+
- Components Created: 35+
- Pages: 11
- Routes: 11
- Mock Data Entries: 12
- Zustand Stores: 3
- TypeScript Interfaces: 10+
- Icons Used: 50+
- Color Tokens: 50+

**File Breakdown**:
- TypeScript/TSX files: 45+
- JSON files: 3
- CSS files: 1 (globals.css)
- Config files: 5
- Documentation files: 5

**Component Distribution**:
- UI Primitives: 12
- Shared Components: 5
- Page Components: 11
- Layout Components: 3

---

## 🚀 Deployment Considerations

### Production Checklist

**Environment Variables**:
- API endpoints (future)
- API keys (future)
- Database URLs (future)
- Analytics IDs (future)

**Optimizations**:
- Enable Next.js Image Optimization
- Configure CDN for static assets
- Set up caching headers
- Enable compression (gzip/brotli)
- Lazy load non-critical components

**Security**:
- Add CORS configuration
- Implement rate limiting
- Sanitize user inputs
- Add CSRF protection
- Enable HTTPS only

**Monitoring**:
- Set up error tracking (Sentry)
- Add analytics (Google Analytics)
- Monitor Core Web Vitals
- Log API errors
- Track user flows

---

## 📞 Support & Maintenance

### How to Maintain This Application

**Adding New Pages**:
1. Create folder in `src/app/[page-name]/`
2. Add `page.tsx` file
3. Import and use existing components
4. Add route to navigation if needed

**Adding New Components**:
1. UI primitives go in `src/components/ui/`
2. Shared components in `src/components/shared/`
3. Use TypeScript interfaces
4. Follow CVA pattern for variants

**Updating Mock Data**:
1. Edit files in `/public/mock-data/`
2. Maintain TypeScript interfaces
3. Keep data structure consistent
4. Update docs if structure changes

**Styling Changes**:
1. Update `tailwind.config.ts` for tokens
2. Update `globals.css` for custom classes
3. Maintain dark mode compatibility
4. Test responsive breakpoints

---

## 🎉 Summary

This is a **comprehensive, production-ready UI** for a healthcare data-as-a-service platform. It includes:

- **11 fully functional pages** with real interactions
- **35+ reusable components** following best practices
- **Complete design system** with dark mode
- **Mock authentication and data** for demonstration
- **Responsive layouts** for all screen sizes
- **Accessibility features** meeting WCAG AA+ standards
- **Modern tech stack** (Next.js 14, TypeScript, Tailwind)
- **State management** with Zustand
- **Well-organized codebase** ready for backend integration

The application is **ready to connect to real APIs** and can be deployed to production with minimal changes. All UI/UX patterns are implemented, and the codebase is maintainable and scalable.

---

# 🚀 PHASE 2 ENHANCEMENTS - HealthData DaaS 2.0

## Industrial UI & Advanced Feature Expansion

### Vision Statement
Transform the healthcare DaaS platform into an **industrial, data-driven, AI-augmented intelligence system** featuring real-time communication, advanced graph visualization, B2B intent intelligence, and motion-rich interactions. This is **HealthData AI 2.0** - where analytics meets intelligence meets interaction.

---

## 🎨 1. Visual & Functional Overhaul (Global Enhancements)

### 🔹 Next-Gen Design System

#### Design Philosophy
- **Glassmorphism + Neuromorphic Hybrid Interface**
  - Glass-like translucent panels with frosted backgrounds
  - Soft neuromorphic shadows for depth
  - Ambient glow effects on interactive elements
  - Smooth gradients with HSL color transitions

#### Motion-Driven Transitions (Framer Motion)

**Page Transitions**:
```typescript
// Page level animations
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  },
  exit: { opacity: 0, y: -20 }
}
```

**Card Interactions**:
- **Hover**: Parallax lift (translateY: -8px) + ambient glow
- **Click**: Scale + ripple effect
- **Load**: Stagger animation for card grids

**Filter Drawers**:
- Animated slide-in from side
- Blur background overlay
- Spring physics for natural feel

#### Visual Hierarchy Redefinition

**Hero Sections**:
- 3D illustrations using Three.js
- D3.js graph orbits as decorative elements
- Floating particle effects
- Animated metric counters

**Depth Layers**:
```
Z-Index System:
- Base content: z-0
- Cards: z-10
- Floating panels: z-20
- Analytics overlays: z-30
- Graph panels: z-40
- Modals/Dialogs: z-50
- Toasts: z-60
```

**Dynamic Theming**:
```css
/* CSS Variables for real-time theme switching */
:root {
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-blur: 12px;
  --glow-primary: rgba(37, 99, 235, 0.4);
  --glow-secondary: rgba(16, 185, 129, 0.4);
  --depth-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
```

#### Typography Upgrade

**Font Stack**:
```typescript
{
  sans: ["Inter Variable", "Geist Sans", "system-ui"],
  mono: ["JetBrains Mono", "monospace"],
  display: ["Inter Variable", "sans-serif"]
}
```

**Usage Guidelines**:
- **Inter Variable**: All UI text, body copy, navigation
- **Geist Sans**: Headings, hero text (fallback)
- **JetBrains Mono**: 
  - Metric dashboards
  - Code blocks
  - Graph legends
  - API keys
  - Data tables

#### Color System 2.0

**Primary Palette**:
```typescript
{
  primary: {
    base: "#2563EB", // Blue glow
    50: "#EFF6FF",
    100: "#DBEAFE",
    500: "#2563EB",
    900: "#1E3A8A",
    glow: "rgba(37, 99, 235, 0.4)"
  },
  secondary: {
    base: "#10B981", // Emerald
    50: "#ECFDF5",
    100: "#D1FAE5",
    500: "#10B981",
    900: "#064E3B",
    glow: "rgba(16, 185, 129, 0.4)"
  },
  accent: {
    base: "#FACC15", // Gold
    50: "#FEFCE8",
    100: "#FEF9C3",
    500: "#FACC15",
    900: "#713F12",
    glow: "rgba(250, 204, 21, 0.4)"
  }
}
```

**Background Gradients**:
```css
/* Light mode */
.bg-gradient-light {
  background: linear-gradient(to bottom right, 
    #f8fafc, 
    #e0f2fe, 
    #d1fae5
  );
}

/* Dark mode */
.bg-gradient-dark {
  background: linear-gradient(to bottom right,
    #0f172a,  /* slate-900 */
    #1e3a8a,  /* blue-900 */
    #064e3b   /* emerald-900 */
  );
}
```

**Shadows & Glows**:
```css
/* Soft ambient glow for data components */
.shadow-glow-primary {
  box-shadow: 
    0 0 20px rgba(37, 99, 235, 0.3),
    0 8px 32px rgba(0, 0, 0, 0.12);
}

.shadow-glow-secondary {
  box-shadow: 
    0 0 20px rgba(16, 185, 129, 0.3),
    0 8px 32px rgba(0, 0, 0, 0.12);
}
```

---

## ⚙️ 2. Major Functional Upgrades

### 🧬 A. Twilio Calling Integration

**Objective**: Enable direct voice calling to healthcare facilities from within the application using Twilio Voice SDK.

#### UI Implementation

**FacilityCard Enhancement**:
```typescript
// Add to existing facility card
<Button 
  variant="outline" 
  size="sm"
  onClick={handleCallClick}
  className="group"
>
  <PhoneCall className="h-4 w-4 mr-2 group-hover:animate-ring" />
  Call Now
</Button>
```

**Call Modal Component**:
```typescript
interface CallModalProps {
  facility: {
    name: string
    phone: string
    id: string
  }
  isOpen: boolean
  onClose: () => void
}

// Modal Structure:
- Header: "Call [Facility Name]"
- Body:
  - Phone number display
  - Call status indicator
  - Waveform visualization (during call)
  - Call timer
- Footer:
  - "Call Now" button
  - "Schedule Call" button (Phase 3)
  - "Cancel" button
```

**Call States & UI**:

1. **Idle**:
   - Display phone number
   - "Call Now" button enabled
   - No waveform

2. **Connecting**:
   - Status: "Connecting..."
   - Loading spinner
   - Pulse animation on icon
   - Button disabled

3. **Ringing**:
   - Status: "Ringing..."
   - Animated rings around phone icon
   - Duration: 0:00
   - "End Call" button

4. **Active Call**:
   - Status: "On Call"
   - Real-time waveform animation
   - Live timer: MM:SS
   - Mute button
   - Speaker button
   - "End Call" button (red)

5. **Call Ended**:
   - Status: "Call Ended"
   - Final duration display
   - Call cost (if applicable)
   - "Call Again" button
   - "Close" button

**Waveform Component**:
```typescript
// Real-time audio visualization
import { motion } from "framer-motion"

const Waveform = () => (
  <div className="flex items-center justify-center gap-1 h-16">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="w-1 bg-primary-500 rounded-full"
        animate={{
          height: [8, 32, 8],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: i * 0.05,
        }}
      />
    ))}
  </div>
)
```

#### Backend API Structure

**Endpoint**: `/api/twilio/call`

**Request**:
```typescript
POST /api/twilio/call
{
  "from": "+12065551234",      // User's Twilio number
  "to": "+14085550123",         // Facility phone
  "facilityId": "fac_123",
  "facilityName": "St. Mary's Medical Center",
  "userId": "user_456"
}
```

**Response**:
```typescript
{
  "success": true,
  "callSid": "CA1234567890abcdef",
  "status": "initiated",
  "estimatedCost": "$0.015/min"
}
```

**Webhook Endpoint**: `/api/twilio/status`
- Receives call status updates
- Updates Zustand store in real-time

#### Zustand Store: callStore

```typescript
interface CallState {
  activeCall: {
    callSid: string | null
    facility: Facility | null
    status: "idle" | "connecting" | "ringing" | "active" | "ended"
    duration: number
    startTime: Date | null
    cost: number
  }
  callHistory: CallLog[]
  
  // Actions
  initiateCall: (facility: Facility) => Promise<void>
  endCall: () => void
  updateCallStatus: (status: string) => void
  updateDuration: (duration: number) => void
  addToHistory: (call: CallLog) => void
}
```

#### Features

**Call Logs**:
- Store all calls in history
- Display in dashboard sidebar
- Export as CSV
- Filter by date, facility, duration

**Toast Notifications**:
- "Connecting to [Facility Name]..."
- "Call connected successfully"
- "Call ended - Duration: 5:23"
- "Call failed - Please try again"

**Error Handling**:
- Network issues
- Invalid phone numbers
- Twilio API errors
- Insufficient credits
- User-friendly error messages

**Accessibility**:
- Keyboard navigation (Tab, Enter, Esc)
- ARIA labels for all states
- Screen reader announcements
- Focus management

---

### 🕸️ B. Entity Linkage Visualization (Graph Integration)

**Objective**: Render interactive, data-driven visual mapping of healthcare entities and relationships.

#### Entity Schema

**Node Types**:
```typescript
type NodeType = 
  | "State"
  | "County" 
  | "Zipcode"
  | "Hospital"
  | "Drug"

interface GraphNode {
  id: string
  type: NodeType
  label: string
  properties: {
    name?: string
    npi?: string
    generic_name?: string
    claim_count?: number
  }
  x?: number
  y?: number
  z?: number
}

interface GraphEdge {
  source: string
  target: string
  relationship: string
  weight?: number
}
```

**Relationships**:
- State → CONTAINS → County
- County → CONTAINS → Zipcode
- Zipcode → HAS_FACILITY → Hospital
- Hospital → PRESCRIBES → Drug

#### New Route: `/graph-linkage`

**Layout**:
```
┌─────────────────────────────────────────┐
│ Entity Linkage Explorer                 │
├─────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌────────────┐ │
│ │ State ▼ │ │ County ▼│ │  Drug     │ │
│ │  CA     │ │   All   │ │ Category ▼│ │
│ └─────────┘ └─────────┘ └────────────┘ │
├───────────────────┬─────────────────────┤
│                   │ ┌───────────────┐   │
│                   │ │ Mini Metrics  │   │
│   3D Graph Canvas │ │ Hospitals: 235│   │
│                   │ │ Drugs: 1,244  │   │
│   (Force Layout)  │ │ Counties: 65  │   │
│                   │ └───────────────┘   │
│                   │ ┌───────────────┐   │
│                   │ │ Export        │   │
│                   │ │ • PNG         │   │
│                   │ │ • JSON        │   │
│                   │ │ • Graph Query │   │
│                   │ └───────────────┘   │
└───────────────────┴─────────────────────┘
```

#### Visual Components

**Top Control Panel**:
```typescript
<div className="glass-panel p-4 rounded-lg">
  <div className="flex gap-4">
    {/* State Filter */}
    <Select>
      <option>All States</option>
      <option>California</option>
      <option>Texas</option>
      <option>Florida</option>
    </Select>
    
    {/* County Filter */}
    <Select>
      <option>All Counties</option>
      {/* Dynamic based on state */}
    </Select>
    
    {/* Drug Category */}
    <Select>
      <option>All Categories</option>
      <option>Antibiotics</option>
      <option>Cardiovascular</option>
      <option>Diabetes</option>
    </Select>
    
    {/* View Options */}
    <Toggle>
      <option>3D View</option>
      <option>2D View</option>
    </Toggle>
  </div>
</div>
```

**3D Graph Canvas**:

**Technology**: `react-force-graph-3d` + `three.js`

**Configuration**:
```typescript
import ForceGraph3D from 'react-force-graph-3d';

<ForceGraph3D
  graphData={graphData}
  nodeLabel={node => `
    <div class="graph-tooltip">
      <strong>${node.label}</strong>
      <p>${node.properties.name}</p>
    </div>
  `}
  nodeColor={node => {
    switch(node.type) {
      case 'State': return '#2563EB'
      case 'County': return '#10B981'
      case 'Zipcode': return '#6B7280'
      case 'Hospital': return '#FFFFFF'
      case 'Drug': return '#F97316'
    }
  }}
  nodeVal={node => node.size || 1}
  linkWidth={link => link.weight || 1}
  linkColor={() => 'rgba(255, 255, 255, 0.3)'}
  onNodeClick={handleNodeClick}
  onNodeHover={handleNodeHover}
  enableNodeDrag={true}
  enableNavigationControls={true}
/>
```

**Node Styling**:
- **State**: Blue hexagon, size 20
- **County**: Green circle, size 15
- **Zipcode**: Gray small circle, size 8
- **Hospital**: White node with hospital icon overlay, size 12
- **Drug**: Orange diamond, size 10

**Hover Tooltip**:
```typescript
// Tooltip for Hospital node
<div className="graph-tooltip glass-panel p-3 rounded-lg">
  <h4 className="font-bold">St. Mary's Medical Center</h4>
  <div className="space-y-1 text-sm">
    <p>NPI: 1234567890</p>
    <p>Prescribed Drugs: 122</p>
    <p>Top Drug: Atorvastatin</p>
    <p>Claim Count: 45,678</p>
  </div>
</div>
```

**Sidebar Metrics**:
```typescript
<Card className="glass-panel">
  <CardHeader>
    <CardTitle>Graph Statistics</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <MetricRow icon={Building2} label="Hospitals Linked" value={235} />
    <MetricRow icon={Pill} label="Drugs Mapped" value={1244} />
    <MetricRow icon={MapPin} label="Counties Visualized" value={65} />
    <MetricRow icon={Activity} label="Total Relationships" value={3421} />
  </CardContent>
</Card>
```

**Export Options**:
```typescript
<Card className="glass-panel">
  <CardHeader>
    <CardTitle>Export Graph</CardTitle>
  </CardHeader>
  <CardContent className="space-y-2">
    <Button onClick={exportAsPNG}>
      <Image className="mr-2" />
      Export as PNG
    </Button>
    <Button onClick={exportAsJSON}>
      <FileJson className="mr-2" />
      Export as JSON
    </Button>
    <Button onClick={openGraphQuery}>
      <Database className="mr-2" />
      Traverse in Graph DB
    </Button>
  </CardContent>
</Card>
```

#### Graph Interactions

**Node Drag**:
- Click and hold to drag nodes
- Physics simulation adjusts connected nodes
- Release to settle into new position

**Edge Highlighting**:
- Hover over node highlights all connected edges
- Connected nodes also highlight
- Thickness increases on hover

**Click-to-Expand**:
```typescript
const handleNodeClick = (node: GraphNode) => {
  if (node.type === 'Hospital') {
    // Expand to show all drugs prescribed
    fetchDrugsForHospital(node.id);
  } else if (node.type === 'County') {
    // Expand to show all zipcodes
    fetchZipcodesForCounty(node.id);
  }
}
```

**Zoom & Pan**:
- Scroll to zoom
- Click and drag background to pan
- Double-click node to focus
- "Fit to View" button

#### Backend API (Mock)

**Endpoint**: `/api/graph/linkage`

**Request**:
```typescript
GET /api/graph/linkage?state=CA&county=Los Angeles&drugCategory=Cardiovascular
```

**Response**:
```typescript
{
  "nodes": [
    {
      "id": "state_ca",
      "type": "State",
      "label": "California",
      "properties": { "name": "California" }
    },
    {
      "id": "county_la",
      "type": "County",
      "label": "Los Angeles",
      "properties": { "name": "Los Angeles County" }
    },
    {
      "id": "hosp_123",
      "type": "Hospital",
      "label": "St. Mary's",
      "properties": {
        "name": "St. Mary's Medical Center",
        "npi": "1234567890"
      }
    },
    {
      "id": "drug_456",
      "type": "Drug",
      "label": "Atorvastatin",
      "properties": {
        "generic_name": "Atorvastatin",
        "brand_name": "Lipitor",
        "claim_count": 45678
      }
    }
  ],
  "edges": [
    {
      "source": "state_ca",
      "target": "county_la",
      "relationship": "CONTAINS",
      "weight": 1
    },
    {
      "source": "county_la",
      "target": "hosp_123",
      "relationship": "HAS_FACILITY",
      "weight": 1
    },
    {
      "source": "hosp_123",
      "target": "drug_456",
      "relationship": "PRESCRIBES",
      "weight": 45678
    }
  ]
}
```

#### Mock Data File

**Location**: `/public/mock-data/entity-linkage.json`

**Structure**:
```json
{
  "states": [
    {
      "id": "state_ca",
      "name": "California",
      "counties": ["county_la", "county_sf", "county_sd"]
    }
  ],
  "counties": [
    {
      "id": "county_la",
      "name": "Los Angeles County",
      "state": "state_ca",
      "zipcodes": ["90001", "90002", "90210"]
    }
  ],
  "hospitals": [
    {
      "id": "hosp_123",
      "name": "St. Mary's Medical Center",
      "npi": "1234567890",
      "zipcode": "90001",
      "drugs": ["drug_456", "drug_789"]
    }
  ],
  "drugs": [
    {
      "id": "drug_456",
      "generic_name": "Atorvastatin",
      "brand_name": "Lipitor",
      "category": "Cardiovascular",
      "claim_count": 45678
    }
  ]
}
```

#### Zustand Store: graphStore

```typescript
interface GraphState {
  nodes: GraphNode[]
  edges: GraphEdge[]
  selectedNode: GraphNode | null
  filters: {
    state: string | null
    county: string | null
    drugCategory: string | null
  }
  
  // Actions
  loadGraph: (filters: GraphFilters) => Promise<void>
  selectNode: (node: GraphNode) => void
  expandNode: (nodeId: string) => Promise<void>
  setFilter: (key: string, value: string) => void
  resetFilters: () => void
  exportGraph: (format: 'png' | 'json') => void
}
```

---

### 🔍 C. Bombora Intent Data Integration

**Objective**: Incorporate Bombora B2B intent intelligence to track healthcare companies' research activity and buying signals.

#### What is Bombora?

Bombora provides **Company Surge® data** - tracking when businesses research specific topics online, indicating purchase intent. For healthcare, this means tracking when companies research:
- Hospital analytics solutions
- Healthcare AI platforms
- Provider data systems
- EHR integrations
- Telemedicine platforms

#### New Tab: Market Intent (`/insights?tab=market-intent`)

**Layout**:
```
┌─────────────────────────────────────────────┐
│ Healthcare Insights                         │
│ [All] [Hospitals] [Clinics] [Market Intent]│
├─────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐   │
│ │ Intent Activity This Week            │   │
│ ├──────────────────────────────────────┤   │
│ │ [Company Card 1]                     │   │
│ │ [Company Card 2]                     │   │
│ │ [Company Card 3]                     │   │
│ └──────────────────────────────────────┘   │
│                                             │
│ ┌──────────────────────────────────────┐   │
│ │ Trending Intent Topics               │   │
│ │ [Radial Chart / Bubble Chart]        │   │
│ └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

#### Company Intent Card Component

```typescript
interface IntentCardProps {
  company: {
    name: string
    logo?: string
    industry: string
    size: string
    website: string
  }
  topics: string[]
  intentScore: number  // 0-100
  trend: "up" | "down" | "stable"
  lastActivity: Date
}

// Visual Design
<Card className="glass-panel hover:shadow-glow-primary">
  <CardHeader>
    <div className="flex items-center gap-3">
      {/* Company Logo */}
      <img src={company.logo} className="w-12 h-12 rounded-lg" />
      
      {/* Company Info */}
      <div>
        <h3 className="font-bold">{company.name}</h3>
        <p className="text-sm text-muted-foreground">
          {company.industry} • {company.size}
        </p>
      </div>
      
      {/* Trend Indicator */}
      <Badge variant={trend === 'up' ? 'success' : 'secondary'}>
        {trend === 'up' && <TrendingUp className="mr-1" />}
        {intentScore}
      </Badge>
    </div>
  </CardHeader>
  
  <CardContent>
    {/* Research Topics */}
    <div className="mb-4">
      <p className="text-sm font-medium mb-2">Researching:</p>
      <div className="flex flex-wrap gap-2">
        {topics.map(topic => (
          <Badge key={topic} variant="outline">
            {topic}
          </Badge>
        ))}
      </div>
    </div>
    
    {/* Intent Score Bar */}
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>Intent Score</span>
        <span className="font-bold text-primary-500">{intentScore}/100</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
          initial={{ width: 0 }}
          animate={{ width: `${intentScore}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
    
    {/* Last Activity */}
    <p className="text-xs text-muted-foreground">
      Last activity: {formatDistanceToNow(lastActivity)} ago
    </p>
  </CardContent>
  
  <CardFooter>
    <Button variant="outline" size="sm" className="w-full">
      <ExternalLink className="mr-2 h-4 w-4" />
      View Company Profile
    </Button>
  </CardFooter>
</Card>
```

#### Trending Topics Visualization

**Using Plotly.js**:

```typescript
import Plot from 'react-plotly.js';

const TrendingTopicsChart = ({ data }) => (
  <Card className="glass-panel">
    <CardHeader>
      <CardTitle>Trending Intent Topics</CardTitle>
      <CardDescription>
        Research activity by topic this month
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Plot
        data={[
          {
            type: 'scatter',
            mode: 'markers',
            x: data.map(d => d.topic),
            y: data.map(d => d.averageScore),
            marker: {
              size: data.map(d => d.companyCount * 2),
              color: data.map(d => d.averageScore),
              colorscale: 'Viridis',
              showscale: true
            },
            text: data.map(d => 
              `${d.topic}\n${d.companyCount} companies\nAvg Score: ${d.averageScore}`
            ),
            hoverinfo: 'text'
          }
        ]}
        layout={{
          title: '',
          xaxis: { title: 'Topic Category' },
          yaxis: { title: 'Average Intent Score' },
          hovermode: 'closest',
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent'
        }}
      />
    </CardContent>
  </Card>
);
```

**Alternative: Radial/Polar Chart**:
```typescript
// For a more visually striking display
{
  type: 'scatterpolar',
  r: data.map(d => d.averageScore),
  theta: data.map(d => d.topic),
  fill: 'toself',
  name: 'Intent Activity'
}
```

#### Sidebar Metrics

```typescript
<Card className="glass-panel">
  <CardHeader>
    <CardTitle>Intent Intelligence</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Top Intent Companies */}
    <div>
      <h4 className="font-semibold mb-2">Top Intent Companies</h4>
      <div className="space-y-2">
        {topCompanies.map((company, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-lg font-bold text-muted-foreground">
              {idx + 1}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">{company.name}</p>
              <p className="text-xs text-muted-foreground">
                Score: {company.score}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    {/* Emerging Topics */}
    <div>
      <h4 className="font-semibold mb-2">Emerging Topics</h4>
      <div className="flex flex-wrap gap-2">
        {emergingTopics.map(topic => (
          <Badge key={topic.name} className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {topic.name}
            <span className="ml-1 text-xs">+{topic.growth}%</span>
          </Badge>
        ))}
      </div>
    </div>
    
    {/* Industry Heatmap Link */}
    <Button variant="outline" className="w-full">
      <Map className="mr-2 h-4 w-4" />
      View Intent Heatmap
    </Button>
  </CardContent>
</Card>
```

#### Backend API

**Endpoint**: `/api/bombora/intent`

**Request**:
```typescript
GET /api/bombora/intent?industry=Healthcare&minScore=70&period=week
```

**Response**:
```typescript
{
  "companies": [
    {
      "id": "comp_123",
      "name": "Pfizer Inc.",
      "logo": "https://logo.clearbit.com/pfizer.com",
      "industry": "Pharmaceuticals",
      "size": "Enterprise",
      "website": "pfizer.com",
      "topics": [
        "Hospital Analytics",
        "Healthcare AI",
        "Provider Data"
      ],
      "intentScore": 85,
      "trend": "up",
      "lastActivity": "2025-10-05T14:30:00Z",
      "changeWeekly": +12
    },
    // ... more companies
  ],
  "trendingTopics": [
    {
      "topic": "Hospital Analytics",
      "averageScore": 78,
      "companyCount": 45,
      "growth": 15
    },
    {
      "topic": "Healthcare AI",
      "averageScore": 82,
      "companyCount": 38,
      "growth": 22
    }
  ]
}
```

#### Mock Data File

**Location**: `/public/mock-data/bombora-intent.json`

```json
{
  "companies": [
    {
      "id": "comp_001",
      "name": "Pfizer Inc.",
      "logo": "/logos/pfizer.png",
      "industry": "Pharmaceuticals",
      "size": "Enterprise (10,000+ employees)",
      "website": "pfizer.com",
      "topics": [
        "Hospital Analytics",
        "Healthcare AI",
        "Provider Data",
        "EHR Integration"
      ],
      "intentScore": 85,
      "trend": "up",
      "lastActivity": "2025-10-05T14:30:00Z",
      "changeWeekly": 12
    },
    {
      "id": "comp_002",
      "name": "Johnson & Johnson",
      "logo": "/logos/jnj.png",
      "industry": "Healthcare",
      "size": "Enterprise (10,000+ employees)",
      "website": "jnj.com",
      "topics": [
        "Healthcare Supply Chain",
        "Medical Device Analytics",
        "Hospital Partnerships"
      ],
      "intentScore": 78,
      "trend": "stable",
      "lastActivity": "2025-10-04T10:15:00Z",
      "changeWeekly": 2
    },
    {
      "id": "comp_003",
      "name": "UnitedHealth Group",
      "logo": "/logos/unitedhealth.png",
      "industry": "Health Insurance",
      "size": "Enterprise (10,000+ employees)",
      "website": "unitedhealthgroup.com",
      "topics": [
        "Provider Networks",
        "Claims Analytics",
        "Population Health"
      ],
      "intentScore": 92,
      "trend": "up",
      "lastActivity": "2025-10-05T16:45:00Z",
      "changeWeekly": 18
    }
  ],
  "trendingTopics": [
    {
      "topic": "Hospital Analytics",
      "averageScore": 78,
      "companyCount": 45,
      "growth": 15,
      "category": "Analytics"
    },
    {
      "topic": "Healthcare AI",
      "averageScore": 82,
      "companyCount": 38,
      "growth": 22,
      "category": "Technology"
    },
    {
      "topic": "Provider Data",
      "averageScore": 75,
      "companyCount": 52,
      "growth": 8,
      "category": "Data"
    },
    {
      "topic": "Telemedicine Platforms",
      "averageScore": 68,
      "companyCount": 31,
      "growth": 28,
      "category": "Technology"
    },
    {
      "topic": "EHR Integration",
      "averageScore": 71,
      "companyCount": 42,
      "growth": 11,
      "category": "Integration"
    }
  ]
}
```

#### Graph Integration

**Linking Bombora to Entity Graph**:

When a company in Bombora shows interest in "Hospital Analytics", link to:
- Hospitals they own/manage
- Facilities in their network
- Market territories they operate in

**Visual Connection**:
```typescript
// In graph view, add a new node type: "Company"
{
  id: "comp_pfizer",
  type: "Company",
  label: "Pfizer",
  properties: {
    intentScore: 85,
    topics: ["Hospital Analytics", "Healthcare AI"]
  }
}

// Create edges:
Company → MANAGES → Hospital
Company → RESEARCHING → Topic
Company → OPERATES_IN → State
```

**Use Case Example**:
1. User sees "Pfizer" has high intent score for "Hospital Analytics"
2. Clicks on Pfizer card
3. Modal shows: "View in Entity Graph"
4. Graph loads showing:
   - Pfizer node (center)
   - Hospitals Pfizer manages (connected)
   - Research topics (connected)
   - Geographic presence (connected states)

#### Zustand Store: intentStore

```typescript
interface IntentState {
  companies: IntentCompany[]
  trendingTopics: TrendingTopic[]
  filters: {
    industry: string | null
    minScore: number
    period: 'day' | 'week' | 'month'
  }
  selectedCompany: IntentCompany | null
  
  // Actions
  loadIntentData: (filters: IntentFilters) => Promise<void>
  selectCompany: (company: IntentCompany) => void
  setFilter: (key: string, value: any) => void
  refreshData: () => Promise<void>
}
```

---

### 📞 D. Unified Dashboard (Integration Hub)

**Objective**: Create a comprehensive executive dashboard that consolidates all major data systems into one view.

#### New Route: `/dashboard`

**Layout**: 3-column modular grid (draggable widgets using `react-grid-layout`)

```
┌────────────────────────────────────────────────────┐
│ Dashboard - HealthData Intelligence Hub           │
├────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐ │
│ │ Entity Graph│ │ Intent      │ │ Call Logs    │ │
│ │ Summary     │ │ Activity    │ │              │ │
│ │             │ │ Feed        │ │              │ │
│ └─────────────┘ └─────────────┘ └──────────────┘ │
│ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐ │
│ │ Search      │ │ AI Assistant│ │ Real-time    │ │
│ │ Statistics  │ │ Suggestions │ │ Activity     │ │
│ │             │ │             │ │              │ │
│ └─────────────┘ └─────────────┘ └──────────────┘ │
└────────────────────────────────────────────────────┘
```

#### Widget Components

**1. Entity Graph Summary Widget**:
```typescript
<Card className="glass-panel h-full">
  <CardHeader>
    <CardTitle>Entity Graph Network</CardTitle>
    <Button variant="ghost" size="sm" onClick={openFullGraph}>
      <ExternalLink className="h-4 w-4" />
    </Button>
  </CardHeader>
  <CardContent>
    {/* Mini 2D graph visualization */}
    <div className="h-48 relative">
      <ForceGraph2D
        graphData={miniGraphData}
        width={300}
        height={180}
        nodeCanvasObject={drawNode}
        linkColor={() => 'rgba(255,255,255,0.2)'}
      />
    </div>
    
    {/* Quick stats */}
    <div className="grid grid-cols-3 gap-2 mt-4">
      <MetricBadge label="Nodes" value={graphStats.nodes} />
      <MetricBadge label="Links" value={graphStats.edges} />
      <MetricBadge label="States" value={graphStats.states} />
    </div>
    
    <Button className="w-full mt-4" onClick={goToGraph}>
      Explore Full Graph
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  </CardContent>
</Card>
```

**2. Intent Activity Feed Widget**:
```typescript
<Card className="glass-panel h-full">
  <CardHeader>
    <CardTitle>Market Intent Activity</CardTitle>
    <Badge variant="secondary">Live</Badge>
  </CardHeader>
  <CardContent>
    <ScrollArea className="h-64">
      {intentActivities.map(activity => (
        <div key={activity.id} className="mb-3 p-2 hover:bg-muted/50 rounded">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-primary-500" />
            <span className="font-medium text-sm">{activity.company}</span>
            <Badge variant="outline" className="ml-auto">
              {activity.score}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Researching: {activity.topic}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(activity.timestamp)} ago
          </p>
        </div>
      ))}
    </ScrollArea>
    
    <Button variant="outline" className="w-full mt-4">
      View All Intent Data
    </Button>
  </CardContent>
</Card>
```

**3. Recent Calls & Engagement Widget**:
```typescript
<Card className="glass-panel h-full">
  <CardHeader>
    <CardTitle>Call Activity</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Call stats chart */}
    <div className="mb-4">
      <Line
        data={{
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Calls',
            data: callsPerDay,
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
          }]
        }}
        options={{
          responsive: true,
          plugins: { legend: { display: false } }
        }}
      />
    </div>
    
    {/* Recent calls list */}
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">Recent Calls</h4>
      {recentCalls.slice(0, 5).map(call => (
        <div key={call.id} className="flex items-center gap-2 text-sm">
          <PhoneCall className="h-4 w-4" />
          <span className="flex-1 truncate">{call.facility}</span>
          <Badge variant="outline">{call.duration}</Badge>
        </div>
      ))}
    </div>
    
    <Button variant="outline" className="w-full mt-4">
      View Call History
    </Button>
  </CardContent>
</Card>
```

**4. Search Statistics Widget**:
```typescript
<Card className="glass-panel h-full">
  <CardHeader>
    <CardTitle>Search Activity</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {/* Total queries with animated counter */}
      <div className="text-center">
        <AnimatedCounter value={totalQueries} />
        <p className="text-sm text-muted-foreground">Total Searches</p>
      </div>
      
      {/* Most searched filters */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Popular Filters</h4>
        <div className="space-y-2">
          {topFilters.map(filter => (
            <div key={filter.name} className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>{filter.name}</span>
                  <span className="font-medium">{filter.count}</span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500"
                    style={{ width: `${filter.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

**5. AI Assistant Suggestions Widget**:
```typescript
<Card className="glass-panel h-full">
  <CardHeader>
    <CardTitle>AI-Powered Insights</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      {aiSuggestions.map(suggestion => (
        <Button
          key={suggestion.id}
          variant="outline"
          className="w-full justify-start text-left h-auto py-3"
          onClick={() => executeAISuggestion(suggestion)}
        >
          <Sparkles className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="text-sm">{suggestion.prompt}</span>
        </Button>
      ))}
    </div>
    
    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
      <p className="text-xs text-muted-foreground">
        💡 Based on your recent activity, these queries might be helpful
      </p>
    </div>
  </CardContent>
</Card>
```

**6. Real-time Activity Widget**:
```typescript
<Card className="glass-panel h-full">
  <CardHeader>
    <CardTitle>Live Activity</CardTitle>
    <Badge variant="secondary" className="animate-pulse">
      <Circle className="h-2 w-2 mr-1 fill-current" />
      Live
    </Badge>
  </CardHeader>
  <CardContent>
    <ScrollArea className="h-64">
      {activityFeed.map(activity => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-3 p-2 border-l-2 border-primary-500 pl-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <ActivityIcon type={activity.type} />
            <span className="text-sm font-medium">{activity.action}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {activity.description}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(activity.timestamp)} ago
          </p>
        </motion.div>
      ))}
    </ScrollArea>
  </CardContent>
</Card>
```

#### Draggable Grid Implementation

```typescript
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";

const DashboardLayout = () => {
  const [layout, setLayout] = useState([
    { i: 'graph', x: 0, y: 0, w: 4, h: 2 },
    { i: 'intent', x: 4, y: 0, w: 4, h: 2 },
    { i: 'calls', x: 8, y: 0, w: 4, h: 2 },
    { i: 'search', x: 0, y: 2, w: 4, h: 2 },
    { i: 'ai', x: 4, y: 2, w: 4, h: 2 },
    { i: 'activity', x: 8, y: 2, w: 4, h: 2 },
  ]);

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={12}
      rowHeight={150}
      width={1200}
      onLayoutChange={setLayout}
      draggableHandle=".drag-handle"
    >
      <div key="graph">
        <EntityGraphWidget />
      </div>
      <div key="intent">
        <IntentActivityWidget />
      </div>
      {/* ... more widgets */}
    </GridLayout>
  );
};
```

#### Floating Mini-Graph Visual

**Top-right corner orbital graph**:
```typescript
<div className="fixed top-20 right-4 w-32 h-32 pointer-events-none">
  <Canvas>
    <ambientLight intensity={0.5} />
    <pointLight position={[10, 10, 10]} />
    {/* Rotating sphere with orbiting nodes */}
    <OrbitingNodes />
  </Canvas>
</div>
```

#### WebSocket Mock (Simulated Real-time)

```typescript
// Simulate live activity updates
useEffect(() => {
  const interval = setInterval(() => {
    const newActivity = generateRandomActivity();
    addActivity(newActivity);
  }, 5000); // New activity every 5 seconds

  return () => clearInterval(interval);
}, []);
```

---

## 🧠 3. AI Assistant Upgrade (Context-Aware Intelligence)

**Objective**: Enhance AI Assistant to be aware of all integrated data systems and provide intelligent, contextual responses.

### Context Sources

**1. Graph Data** (from graphStore):
- State/County/Hospital linkages
- Drug prescription patterns
- Facility networks

**2. Intent Signals** (from intentStore):
- Company research activity
- Trending topics
- Market intelligence

**3. Call Logs** (from callStore):
- Recent facility contacts
- Call statistics
- Engagement patterns

**4. Search History** (from filtersStore):
- Recent queries
- Popular filters
- User preferences

### Enhanced Prompts

**New Sample Prompts**:
```typescript
const contextAwarePrompts = [
  // Graph-aware
  "Show me hospitals linked to California counties prescribing Atorvastatin",
  "What's the drug prescription network for Los Angeles hospitals?",
  "Find all facilities in counties with high cardiovascular drug usage",
  
  // Intent-aware
  "Which companies are researching hospital analytics this week?",
  "Show me pharmaceutical companies with high intent scores",
  "What topics are trending in healthcare B2B research?",
  
  // Call-aware
  "Call the top-rated facility in Austin directly",
  "Show me call history for mental health facilities",
  "What's my engagement rate with California hospitals?",
  
  // Multi-context
  "Summarize market intent trends in pharmaceuticals this month",
  "Which hospitals should I contact based on intent data?",
  "Show facilities in my call history that are also being researched by top companies"
]
```

### Integration Logic

**Hybrid RAG (Retrieval-Augmented Generation)**:

```typescript
const generateAIResponse = async (userQuery: string) => {
  // 1. Determine query type
  const queryType = classifyQuery(userQuery);
  
  // 2. Retrieve relevant context
  let context = {};
  
  if (queryType.includes('graph')) {
    context.graph = await fetchRelevantGraphData(userQuery);
  }
  
  if (queryType.includes('intent')) {
    context.intent = await fetchRelevantIntentData(userQuery);
  }
  
  if (queryType.includes('call')) {
    context.calls = await fetchRelevantCallData(userQuery);
  }
  
  if (queryType.includes('search')) {
    context.search = await fetchSearchHistory(userQuery);
  }
  
  // 3. Augment prompt with context
  const augmentedPrompt = `
    User Query: ${userQuery}
    
    Relevant Context:
    ${JSON.stringify(context, null, 2)}
    
    Please provide a comprehensive answer using the context above.
  `;
  
  // 4. Generate response (mock for now)
  return await mockGPTResponse(augmentedPrompt);
};
```

### Example Interactions

**Query 1**: "Show me hospitals linked to California counties prescribing Atorvastatin"

**AI Response**:
```
Based on the entity graph data, here are the California hospitals 
with Atorvastatin prescriptions:

1. **St. Mary's Medical Center** (Los Angeles County)
   - NPI: 1234567890
   - Atorvastatin Claims: 45,678
   - Rank: #2 in LA County

2. **San Francisco General Hospital** (San Francisco County)
   - NPI: 0987654321
   - Atorvastatin Claims: 38,423
   - Rank: #1 in SF County

3. **UC San Diego Health** (San Diego County)
   - NPI: 5678901234
   - Atorvastatin Claims: 52,109
   - Rank: #1 in SD County

[View in Graph] [Export List] [Call Top Hospital]
```

**Query 2**: "Which companies are researching hospital analytics this week?"

**AI Response**:
```
This week, 12 companies showed significant research intent for 
"Hospital Analytics":

**High Intent (80-100)**:
1. UnitedHealth Group - Score: 92 ↑ +18%
   Topics: Provider Networks, Claims Analytics, Population Health

2. Pfizer Inc. - Score: 85 ↑ +12%
   Topics: Hospital Analytics, Healthcare AI, Provider Data

**Medium Intent (60-79)**:
3. CVS Health - Score: 74 ↑ +8%
4. Anthem Inc. - Score: 71 → stable

[View All Companies] [Set Alert for New Activity]
```

**Query 3**: "Call the top-rated facility in Austin directly"

**AI Response**:
```
Based on your search criteria, the top-rated facility in Austin is:

**Seton Medical Center Austin**
⭐ 4.8/5 (245 reviews)
📞 +1 (512) 324-1000
📍 1201 W 38th St, Austin, TX 78705

[Call Now] [View Details] [Save to Favorites]

Would you like me to initiate a call?
```

### UI Enhancements

**Context Pills** (show what context AI is using):
```typescript
<div className="flex gap-2 mb-2">
  {contextSources.includes('graph') && (
    <Badge variant="secondary" className="flex items-center gap-1">
      <Network className="h-3 w-3" />
      Using Graph Data
    </Badge>
  )}
  {contextSources.includes('intent') && (
    <Badge variant="secondary" className="flex items-center gap-1">
      <TrendingUp className="h-3 w-3" />
      Using Intent Data
    </Badge>
  )}
</div>
```

**Action Buttons in Responses**:
```typescript
// After AI response, show relevant actions
<div className="flex gap-2 mt-3">
  <Button size="sm" variant="outline">
    <ExternalLink className="h-3 w-3 mr-1" />
    View in Graph
  </Button>
  <Button size="sm" variant="outline">
    <Download className="h-3 w-3 mr-1" />
    Export Results
  </Button>
  <Button size="sm" variant="outline">
    <PhoneCall className="h-3 w-3 mr-1" />
    Call Facility
  </Button>
</div>
```

---

## 📦 4. Technical Implementation Guide

### Required Package Installations

```bash
npm install @twilio/voice-sdk \
  react-force-graph-3d \
  three \
  plotly.js \
  react-plotly.js \
  framer-motion \
  react-grid-layout \
  d3 \
  vis-network \
  recharts \
  @react-three/fiber \
  @react-three/drei
```

### New Zustand Stores

#### 1. callStore.ts
```typescript
import { create } from 'zustand'

interface CallStore {
  activeCall: ActiveCall | null
  callHistory: CallLog[]
  initiateCall: (facility: Facility) => Promise<void>
  endCall: () => void
  updateStatus: (status: CallStatus) => void
}

export const useCallStore = create<CallStore>((set) => ({
  // implementation
}))
```

#### 2. graphStore.ts
```typescript
import { create } from 'zustand'

interface GraphStore {
  nodes: GraphNode[]
  edges: GraphEdge[]
  selectedNode: GraphNode | null
  filters: GraphFilters
  loadGraph: (filters: GraphFilters) => Promise<void>
  expandNode: (nodeId: string) => Promise<void>
}

export const useGraphStore = create<GraphStore>((set) => ({
  // implementation
}))
```

#### 3. intentStore.ts
```typescript
import { create } from 'zustand'

interface IntentStore {
  companies: IntentCompany[]
  trendingTopics: TrendingTopic[]
  filters: IntentFilters
  loadIntentData: (filters: IntentFilters) => Promise<void>
}

export const useIntentStore = create<IntentStore>((set) => ({
  // implementation
}))
```

### New Mock Data Files

Create in `/public/mock-data/`:

1. **entity-linkage.json** (5KB)
   - States, counties, hospitals, drugs
   - Relationships and connections

2. **bombora-intent.json** (3KB)
   - Company intent data
   - Trending topics
   - Research signals

3. **call-logs.json** (2KB)
   - Historical call records
   - Call statistics
   - Engagement metrics

### New Routes to Create

```typescript
// src/app structure additions:

src/app/
  ├── dashboard/
  │   └── page.tsx              # New unified dashboard
  ├── graph-linkage/
  │   └── page.tsx              # New 3D entity graph
  └── insights/
      └── page.tsx              # Enhanced with intent tab
```

### Framer Motion Patterns

**Page Transitions**:
```typescript
// src/app/layout.tsx
import { motion, AnimatePresence } from 'framer-motion'

<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

**Card Animations**:
```typescript
<motion.div
  whileHover={{ 
    y: -8,
    boxShadow: "0 20px 40px rgba(37, 99, 235, 0.2)"
  }}
  transition={{ type: "spring", stiffness: 300 }}
>
  <Card>...</Card>
</motion.div>
```

**Stagger Children**:
```typescript
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

<motion.div variants={container} initial="hidden" animate="show">
  {items.map((item) => (
    <motion.div key={item.id} variants={item}>
      <Card />
    </motion.div>
  ))}
</motion.div>
```

### Accessibility Enhancements

**ARIA Labels for New Components**:
```typescript
// Twilio call button
<Button
  aria-label={`Call ${facility.name}`}
  aria-describedby="call-description"
>
  Call Now
</Button>

// Graph node
<div
  role="treeitem"
  aria-label={`${node.label} - ${node.type}`}
  tabIndex={0}
>
  {node.label}
</div>

// Intent card
<article
  aria-labelledby={`company-${company.id}`}
  aria-describedby={`intent-${company.id}`}
>
  <h3 id={`company-${company.id}`}>{company.name}</h3>
  <p id={`intent-${company.id}`}>Intent Score: {company.score}</p>
</article>
```

**Keyboard Navigation**:
- Graph: Arrow keys to navigate nodes
- Dashboard: Tab to move between widgets
- Call modal: Esc to close, Enter to call
- Intent cards: Space to expand

### Performance Optimizations

**Lazy Loading Heavy Components**:
```typescript
import dynamic from 'next/dynamic'

const ForceGraph3D = dynamic(
  () => import('react-force-graph-3d'),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-96 w-full" />
  }
)

const PlotlyChart = dynamic(
  () => import('react-plotly.js'),
  { ssr: false }
)
```

**React.memo for Graph Nodes**:
```typescript
const GraphNode = React.memo(({ node }) => {
  return <mesh position={[node.x, node.y, node.z]}>...</mesh>
}, (prev, next) => {
  return prev.node.id === next.node.id && 
         prev.node.x === next.node.x &&
         prev.node.y === next.node.y &&
         prev.node.z === next.node.z
})
```

**Virtual Scrolling for Large Lists**:
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

// For call history, intent feed, etc.
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80,
})
```

---

## ✨ 5. Visual Design References

### Design Inspiration Sources

**Dashboard Aesthetic**:
- **Palantir Foundry**: Data-driven, enterprise-grade
- **Databricks Lakehouse**: Clean metrics, modern charts
- **Notion**: Smooth interactions, minimal design

**Graph Interface**:
- **Neo4j Bloom**: Orbital layout, interactive nodes
- **Gephi**: Force-directed graphs
- **Observable**: D3.js visualizations

**AI Assistant Drawer**:
- **Notion AI**: Chat-style interface
- **GitHub Copilot**: Contextual suggestions
- **ChatGPT**: Clean message bubbles

**Entity Graph Page**:
- **Cosmos DB Explorer**: 3D graph visualization
- **TigerGraph GraphStudio**: Interactive exploration
- **NetworkX**: Physics-based layouts

**Market Intent View**:
- **LinkedIn Talent Insights**: Analytics cards
- **Bombora Dashboard**: Intent heatmaps
- **HubSpot**: Company profiles

### Color Gradient Examples

**Hero Backgrounds**:
```css
/* Light Mode Gradient */
background: linear-gradient(
  135deg,
  #f8fafc 0%,
  #e0f2fe 25%,
  #dbeafe 50%,
  #d1fae5 75%,
  #ecfdf5 100%
);

/* Dark Mode Gradient */
background: linear-gradient(
  135deg,
  #0f172a 0%,
  #1e293b 25%,
  #1e3a8a 50%,
  #064e3b 75%,
  #1f2937 100%
);
```

**Card Glows**:
```css
/* Primary Glow */
box-shadow: 
  0 0 0 1px rgba(37, 99, 235, 0.1),
  0 0 20px rgba(37, 99, 235, 0.3),
  0 8px 32px rgba(0, 0, 0, 0.12);

/* Secondary Glow */
box-shadow: 
  0 0 0 1px rgba(16, 185, 129, 0.1),
  0 0 20px rgba(16, 185, 129, 0.3),
  0 8px 32px rgba(0, 0, 0, 0.12);
```

---

## 🎯 6. Final Deliverables Summary

### Module Overview Table

| Module | Feature | Description | Primary Tech |
|--------|---------|-------------|--------------|
| **Search** | Twilio Calling | Real-time voice calls from facility cards | Twilio Voice SDK |
| **Graph Linkage** | Entity Mapping | 3D visualization of State→County→Hospital→Drug | Neo4j / react-force-graph-3d |
| **Insights** | Bombora Integration | Company-level research intent display | Bombora API / Plotly |
| **Dashboard** | Unified View | Combined analytics, call logs, graph activity | react-grid-layout |
| **AI Assistant** | Context-Aware | AI enriched with graph and intent data | GPT-4 + RAG context |
| **Global** | Motion Design | Framer Motion animations throughout | Framer Motion |
| **Global** | Theme System | Glassmorphism + neuromorphic hybrid | TailwindCSS + CSS vars |

### Implementation Priority

**Phase 2A (Weeks 1-2)**:
1. ✅ Install all required packages
2. ✅ Create new Zustand stores (call, graph, intent)
3. ✅ Add mock data files
4. ✅ Implement Framer Motion page transitions
5. ✅ Update color system and typography

**Phase 2B (Weeks 3-4)**:
6. ✅ Build Twilio calling UI and flow
7. ✅ Create `/graph-linkage` page with 3D visualization
8. ✅ Add Bombora intent tab to `/insights`
9. ✅ Build unified `/dashboard`

**Phase 2C (Weeks 5-6)**:
10. ✅ Enhance AI Assistant with context awareness
11. ✅ Add glassmorphism styling throughout
12. ✅ Implement all animations and transitions
13. ✅ Performance optimization and testing

### Success Criteria

- [ ] All new routes accessible and functional
- [ ] Twilio calling works (at least in mock)
- [ ] 3D graph renders smoothly (60fps)
- [ ] Bombora intent data displays correctly
- [ ] Dashboard widgets are draggable
- [ ] AI Assistant provides contextual responses
- [ ] Animations are smooth and purposeful
- [ ] Dark/light themes work perfectly
- [ ] Accessibility maintained (WCAG AA+)
- [ ] Performance: < 3s page load, < 100ms interactions

---

## 📞 7. Cursor AI Instructions (Copy-Paste Ready)

### Complete Prompt for Cursor

```
Enhance the existing Healthcare DaaS platform to include:

1. **Twilio-based calling features**:
   - Add "Call Now" button to FacilityCard component
   - Create CallModal with states: idle, connecting, ringing, active, ended
   - Implement waveform visualization during calls
   - Add call history tracking
   - Create callStore Zustand store

2. **Entity graph visualization using react-force-graph-3d**:
   - Create new route /graph-linkage
   - Implement 3D force-directed graph
   - Node types: State, County, Zipcode, Hospital, Drug
   - Add filters: State, County, Drug Category
   - Include hover tooltips and click interactions
   - Create graphStore Zustand store
   - Add mock data file: entity-linkage.json

3. **Bombora intent data integration**:
   - Add "Market Intent" tab to /insights page
   - Create IntentCard component showing company, topics, score
   - Implement Plotly.js trending topics visualization
   - Add sidebar with top companies and emerging topics
   - Create intentStore Zustand store
   - Add mock data file: bombora-intent.json

4. **Unified dashboard at /dashboard**:
   - Use react-grid-layout for draggable widgets
   - Widgets: Entity Graph Summary, Intent Activity, Call Logs, Search Stats, AI Suggestions, Real-time Activity
   - Add animated metric counters
   - Implement WebSocket mock for live updates

5. **Apply upgraded UI theme**:
   - Glassmorphism + neuromorphic design
   - Framer Motion for all transitions and animations
   - Update color system: Primary #2563EB, Secondary #10B981, Accent #FACC15
   - Add gradient backgrounds for light/dark modes
   - Implement soft ambient glows on interactive elements
   - Update typography: Inter Variable + JetBrains Mono

6. **Enhance AI Assistant**:
   - Make context-aware of graph, intent, and call data
   - Add new suggested prompts related to all features
   - Show context pills indicating data sources used
   - Add action buttons in responses (View in Graph, Call Facility, Export)

7. **Technical requirements**:
   - Use TailwindCSS for all styling
   - Ensure full accessibility (ARIA roles, keyboard navigation)
   - Implement lazy loading for heavy components (graphs, charts)
   - Maintain responsive design for all screen sizes
   - Follow existing design system while enhancing visuals

8. **Performance**:
   - Use React.memo for expensive components
   - Implement virtual scrolling for long lists
   - Lazy load 3D graph and Plotly charts
   - Debounce search and filter inputs

All pages must remain accessible, responsive, and consistent with the 
existing design system while adding richer interactivity, real-time 
components, and modern visuals.

This is HealthData AI 2.0 - where analytics meets intelligence meets interaction.
```

---

**Built with ❤️ using Next.js 14 + TypeScript + TailwindCSS**

**Healthcare Intelligence Platform - Phase 2 Enhancements**

**October 2025**

