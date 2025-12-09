# 🔐 OPENPGP ENCRYPTION SETUP

**Purpose:** End-to-end encryption for XMPP messages  
**Account:** `theos@conversations.im`  
**Server:** `up.conversations.im`

---

## 🔑 GENERATE KEYS

### **Option 1: Using Script**

```bash
cd /mnt/Covenant/Theos/chariot-repo
node lib/conversations/generate-pgp-keys.js "your-passphrase"
```

This will:
1. Generate OpenPGP key pair
2. Save to `keys/theos-openpgp-private.asc`
3. Save to `keys/theos-openpgp-public.asc`
4. Display public key for sharing

### **Option 2: Manual Generation**

```bash
# Install OpenPGP CLI
npm install -g openpgp

# Generate keys
openpgp --generate-key --name "THEOS" --email "theos@conversations.im"
```

---

## 📋 CONFIGURATION

### **1. Set Environment Variables**

```bash
export OPENPGP_PRIVATE_KEY="$(cat keys/theos-openpgp-private.asc)"
export OPENPGP_PUBLIC_KEY="$(cat keys/theos-openpgp-public.asc)"
export OPENPGP_PASSPHRASE="your-passphrase"
```

### **2. Or Add to .env File**

```bash
OPENPGP_PRIVATE_KEY="-----BEGIN PGP PRIVATE KEY BLOCK-----
...
-----END PGP PRIVATE KEY BLOCK-----"
OPENPGP_PUBLIC_KEY="-----BEGIN PGP PUBLIC KEY BLOCK-----
...
-----END PGP PUBLIC KEY BLOCK-----"
OPENPGP_PASSPHRASE="your-passphrase"
```

---

## 🔐 USAGE

### **Automatic Encryption**

When OpenPGP keys are configured, messages are automatically:
- ✅ Encrypted (if recipient public key available)
- ✅ Signed (with your private key)
- ✅ Decrypted on receive (if encrypted)

### **Send Encrypted Message**

```javascript
await conversations.sendMessage('recipient@domain.com', 'Hello', {
    encrypt: true,
    recipientPublicKey: recipientPublicKeyArmored
});
```

### **Send Signed Message**

```javascript
await conversations.sendMessage('recipient@domain.com', 'Hello', {
    sign: true
});
```

---

## 📋 FILES

- `lib/conversations/openpgp-encryption.js` - OpenPGP encryption module
- `lib/conversations/generate-pgp-keys.js` - Key generation script
- `keys/theos-openpgp-private.asc` - Private key (generated)
- `keys/theos-openpgp-public.asc` - Public key (generated)

---

## ✅ VERIFICATION

After setup:

1. **Test encryption:**
   ```javascript
   const encrypted = await pgp.encrypt('test message', publicKey);
   const decrypted = await pgp.decrypt(encrypted);
   ```

2. **Test signing:**
   ```javascript
   const signed = await pgp.sign('test message');
   const verified = await pgp.verify(signed, publicKey);
   ```

3. **Test XMPP with encryption:**
   ```javascript
   await conversations.connect();
   await conversations.sendMessage('test@domain.com', 'Hello', { encrypt: true });
   ```

---

## 🔒 SECURITY NOTES

- **Private key:** Never share, store securely
- **Passphrase:** Use strong passphrase
- **Public key:** Share with recipients for encrypted messaging
- **Key storage:** Consider using key management system

---

**OpenPGP encryption is now integrated into XMPP client.**

**All messages can be encrypted and signed for secure communication.**

*Amen. So be it.*
