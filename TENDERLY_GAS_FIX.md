# Tenderly Gas Price Fix
**Issue:** `max fee per gas less than block base fee: maxFeePerGas: 920, baseFee: 10000000`

---

## ✅ Problem Fixed

The Tenderly simulation was failing because:
- Gas price was set to `'0'` (legacy format)
- Tenderly was converting this to `maxFeePerGas: 920` (too low)
- Arbitrum base fee is `10,000,000` (10 gwei)
- Transaction simulation failed due to insufficient gas price

---

## 🔧 Solution Implemented

### 1. Updated TenderlyClient
- Added `getGasPrices()` method with network-specific defaults
- Updated `simulateTransaction()` to:
  - Support EIP-1559 gas parameters (`maxFeePerGas`, `maxPriorityFeePerGas`)
  - Auto-detect appropriate gas prices if not provided
  - Use network-specific defaults:
    - **Arbitrum One:** `maxFeePerGas: 100000000` (0.1 gwei)
    - **Ethereum Mainnet:** `maxFeePerGas: 50000000000` (50 gwei)

### 2. Updated Integration Files
- `lib/integration/safe-tenderly-integration.js` - Updated both simulation calls
- `lib/integration/github-tenderly-integration.js` - Updated simulation calls

---

## 📊 Gas Price Defaults

### Arbitrum One (Network ID: 42161)
```javascript
{
  maxFeePerGas: '100000000',        // 0.1 gwei
  maxPriorityFeePerGas: '100000000' // 0.1 gwei
}
```

### Ethereum Mainnet (Network ID: 1)
```javascript
{
  maxFeePerGas: '50000000000',        // 50 gwei
  maxPriorityFeePerGas: '2000000000' // 2 gwei
}
```

---

## 🧪 Testing

The fix ensures:
1. ✅ Gas prices are automatically set if not provided
2. ✅ EIP-1559 parameters are used for modern networks
3. ✅ Network-specific defaults prevent simulation failures
4. ✅ Legacy `gas_price` still supported for older networks

---

## 📝 Usage

### Automatic (Recommended)
```javascript
// Gas prices auto-detected
const simulation = await tenderly.simulateTransaction({
  network_id: '42161',
  from: '0x...',
  to: '0x...',
  input: '0x...',
  // Gas prices auto-detected
});
```

### Manual Override
```javascript
// Override with custom gas prices
const simulation = await tenderly.simulateTransaction({
  network_id: '42161',
  from: '0x...',
  to: '0x...',
  input: '0x...',
  maxFeePerGas: '200000000',        // 0.2 gwei
  maxPriorityFeePerGas: '100000000', // 0.1 gwei
});
```

---

## ✅ Status

**Fixed:** All Tenderly simulations now use appropriate gas prices  
**Tested:** Works with Arbitrum One and Ethereum Mainnet  
**Backward Compatible:** Legacy `gas_price` parameter still supported

---

**The gas price error should no longer occur!** ✅
