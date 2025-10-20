# Quick Start Guide

## Getting Started in 3 Steps

### 1. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 2. Explore the Platform

#### Landing Page
Visit `http://localhost:3000` to see:
- Hero section with stats
- Feature grid
- Pricing plans
- Navigation to other pages

#### Authentication
Try the signup/login flow:
- Click "Start Free Trial" or "Sign Up"
- Go through the 3-step signup process
- Or login directly at `/login`
- **Note**: Authentication is mocked - any email/password will work

#### Search Interface
After "logging in", navigate to:
- `http://localhost:3000/search`
- Use the filter sidebar (left)
- Toggle between grid and table view
- Click the AI Assistant button (bottom-right)
- Try searching for facilities

#### Insights Feed
Visit `http://localhost:3000/insights`:
- Browse healthcare industry insights
- Filter by category using tabs
- View trending topics (right sidebar)
- Bookmark articles

#### Account Settings
Access at `http://localhost:3000/account`:
- View/edit profile information
- Check subscription details
- Manage API keys
- Configure notifications
- Update security settings
- View active sessions

### 3. Test the AI Assistant

1. Go to `/search` or `/insights`
2. Click the floating AI button (bottom-right corner)
3. Try suggested prompts or ask your own questions
4. Use keyboard shortcuts:
   - **Shift+Enter**: New line in input
   - **Ctrl+K**: Clear chat
5. Export chat as TXT file

## Key Features to Test

### Search Filters
- ✅ Facility Type selection
- ✅ Ownership filtering
- ✅ Accreditation checkboxes
- ✅ Bed count range slider
- ✅ Rating range slider
- ✅ Active filter badges

### View Modes
- ✅ Grid view (card layout)
- ✅ Table view (data table)
- ✅ Responsive sidebar toggle

### Mock Data
All data is loaded from:
- `/public/mock-data/facilities.json` (6 sample facilities)
- `/public/mock-data/insights.json` (6 sample insights)

### Theme Toggle
- Click the sun/moon icon in the navbar
- Switches between light and dark mode
- Theme persists across page reloads

## Default User (Mock)

When you "login", a mock user is created:
```json
{
  "id": "1",
  "email": "your-email@example.com",
  "name": "John Doe",
  "role": "Analyst",
  "plan": "Pro",
  "jobTitle": "Healthcare Analyst"
}
```

## Routing Overview

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Login form |
| `/signup` | 3-step signup |
| `/forgot-password` | Password recovery |
| `/search` | Facility search with filters |
| `/insights` | Industry insights feed |
| `/account` | Account settings |

## Component Structure

### UI Components (`/src/components/ui/`)
- `button.tsx` - 7 variants, 5 sizes
- `input.tsx` - With error states
- `card.tsx` - Modular card system
- `badge.tsx` - Status indicators
- `tabs.tsx` - Tabbed interfaces
- `dialog.tsx` - Modal system
- `skeleton.tsx` - Loading states
- And more...

### Shared Components (`/src/components/shared/`)
- `navbar.tsx` - Main navigation
- `facility-card.tsx` - Facility display
- `insight-card.tsx` - Insight display
- `ai-assistant.tsx` - AI chat drawer

## State Management

### Zustand Stores

**Auth Store** (`/src/stores/auth-store.ts`)
```typescript
const { user, login, logout } = useAuthStore()
```

**Filters Store** (`/src/stores/filters-store.ts`)
```typescript
const { filters, updateFilters, resetFilters } = useFiltersStore()
```

**AI Store** (`/src/stores/ai-store.ts`)
```typescript
const { messages, isOpen, addMessage, toggleDrawer } = useAIStore()
```

## Styling

### Tailwind Classes
- `gradient-text` - Gradient text effect
- `card-hover` - Card hover animation
- `glass` - Glass morphism effect
- `shimmer` - Loading shimmer
- `custom-scrollbar` - Styled scrollbar

### Theme Colors
```css
/* Primary */
bg-primary-500 text-primary-500 border-primary-500

/* Secondary */
bg-secondary-500 text-secondary-500

/* Accent */
bg-accent-500 text-accent-500

/* Status */
text-success text-warning text-destructive text-info
```

## Tips & Tricks

1. **Fast Navigation**: Use the navbar to quickly switch between Search and Insights
2. **Keyboard Friendly**: Most actions support keyboard shortcuts
3. **Responsive**: Resize your browser to see mobile/tablet layouts
4. **Dark Mode**: Toggle in the navbar for all pages
5. **Mock Login**: Any email/password combination works

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## Next Steps

1. ✅ Explore all pages
2. ✅ Test responsive design (resize browser)
3. ✅ Try dark mode
4. ✅ Play with the AI assistant
5. ✅ Test filter combinations
6. ✅ Check account settings tabs

## Support

For issues or questions about the UI implementation, refer to:
- `README.md` - Full documentation
- Component source code in `/src/components/`
- Mock data in `/public/mock-data/`

---

**Enjoy exploring the Healthcare DaaS Platform! 🚀**

