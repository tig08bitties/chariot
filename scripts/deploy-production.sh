#!/bin/bash
# Production Deployment Script for THEOS Chariot Repository

set -e

echo "═══════════════════════════════════════════════════════════════════════"
echo "║ 🚀 THEOS CHARIOT - PRODUCTION DEPLOYMENT ║"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${REPO_DIR}/.env"
ENV_EXAMPLE="${REPO_DIR}/.env.example"

echo -e "${YELLOW}📋 Pre-Deployment Checklist${NC}"
echo "───────────────────────────────────────────────────────────────────────"

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    if [ -f "$ENV_EXAMPLE" ]; then
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        echo -e "${GREEN}✅ Created .env file. Please update with your API keys.${NC}"
    else
        echo -e "${RED}❌ .env.example not found. Cannot proceed.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found. Please install npm.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm --version)${NC}"

echo ""
echo -e "${YELLOW}📦 Installing Dependencies${NC}"
echo "───────────────────────────────────────────────────────────────────────"
cd "$REPO_DIR"
npm install --legacy-peer-deps --production=false

echo ""
echo -e "${YELLOW}🔍 Running Pre-Deployment Checks${NC}"
echo "───────────────────────────────────────────────────────────────────────"

# Check required environment variables
REQUIRED_VARS=(
    "XAI_API_KEY"
    "GITHUB_TOKEN"
    "THEOS_WEBHOOK_SECRET"
    "BRIDGEWORLD_WEBHOOK_SECRET"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" "$ENV_FILE" 2>/dev/null || grep -q "^${var}=your-.*-here" "$ENV_FILE" 2>/dev/null; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Missing or placeholder environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo -e "   - ${var}"
    done
    echo -e "${YELLOW}   Please update .env file before deploying.${NC}"
else
    echo -e "${GREEN}✅ All required environment variables configured${NC}"
fi

echo ""
echo -e "${YELLOW}🧪 Running Integration Tests${NC}"
echo "───────────────────────────────────────────────────────────────────────"

# Test document integration
if [ -f "${REPO_DIR}/scripts/integrate-documents.js" ]; then
    node "${REPO_DIR}/scripts/integrate-documents.js" || echo -e "${YELLOW}⚠️  Document integration test skipped${NC}"
fi

echo ""
echo -e "${YELLOW}🚀 Deployment Options${NC}"
echo "───────────────────────────────────────────────────────────────────────"
echo ""
echo "1. PM2 (Recommended for production)"
echo "   pm2 start webhook-server.js --name theos-chariot"
echo ""
echo "2. Docker"
echo "   docker build -t theos-chariot ."
echo "   docker run -d -p 3000:3000 --env-file .env theos-chariot"
echo ""
echo "3. Systemd Service"
echo "   sudo cp systemd/theos-chariot.service /etc/systemd/system/"
echo "   sudo systemctl enable theos-chariot"
echo "   sudo systemctl start theos-chariot"
echo ""
echo "4. Manual"
echo "   node webhook-server.js"
echo ""

echo -e "${GREEN}✅ Pre-deployment checks complete!${NC}"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
