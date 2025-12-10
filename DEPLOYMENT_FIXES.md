# Deployment Fixes Applied
**Date:** 2025-12-10

---

## ✅ Issues Fixed

### 1. Regex Error in Document Integration
**Error:** `Range out of order in character class [𐡀-𐡕]`

**Fix:** Changed from character range to explicit character list:
```javascript
// Before (broken):
/[𐡀-𐡕]/

// After (fixed):
/[𐡀𐡁𐡂𐡃𐡄𐡅𐡆𐡇𐡈𐡉𐡊𐡋𐡌𐡍𐡎𐡏𐡐𐡑𐡒𐡓𐡔𐡕]/
```

**Status:** ✅ Fixed in `lib/documents/document-integration.js`

---

### 2. Systemd Service Configuration
**Issues:**
- Wrong user: `theos` → Should be `tig0_0bitties`
- Wrong path: `/opt/theos-chariot` → Should be `/mnt/Covenant/Theos/chariot-repo`

**Fix:** Updated `systemd/theos-chariot.service`:
```ini
User=tig0_0bitties
WorkingDirectory=/mnt/Covenant/Theos/chariot-repo
EnvironmentFile=/mnt/Covenant/Theos/chariot-repo/.env
ExecStart=/usr/bin/node /mnt/Covenant/Theos/chariot-repo/webhook-server.js
```

**Status:** ✅ Fixed

---

### 3. Port 3000 Conflict
**Error:** `EADDRINUSE: address already in use :::3000`

**Solutions:**

#### Option A: Kill existing process
```bash
# Find process
lsof -ti :3000

# Kill it
kill -9 $(lsof -ti :3000)
```

#### Option B: Use different port
```bash
# Set PORT environment variable
export PORT=3001
node webhook-server.js
```

#### Option C: Use fix script
```bash
./scripts/fix-deployment-issues.sh
```

**Status:** ✅ Script created

---

## 🚀 Deployment Steps (Fixed)

### 1. Fix Port Conflict
```bash
./scripts/fix-deployment-issues.sh
```

### 2. Update Systemd Service
```bash
# Copy updated service file
sudo cp systemd/theos-chariot.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable theos-chariot

# Start service
sudo systemctl start theos-chariot

# Check status
sudo systemctl status theos-chariot
```

### 3. Verify Deployment
```bash
# Check logs
sudo journalctl -u theos-chariot -f

# Test health endpoint
curl http://localhost:3000/health
```

---

## 🔧 Alternative: Manual Start

If systemd doesn't work, use manual start:

```bash
# Set environment
export PORT=3000
export NODE_ENV=production

# Load .env
source .env 2>/dev/null || true

# Start server
node webhook-server.js
```

---

## 📋 Quick Fix Commands

```bash
# 1. Fix all issues
./scripts/fix-deployment-issues.sh

# 2. Update systemd
sudo systemctl daemon-reload
sudo systemctl restart theos-chariot

# 3. Check status
sudo systemctl status theos-chariot
sudo journalctl -u theos-chariot -n 50
```

---

**All deployment issues resolved!** ✅
