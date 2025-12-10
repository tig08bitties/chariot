/**
 * Safe + Tenderly Integration
 * 
 * Combines Safe Smart Account operations with Tenderly simulation
 * for the Treasury of Light (Bride & Groom Chamber)
 */

const { SafeClient } = require('../safe/safe-client');
const { TenderlyClient } = require('../tenderly/tenderly-client');

class SafeTenderlyIntegration {
  constructor(provider, signer, tenderlyApiKey, tenderlyAccount, tenderlyProject, network = 'arbitrum') {
    this.safe = new SafeClient(provider, signer, network);
    this.tenderly = new TenderlyClient(tenderlyApiKey, tenderlyAccount, tenderlyProject);
    this.network = network;
    this.networkId = network === 'ethereum' ? '1' : '42161';
  }

  /**
   * Simulate Safe transaction before execution
   * @param {string} safeAddress - Safe address
   * @param {object} txParams - Transaction parameters
   * @returns {Promise<object>} - Simulation result
   */
  async simulateSafeTransaction(safeAddress, txParams) {
    // Get Safe info
    const safeInfo = await this.safe.getSafeInfo(safeAddress);
    
    // Create Safe transaction
    const safeTransaction = await this.safe.createTransaction(safeAddress, txParams);
    
    // Get transaction data for simulation
    const txData = safeTransaction.data;
    
    // Simulate on Tenderly
    const simulation = await this.tenderly.simulateTransaction({
      network_id: this.networkId,
      from: safeAddress,
      to: txParams.to,
      input: txData,
      gas: txParams.gas || '8000000',
      gas_price: txParams.gas_price || '0',
      value: txParams.value || '0',
      save: true,
    });

    return {
      safe: safeInfo,
      transaction: safeTransaction,
      simulation,
      networkId: this.networkId,
    };
  }

  /**
   * Monitor Safe transaction execution
   * @param {string} safeAddress - Safe address
   * @param {string} txHash - Transaction hash
   * @returns {Promise<object>} - Transaction details with trace
   */
  async monitorSafeTransaction(safeAddress, txHash) {
    // Get transaction from Tenderly
    const tx = await this.tenderly.getTransaction(this.networkId, txHash);
    const trace = await this.tenderly.getTransactionTrace(this.networkId, txHash);
    
    // Get Safe info
    const safeInfo = await this.safe.getSafeInfo(safeAddress);
    
    // Get transaction history from Safe Service
    const history = await this.safe.getTransactionHistory(safeAddress);
    const safeTx = history.results?.find(t => t.txHash === txHash);

    return {
      safe: safeInfo,
      transaction: tx,
      trace,
      safeTransaction: safeTx,
      networkId: this.networkId,
    };
  }

  /**
   * Create and simulate Safe transaction for Treasury of Light
   * @param {object} txParams - Transaction parameters
   * @returns {Promise<object>} - Complete transaction with simulation
   */
  async createTreasuryTransaction(txParams) {
    const TREASURY_OF_LIGHT = '0xb4C173AaFe428845f0b96610cf53576121BAB221';
    
    return await this.simulateSafeTransaction(TREASURY_OF_LIGHT, txParams);
  }

  /**
   * Get Treasury of Light status
   * @returns {Promise<object>} - Treasury status with balance and owners
   */
  async getTreasuryStatus() {
    const TREASURY_OF_LIGHT = '0xb4C173AaFe428845f0b96610cf53576121BAB221';
    
    const safeInfo = await this.safe.getSafeInfo(TREASURY_OF_LIGHT);
    
    // Get balance from Tenderly
    const balance = await this.tenderly.getBalance(this.networkId, TREASURY_OF_LIGHT);
    
    // Get pending transactions
    const pendingTxs = await this.safe.getPendingTransactions(TREASURY_OF_LIGHT);
    
    return {
      ...safeInfo,
      balanceWei: balance,
      balanceEth: ethers.formatEther(balance),
      pendingTransactions: pendingTxs,
      network: 'Arbitrum One',
    };
  }

  /**
   * Propose and simulate Safe transaction
   * @param {string} safeAddress - Safe address
   * @param {object} txParams - Transaction parameters
   * @param {string} senderAddress - Sender address (must be owner)
   * @returns {Promise<object>} - Proposal with simulation
   */
  async proposeAndSimulate(safeAddress, txParams, senderAddress) {
    // Verify sender is owner
    const isOwner = await this.safe.isOwner(safeAddress, senderAddress);
    if (!isOwner) {
      throw new Error(`Address ${senderAddress} is not an owner of Safe ${safeAddress}`);
    }

    // Create transaction
    const safeTransaction = await this.safe.createTransaction(safeAddress, txParams);
    
    // Sign transaction
    const signedTx = await this.safe.signTransaction(safeAddress, safeTransaction);
    
    // Get safe transaction hash
    const safeTxHash = await this.safe.getSafe(safeAddress).then(safe => 
      safe.getTransactionHash(safeTransaction)
    );
    
    // Simulate on Tenderly
    const simulation = await this.tenderly.simulateTransaction({
      network_id: this.networkId,
      from: safeAddress,
      to: txParams.to,
      input: safeTransaction.data,
      gas: txParams.gas || '8000000',
      value: txParams.value || '0',
      save: true,
    });

    // Propose to Safe Service
    const proposal = await this.safe.proposeTransaction(
      safeAddress,
      safeTransaction,
      safeTxHash,
      senderAddress
    );

    return {
      proposal,
      simulation,
      safeTransaction: signedTx,
      safeTxHash,
      networkId: this.networkId,
    };
  }
}

// Import ethers for balance formatting
const { ethers } = require('ethers');

module.exports = { SafeTenderlyIntegration };
