/**
 * Tenderly API Client
 * 
 * Integration with Tenderly for blockchain transaction simulation,
 * debugging, and monitoring
 * 
 * API Key: vrbEgHhO3wmb2YYwiaC5zxed3IPqslx8
 */

const axios = require('axios');

class TenderlyClient {
  constructor(apiKey, accountSlug, projectSlug) {
    this.apiKey = apiKey;
    this.accountSlug = accountSlug;
    this.projectSlug = projectSlug;
    this.baseURL = 'https://api.tenderly.co/api/v1';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-Access-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Simulate a transaction
   * @param {object} params - Simulation parameters
   * @param {string} params.network_id - Network ID (e.g., '1' for mainnet, '42161' for Arbitrum)
   * @param {string} params.from - From address
   * @param {string} params.to - To address
   * @param {string} params.input - Transaction input data
   * @param {string} params.gas - Gas limit
   * @param {string} params.gas_price - Gas price
   * @param {string} params.value - Value in wei
   * @param {string} params.save - Whether to save simulation
   * @returns {Promise<object>} - Simulation result
   */
  async simulateTransaction(params) {
    const response = await this.client.post('/simulate', {
      network_id: params.network_id,
      from: params.from,
      to: params.to,
      input: params.input,
      gas: params.gas || '8000000',
      gas_price: params.gas_price || '0',
      value: params.value || '0',
      save: params.save || false,
    });
    return response.data;
  }

  /**
   * Get transaction details
   * @param {string} networkId - Network ID
   * @param {string} txHash - Transaction hash
   * @returns {Promise<object>} - Transaction details
   */
  async getTransaction(networkId, txHash) {
    const response = await this.client.get(`/network/${networkId}/transaction/${txHash}`);
    return response.data;
  }

  /**
   * Get contract details
   * @param {string} networkId - Network ID
   * @param {string} address - Contract address
   * @returns {Promise<object>} - Contract details
   */
  async getContract(networkId, address) {
    const response = await this.client.get(`/network/${networkId}/contract/${address}`);
    return response.data;
  }

  /**
   * Get account balance
   * @param {string} networkId - Network ID
   * @param {string} address - Account address
   * @returns {Promise<string>} - Balance in wei
   */
  async getBalance(networkId, address) {
    const response = await this.client.get(`/network/${networkId}/account/${address}/balance`);
    return response.data.balance;
  }

  /**
   * Fork a network
   * @param {string} networkId - Network ID to fork
   * @param {number} blockNumber - Block number to fork at (optional)
   * @returns {Promise<object>} - Fork details
   */
  async forkNetwork(networkId, blockNumber = null) {
    const payload = {
      network_id: networkId,
    };
    if (blockNumber) {
      payload.block_number = blockNumber;
    }
    
    const response = await this.client.post(`/account/${this.accountSlug}/project/${this.projectSlug}/fork`, payload);
    return response.data;
  }

  /**
   * Get fork details
   * @param {string} forkId - Fork ID
   * @returns {Promise<object>} - Fork details
   */
  async getFork(forkId) {
    const response = await this.client.get(`/account/${this.accountSlug}/project/${this.projectSlug}/fork/${forkId}`);
    return response.data;
  }

  /**
   * Simulate transaction on fork
   * @param {string} forkId - Fork ID
   * @param {object} params - Transaction parameters
   * @returns {Promise<object>} - Simulation result
   */
  async simulateOnFork(forkId, params) {
    const response = await this.client.post(
      `/account/${this.accountSlug}/project/${this.projectSlug}/fork/${forkId}/simulate`,
      params
    );
    return response.data;
  }

  /**
   * Verify contract on Tenderly
   * @param {string} networkId - Network ID
   * @param {string} address - Contract address
   * @param {object} contractData - Contract source code and metadata
   * @returns {Promise<object>} - Verification result
   */
  async verifyContract(networkId, address, contractData) {
    const response = await this.client.post(`/network/${networkId}/contract/${address}/verify`, contractData);
    return response.data;
  }

  /**
   * Get transaction trace
   * @param {string} networkId - Network ID
   * @param {string} txHash - Transaction hash
   * @returns {Promise<object>} - Transaction trace
   */
  async getTransactionTrace(networkId, txHash) {
    const response = await this.client.get(`/network/${networkId}/transaction/${txHash}/trace`);
    return response.data;
  }

  /**
   * Get contract storage
   * @param {string} networkId - Network ID
   * @param {string} address - Contract address
   * @param {string} slot - Storage slot (hex)
   * @returns {Promise<string>} - Storage value
   */
  async getStorage(networkId, address, slot) {
    const response = await this.client.get(`/network/${networkId}/contract/${address}/storage/${slot}`);
    return response.data.value;
  }
}

module.exports = { TenderlyClient };
