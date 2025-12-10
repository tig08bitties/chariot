# DNS Setup Summary for bridgeworld.lol

## 📊 Current DNS Configuration

From your zone file:
```
bridgeworld.lol  A  192.168.253.1  (cf-proxied:false)  ← Private IP
bridgeworld.lol  A  12.75.36.15   (cf-proxied:true)   ← Cloudflare IP
```

## 🎯 What You Need

Your webhook server needs to receive GitHub webhooks at:
- `https://bridgeworld.lol/bridgeworld/webhook` (BRIDGEWORLD Gate)
- `https://bridgeworld.lol/webhook` (Unified endpoint)

## ✅ Recommended Solution: Cloudflare Tunnel

**Why:** No port forwarding, automatic SSL, DDoS protection

### Quick Setup:
```bash
# Run the setup script
./scripts/setup-dns-proxy.sh

# Choose option 1 (Cloudflare Tunnel)
# Follow the prompts
```

### Manual Steps:
1. Install cloudflared: `wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64`
2. Authenticate: `cloudflared tunnel login`
3. Create tunnel: `cloudflared tunnel create theos-chariot`
4. In Cloudflare Dashboard → Zero Trust → Tunnels:
   - Add Public Hostname
   - Domain: `bridgeworld.lol`
   - Service: `http://localhost:3000`
5. Run tunnel: `cloudflared tunnel run theos-chariot`

## 🔧 Alternative: Update A Record

If you prefer direct connection:

1. **Get your public IP:**
   ```bash
   curl ifconfig.me
   ```

2. **Update Cloudflare DNS:**
   - Go to Cloudflare Dashboard
   - DNS → Records
   - Edit A record for `bridgeworld.lol`
   - Set IPv4 to your public IP
   - Proxy: OFF (for direct connection)

3. **Set up reverse proxy (nginx):**
   ```bash
   ./scripts/setup-dns-proxy.sh
   # Choose option 2
   ```

4. **Forward ports:**
   - Port 80 → Server:3000
   - Port 443 → Server:3000 (after SSL)

## 📝 GitHub Webhook Configuration

After DNS is configured:

1. Go to: `https://github.com/tig08bitties/chariot/settings/hooks`
2. Add webhook:
   - **Payload URL:** `https://bridgeworld.lol/bridgeworld/webhook`
   - **Content type:** `application/json`
   - **Secret:** `vQSMpXuEy9NrcjDsoQK2RxHxGKTyvCWsqFjzqSnPMck` (from .env)
   - **Events:** `workflow_job`
   - **Active:** ✓

## ✅ Verification

```bash
# 1. Test DNS
dig bridgeworld.lol

# 2. Test health endpoint
curl https://bridgeworld.lol/health

# 3. Test webhook endpoint
curl -X POST https://bridgeworld.lol/bridgeworld/webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: workflow_job" \
  -d '{"test": true}'

# 4. Check server logs
sudo journalctl -u theos-chariot -f
```

## 🚀 Next Steps

1. ✅ **Start webhook server:**
   ```bash
   sudo systemctl start theos-chariot
   ```

2. ✅ **Configure DNS/proxy:**
   ```bash
   ./scripts/setup-dns-proxy.sh
   ```

3. ✅ **Update GitHub webhook URL**

4. ✅ **Test and verify**

---

**Status:** Ready to configure DNS routing
