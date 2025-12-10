# THEOS Chariot Repository - Deployment Guide

## 🚀 Production Deployment

### Prerequisites

1. **Environment Setup**
   ```bash
   # Clone repository
   git clone https://github.com/tig08bitties/chariot.git
   cd chariot
   
   # Install dependencies
   npm install --legacy-peer-deps
   ```

2. **Environment Variables**
   ```bash
   # Copy example
   cp .env.example .env
   
   # Edit .env with your production keys
   nano .env
   ```

   **Required Variables:**
   - `XAI_API_KEY` - xAI Grok API key
   - `GITHUB_TOKEN` - GitHub personal access token
   - `THEOS_WEBHOOK_SECRET` - Webhook secret for theos.brave
   - `BRIDGEWORLD_WEBHOOK_SECRET` - Webhook secret for bridgeworld.lol
   - `TENDERLY_API_KEY` - Tenderly API key (optional)
   - `ENS_PRIVATE_KEY` - Private key for ENS updates (optional)

### Deployment Steps

#### Option 1: Automated Deployment Script

```bash
./scripts/deploy-production.sh
```

This script will:
- ✅ Validate environment variables
- ✅ Install dependencies
- ✅ Integrate documents
- ✅ Build TypeScript (if needed)
- ✅ Run tests
- ✅ Create production build

#### Option 2: Manual Deployment

```bash
# 1. Install dependencies
npm install --legacy-peer-deps --production

# 2. Integrate documents
node scripts/integrate-documents.js

# 3. Start server
npm start
```

### Production Configuration

The production configuration is in `config/production.js`. Key settings:

- **Server:** Port 3000, host 0.0.0.0
- **Security:** CORS enabled, rate limiting active
- **Monitoring:** Tenderly and Blockscout enabled
- **Webhooks:** Signature verification enabled

### Monitoring

1. **Health Check**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Webhook Status**
   ```bash
   curl http://localhost:3000/webhook/status
   ```

3. **Logs**
   ```bash
   # View logs
   tail -f logs/theos.log
   ```

### Scaling

For production scaling:

1. **Process Manager (PM2)**
   ```bash
   npm install -g pm2
   pm2 start webhook-server.js --name theos-chariot
   pm2 save
   pm2 startup
   ```

2. **Docker** (coming soon)
   ```bash
   docker build -t theos-chariot .
   docker run -d -p 3000:3000 --env-file .env theos-chariot
   ```

3. **Kubernetes** (coming soon)

---

## 🔧 Development Setup

### Local Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Set up development environment
cp .env.example .env
# Edit .env with development keys

# Run integration
node scripts/integrate-documents.js

# Start development server
npm run dev  # or node webhook-server.js
```

### Development Configuration

Development config is in `config/development.js`:
- Port 3001 (to avoid conflicts)
- Debug logging enabled
- Signature verification disabled
- Rate limiting disabled

---

## 📚 Integration Examples

### Example 1: Query Oracle via Grok

```bash
node examples/grok-oracle-query.js
```

### Example 2: Monitor Safe Wallet

```bash
node examples/grok-safe-monitor.js
```

### Example 3: Complete Workflow

```bash
node examples/complete-workflow.js
```

---

## 🔐 Security Checklist

- [ ] All API keys in `.env` (not committed)
- [ ] `.env` in `.gitignore`
- [ ] Webhook secrets configured
- [ ] CORS origins restricted (production)
- [ ] Rate limiting enabled (production)
- [ ] HTTPS enabled (production)
- [ ] Firewall rules configured
- [ ] Monitoring alerts set up

---

## 🐛 Troubleshooting

### Common Issues

1. **"XAI_API_KEY not found"**
   - Check `.env` file exists
   - Verify `XAI_API_KEY` is set
   - Restart server after adding key

2. **"Webhook signature verification failed"**
   - Check webhook secret matches
   - Verify request headers
   - Check timestamp (must be recent)

3. **"Dependencies installation failed"**
   - Use `--legacy-peer-deps` flag
   - Check Node.js version (20+)
   - Clear npm cache: `npm cache clean --force`

---

## 📞 Support

For issues or questions:
- Check `INTEGRATION_STATUS.md` for current state
- Review `NEXT_STEPS.md` for guidance
- Check GitHub Issues: https://github.com/tig08bitties/chariot/issues

---

**Status:** ✅ Ready for Production Deployment
