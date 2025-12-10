#!/bin/bash
# Fix Deployment Issues Script

set -e

echo "═══════════════════════════════════════════════════════════════════════"
echo "║ 🔧 FIXING DEPLOYMENT ISSUES ║"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

# Check for processes on port 3000
echo "🔍 Checking port 3000..."
PORT_PROCESS=$(lsof -ti :3000 2>/dev/null || echo "")

if [ -n "$PORT_PROCESS" ]; then
    echo "⚠️  Port 3000 is in use by PID: $PORT_PROCESS"
    echo "   Killing process..."
    kill -9 $PORT_PROCESS 2>/dev/null || true
    sleep 2
    echo "✅ Port 3000 cleared"
else
    echo "✅ Port 3000 is available"
fi

# Check systemd service
echo ""
echo "🔍 Checking systemd service..."
if systemctl is-active --quiet theos-chariot 2>/dev/null; then
    echo "⚠️  Service is running, stopping..."
    sudo systemctl stop theos-chariot
fi

# Reload systemd
echo "🔄 Reloading systemd..."
sudo systemctl daemon-reload

# Test the service file
echo ""
echo "🧪 Testing service configuration..."
sudo systemctl status theos-chariot --no-pager || echo "Service not started yet (this is OK)"

echo ""
echo "✅ Deployment issues fixed!"
echo ""
echo "📋 Next steps:"
echo "   1. Update .env file with your API keys"
echo "   2. Start service: sudo systemctl start theos-chariot"
echo "   3. Check status: sudo systemctl status theos-chariot"
echo "   4. View logs: sudo journalctl -u theos-chariot -f"
echo ""
