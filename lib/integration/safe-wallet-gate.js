/**
 * Safe{Wallet} Gate Integration
 * 
 * Connects chariot to Safe multi-sig wallet infrastructure
 * 
 * Features:
 * - Safe SDK integration
 * - Transaction proposal and execution
 * - Multi-sig coordination
 * - Treasury management
 */

const { ethers } = require('ethers');
const EventEmitter = require('events');

class SafeWalletGate extends EventEmitter {
  constructor(opts = {}) {
    super();
    
    this.config = {
      // Network configs
      networks: {
        ethereum: {
          chainId: 1,
          rpc: opts.ethereumRpc || process.env.ETHEREUM_RPC || 'https://eth.llamarpc.com',
          safeService: 'https://safe-transaction-mainnet.safe.global',
          safeFactory: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
        },
        arbitrum: {
          chainId: 42161,
          rpc: opts.arbitrumRpc || process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
          safeService: 'https://safe-transaction-arbitrum.safe.global',
          safeFactory: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
        },
        optimism: {
          chainId: 10,
          rpc: opts.optimismRpc || process.env.OPTIMISM_RPC || 'https://mainnet.optimism.io',
          safeService: 'https://safe-transaction-optimism.safe.global',
          safeFactory: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
        },
        base: {
          chainId: 8453,
          rpc: opts.baseRpc || process.env.BASE_RPC || 'https://mainnet.base.org',
          safeService: 'https://safe-transaction-base.safe.global',
          safeFactory: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
        },
      },
      
      // Known Safe addresses (Treasury of Light - Bride & Groom Chamber)
      treasuryAddresses: {
        arbitrum: opts.treasuryArbitrum || process.env.TREASURY_ARBITRUM || '0xb4C173AaFe428845f0b96610cf53576121BAB221',
        ethereum: opts.treasuryEthereum || process.env.TREASURY_ETHEREUM,
      },
      
      // Private key for signing (optional - for automated operations)
      signerKey: opts.signerKey || process.env.SAFE_SIGNER_KEY,
    };
    
    this.providers = {};
    this.signers = {};
    this.initialized = false;
  }

  /**
   * Initialize providers and signers
   */
  async initialize() {
    for (const [network, config] of Object.entries(this.config.networks)) {
      try {
        this.providers[network] = new ethers.JsonRpcProvider(config.rpc);
        
        if (this.config.signerKey) {
          this.signers[network] = new ethers.Wallet(this.config.signerKey, this.providers[network]);
        }
        
        // Test connection
        await this.providers[network].getBlockNumber();
        this.emit('network_connected', { network, chainId: config.chainId });
      } catch (error) {
        this.emit('network_error', { network, error: error.message });
      }
    }
    
    this.initialized = true;
    return this.getStatus();
  }

  /**
   * Get Safe info from Safe Transaction Service
   */
  async getSafeInfo(network, safeAddress) {
    const config = this.config.networks[network];
    if (!config) {
      throw new Error(`Unknown network: ${network}`);
    }
    
    try {
      const response = await fetch(`${config.safeService}/api/v1/safes/${safeAddress}/`);
      
      if (!response.ok) {
        throw new Error(`Safe not found: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        address: data.address,
        nonce: data.nonce,
        threshold: data.threshold,
        owners: data.owners,
        modules: data.modules,
        fallbackHandler: data.fallbackHandler,
        guard: data.guard,
        version: data.version,
      };
    } catch (error) {
      this.emit('error', { source: 'getSafeInfo', network, error: error.message });
      throw error;
    }
  }

  /**
   * Get pending transactions for a Safe
   */
  async getPendingTransactions(network, safeAddress) {
    const config = this.config.networks[network];
    if (!config) {
      throw new Error(`Unknown network: ${network}`);
    }
    
    try {
      const response = await fetch(
        `${config.safeService}/api/v1/safes/${safeAddress}/multisig-transactions/?executed=false`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to get transactions: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      this.emit('error', { source: 'getPendingTransactions', network, error: error.message });
      throw error;
    }
  }

  /**
   * Get transaction history for a Safe
   */
  async getTransactionHistory(network, safeAddress, limit = 20) {
    const config = this.config.networks[network];
    if (!config) {
      throw new Error(`Unknown network: ${network}`);
    }
    
    try {
      const response = await fetch(
        `${config.safeService}/api/v1/safes/${safeAddress}/all-transactions/?limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to get history: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      this.emit('error', { source: 'getTransactionHistory', network, error: error.message });
      throw error;
    }
  }

  /**
   * Get Safe balances
   */
  async getBalances(network, safeAddress) {
    const config = this.config.networks[network];
    if (!config) {
      throw new Error(`Unknown network: ${network}`);
    }
    
    try {
      const response = await fetch(
        `${config.safeService}/api/v1/safes/${safeAddress}/balances/?trusted=true&exclude_spam=true`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to get balances: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      this.emit('error', { source: 'getBalances', network, error: error.message });
      throw error;
    }
  }

  /**
   * Get Treasury of Light status
   */
  async getTreasuryStatus() {
    const status = {};
    
    for (const [network, address] of Object.entries(this.config.treasuryAddresses)) {
      if (!address) continue;
      
      try {
        const info = await this.getSafeInfo(network, address);
        const balances = await this.getBalances(network, address);
        const pending = await this.getPendingTransactions(network, address);
        
        status[network] = {
          address,
          ...info,
          balances,
          pendingTransactions: pending.length,
        };
      } catch (error) {
        status[network] = {
          address,
          error: error.message,
        };
      }
    }
    
    return status;
  }

  /**
   * Encode transaction data
   */
  encodeTransactionData(abi, functionName, args) {
    const iface = new ethers.Interface(abi);
    return iface.encodeFunctionData(functionName, args);
  }

  /**
   * Estimate Safe transaction
   */
  async estimateTransaction(network, safeAddress, to, value, data) {
    const config = this.config.networks[network];
    if (!config) {
      throw new Error(`Unknown network: ${network}`);
    }
    
    try {
      const response = await fetch(
        `${config.safeService}/api/v1/safes/${safeAddress}/multisig-transactions/estimations/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to,
            value: value.toString(),
            data: data || '0x',
            operation: 0, // CALL
          }),
        }
      );
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Estimation failed: ${error}`);
      }
      
      return await response.json();
    } catch (error) {
      this.emit('error', { source: 'estimateTransaction', network, error: error.message });
      throw error;
    }
  }

  /**
   * Get collectibles (NFTs) for a Safe
   */
  async getCollectibles(network, safeAddress) {
    const config = this.config.networks[network];
    if (!config) {
      throw new Error(`Unknown network: ${network}`);
    }
    
    try {
      const response = await fetch(
        `${config.safeService}/api/v2/safes/${safeAddress}/collectibles/`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to get collectibles: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      this.emit('error', { source: 'getCollectibles', network, error: error.message });
      throw error;
    }
  }

  /**
   * Watch Safe for new transactions
   */
  watchSafe(network, safeAddress, intervalMs = 30000) {
    let lastNonce = -1;
    
    const check = async () => {
      try {
        const info = await this.getSafeInfo(network, safeAddress);
        
        if (lastNonce >= 0 && info.nonce !== lastNonce) {
          this.emit('nonce_changed', {
            network,
            safeAddress,
            oldNonce: lastNonce,
            newNonce: info.nonce,
          });
        }
        
        lastNonce = info.nonce;
        
        const pending = await this.getPendingTransactions(network, safeAddress);
        if (pending.length > 0) {
          this.emit('pending_transactions', {
            network,
            safeAddress,
            count: pending.length,
            transactions: pending,
          });
        }
      } catch (error) {
        this.emit('watch_error', { network, safeAddress, error: error.message });
      }
    };
    
    // Initial check
    check();
    
    // Set up interval
    const intervalId = setInterval(check, intervalMs);
    
    return () => clearInterval(intervalId);
  }

  /**
   * Get gate status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      networks: Object.keys(this.config.networks),
      connectedProviders: Object.keys(this.providers),
      hasSigner: !!this.config.signerKey,
      treasuryAddresses: this.config.treasuryAddresses,
    };
  }
}

module.exports = { SafeWalletGate };
