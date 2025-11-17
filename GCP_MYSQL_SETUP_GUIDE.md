# 🔧 GCP Cloud SQL MySQL Setup Guide

## ✅ Configuration Applied

The MySQL connection has been configured for GCP Cloud SQL with:
- ✅ SSL enabled (required for GCP Cloud SQL)
- ✅ Increased timeouts (30 seconds for GCP connections)
- ✅ Better error handling for authentication issues
- ✅ GCP-optimized connection settings

## 🔐 Setting Up MySQL User in GCP Console

### Step 1: Access GCP Cloud SQL
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **SQL** (search "SQL" in top search bar)
3. Click on your **MySQL instance** (IP: `34.63.177.157`)

### Step 2: Create MySQL User
1. Click **Users** in the left sidebar
2. Click **Add user account** (or **+ Add user**)
3. Fill in the form:
   - **Username**: `chat_history_user` (or any name you prefer)
   - **Password**: `Platoon@1` (or your preferred secure password)
   - **Host name**: `%` (allows connection from any IP)
     - Or use your specific IP: `122.170.193.59`
4. Click **Add**

### Step 3: Create Database
1. Click **Databases** in the left sidebar
2. Click **Create database**
3. Database name: `chat_history`
4. Click **Create**

### Step 4: Grant Permissions
1. Go back to **Users**
2. Click the three dots (⋮) next to your user
3. Click **Edit user**
4. Under **Database access**, select `chat_history`
5. Grant **All privileges** (or at minimum: SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER)
6. Click **Update**

### Step 5: Authorize Your IP
1. Click **Connections** in the left sidebar
2. Under **Authorized networks**, click **Add network**
3. Fill in:
   - **Name**: `My Development IP`
   - **Network**: `122.170.193.59/32`
4. Click **Done**, then **Save**

### Step 6: Update Environment Variables
Create/update `.env.local` in your project root:

```env
# GCP Cloud SQL MySQL (for chat history)
MYSQL_HOST=34.63.177.157
MYSQL_PORT=3306
MYSQL_DATABASE=chat_history
MYSQL_USER=chat_history_user
MYSQL_PASSWORD=Platoon@1
MYSQL_USE_SSL=true
```

### Step 7: Restart and Test
1. **Restart your dev server** (important!)
2. Open chat history sidebar
3. Click **"Initialize Database"**
4. Should work now! ✅

---

## 🔍 Troubleshooting

### "Access denied" Error
**Problem**: MySQL user doesn't have permission from your IP

**Solution**:
1. Check user host name is `%` or your IP `122.170.193.59`
2. Verify password matches in `.env.local`
3. Ensure user has privileges on `chat_history` database
4. Check your IP is in Authorized networks

### Connection Timeout
**Problem**: Can't connect to MySQL

**Solution**:
1. Verify MySQL instance is running in GCP Console
2. Check your IP is in Authorized networks
3. Verify firewall allows port 3306
4. Check network connectivity

### SSL Errors
**Problem**: SSL connection issues

**Solution**:
- SSL is now enabled by default for GCP Cloud SQL
- If you need to disable (not recommended), set `MYSQL_USE_SSL=false` in `.env.local`

---

## 📝 Current Configuration

### MySQL Connection Settings
- **Host**: `34.63.177.157` (GCP Cloud SQL)
- **Port**: `3306`
- **Database**: `chat_history`
- **SSL**: Enabled (required for GCP)
- **Timeout**: 30 seconds
- **Connection Pool**: 10 connections

### Features
- ✅ Automatic retry on connection failure
- ✅ SSL support for GCP Cloud SQL
- ✅ Detailed error logging
- ✅ Auto-initialization of database and tables
- ✅ Graceful error handling

---

## 🎯 Quick Reference

### GCP Console Locations
- **Users**: SQL → Your Instance → Users
- **Databases**: SQL → Your Instance → Databases
- **Authorized Networks**: SQL → Your Instance → Connections → Authorized networks
- **Instance Status**: SQL → Your Instance → Overview

### Test Connection
```bash
node test-mysql-connection.js
```

This will test:
1. Connection to MySQL server
2. Database existence
3. Table existence
4. Show detailed error messages

---

## ✅ Checklist

Before testing:
- [ ] MySQL user created in GCP Console
- [ ] User host set to `%` or your IP
- [ ] User has privileges on `chat_history` database
- [ ] Database `chat_history` created
- [ ] Your IP `122.170.193.59` in Authorized networks
- [ ] `.env.local` updated with correct credentials
- [ ] Dev server restarted

After setup:
- [ ] Test connection: `node test-mysql-connection.js`
- [ ] Open chat history sidebar
- [ ] Click "Initialize Database"
- [ ] Should see success message ✅

---

**Status**: ✅ Configuration updated for GCP Cloud SQL MySQL


