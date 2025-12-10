/**
 * Example usage of GitHub + Tenderly Integration
 * 
 * Demonstrates how to use the combined integration for:
 * - Monitoring repository deployments
 * - Simulating transactions from GitHub issues
 * - Creating Tenderly forks for PR testing
 * - Verifying contracts from commits
 * - Monitoring Safe transactions
 */

require('dotenv').config();
const { GitHubTenderlyIntegration } = require('./github-tenderly-integration');

async function main() {
  // Initialize integration
  const integration = new GitHubTenderlyIntegration(
    process.env.GITHUB_TOKEN,
    process.env.TENDERLY_API_KEY,
    process.env.TENDERLY_ACCOUNT_SLUG,
    process.env.TENDERLY_PROJECT_SLUG
  );

  // Example 1: Monitor repository deployments
  console.log('📊 Monitoring repository deployments...');
  const monitoring = await integration.monitorRepositoryDeployments(
    'tig08bitties',
    'chariot',
    '42161' // Arbitrum One
  );
  console.log('Monitoring result:', monitoring);

  // Example 2: Simulate transaction from GitHub issue
  console.log('\n🔬 Simulating transaction from GitHub issue...');
  const simulation = await integration.simulateFromGitHubIssue(
    'tig08bitties',
    'chariot',
    1, // Issue number
    {
      networkId: '42161',
      from: '0x3BBa654A3816A228284E3e0401Cff4EA6dFc5cea',
      to: '0xb4C173AaFe428845f0b96610cf53576121BAB221', // Treasury of Light
      input: '0x', // Transaction data
      gas: '8000000',
      value: '0',
    }
  );
  console.log('Simulation result:', simulation);

  // Example 3: Monitor Safe transaction
  console.log('\n🔍 Monitoring Safe transaction...');
  const safeTx = await integration.monitorSafeTransaction(
    '42161', // Arbitrum One
    '0xb4C173AaFe428845f0b96610cf53576121BAB221', // Treasury of Light
    '0x...', // Transaction hash
    'tig08bitties',
    'chariot'
  );
  console.log('Safe transaction details:', safeTx);

  // Example 4: Simulate Safe transaction before execution
  console.log('\n⚡ Simulating Safe transaction...');
  const safeSim = await integration.simulateSafeTransaction(
    '42161',
    '0xb4C173AaFe428845f0b96610cf53576121BAB221',
    {
      from: '0x3BBa654A3816A228284E3e0401Cff4EA6dFc5cea',
      input: '0x', // Safe transaction data
      gas: '8000000',
      value: '0',
    }
  );
  console.log('Safe simulation result:', safeSim);
}

// Run examples
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
