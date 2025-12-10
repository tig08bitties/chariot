/**
 * Complete Safe Integration
 * 
 * Combines Safe Smart Account, Tenderly, and GitHub for complete
 * Treasury of Light management
 */

const { SafeTenderlyIntegration } = require('./safe-tenderly-integration');
const { GitHubTenderlyIntegration } = require('./github-tenderly-integration');
const { TreasuryOfLight } = require('../safe/treasury-of-light');

class CompleteSafeIntegration {
  constructor(provider, signer, githubToken, tenderlyApiKey, tenderlyAccount, tenderlyProject) {
    this.safeTenderly = new SafeTenderlyIntegration(
      provider,
      signer,
      tenderlyApiKey,
      tenderlyAccount,
      tenderlyProject,
      'arbitrum'
    );
    
    this.githubTenderly = new GitHubTenderlyIntegration(
      githubToken,
      tenderlyApiKey,
      tenderlyAccount,
      tenderlyProject
    );
    
    this.treasury = new TreasuryOfLight(provider, signer);
  }

  /**
   * Complete workflow: Create, simulate, and propose Treasury transaction
   * @param {object} txParams - Transaction parameters
   * @param {string} senderAddress - Sender address (must be Treasury owner)
   * @param {string} owner - GitHub repository owner (optional)
   * @param {string} repo - GitHub repository name (optional)
   * @param {number} issueNumber - GitHub issue number (optional)
   * @returns {Promise<object>} - Complete transaction workflow result
   */
  async createTreasuryTransactionWorkflow(txParams, senderAddress, owner = null, repo = null, issueNumber = null) {
    // Step 1: Create and simulate transaction
    const simulation = await this.safeTenderly.createTreasuryTransaction(txParams);
    
    // Step 2: Create Safe transaction
    const safeTransaction = await this.treasury.createTransaction(txParams);
    
    // Step 3: Sign transaction
    const signedTx = await this.treasury.signTransaction(safeTransaction);
    
    // Step 4: Get safe transaction hash
    const safe = await this.safeTenderly.safe.getSafe(this.treasury.treasury.address);
    const safeTxHash = await safe.getTransactionHash(safeTransaction);
    
    // Step 5: Propose transaction
    const proposal = await this.treasury.proposeTransaction(
      safeTransaction,
      safeTxHash,
      senderAddress
    );

    const result = {
      simulation: simulation.simulation,
      safeTransaction: signedTx,
      proposal,
      safeTxHash,
      treasury: {
        address: this.treasury.treasury.address,
        network: 'Arbitrum One',
        threshold: '2-of-2',
      },
    };

    // Step 6: If GitHub context provided, link to issue
    if (owner && repo && issueNumber) {
      const githubContext = await this.githubTenderly.simulateFromGitHubIssue(
        owner,
        repo,
        issueNumber,
        {
          networkId: '42161',
          from: this.treasury.treasury.address,
          to: txParams.to,
          input: safeTransaction.data,
          gas: txParams.gas || '8000000',
          value: txParams.value || '0',
        }
      );
      result.github = githubContext;
    }

    return result;
  }

  /**
   * Get complete Treasury status with all integrations
   * @returns {Promise<object>} - Complete Treasury status
   */
  async getCompleteTreasuryStatus() {
    const status = await this.treasury.getStatus();
    
    // Get balance from Tenderly
    const balance = await this.safeTenderly.tenderly.getBalance(
      '42161',
      this.treasury.treasury.address
    );
    
    status.balanceWei = balance;
    status.balanceEth = ethers.formatEther(balance);
    status.integrations = {
      safe: 'operational',
      tenderly: 'operational',
      github: 'operational',
    };

    return status;
  }

  /**
   * Monitor Treasury transaction with full context
   * @param {string} txHash - Transaction hash
   * @returns {Promise<object>} - Complete transaction monitoring
   */
  async monitorTreasuryTransaction(txHash) {
    return await this.safeTenderly.monitorSafeTransaction(
      this.treasury.treasury.address,
      txHash
    );
  }
}

// Import ethers for balance formatting
const { ethers } = require('ethers');

module.exports = { CompleteSafeIntegration };
