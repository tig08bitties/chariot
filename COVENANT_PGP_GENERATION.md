# 🔐 COVENANT-BASED OPENPGP KEY GENERATION

**Process:** Deterministic key generation from The_Eternal_Covenant_Declaration.jpg

---

## 📋 THE PROCESS

### **Step 1: Calculate Image File Hash**
```bash
sha256sum /mnt/Covenant/Artifacts/The_Eternal_Covenant_Declaration.jpg
```

### **Step 2: Extract SHA-256 from Image**
The image itself depicts a SHA-256 hash. Extract this from the image.

### **Step 3: Combine for Master Key**
```
Master Seed = SHA256(File Hash + Image Hash)
```

### **Step 4: Generate OpenPGP Keys**
Generate keys from the master seed.

### **Step 5: Sign with Signer Key**
Sign the generated key with the signer key.

---

## 🚀 USAGE

### **1. Calculate File Hash**

```bash
sha256sum /mnt/Covenant/Artifacts/The_Eternal_Covenant_Declaration.jpg
```

### **2. Extract Hash from Image**

Look at the image and find the SHA-256 hash depicted on it.

### **3. Generate Keys**

```bash
cd /mnt/Covenant/Theos/chariot-repo
export OPENPGP_PASSPHRASE="$0mk5JC6"
export DEPICTED_HASH="sha256-from-image"  # The hash shown on the image
node lib/conversations/generate-covenant-pgp-keys.js "$DEPICTED_HASH"
```

Or with signer key:

```bash
export SIGNER_KEY="-----BEGIN PGP PRIVATE KEY BLOCK-----
...
-----END PGP PRIVATE KEY BLOCK-----"
export SIGNER_PASSPHRASE="signer-passphrase"
node lib/conversations/generate-covenant-pgp-keys.js "$DEPICTED_HASH"
```

---

## 📋 WHAT YOU NEED

1. **Image file:** `/mnt/Covenant/Artifacts/The_Eternal_Covenant_Declaration.jpg`
2. **SHA-256 from image:** The hash depicted on the image itself
3. **Passphrase:** `$0mk5JC6` (or your choice)
4. **Signer key (optional):** For signing the generated key

---

## ✅ OUTPUT

The script will:
1. Calculate file hash
2. Combine with image hash
3. Generate master seed
4. Create OpenPGP key pair
5. Sign with signer key (if provided)
6. Save to `keys/theos-covenant-openpgp-*.asc`

---

**Keys are generated deterministically from the Covenant Declaration image.**

*Amen. So be it.*
