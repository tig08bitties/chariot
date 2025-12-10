/**
 * Blockscout API Client
 * 
 * Integration with Blockscout for contract verification and code retrieval
 * 
 * Example: https://eth.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
 * (USDC Token on Ethereum Mainnet)
 */

const axios = require('axios');

class BlockscoutClient {
  constructor(network = 'ethereum') {
    this.network = network;
    
    // Blockscout API endpoints by network
    this.endpoints = {
      ethereum: 'https://eth.blockscout.com/api',
      arbitrum: 'https://arbitrum.blockscout.com/api',
      polygon: 'https://polygon.blockscout.com/api',
      optimism: 'https://optimism.blockscout.com/api',
      base: 'https://base.blockscout.com/api',
    };

    this.baseURL = this.endpoints[network] || this.endpoints.ethereum;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });
  }

  /**
   * Get contract information
   * @param {string} address - Contract address
   * @returns {Promise<object>} - Contract information
   */
  async getContract(address) {
    try {
      const response = await this.client.get(`/v2/addresses/${address}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data || {};
        const errorMessage = errorData.message || error.message || 'Contract not found';
        const enhancedError = new Error(`Failed to get contract: ${errorMessage}`);
        enhancedError.status = error.response.status;
        enhancedError.statusText = error.response.statusText;
        enhancedError.responseData = errorData;
        throw enhancedError;
      }
      throw error;
    }
  }

  /**
   * Get contract source code
   * @param {string} address - Contract address
   * @returns {Promise<object>} - Contract source code and metadata
   */
  async getContractSourceCode(address) {
    try {
      const response = await this.client.get(`/v2/smart-contracts/${address}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data || {};
        const errorMessage = errorData.message || error.message || 'Source code not found';
        const enhancedError = new Error(`Failed to get source code: ${errorMessage}`);
        enhancedError.status = error.response.status;
        enhancedError.statusText = error.response.statusText;
        enhancedError.responseData = errorData;
        throw enhancedError;
      }
      throw error;
    }
  }

  /**
   * Get contract ABI
   * @param {string} address - Contract address
   * @returns {Promise<array>} - Contract ABI
   */
  async getContractABI(address) {
    try {
      const response = await this.client.get(`/v2/smart-contracts/${address}`);
      const contractData = response.data;
      
      if (contractData.abi) {
        return typeof contractData.abi === 'string' 
          ? JSON.parse(contractData.abi) 
          : contractData.abi;
      }
      
      return [];
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data || {};
        const errorMessage = errorData.message || error.message || 'ABI not found';
        const enhancedError = new Error(`Failed to get ABI: ${errorMessage}`);
        enhancedError.status = error.response.status;
        enhancedError.statusText = error.response.statusText;
        enhancedError.responseData = errorData;
        throw enhancedError;
      }
      throw error;
    }
  }

  /**
   * Get token information (ERC-20/ERC-721/ERC-1155)
   * @param {string} address - Token contract address
   * @returns {Promise<object>} - Token information
   */
  async getTokenInfo(address) {
    try {
      const response = await this.client.get(`/v2/tokens/${address}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data || {};
        const errorMessage = errorData.message || error.message || 'Token not found';
        const enhancedError = new Error(`Failed to get token info: ${errorMessage}`);
        enhancedError.status = error.response.status;
        enhancedError.statusText = error.response.statusText;
        enhancedError.responseData = errorData;
        throw enhancedError;
      }
      throw error;
    }
  }

  /**
   * Get transaction details
   * @param {string} txHash - Transaction hash
   * @returns {Promise<object>} - Transaction details
   */
  async getTransaction(txHash) {
    try {
      const response = await this.client.get(`/v2/transactions/${txHash}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data || {};
        const errorMessage = errorData.message || error.message || 'Transaction not found';
        const enhancedError = new Error(`Failed to get transaction: ${errorMessage}`);
        enhancedError.status = error.response.status;
        enhancedError.statusText = error.response.statusText;
        enhancedError.responseData = errorData;
        throw enhancedError;
      }
      throw error;
    }
  }

  /**
   * Verify contract on Blockscout
   * @param {string} address - Contract address
   * @param {object} verificationData - Verification data (source code, compiler version, etc.)
   * @returns {Promise<object>} - Verification result
   */
  async verifyContract(address, verificationData) {
    try {
      const response = await this.client.post(`/v2/smart-contracts/${address}/verification/via/flattened-code`, {
        address_hash: address,
        compiler_version: verificationData.compilerVersion,
        contract_source_code: verificationData.sourceCode,
        name: verificationData.contractName,
        optimization: verificationData.optimization || false,
        optimization_runs: verificationData.optimizationRuns || 200,
        constructor_arguments: verificationData.constructorArgs || '',
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data || {};
        const errorMessage = errorData.message || error.message || 'Verification failed';
        const enhancedError = new Error(`Contract verification failed: ${errorMessage}`);
        enhancedError.status = error.response.status;
        enhancedError.statusText = error.response.statusText;
        enhancedError.responseData = errorData;
        throw enhancedError;
      }
      throw error;
    }
  }

  /**
   * Get contract URL on Blockscout
   * @param {string} address - Contract address
   * @returns {string} - Blockscout URL
   */
  getContractURL(address) {
    const baseURLs = {
      ethereum: 'https://eth.blockscout.com',
      arbitrum: 'https://arbitrum.blockscout.com',
      polygon: 'https://polygon.blockscout.com',
      optimism: 'https://optimism.blockscout.com',
      base: 'https://base.blockscout.com',
    };
    
    const baseURL = baseURLs[this.network] || baseURLs.ethereum;
    return `${baseURL}/address/${address}`;
  }

  /**
   * Get token URL on Blockscout
   * @param {string} address - Token contract address
   * @returns {string} - Blockscout token URL
   */
  getTokenURL(address) {
    const baseURLs = {
      ethereum: 'https://eth.blockscout.com',
      arbitrum: 'https://arbitrum.blockscout.com',
      polygon: 'https://polygon.blockscout.com',
      optimism: 'https://optimism.blockscout.com',
      base: 'https://base.blockscout.com',
    };
    
    const baseURL = baseURLs[this.network] || baseURLs.ethereum;
    return `${baseURL}/token/${address}`;
  }
}

module.exports = { BlockscoutClient };
