/**
 * GitHub + Tenderly Integration
 * 
 * Combines GitHub GraphQL Node ID utilities with Tenderly blockchain
 * simulation and monitoring capabilities
 */

const { GitHubNodeIDManager } = require('../github/graphql-node-ids');
const { TenderlyClient } = require('../tenderly/tenderly-client');

class GitHubTenderlyIntegration {
  constructor(githubToken, tenderlyApiKey, tenderlyAccount, tenderlyProject) {
    this.github = new GitHubNodeIDManager(githubToken);
    this.tenderly = new TenderlyClient(tenderlyApiKey, tenderlyAccount, tenderlyProject);
  }

  /**
   * Monitor repository for contract deployments and simulate them
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} networkId - Network ID (e.g., '42161' for Arbitrum)
   * @returns {Promise<object>} - Monitoring result
   */
  async monitorRepositoryDeployments(owner, repo, networkId = '42161') {
    // Get repository node ID
    const repoNodeId = await this.github.getRepositoryNodeID(owner, repo);
    
    // Get repository details via GraphQL
    const repoData = await this.github.lookupNode(repoNodeId, 'Repository', `
      name
      url
      defaultBranchRef {
        name
        target {
          ... on Commit {
            oid
            message
          }
        }
      }
    `);

    return {
      repository: repoData,
      networkId,
      monitoring: 'active',
    };
  }

  /**
   * Simulate a transaction from a GitHub issue or PR
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} issueNumber - Issue or PR number
   * @param {object} txParams - Transaction parameters
   * @returns {Promise<object>} - Simulation result with GitHub context
   */
  async simulateFromGitHubIssue(owner, repo, issueNumber, txParams) {
    // Get issue node ID
    const issueNodeId = await this.github.getIssueNodeID(owner, repo, issueNumber);
    
    // Get issue details
    const issue = await this.github.lookupNode(issueNodeId, 'Issue', `
      title
      body
      author {
        login
      }
      url
    `);

    // Simulate transaction on Tenderly
    const simulation = await this.tenderly.simulateTransaction({
      network_id: txParams.networkId || '42161',
      from: txParams.from,
      to: txParams.to,
      input: txParams.input,
      gas: txParams.gas,
      gas_price: txParams.gas_price,
      value: txParams.value,
      save: true,
    });

    return {
      issue,
      simulation,
      githubContext: {
        owner,
        repo,
        issueNumber,
        issueUrl: issue.url,
      },
    };
  }

  /**
   * Create a Tenderly fork for testing and link to GitHub PR
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} prNumber - Pull request number
   * @param {string} networkId - Network ID to fork
   * @param {number} blockNumber - Block number to fork at
   * @returns {Promise<object>} - Fork details with PR context
   */
  async createForkForPR(owner, repo, prNumber, networkId = '42161', blockNumber = null) {
    // Get PR node ID
    const prNodeId = await this.github.getPullRequestNodeID(owner, repo, prNumber);
    
    // Get PR details
    const pr = await this.github.lookupNode(prNodeId, 'PullRequest', `
      title
      body
      headRefName
      baseRefName
      author {
        login
      }
      url
    `);

    // Create fork on Tenderly
    const fork = await this.tenderly.forkNetwork(networkId, blockNumber);

    return {
      pr,
      fork,
      githubContext: {
        owner,
        repo,
        prNumber,
        prUrl: pr.url,
        branch: pr.headRefName,
      },
      tenderlyContext: {
        forkId: fork.fork.id,
        forkUrl: `https://dashboard.tenderly.co/${this.tenderly.accountSlug}/${this.tenderly.projectSlug}/fork/${fork.fork.id}`,
      },
    };
  }

  /**
   * Verify contract deployment from GitHub commit
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} commitSha - Commit SHA
   * @param {string} networkId - Network ID
   * @param {string} contractAddress - Deployed contract address
   * @param {object} contractData - Contract source code and metadata
   * @returns {Promise<object>} - Verification result with commit context
   */
  async verifyContractFromCommit(owner, repo, commitSha, networkId, contractAddress, contractData) {
    // Get commit details (would need to use REST API for commits)
    // For now, we'll use the contract address directly
    
    // Verify contract on Tenderly
    const verification = await this.tenderly.verifyContract(networkId, contractAddress, contractData);

    return {
      commit: {
        sha: commitSha,
        url: `https://github.com/${owner}/${repo}/commit/${commitSha}`,
      },
      contract: {
        address: contractAddress,
        networkId,
      },
      verification,
    };
  }

  /**
   * Monitor Safe transaction and link to GitHub
   * @param {string} networkId - Network ID
   * @param {string} safeAddress - Safe address
   * @param {string} txHash - Transaction hash
   * @param {string} owner - Repository owner (optional)
   * @param {string} repo - Repository name (optional)
   * @returns {Promise<object>} - Transaction details with monitoring
   */
  async monitorSafeTransaction(networkId, safeAddress, txHash, owner = null, repo = null) {
    // Get transaction details from Tenderly
    const tx = await this.tenderly.getTransaction(networkId, txHash);
    const trace = await this.tenderly.getTransactionTrace(networkId, txHash);
    
    // Get contract details
    const contract = await this.tenderly.getContract(networkId, safeAddress);

    const result = {
      transaction: tx,
      trace,
      safe: {
        address: safeAddress,
        contract,
      },
      networkId,
    };

    // If GitHub context provided, add it
    if (owner && repo) {
      const repoNodeId = await this.github.getRepositoryNodeID(owner, repo);
      result.github = {
        owner,
        repo,
        repositoryUrl: `https://github.com/${owner}/${repo}`,
      };
    }

    return result;
  }

  /**
   * Simulate Safe transaction before execution
   * @param {string} networkId - Network ID
   * @param {string} safeAddress - Safe address
   * @param {object} txParams - Transaction parameters
   * @returns {Promise<object>} - Simulation result
   */
  async simulateSafeTransaction(networkId, safeAddress, txParams) {
    // Build Safe transaction input
    // This would typically use Safe's encodeTransactionData or similar
    const input = txParams.input || '0x';

    const simulation = await this.tenderly.simulateTransaction({
      network_id: networkId,
      from: txParams.from || safeAddress,
      to: safeAddress,
      input: input,
      gas: txParams.gas || '8000000',
      gas_price: txParams.gas_price || '0',
      value: txParams.value || '0',
      save: true,
    });

    return {
      safe: {
        address: safeAddress,
      },
      simulation,
      networkId,
    };
  }
}

module.exports = { GitHubTenderlyIntegration };
