# 🔍 WHERE TO FIND "View News Timeline" BUTTON - Step by Step

## ⚠️ IMPORTANT: Servers Must Be Running

Your servers are now running. You should see:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

---

## 📍 **STEP-BY-STEP GUIDE TO FIND THE BUTTON**

### Step 1: Open Data Catalog
1. Open your browser
2. Go to: **http://localhost:3000**
3. Click on **"Data Catalog"** in the navigation bar

### Step 2: Choose a Category
You'll see cards like:
- 🏥 Hospital
- 🏪 Clinic
- 🏢 Agency
- etc.

**Click on any category** (e.g., "Hospital")

### Step 3: Choose a Facility Type
You'll see a list of facility types like:
- General Hospital
- Children's Hospital
- Psychiatric Hospital
- etc.

**Click on any facility type**

### Step 4: View the Facility List
You'll now see a list of facilities with cards showing:
- Facility name
- Location
- Phone number
- NPI number

### Step 5: Open Facility Detail Modal
**Click on ANY facility card**

A modal (popup) will open showing detailed information about the facility.

### Step 6: FIND THE BUTTON! ✨
**Look at the TOP of the modal**, right after the facility name and type.

You should see a button that looks like this:
```
┌─────────────────────────────────────────┐
│  📰 View News Timeline (Past Year)      │
└─────────────────────────────────────────┘
```

The button has:
- A newspaper icon (📰)
- Blue border
- Text: "View News Timeline (Past Year)"

### Step 7: Click the Button
When you click it, a NEW TAB will open with:
- The entity-specific news timeline
- Time range selector (3M / 6M / 1Y)
- List of real news articles
- OR "No news found" if no articles exist

---

## 🎯 **VISUAL LOCATION**

The button appears in this order:

```
╔════════════════════════════════════════════════╗
║  FACILITY DETAIL MODAL                         ║
╠════════════════════════════════════════════════╣
║  [Icon] Facility Name                          ║
║  ✓ Active   NPI: 1234567890                   ║
║  General Hospital                               ║
║                                                 ║
║  ┌──────────────────────────────────────┐     ║ <-- BUTTON IS HERE!
║  │ 📰 View News Timeline (Past Year)    │     ║
║  └──────────────────────────────────────┘     ║
║                                                 ║
║  Business Location                              ║
║  [rest of the details...]                      ║
╚════════════════════════════════════════════════╝
```

---

## 🔍 **IF YOU STILL DON'T SEE IT**

### Check 1: Are the servers running?
Open a terminal and run:
```powershell
Get-Process -Name node | Select-Object ProcessName, Id
```

You should see multiple node processes. If not, restart:
```powershell
npm run dev
```

### Check 2: Clear Browser Cache
1. Press **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)
2. This forces a hard refresh

### Check 3: Check Browser Console
1. Press **F12** to open Developer Tools
2. Click on "Console" tab
3. Look for any red errors
4. Take a screenshot and share if you see errors

### Check 4: Try Direct URL
Instead of clicking the button, try going directly to:
```
http://localhost:3000/entity-news?name=Mayo%20Clinic&type=general-hospital&location=Rochester,%20MN
```

This should show you the news timeline page directly.

---

## 🎬 **QUICK TEST VIDEO PATH**

1. http://localhost:3000
2. Click "Data Catalog"
3. Click "Hospital"  
4. Click "General Hospital"
5. Click on first facility card
6. **LOOK FOR THE BLUE BUTTON WITH NEWSPAPER ICON**
7. Click it
8. New tab opens with news!

---

## 📸 **WHAT TO DO IF IT'S STILL NOT VISIBLE**

Take screenshots of:
1. The Data Catalog page showing facilities
2. The facility detail modal (popup) when you click a facility
3. The browser console (F12)

Then I can help debug the specific issue!

---

## ✅ **ALTERNATIVE: Test the News Page Directly**

If you want to see the news timeline page working without finding the button:

1. Go to: **http://localhost:3000/entity-news?name=Mayo%20Clinic&type=hospital&location=Rochester,%20MN**

2. You should see:
   - Time range selector (3M / 6M / 1Y)
   - Either news articles OR "No news found"
   - Category filters
   - Refresh button

This proves the feature is working, even if the button isn't visible yet.

---

## 🚨 **COMMON ISSUES**

### Issue 1: "Page not found" Error
- Solution: Make sure you ran `npm run dev` in the correct directory
- The servers need to be fully restarted after adding new pages

### Issue 2: Button Not Showing
- Solution: Hard refresh (Ctrl + Shift + R)
- Clear browser cache
- Check if you're in the facility detail modal (popup)

### Issue 3: "API key not configured"
- This is OK for testing! The page will still load
- It will show "No news found" but the UI works
- Your API key is already set, so this shouldn't happen

---

**Try these steps and let me know what you see!** 📸

If the button still doesn't appear, please share:
1. What URL you're on
2. What you see on screen (screenshot if possible)
3. Any error messages in the browser console (F12)

