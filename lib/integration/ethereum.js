// EthereumAdapter — Full Implementation
// Replaces stub with ethers.js provider integration
import { ethers } from 'ethers';

export class EthereumAdapter {
  constructor({ network = 'arbitrum', chainId = 42161, rpcUrl = null } = {}) {
    this.network = network;
    this.chainId = chainId;
    this.rpcUrl = rpcUrl;
    this.provider = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      if (this.rpcUrl) {
        this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
      } else {
        // Default RPC URLs
        const rpcUrls = {
          arbitrum: 'https://arb1.arbitrum.io/rpc',
          ethereum: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID || ''}`,
          polygon: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID || ''}`,
          base: `https://base-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID || ''}`
        };
        
        this.provider = new ethers.JsonRpcProvider(
          rpcUrls[this.network] || rpcUrls.arbitrum
        );
      }

      // Verify connection
      const blockNumber = await this.provider.getBlockNumber();
      const network = await this.provider.getNetwork();
      
      this.initialized = true;
      
      return {
        success: true,
        network: network.name,
        chainId: network.chainId.toString(),
        blockNumber,
        provider: 'ethers.js'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async verify() {
    if (!this.initialized) {
      const result = await this.initialize();
      return result.success;
    }
    try {
      await this.provider.getBlockNumber();
      return true;
    } catch {
      return false;
    }
  }

  getProvider() {
    return this.provider;
  }

  getNetwork() {
    return {
      network: this.network,
      chainId: this.chainId
    };
  }
}
