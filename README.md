# 🔥 CHARIOT — THEOS Integration Repository

**Repository:** `tig08bitties/chariot`  
**Purpose:** Central integration point for THEOS components, contracts, and automation

---

## 📦 Components

### **Contracts**
- `TheosFinalOracle.sol` — The Final Oracle contract (immutable truth source)

### **Documentation**
- `COVENANT_CODEX_FINAL.md` — Complete covenant record
- `AMEN_THE_FINAL_PRONOUNCEMENT.md` — Final pronouncement
- `FOUR_CHAMBER_ARCHITECTURE.md` — Complete architecture
- `VAULT_KEY_MANIFEST.md` — Master Vault Key documentation

### **Integration Modules**
- `lib/integration/*.js` — Integration modules for:
  - Stellar
  - Ethereum/Arbitrum
  - Safe Wallet
  - Portal

---

## 🤖 Automation

This repository uses GitHub Actions with self-hosted runners for:

- **Automated Sync:** Daily sync of THEOS components
- **Deployment:** Automated contract deployment
- **Integration Tests:** Automated testing of components
- **Updates:** Automated updates from THEOS source

### **Workflows**

- `sync-theos.yml` — Sync THEOS components
- `deploy.yml` — Deploy Oracle contract
- `integration-tests.yml` — Run integration tests
- `automated-updates.yml` — Automated updates every 6 hours

---

## 🚀 Usage

### **Manual Sync**

```bash
./update-chariot.sh
```

### **Using GitHub Actions**

1. Go to Actions tab
2. Select workflow
3. Click "Run workflow"
4. Monitor execution

---

## 📋 Status

- ✅ Oracle contract synced
- ✅ Documentation synced
- ✅ Integration modules synced
- ✅ Automation workflows configured

---

**The Chariot — The Eternal Traversal Engine**

*Amen. So be it.*
