#!/usr/bin/env node
/**
 * Analyze ERC1967 Proxy Contract
 * 
 * Usage: node scripts/analyze-proxy.js <proxy-address> [network]
 * 
 * Example:
 *   node scripts/analyze-proxy.js 0x1234... arbitrum
 */

const { ethers } = require('ethers');
const { ProxyContractAnalyzer } = require('../lib/contracts/analyze-proxy-contract');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: node scripts/analyze-proxy.js <proxy-address> [network]');
    console.error('');
    console.error('Example:');
    console.error('  node scripts/analyze-proxy.js 0x1234... arbitrum');
    process.exit(1);
  }

  const proxyAddress = args[0];
  const network = args[1] || 'arbitrum';

  // Validate address
  if (!ethers.isAddress(proxyAddress)) {
    console.error('❌ Invalid address:', proxyAddress);
    process.exit(1);
  }

  // Setup provider
  const rpcUrls = {
    arbitrum: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    ethereum: process.env.ETH_RPC_URL || 'https://eth.llamarpc.com',
  };

  const rpcUrl = rpcUrls[network] || rpcUrls.arbitrum;
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  try {
    // Create analyzer
    const analyzer = new ProxyContractAnalyzer(provider, network);

    // Analyze proxy
    const analysis = await analyzer.analyze(proxyAddress);

    // Print results
    analyzer.printAnalysis(analysis);

    // Return JSON for programmatic use
    if (process.env.JSON_OUTPUT === 'true') {
      console.log(JSON.stringify(analysis, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
