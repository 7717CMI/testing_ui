# Saved Searches & Alerts System Guide

## Overview

We've implemented two powerful features to enhance your workflow:
1. **Saved Searches & Lists** - Save search criteria and create custom facility lists
2. **Alerts & Notifications** - Stay informed with real-time alerts about important events

---

## 🔖 Saved Searches & Lists

### Features

#### Saved Searches
- **Save any search criteria** to quickly re-run searches
- **Auto-refresh** option to get the latest results
- **Notifications** when new facilities match your criteria
- **Duplicate** searches to create variations
- **Color coding** for easy organization
- **Results count** tracking

#### Facility Lists
- **Custom lists** to organize facilities you're tracking
- **Add/remove** facilities manually
- **Tags** for categorization
- **Share** lists with team members
- **Export** to CSV or JSON
- **Color coding** for visual organization

### How to Use

#### Saving a Search

1. Go to the **Search** page (`/search`)
2. Set your desired filters (facility type, ownership, location, etc.)
3. Enter a search query if needed
4. Click the **Bookmark** icon (📑) in the top-right
5. Enter a name and optional description
6. Click **Save Search**

**Your search criteria is automatically saved including:**
- Search query
- Facility type filters
- Ownership filters
- Accreditation filters
- Results count

#### Managing Saved Searches

Navigate to **Saved Searches** page (`/saved-searches`) to:

- **View all saved searches** in a grid layout
- **Run a search** - Click "Run Search" to execute it again
- **Edit settings:**
  - Toggle **Auto-refresh** - Automatically updates results
  - Toggle **Notify** - Get alerts when new results are found
- **Duplicate** - Create a copy to modify
- **Delete** - Remove searches you no longer need

#### Creating Facility Lists

1. Go to **Saved Searches** page
2. Click the **Lists** tab
3. Click **Create List**
4. Add facilities from the search page
5. Organize with tags and colors
6. Export or share with team

#### Exporting Data

**From Saved Searches page:**
- Click the **Download** icon on any list
- Choose CSV or JSON format
- File downloads automatically

**Export includes:**
- All facility IDs in the list
- List metadata (name, description, tags)

---

## 🔔 Alerts & Notifications

### Alert Types

We track 8 types of alerts to keep you informed:

| Alert Type | Description | Default Priority |
|------------|-------------|------------------|
| **M&A Activity** | Mergers, acquisitions, ownership changes | High |
| **Facility Changes** | Updates to facility information | Medium |
| **Intent Spikes** | High-intent companies showing buying signals | Critical |
| **New Facilities** | Newly added facilities in your regions | Low |
| **Competitive Moves** | Competitor activity and market changes | High |
| **Data Updates** | Database refreshes and improvements | Low |
| **Saved Search Results** | New results for your saved searches | Medium |
| **System** | Platform updates and announcements | Medium |

### How to Use

#### Viewing Notifications

**In Navigation Bar:**
- Click the **Bell** icon (🔔) in the top-right
- See unread count badge
- Quick view of recent alerts
- Mark as read or delete individual alerts
- Click "Mark All Read" to clear all notifications

**Full Alerts Page:**
Navigate to **Alerts** page (`/alerts`) to:
- View all alerts with full details
- Filter by alert type
- See alert priority and timestamps
- Bulk actions (mark all read, clear all)

#### Managing Alert Preferences

1. Go to **Alerts** page (`/alerts`)
2. Click the **Settings** tab
3. Configure each alert type:
   - **Enable/Disable** - Turn alerts on or off
   - **Email notifications** - Receive emails
   - **Push notifications** - Browser/mobile push
   - **Minimum priority** - Only get alerts above a certain priority

**Global Settings:**
- **Master switch** - Pause all notifications temporarily
- Useful when you're on vacation or in a meeting

#### Priority Levels

- **Low** (Gray) - Informational, no urgent action needed
- **Medium** (Blue) - Worth reviewing when convenient
- **High** (Orange) - Important, review soon
- **Critical** (Red) - Urgent, action required now

### Real-World Use Cases

#### Sales Team
**Scenario:** Track high-intent companies
- Enable **Intent Spike** alerts (Critical priority)
- Get notified when companies show 85+ intent score
- Reach out immediately while they're actively researching

**Scenario:** Monitor saved searches
- Save search for "Hospital Systems in California"
- Enable **Notify on new results**
- Get alerted when new hospitals match your criteria

#### Marketing Team
**Scenario:** Track M&A activity
- Enable **M&A Activity** alerts (High priority)
- Get notified of mergers and acquisitions
- Adjust campaigns based on ownership changes

**Scenario:** Competitive intelligence
- Enable **Competitive Moves** alerts
- Track competitor expansions
- Adjust strategy proactively

#### Data Analysts
**Scenario:** Stay updated on data quality
- Enable **Data Updates** alerts (Low priority)
- Know when database is refreshed
- Plan analysis around latest data

---

## 🎯 Best Practices

### Saved Searches

✅ **Do:**
- Use descriptive names: "CA Hospitals 200+ Beds" not "Search 1"
- Add descriptions explaining why you saved the search
- Enable auto-refresh for searches you check daily
- Enable notifications for critical searches only
- Organize with color coding
- Duplicate and modify rather than creating from scratch

❌ **Don't:**
- Save too many searches (keep it manageable)
- Forget to update or delete outdated searches
- Enable notifications for all searches (inbox overload)

### Facility Lists

✅ **Do:**
- Use lists for specific purposes (e.g., "Q1 Targets", "Competitors")
- Add tags for easy categorization
- Export regularly for backup
- Share with team members
- Keep lists updated

❌ **Don't:**
- Create duplicate lists
- Let lists grow too large (split into sub-lists)
- Forget to remove inactive facilities

### Alerts

✅ **Do:**
- Configure alert preferences based on your role
- Check notifications daily
- Mark read after reviewing
- Use priority levels to filter importance
- Enable email for critical alerts only

❌ **Don't:**
- Enable all alert types (noise overload)
- Ignore critical priority alerts
- Forget to clear old notifications
- Keep notifications unread forever

---

## 📊 Data Persistence

### Local Storage
Both Saved Searches and Alerts use **browser local storage** with Zustand persist:
- Data persists across browser sessions
- Survives page refreshes
- Stored locally in your browser
- **Note:** Clearing browser data will reset preferences

### Future: Backend Sync
Coming soon:
- Cloud sync across devices
- Team sharing and collaboration
- Advanced analytics on search patterns
- Email/SMS notification delivery

---

## 🔄 Integration Points

### Current Integrations

1. **Search Page** → Saved Searches
   - Save button in search results
   - One-click save with current filters

2. **Navbar** → Notification Center
   - Real-time unread count
   - Quick access to recent alerts
   - Link to full alerts page

3. **Intent Page** → Intent Spike Alerts
   - Automatic alerts for high-intent scores
   - Link to company profile

4. **Insights Page** → M&A Activity Alerts
   - Alerts for new M&A deals
   - Link to insight details

### API-Ready Architecture

When backend is implemented:
- `POST /api/saved-searches` - Create saved search
- `GET /api/saved-searches` - List user's searches
- `PUT /api/saved-searches/:id` - Update search
- `DELETE /api/saved-searches/:id` - Delete search
- `POST /api/alerts/subscribe` - Subscribe to alerts
- `GET /api/alerts` - Fetch user alerts
- `PUT /api/alerts/:id/read` - Mark as read

---

## 🛠️ Technical Details

### Stores

#### `saved-searches-store.ts`
- **Saved searches** CRUD operations
- **Facility lists** management
- **Export** functionality
- **Zustand** with persist middleware
- Local storage key: `saved-searches-storage`

#### `notifications-store.ts`
- **Alerts** management (add, read, delete)
- **Preferences** per alert type
- **Mock data** generation
- **Zustand** with persist middleware
- Local storage key: `notifications-storage`

### Components

#### `NotificationCenter.tsx`
- Dropdown notification panel
- Unread badge counter
- Quick actions (mark read, delete)
- Links to full alerts page

### Pages

1. **`/saved-searches`** - Full saved searches & lists management
2. **`/alerts`** - Complete alerts dashboard with settings
3. **`/search`** - Integrated save search button

---

## 🚀 Quick Start

### Save Your First Search

1. Go to `/search`
2. Search for "California"
3. Select "Hospital" facility type
4. Click bookmark icon
5. Name it "California Hospitals"
6. Click "Save Search"
7. ✅ Done! Access it anytime from `/saved-searches`

### Configure Your First Alert

1. Go to `/alerts`
2. Click **Settings** tab
3. Find "Intent Spikes"
4. Toggle **Email notifications** ON
5. Set minimum priority to **High**
6. ✅ Done! You'll get emailed for high-intent companies

---

## 📈 Future Enhancements

### Planned Features

- [ ] **Smart Lists** - Auto-populate lists based on criteria
- [ ] **Scheduled Searches** - Run searches on a schedule
- [ ] **Alert Digests** - Daily/weekly email summaries
- [ ] **Advanced Filters** - More granular alert control
- [ ] **Team Workspaces** - Shared searches and lists
- [ ] **Search History** - Track what you've searched
- [ ] **Analytics Dashboard** - Search patterns and insights
- [ ] **Mobile App** - Push notifications on mobile
- [ ] **Slack/Teams Integration** - Alerts in chat
- [ ] **CRM Integration** - Sync lists to Salesforce/HubSpot

---

## 🆘 Troubleshooting

### Saved Search Not Saving

**Problem:** Click "Save Search" but nothing happens

**Solution:**
- Enter a search name (required field)
- Check browser console for errors
- Try refreshing the page
- Clear browser cache if persists

### Notifications Not Showing

**Problem:** Not seeing any alerts

**Solution:**
- Check if global notifications are enabled (`/alerts` → Settings)
- Verify alert type preferences are enabled
- Check minimum priority settings
- Mock data should show 6 sample alerts

### Unread Count Wrong

**Problem:** Unread count doesn't match actual unread alerts

**Solution:**
- Navigate to `/alerts`
- Click "Mark All as Read"
- Refresh the page
- Check browser local storage for corrupted data

### Data Lost After Closing Browser

**Problem:** Saved searches disappeared

**Solution:**
- Check if browser is in incognito/private mode (data doesn't persist)
- Verify browser allows local storage
- Check if "Clear data on exit" is enabled in browser settings
- Export important searches as backup

---

## 💡 Tips & Tricks

### Power User Tips

1. **Keyboard Shortcuts** (coming soon)
   - `Cmd/Ctrl + K` - Quick search
   - `Cmd/Ctrl + S` - Save search
   - `Cmd/Ctrl + B` - View saved searches

2. **Color Organization**
   - Use colors consistently (e.g., red for urgent, blue for research)
   - Group related searches with same color
   - Use in lists to categorize by region/type

3. **Search Naming Convention**
   - Start with location: "CA - Hospitals 200+ Beds"
   - Include key filters: "NY - Private - Accredited"
   - Add date for time-sensitive: "Q1 2025 Targets"

4. **Alert Management**
   - Clear alerts weekly to keep inbox clean
   - Export important alerts as PDF for records
   - Use priority to determine urgency

---

## 📞 Support

For questions or issues:
- Check this guide first
- Review code comments in store files
- Check browser console for errors
- Contact support for backend integration

**Files to Reference:**
- `src/stores/saved-searches-store.ts`
- `src/stores/notifications-store.ts`
- `src/components/shared/notification-center.tsx`
- `src/app/saved-searches/page.tsx`
- `src/app/alerts/page.tsx`

---

**Built with ❤️ for Healthcare Data Intelligence Platform**


