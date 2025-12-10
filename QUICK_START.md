# Quick Start Guide - THEOS Chariot
**Get up and running in 60 seconds**

---

## 🚀 Quick Start

### 1. Fix Deployment Issues
```bash
./scripts/fix-deployment-issues.sh
```

### 2. Configure Environment
```bash
# Copy example
cp .env.example .env

# Edit with your API keys
nano .env  # or use your preferred editor
```

### 3. Start Server

**Option A: Systemd (Recommended)**
```bash
sudo systemctl daemon-reload
sudo systemctl start theos-chariot
sudo systemctl status theos-chariot
```

**Option B: Manual**
```bash
node webhook-server.js
```

**Option C: Different Port**
```bash
PORT=3001 node webhook-server.js
```

---

## ✅ Verify It's Working

```bash
# Health check
curl http://localhost:3000/health

# Should return: {"status":"ok","service":"theos-chariot"}
```

---

## 📊 Check Logs

**Systemd:**
```bash
sudo journalctl -u theos-chariot -f
```

**Manual:**
```bash
# Logs appear in terminal
```

---

## 🔧 Common Issues

### Port Already in Use
```bash
# Kill process on port 3000
kill -9 $(lsof -ti :3000)

# Or use different port
PORT=3001 node webhook-server.js
```

### Systemd Service Fails
```bash
# Check logs
sudo journalctl -u theos-chariot -n 50

# Check service file
cat /etc/systemd/system/theos-chariot.service

# Restart
sudo systemctl restart theos-chariot
```

### Module Not Found
```bash
# Reinstall dependencies
npm install --legacy-peer-deps
```

---

## 🎯 Next Steps

1. **Integrate Documents:**
   ```bash
   node scripts/integrate-documents.js
   ```

2. **Run Complete Integration:**
   ```bash
   node scripts/complete-integration-workflow.js
   ```

3. **Test Webhooks:**
   - Configure GitHub webhooks
   - Test endpoints
   - Monitor logs

---

**Ready to go!** 🚀
