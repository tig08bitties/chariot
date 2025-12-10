# Production Deployment Guide
**THEOS Chariot Repository**

---

## 🚀 Deployment Options

### Option 1: PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start webhook-server.js --name theos-chariot

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Option 2: Docker

```bash
# Build image
docker build -t theos-chariot .

# Run container
docker run -d \
  --name theos-chariot \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  theos-chariot
```

### Option 3: Systemd Service

```bash
# Copy service file
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

### Option 4: Manual

```bash
# Run directly
node webhook-server.js

# Or with forever
npm install -g forever
forever start webhook-server.js
```

---

## 📋 Pre-Deployment Checklist

- [ ] `.env` file configured with all API keys
- [ ] Dependencies installed (`npm install --legacy-peer-deps`)
- [ ] Documents integrated (`node scripts/integrate-documents.js`)
- [ ] Stellar SDK initialized
- [ ] Health check endpoint tested
- [ ] Webhook endpoints verified
- [ ] Logging configured
- [ ] Monitoring set up

---

## 🔧 Environment Variables

Required environment variables (see `.env.example`):

```bash
# xAI Grok API
XAI_API_KEY=your-xai-api-key

# GitHub
GITHUB_TOKEN=your_github_token

# Webhook Secrets
THEOS_WEBHOOK_SECRET=your-secret
BRIDGEWORLD_WEBHOOK_SECRET=your-secret

# Ethereum/ENS
ETH_RPC_URL=https://eth.llamarpc.com
ENS_DOMAIN=tig08bitties.uni.eth

# Stellar (optional)
STELLAR_NETWORK=testnet
STELLAR_SECRET_KEY=your-stellar-secret
```

---

## 🧪 Testing Deployment

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test webhook endpoint
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: ping" \
  -d '{"zen":"Keep it logically awesome."}'
```

---

## 📊 Monitoring

### PM2 Monitoring

```bash
# View logs
pm2 logs theos-chariot

# Monitor
pm2 monit

# Status
pm2 status
```

### Docker Monitoring

```bash
# View logs
docker logs theos-chariot

# Follow logs
docker logs -f theos-chariot

# Stats
docker stats theos-chariot
```

### Systemd Monitoring

```bash
# View logs
sudo journalctl -u theos-chariot -f

# Status
sudo systemctl status theos-chariot
```

---

## 🔄 Updates

### PM2

```bash
# Restart
pm2 restart theos-chariot

# Reload (zero-downtime)
pm2 reload theos-chariot
```

### Docker

```bash
# Rebuild and restart
docker-compose up -d --build

# Or manually
docker stop theos-chariot
docker rm theos-chariot
docker build -t theos-chariot .
docker run -d --name theos-chariot -p 3000:3000 --env-file .env theos-chariot
```

### Systemd

```bash
# Restart
sudo systemctl restart theos-chariot

# Reload (if service file changed)
sudo systemctl daemon-reload
sudo systemctl restart theos-chariot
```

---

## 🛡️ Security

1. **Never commit `.env` file**
2. **Use strong webhook secrets**
3. **Enable HTTPS in production**
4. **Set up firewall rules**
5. **Regular security updates**
6. **Monitor for suspicious activity**

---

## 📝 Production Checklist

- [ ] All environment variables set
- [ ] API keys secured
- [ ] Health checks working
- [ ] Logging configured
- [ ] Monitoring enabled
- [ ] Backup strategy in place
- [ ] SSL/TLS configured
- [ ] Firewall rules set
- [ ] Documentation updated

---

**Ready for production deployment!** 🚀
