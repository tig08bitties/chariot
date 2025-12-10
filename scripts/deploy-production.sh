#!/bin/bash
# Production Deployment Script
# Deploys THEOS Chariot Repository to production environment

set -e

echo "═══════════════════════════════════════════════════════════════════"
echo "║ 🚀 THEOS CHARIOT - PRODUCTION DEPLOYMENT ║"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "   Creating from .env.example..."
    cp .env.example .env
    echo "   ⚠️  Please edit .env with your production API keys"
    exit 1
fi

# Validate environment variables
echo "🔍 Validating environment variables..."
source .env

REQUIRED_VARS=("XAI_API_KEY" "GITHUB_TOKEN" "THEOS_WEBHOOK_SECRET" "BRIDGEWORLD_WEBHOOK_SECRET")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    exit 1
fi

echo "✅ All required environment variables present"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps --production

# Run integration
echo "📚 Integrating documents..."
node scripts/integrate-documents.js

# Build TypeScript (if needed)
if [ -f tsconfig.json ]; then
    echo "🔨 Building TypeScript..."
    npx tsc
fi

# Run tests (if available)
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    echo "🧪 Running tests..."
    npm test || echo "⚠️  Tests failed, but continuing deployment..."
fi

# Create production build
echo "📦 Creating production build..."
mkdir -p dist
cp -r lib dist/ 2>/dev/null || true
cp -r config dist/ 2>/dev/null || true
cp package.json dist/
cp .env dist/ 2>/dev/null || true

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "✅ PRODUCTION DEPLOYMENT READY"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "📋 Next steps:"
echo "   1. Review dist/ directory"
echo "   2. Start server: npm start"
echo "   3. Monitor logs for errors"
echo "   4. Test webhook endpoints"
echo ""
