# ERC1967 Proxy Contract Analyzer Guide

## 🎯 Purpose

Analyze ERC1967 Transparent Upgradeable Proxy contracts to extract:
- Implementation contract address
- Admin address
- Contract verification status
- Storage slot mappings

---

## 📋 Quick Start

### Basic Usage

```bash
# Analyze a proxy on Arbitrum
node scripts/analyze-proxy.js 0xYourProxyAddress arbitrum

# Analyze a proxy on Ethereum
node scripts/analyze-proxy.js 0xYourProxyAddress ethereum

# Get JSON output
JSON_OUTPUT=true node scripts/analyze-proxy.js 0xYourProxyAddress arbitrum
```

---

## 🔍 What It Analyzes

### 1. Proxy Contract
- Address and code verification
- Code size
- Blockscout link

### 2. Implementation Contract
- Address extracted from storage slot `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc`
- Code verification status
- Contract name (if verified)

### 3. Admin Address
- Extracted from storage slot `0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d61`
- Zero address check

### 4. Storage Slots
- ERC1967 standard storage slot mappings

---

## 📊 Example Output

```
═══════════════════════════════════════════════════════════════════════
║ 📊 PROXY CONTRACT ANALYSIS ║
═══════════════════════════════════════════════════════════════════════

🔷 PROXY CONTRACT
────────────────────────────────────────────────────────────────────────
  Address: 0x1234...
  Type: ERC1967 Transparent Upgradeable Proxy
  Has Code: ✅ Yes
  Code Size: 1234 bytes
  Blockscout: https://arbitrum.blockscout.com/address/0x1234...

🔷 IMPLEMENTATION CONTRACT
────────────────────────────────────────────────────────────────────────
  Address: 0x5678...
  Has Code: ✅ Yes
  Code Size: 5678 bytes
  Blockscout: https://arbitrum.blockscout.com/address/0x5678...
  Name: MyContract
  Is Verified: ✅ Yes

🔷 ADMIN
────────────────────────────────────────────────────────────────────────
  Address: 0x9abc...
  Is Zero Address: ✅ No
  Blockscout: https://arbitrum.blockscout.com/address/0x9abc...

🔷 STORAGE SLOTS
────────────────────────────────────────────────────────────────────────
  Implementation Slot: 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc
  Admin Slot: 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d61
```

---

## 🔧 Programmatic Usage

```javascript
const { ethers } = require('ethers');
const { ProxyContractAnalyzer } = require('./lib/contracts/analyze-proxy-contract');

const provider = new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
const analyzer = new ProxyContractAnalyzer(provider, 'arbitrum');

const analysis = await analyzer.analyze('0xYourProxyAddress');
console.log(analysis);

// Access specific fields
console.log('Implementation:', analysis.implementation.address);
console.log('Admin:', analysis.admin.address);
```

---

## 🛠️ Integration with Other Tools

### Combine with Tenderly Simulation

```javascript
const { ProxyContractAnalyzer } = require('./lib/contracts/analyze-proxy-contract');
const { TenderlyClient } = require('./lib/tenderly/tenderly-client');

// Analyze proxy
const analyzer = new ProxyContractAnalyzer(provider, 'arbitrum');
const analysis = await analyzer.analyze(proxyAddress);

// Simulate upgrade transaction
const tenderly = new TenderlyClient(apiKey, account, project);
const simulation = await tenderly.simulateTransaction({
  network_id: '42161',
  from: analysis.admin.address,
  to: proxyAddress,
  input: upgradeCalldata,
  // Gas prices auto-detected
});
```

### Combine with Blockscout

```javascript
const { BlockscoutClient } = require('./lib/contracts/blockscout-client');
const { ProxyContractAnalyzer } = require('./lib/contracts/analyze-proxy-contract');

const blockscout = new BlockscoutClient('arbitrum');
const analyzer = new ProxyContractAnalyzer(provider, 'arbitrum');

const analysis = await analyzer.analyze(proxyAddress);

// Get implementation source code
const sourceCode = await blockscout.getContractSourceCode(analysis.implementation.address);
```

---

## ⚠️ Common Issues

### 1. "Invalid address"
- Ensure address is checksummed or lowercase
- Verify address is on the correct network

### 2. "Contract not found"
- Contract may not be a proxy
- Storage slots may be empty (uninitialized proxy)

### 3. "RPC connection failed"
- Check RPC URL in environment variables
- Verify network connectivity

---

## 📝 ERC1967 Storage Slots Reference

| Purpose | Storage Slot | Value |
|---------|-------------|-------|
| Implementation | `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc` | Implementation address |
| Admin | `0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d61` | Admin address |
| Beacon | `0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50` | Beacon address (if using beacon proxy) |

---

## 🔗 Related Tools

- **Blockscout Client**: `lib/contracts/blockscout-client.js`
- **Tenderly Client**: `lib/tenderly/tenderly-client.js`
- **Safe Client**: `lib/safe/safe-client.js`

---

## ✅ Status

**Ready to use!** Provide a proxy contract address to analyze.
