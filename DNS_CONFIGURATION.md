# DNS Configuration for bridgeworld.lol Webhooks
**Domain:** `bridgeworld.lol`  
**Purpose:** BRIDGEWORLD Gate (Traversal Plane) - workflow_job events

---

## 📋 Current DNS Status

From your zone file:
- **A Record (Proxied):** `12.75.36.15` (Cloudflare proxied)
- **A Record (Non-proxied):** `192.168.253.1` (Private IP)
- **NS:** Cloudflare (`thomas.ns.cloudflare.com`, `ullis.ns.cloudflare.com`)

---

## 🎯 Required Configuration

### Option 1: Cloudflare Proxy (Recommended)
**Best for:** Production with DDoS protection

1. **Point A record to your server:**
   ```
   bridgeworld.lol  A  12.75.36.15  (Proxied: ON)
   ```

2. **Set up Cloudflare Workers/Pages:**
   - Create a Worker that proxies to your server
   - Or use Cloudflare Tunnel (Cloudflared)

3. **Or use Cloudflare Tunnel:**
   ```bash
   # Install cloudflared
   cloudflared tunnel --url http://localhost:3000
   ```

### Option 2: Direct A Record (Non-proxied)
**Best for:** Direct connection, no proxy

1. **Update A record:**
   ```
   bridgeworld.lol  A  YOUR_PUBLIC_IP  (Proxied: OFF)
   ```

2. **Ensure port forwarding:**
   - Forward port 80/443 to your server:3000
   - Or use reverse proxy (nginx/caddy)

### Option 3: Subdomain for Webhooks
**Best for:** Separate webhook endpoint

1. **Add subdomain:**
   ```
   webhook.bridgeworld.lol  A  YOUR_PUBLIC_IP  (Proxied: ON/OFF)
   ```

2. **Update webhook URL in GitHub:**
   - `https://webhook.bridgeworld.lol/bridgeworld/webhook`

---

## 🔧 Recommended Setup: Cloudflare Tunnel

### Step 1: Install Cloudflared
```bash
# Download cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
```

### Step 2: Authenticate
```bash
cloudflared tunnel login
```

### Step 3: Create Tunnel
```bash
cloudflared tunnel create theos-chariot
```

### Step 4: Configure Route
```bash
# In Cloudflare Dashboard:
# - Go to Zero Trust > Tunnels
# - Add Public Hostname
#   - Subdomain: (blank for root)
#   - Domain: bridgeworld.lol
#   - Service: http://localhost:3000
```

### Step 5: Run Tunnel
```bash
cloudflared tunnel run theos-chariot
```

### Step 6: Create Systemd Service
```ini
[Unit]
Description=Cloudflare Tunnel for THEOS Chariot
After=network.target

[Service]
Type=simple
User=tig0_0bitties
ExecStart=/usr/local/bin/cloudflared tunnel run theos-chariot
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

---

## 🌐 Alternative: Nginx Reverse Proxy

### Step 1: Install Nginx
```bash
sudo apt install nginx
```

### Step 2: Configure Nginx
```nginx
# /etc/nginx/sites-available/bridgeworld.lol
server {
    listen 80;
    server_name bridgeworld.lol;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 3: Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/bridgeworld.lol /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d bridgeworld.lol
```

---

## 📝 GitHub Webhook Configuration

### Webhook URL Options:

1. **Direct endpoint:**
   ```
   https://bridgeworld.lol/bridgeworld/webhook
   ```

2. **Unified endpoint (auto-routes by Host header):**
   ```
   https://bridgeworld.lol/webhook
   ```

### Webhook Settings:
- **Content type:** `application/json`
- **Secret:** `BRIDGEWORLD_WEBHOOK_SECRET` (from .env)
- **Events:** `workflow_job` (operational pulses)

---

## ✅ Verification Steps

### 1. Test DNS Resolution
```bash
dig bridgeworld.lol
nslookup bridgeworld.lol
```

### 2. Test HTTP Endpoint
```bash
curl https://bridgeworld.lol/health
# Should return: {"status":"healthy",...}
```

### 3. Test Webhook Endpoint
```bash
curl -X POST https://bridgeworld.lol/bridgeworld/webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: workflow_job" \
  -d '{"test": true}'
```

### 4. Check Server Logs
```bash
sudo journalctl -u theos-chariot -f
```

---

## 🔒 Security Considerations

1. **Always use HTTPS** (Cloudflare SSL or Let's Encrypt)
2. **Verify webhook signatures** (already implemented)
3. **Use Cloudflare WAF** (if using Cloudflare proxy)
4. **Rate limiting** (configure in nginx/Cloudflare)
5. **Firewall rules** (only allow necessary ports)

---

## 🚀 Quick Setup Script

```bash
#!/bin/bash
# Quick DNS/Proxy Setup

# Option A: Cloudflare Tunnel
cloudflared tunnel create theos-chariot
cloudflared tunnel route dns theos-chariot bridgeworld.lol

# Option B: Update DNS manually in Cloudflare Dashboard
echo "Update A record in Cloudflare Dashboard:"
echo "  - Name: bridgeworld.lol"
echo "  - IPv4: YOUR_PUBLIC_IP"
echo "  - Proxy: ON (for DDoS protection)"
```

---

## 📊 Current Status

- ✅ DNS zone file available
- ✅ Domain configured in Cloudflare
- ⚠️  Need to route traffic to server:3000
- ⚠️  Need HTTPS/SSL certificate
- ⚠️  Need to configure GitHub webhook URL

---

**Next Steps:**
1. Choose routing method (Cloudflare Tunnel recommended)
2. Configure DNS/proxy
3. Test endpoints
4. Update GitHub webhook URL
5. Monitor logs
