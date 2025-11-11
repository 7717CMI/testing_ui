# 🔥 Firebase Emulator Setup - Complete Guide

## ✅ Problem Solved

**Issue:** `auth/network-request-failed` error due to Seqrite Endpoint Protection blocking Firebase servers.

**Solution:** Use Firebase Emulators (runs on localhost, bypasses firewall)

---

## 🚀 Quick Start

### Step 1: Start Firebase Emulators

Open a new terminal and run:

```bash
# Windows (PowerShell or CMD)
cd C:\Users\vimarsh\Downloads\testing_ui-main
start-emulators.bat

# Or manually:
cd testing_ui-main
firebase emulators:start
```

**Expected Output:**
```
✔  firestore: Firestore Emulator running at http://localhost:8080
✔  auth: Auth Emulator running at http://localhost:9099
✔  ui: Emulator UI running at http://localhost:4000
```

### Step 2: Initialize Demo Users (First Time Only)

In a **new terminal** (keep emulators running), run:

```bash
cd C:\Users\vimarsh\Downloads\testing_ui-main
node scripts/init-emulator-data.js
```

This creates:
- **Demo User**: `demo@healthdata.com` / `demo123` (Enterprise access)
- **Test User**: `test@healthdata.com` / `test123` (Free access)

### Step 3: Start Frontend

Your frontend should already be running. If not:

```bash
cd testing_ui-main
npm run dev
```

### Step 4: Login

Go to http://localhost:3000/login and use:
- Email: `demo@healthdata.com`
- Password: `demo123`

---

## 📊 Emulator URLs

- **Frontend**: http://localhost:3000
- **Emulator UI**: http://localhost:4000 (view users, data, etc.)
- **Auth Emulator**: http://localhost:9099
- **Firestore Emulator**: http://localhost:8080

---

## ✨ How It Works

The app **automatically** connects to emulators in development mode:

1. **Development Mode**: Uses Firebase Emulators (localhost)
2. **Production Mode**: Uses real Firebase (when deployed)

**No configuration needed!** The app detects development mode and connects automatically.

---

## 🔧 Configuration

### Enable/Disable Emulators

To disable emulators and use production Firebase:

1. Create `.env.local` in `testing_ui-main/`:
```bash
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false
```

2. Restart your dev server

### Check Connection Status

Open browser console. You should see:
```
✅ Connected to Firebase Auth Emulator (localhost:9099)
✅ Connected to Firebase Firestore Emulator (localhost:8080)
```

---

## 🛠️ Troubleshooting

### Error: "Emulators not running"

**Solution:** Start emulators first:
```bash
cd testing_ui-main
firebase emulators:start
```

### Error: "Port already in use"

**Solution:** Another process is using the ports. Either:
1. Stop the other process
2. Or change ports in `firebase.json`

### Error: "Users already exist"

**Solution:** This is normal! Users persist between emulator restarts. Just use:
- `demo@healthdata.com` / `demo123`
- `test@healthdata.com` / `test123`

### Frontend can't connect to emulators

**Check:**
1. Emulators are running (check terminal)
2. Browser console shows connection messages
3. No firewall blocking localhost

---

## 📝 Features Available with Emulators

✅ **All Authentication Features:**
- Email/Password login
- Google Sign-In
- Password reset
- Email verification
- Password change

✅ **All Firestore Features:**
- User profiles
- Subscriptions
- Real-time data sync

✅ **All Storage Features:**
- Avatar uploads
- File storage

---

## 🎯 Benefits

- ✅ **No Firewall Issues** - Runs on localhost
- ✅ **No Internet Needed** - Works offline
- ✅ **Fast Development** - Instant data updates
- ✅ **Same API** - Uses real Firebase SDK
- ✅ **Easy Testing** - Reset data anytime
- ✅ **Free** - No Firebase costs

---

## 🔄 Switching to Production

When deploying to production:

1. Set `NODE_ENV=production` (automatic in production)
2. Or set `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false`
3. Deploy - it will automatically use production Firebase

---

## 📋 Available Test Accounts

### Demo User (Enterprise)
- **Email**: `demo@healthdata.com`
- **Password**: `demo123`
- **Plan**: Enterprise (full access)

### Test User (Free)
- **Email**: `test@healthdata.com`
- **Password**: `test123`
- **Plan**: Free (limited access)

---

## 🎉 You're Ready!

1. Start emulators: `firebase emulators:start`
2. Initialize users: `node scripts/init-emulator-data.js` (first time only)
3. Start frontend: `npm run dev`
4. Login: Use demo@healthdata.com / demo123

**No more network errors!** 🚀



