# Healthcare DaaS Platform - UI Documentation

## 🎯 Overview

A next-generation, production-grade enterprise Data-as-a-Service (DaaS) platform for U.S. healthcare intelligence. Built with Next.js 14, TypeScript, and a comprehensive design system.

## 🚀 Features

### Core Functionality

- **Advanced Search Interface**
  - Real-time facility search with intelligent filtering
  - Grid and table view modes
  - Collapsible filter sidebar with multiple criteria
  - Export results to CSV
  - Over 6M healthcare facilities indexed

- **AI-Powered Assistant**
  - GPT-4 powered conversational interface
  - Context-aware responses with citations
  - Floating drawer with chat history
  - Export chat functionality
  - Keyboard shortcuts (Shift+Enter, Ctrl+K)

- **Insights Feed**
  - Twitter-like infinite scroll interface
  - Categorized content (Hospitals, Clinics, Funding, M&A, Policy)
  - Trending topics sidebar
  - Bookmark and share functionality
  - View counts and engagement metrics

- **Account Management**
  - Comprehensive profile settings
  - Subscription management with billing history
  - API key generation and management
  - Notification preferences
  - Security settings with 2FA support
  - Active session management

### Authentication System

- **Login/Signup Pages**
  - Progressive multi-step signup (Account Info → Role Selection → Plan)
  - Real-time validation with password strength meter
  - Remember me functionality
  - Social login placeholders (Google, GitHub)

- **Password Recovery**
  - Forgot password flow
  - Reset password with token validation

## 🎨 Design System

### Color Palette (WCAG AA+ Compliant)

```typescript
Primary: #1E6AFF (Blue) - Main actions, CTAs
Secondary: #1B9E77 (Green) - Success states, secondary actions
Accent: #FFC300 (Yellow) - Highlights, warnings
Neutrals: Gray scale for text and backgrounds
```

### Typography

- **Font Family**: Inter (UI), JetBrains Mono (Code)
- **Font Weights**: 400–800
- **Line Height**: Generous spacing for data-heavy tables

### Components

All components are located in `/src/components/ui` and `/src/components/shared`:

- **UI Primitives**: Button, Input, Textarea, Badge, Card, Skeleton
- **Form Elements**: Checkbox, Switch, Radio, Slider
- **Overlays**: Dialog, Modal, Dropdown, Popover, Tooltip
- **Navigation**: Tabs, Accordion
- **Shared**: Navbar, FacilityCard, InsightCard, AIAssistant

## 📁 Project Structure

```
healthcare-daas/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── page.tsx            # Landing page
│   │   ├── login/              # Authentication pages
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   ├── search/             # Search interface
│   │   ├── insights/           # Insights feed
│   │   └── account/            # Account settings
│   ├── components/
│   │   ├── ui/                 # Design system components
│   │   └── shared/             # Shared business components
│   ├── lib/                    # Utilities and helpers
│   ├── stores/                 # Zustand state management
│   │   ├── auth-store.ts
│   │   ├── filters-store.ts
│   │   └── ai-store.ts
│   ├── types/                  # TypeScript type definitions
│   └── hooks/                  # Custom React hooks
├── public/
│   └── mock-data/              # JSON mock data files
│       ├── facilities.json
│       └── insights.json
└── tailwind.config.ts          # Tailwind theme configuration
```

## 🛠️ Tech Stack

### Core

- **Framework**: Next.js 14+ (App Router, RSC)
- **Language**: TypeScript 5+
- **Styling**: TailwindCSS 3.4+ with custom theme tokens
- **Components**: Radix UI primitives + custom components
- **Icons**: Lucide React

### State Management

- **Global State**: Zustand (auth, filters, AI)
- **Server State**: TanStack Query v5
- **Validation**: Zod

### UI/UX

- **Notifications**: Sonner
- **Dark Mode**: next-themes
- **Animations**: Tailwind CSS animations
- **Accessibility**: Full keyboard navigation, ARIA labels, focus rings

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Navigate to project directory
cd healthcare-daas

# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 📄 Pages

### Landing Page (/)

- Hero section with animated stats ticker
- Feature grid with hover effects
- Pricing comparison table (Free, Pro, Enterprise)
- Footer with navigation links

### Search Interface (/search)

- Left sidebar with collapsible filters:
  - Facility Type (Hospital, Clinic, Urgent Care, Mental Health)
  - Ownership (Public, Private, Non-Profit)
  - Accreditation (Joint Commission, NCQA, CARF, UCAOA)
  - Bed Count range slider
  - Rating range slider
- Search bar with real-time filtering
- Grid/Table view toggle
- Export to CSV functionality
- AI Assistant drawer (floating button)

### Insights (/insights)

- Tabbed interface (All, Hospitals, Clinics, Mental Health, Urgent Care, Policy)
- Card-based layout with infinite scroll ready
- Right sidebar:
  - Trending Topics with counts
  - Saved Articles section
- Bookmark and share functionality

### Account Settings (/account)

Comprehensive settings with 6 tabs:
1. **Profile**: Avatar, name, email, job title
2. **Subscription**: Plan details, billing history
3. **API Keys**: Generate, view, revoke keys
4. **Notifications**: Email preferences
5. **Security**: Password change, 2FA setup
6. **Sessions**: Active device management

### Authentication

- **/login**: Email/password login with "Remember me"
- **/signup**: 3-step progressive signup
- **/forgot-password**: Password recovery flow

## 🎯 Mock Data

Located in `/public/mock-data/`:

### facilities.json
- 6+ sample healthcare facilities
- Complete with name, type, ownership, ratings, location
- Includes accreditation, bed count, contact info

### insights.json
- 6+ sample industry insights
- Categories: Expansion, Technology, Funding, M&A, Regulation
- Includes author, date, views, tags

## 🎨 Theming

### Light/Dark Mode

Automatic theme switching with next-themes:
```tsx
import { useTheme } from "next-themes"

const { theme, setTheme } = useTheme()
```

### Custom Colors

Defined in `tailwind.config.ts` and `globals.css`:
- Primary (Blue)
- Secondary (Green)
- Accent (Yellow)
- Success, Warning, Destructive, Info

## ⚡ Performance

- Server-side rendering with Next.js 14
- Optimized images and lazy loading
- Code splitting by route
- Shimmer loading states
- Responsive design (mobile-first)

## 🔐 Authentication Flow (UI Only)

Mock authentication is implemented with Zustand:
- Login stores user in global state
- Logout clears user state
- All auth pages have validation
- No actual API calls (Phase 1 MVP)

## 🎨 Key Features Showcase

### AI Assistant

- Floating button (bottom-right)
- Slides in from right
- Suggested prompts when empty
- Real-time typing indicator
- Export chat to TXT
- Keyboard shortcuts

### Search Filters

- Collapsible sections
- Multi-select checkboxes
- Range sliders for numeric values
- Active filter badges with remove option
- Reset all filters button

### Responsive Design

- Mobile: Stacked layout, hamburger menus
- Tablet: Condensed sidebar
- Desktop: Full 3-column layout with sidebars

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🎯 Accessibility

- Semantic HTML5 elements
- ARIA labels and roles
- Keyboard navigation (Tab, Enter, Escape)
- Focus visible indicators
- Screen reader support
- WCAG AA+ color contrast

## 📝 Code Conventions

- Function components (not classes)
- Named exports
- TypeScript interfaces over types
- Consistent file naming (kebab-case)
- Utility-first CSS with Tailwind

## 🚧 Next Steps (Post-MVP)

- Connect to real backend API
- Implement WebSocket for real-time updates
- Add Mapbox GL JS for geographic mapping
- Integrate Plotly.js for advanced charts
- Add Recharts for sparklines
- Implement react-markdown for content rendering
- Add comprehensive error boundaries
- Implement rate limiting feedback
- Add comprehensive testing

## 📄 License

Proprietary - All rights reserved

## 🤝 Contributing

This is a Phase 1 MVP UI implementation. Backend integration and advanced features will be added in subsequent phases.

---

**Built with ❤️ using Next.js 14, TypeScript, and TailwindCSS**
