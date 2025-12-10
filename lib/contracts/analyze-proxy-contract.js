/**
 * Analyze ERC1967 Proxy Contract
 * 
 * Analyzes decompiled proxy contract bytecode to extract:
 * - Implementation address
 * - Admin address
 * - Contract type
 * - Storage slots
 */

const { ethers } = require('ethers');
const { BlockscoutClient } = require('./blockscout-client');

class ProxyContractAnalyzer {
  constructor(provider, network = 'arbitrum') {
    this.provider = provider;
    this.network = network;
    this.blockscout = new BlockscoutClient(network);
  }

  /**
   * Get implementation address from proxy (ERC1967 storage slot)
   * @param {string} proxyAddress - Proxy contract address
   * @returns {Promise<string>} - Implementation address
   */
  async getImplementation(proxyAddress) {
    // ERC1967 implementation storage slot
    const IMPLEMENTATION_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
    
    const implementation = await this.provider.getStorage(proxyAddress, IMPLEMENTATION_SLOT);
    return ethers.getAddress('0x' + implementation.slice(-40));
  }

  /**
   * Get admin address from proxy (ERC1967 storage slot)
   * @param {string} proxyAddress - Proxy contract address
   * @returns {Promise<string>} - Admin address
   */
  async getAdmin(proxyAddress) {
    // ERC1967 admin storage slot
    const ADMIN_SLOT = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d61';
    
    const admin = await this.provider.getStorage(proxyAddress, ADMIN_SLOT);
    return ethers.getAddress('0x' + admin.slice(-40));
  }

  /**
   * Analyze proxy contract
   * @param {string} proxyAddress - Proxy contract address
   * @returns {Promise<object>} - Analysis results
   */
  async analyze(proxyAddress) {
    try {
      console.log('🔍 Analyzing Proxy Contract...\n');
      console.log('Proxy Address:', proxyAddress);
      console.log('Network:', this.network);
      console.log('');

      // Get implementation and admin
      const [implementation, admin] = await Promise.all([
        this.getImplementation(proxyAddress),
        this.getAdmin(proxyAddress),
      ]);

      // Get contract info from Blockscout
      let proxyInfo = null;
      let implementationInfo = null;

      try {
        proxyInfo = await this.blockscout.getContract(proxyAddress);
      } catch (e) {
        console.log('⚠️  Could not fetch proxy info from Blockscout');
      }

      try {
        implementationInfo = await this.blockscout.getContract(implementation);
      } catch (e) {
        console.log('⚠️  Could not fetch implementation info from Blockscout');
      }

      // Get code
      const proxyCode = await this.provider.getCode(proxyAddress);
      const implementationCode = await this.provider.getCode(implementation);

      const analysis = {
        proxy: {
          address: proxyAddress,
          hasCode: proxyCode !== '0x',
          codeSize: (proxyCode.length - 2) / 2, // bytes
          info: proxyInfo,
          blockscoutUrl: this.blockscout.getContractURL(proxyAddress),
        },
        implementation: {
          address: implementation,
          hasCode: implementationCode !== '0x',
          codeSize: (implementationCode.length - 2) / 2, // bytes
          info: implementationInfo,
          blockscoutUrl: this.blockscout.getContractURL(implementation),
        },
        admin: {
          address: admin,
          isZero: admin === ethers.ZeroAddress,
          blockscoutUrl: this.blockscout.getContractURL(admin),
        },
        storage: {
          implementationSlot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
          adminSlot: '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d61',
        },
        type: 'ERC1967 Transparent Upgradeable Proxy',
      };

      return analysis;
    } catch (error) {
      throw new Error(`Failed to analyze proxy: ${error.message}`);
    }
  }

  /**
   * Print analysis results
   * @param {object} analysis - Analysis results
   */
  printAnalysis(analysis) {
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('║ 📊 PROXY CONTRACT ANALYSIS ║');
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('');

    console.log('🔷 PROXY CONTRACT');
    console.log('─'.repeat(80));
    console.log('  Address:', analysis.proxy.address);
    console.log('  Type:', analysis.type);
    console.log('  Has Code:', analysis.proxy.hasCode ? '✅ Yes' : '❌ No');
    console.log('  Code Size:', analysis.proxy.codeSize, 'bytes');
    console.log('  Blockscout:', analysis.proxy.blockscoutUrl);
    console.log('');

    console.log('🔷 IMPLEMENTATION CONTRACT');
    console.log('─'.repeat(80));
    console.log('  Address:', analysis.implementation.address);
    console.log('  Has Code:', analysis.implementation.hasCode ? '✅ Yes' : '❌ No');
    console.log('  Code Size:', analysis.implementation.codeSize, 'bytes');
    console.log('  Blockscout:', analysis.implementation.blockscoutUrl);
    if (analysis.implementation.info) {
      console.log('  Name:', analysis.implementation.info.name || 'N/A');
      console.log('  Is Verified:', analysis.implementation.info.is_verified ? '✅ Yes' : '❌ No');
    }
    console.log('');

    console.log('🔷 ADMIN');
    console.log('─'.repeat(80));
    console.log('  Address:', analysis.admin.address);
    console.log('  Is Zero Address:', analysis.admin.isZero ? '⚠️  Yes' : '✅ No');
    console.log('  Blockscout:', analysis.admin.blockscoutUrl);
    console.log('');

    console.log('🔷 STORAGE SLOTS');
    console.log('─'.repeat(80));
    console.log('  Implementation Slot:', analysis.storage.implementationSlot);
    console.log('  Admin Slot:', analysis.storage.adminSlot);
    console.log('');

    console.log('═══════════════════════════════════════════════════════════════════════');
  }
}

module.exports = { ProxyContractAnalyzer };
