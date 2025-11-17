# 🚀 Quick Start: Firebase Emulators

## Step 1: Start Emulators

Open a **NEW terminal** and run:

```bash
cd C:\Users\vimarsh\Downloads\testing_ui-main\testing_ui-main
firebase emulators:start
```

**Keep this terminal open!** The emulators must stay running.

## Step 2: Initialize Demo Users (First Time Only)

Open **ANOTHER new terminal** and run:

```bash
cd C:\Users\vimarsh\Downloads\testing_ui-main
node scripts/init-emulator-data.js
```

This creates:
- `demo@healthdata.com` / `demo123` (Enterprise)
- `test@healthdata.com` / `test123` (Free)

## Step 3: Restart Your Frontend

Stop your current `npm run dev` (Ctrl+C) and restart it:

```bash
cd C:\Users\vimarsh\Downloads\testing_ui-main\testing_ui-main
npm run dev
```

## Step 4: Check Browser Console

After restarting, open browser console. You should see:
```
✅ Connected to Firebase Auth Emulator (localhost:9099)
✅ Connected to Firebase Firestore Emulator (localhost:8080)
🔥 Firebase Emulators connected! Using localhost (bypasses firewall)
```

## Step 5: Login

Go to http://localhost:3000/login and use:
- Email: `demo@healthdata.com`
- Password: `demo123`

**The network error should be gone!** ✅

---

## Why This Works

- **Emulators run on localhost** → Seqrite doesn't block localhost
- **No internet needed** → Works offline
- **Same Firebase API** → Real authentication, not mock
- **Automatic connection** → App detects development mode

---

## Troubleshooting

**Still getting errors?**
1. Make sure emulators are running (check terminal)
2. Make sure you restarted the frontend after my code changes
3. Check browser console for connection messages
4. Clear browser cache (Ctrl + Shift + Delete)




