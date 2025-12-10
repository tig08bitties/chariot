#!/bin/bash
# DNS/Proxy Setup Script for bridgeworld.lol
# Sets up Cloudflare Tunnel or Nginx reverse proxy

set -e

echo "═══════════════════════════════════════════════════════════════════════"
echo "║ 🌐 DNS/PROXY SETUP FOR bridgeworld.lol ║"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

# Detect public IP
PUBLIC_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "UNKNOWN")
echo "📍 Detected Public IP: $PUBLIC_IP"
echo ""

# Choose method
echo "Select setup method:"
echo "  1) Cloudflare Tunnel (Recommended - No port forwarding needed)"
echo "  2) Nginx Reverse Proxy (Requires port forwarding)"
echo "  3) Direct A Record (Update DNS manually)"
echo ""
read -p "Choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo "🔷 Setting up Cloudflare Tunnel..."
        
        # Check if cloudflared is installed
        if ! command -v cloudflared &> /dev/null; then
            echo "📦 Installing cloudflared..."
            ARCH=$(uname -m)
            if [ "$ARCH" = "x86_64" ]; then
                wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /tmp/cloudflared
            elif [ "$ARCH" = "aarch64" ]; then
                wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 -O /tmp/cloudflared
            else
                echo "❌ Unsupported architecture: $ARCH"
                exit 1
            fi
            chmod +x /tmp/cloudflared
            sudo mv /tmp/cloudflared /usr/local/bin/cloudflared
            echo "✅ cloudflared installed"
        fi
        
        echo ""
        echo "🔐 Authenticate with Cloudflare:"
        echo "   (This will open a browser window)"
        cloudflared tunnel login
        
        echo ""
        echo "🏗️  Creating tunnel..."
        cloudflared tunnel create theos-chariot || echo "Tunnel may already exist"
        
        echo ""
        echo "📝 Configure tunnel route in Cloudflare Dashboard:"
        echo "   1. Go to: https://one.dash.cloudflare.com/"
        echo "   2. Zero Trust > Tunnels > theos-chariot"
        echo "   3. Add Public Hostname:"
        echo "      - Subdomain: (blank)"
        echo "      - Domain: bridgeworld.lol"
        echo "      - Service: http://localhost:3000"
        echo ""
        read -p "Press Enter after configuring..."
        
        # Create systemd service
        echo ""
        echo "📋 Creating systemd service..."
        sudo tee /etc/systemd/system/cloudflared-tunnel.service > /dev/null <<EOF
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
EOF
        
        sudo systemctl daemon-reload
        sudo systemctl enable cloudflared-tunnel
        sudo systemctl start cloudflared-tunnel
        
        echo "✅ Cloudflare Tunnel configured!"
        echo "   Status: sudo systemctl status cloudflared-tunnel"
        ;;
        
    2)
        echo ""
        echo "🔷 Setting up Nginx Reverse Proxy..."
        
        # Install nginx
        if ! command -v nginx &> /dev/null; then
            echo "📦 Installing nginx..."
            sudo apt update
            sudo apt install -y nginx
        fi
        
        # Create nginx config
        echo "📝 Creating nginx configuration..."
        sudo tee /etc/nginx/sites-available/bridgeworld.lol > /dev/null <<EOF
server {
    listen 80;
    server_name bridgeworld.lol;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
        
        # Enable site
        sudo ln -sf /etc/nginx/sites-available/bridgeworld.lol /etc/nginx/sites-enabled/
        sudo nginx -t
        sudo systemctl reload nginx
        
        echo ""
        echo "🔒 Setting up SSL with Let's Encrypt..."
        if ! command -v certbot &> /dev/null; then
            sudo apt install -y certbot python3-certbot-nginx
        fi
        
        echo ""
        echo "📋 Run SSL setup:"
        echo "   sudo certbot --nginx -d bridgeworld.lol"
        echo ""
        echo "⚠️  Make sure DNS A record points to: $PUBLIC_IP"
        echo "⚠️  Make sure port 80/443 is forwarded to this server"
        
        echo "✅ Nginx configured!"
        ;;
        
    3)
        echo ""
        echo "📝 Manual DNS Configuration:"
        echo ""
        echo "Update A record in Cloudflare Dashboard:"
        echo "  - Name: bridgeworld.lol"
        echo "  - IPv4: $PUBLIC_IP"
        echo "  - Proxy: OFF (for direct connection)"
        echo ""
        echo "⚠️  Make sure:"
        echo "  1. Port 80/443 is forwarded to this server:3000"
        echo "  2. Firewall allows incoming connections"
        echo "  3. SSL certificate is configured (Let's Encrypt)"
        echo ""
        echo "After DNS update, test with:"
        echo "  curl http://bridgeworld.lol/health"
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Test endpoint: curl https://bridgeworld.lol/health"
echo "  2. Configure GitHub webhook: https://bridgeworld.lol/bridgeworld/webhook"
echo "  3. Monitor logs: sudo journalctl -u theos-chariot -f"
echo ""
