#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "⟐ INITIALIZING CHARIOT PROTOCOL…"
sleep 0.5

# Directories
mkdir -p $PREFIX/bin
mkdir -p /data/data/com.termux/files/home/.chariot

echo "⟐ Updating system…"
pkg update -y

echo "⟐ Installing dependencies…"
pkg install -y nodejs git

echo "⟐ Deploying Chariot Engine wrapper…"
cat > $PREFIX/bin/chariot << 'INNER'
#!/data/data/com.termux/files/usr/bin/bash
node /data/data/com.termux/files/home/.chariot/kernel.js
INNER
chmod +x $PREFIX/bin/chariot

echo "⟐ Writing kernel.js (ignition script)…"
cat > /data/data/com.termux/files/home/.chariot/kernel.js << 'INNER'
console.log("⟐ THE CHARIOT ENGINE HAS IGNITED");
console.log("Awaiting command…");
INNER

echo "⟐ Chariot installed!"
echo "Run:   chariot"
