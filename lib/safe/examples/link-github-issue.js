/**
 * Example: Link Safe Transaction to GitHub Issue/PR
 * 
 * This script demonstrates how to create a Safe transaction,
 * simulate it on Tenderly, and link it to a GitHub issue or PR.
 */

require('dotenv').config();
const { ethers } = require('ethers');
const { CompleteSafeIntegration } = require('../../integration/complete-safe-integration');

// Treasury of Light address
const TREASURY_OF_LIGHT = '0xb4C173AaFe428845f0b96610cf53576121BAB221';

async function linkToGitHubIssue(issueNumber, txParams) {
  console.log('🔗 Linking Safe Transaction to GitHub Issue...\n');
  console.log('Issue Number:', issueNumber);
  console.log('Repository: tig08bitties/chariot');
  console.log('');

  // Initialize provider (Arbitrum One)
  const provider = new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
  
  // Initialize signer (needed for signing transactions)
  // In production, use a secure key management solution
  const signer = process.env.PRIVATE_KEY 
    ? new ethers.Wallet(process.env.PRIVATE_KEY, provider)
    : null;

  if (!signer) {
    console.warn('⚠️  No signer provided - simulation only (no signing)');
  }

  // Initialize complete integration
  const integration = new CompleteSafeIntegration(
    provider,
    signer,
    process.env.GITHUB_TOKEN,
    process.env.TENDERLY_API_KEY,
    process.env.TENDERLY_ACCOUNT_SLUG,
    process.env.TENDERLY_PROJECT_SLUG
  );

  // Sender must be a Treasury owner
  const senderAddress = signer ? await signer.getAddress() : '0x3BBa654A3816A228284E3e0401Cff4EA6dFc5cea';

  try {
    // Create complete workflow with GitHub linking
    const result = await integration.createTreasuryTransactionWorkflow(
      txParams,
      senderAddress,
      'tig08bitties',
      'chariot',
      issueNumber
    );

    console.log('✅ Complete Workflow Executed\n');
    
    // Simulation Results
    console.log('🔬 Simulation Results:');
    console.log('  Status:', result.simulation.transaction.status ? 'Success ✅' : 'Failed ❌');
    console.log('  Gas Used:', result.simulation.transaction.gas_used);
    if (result.simulation.simulation?.id) {
      console.log('  Simulation ID:', result.simulation.simulation.id);
      console.log('  Simulation URL:');
      console.log(`    https://dashboard.tenderly.co/${process.env.TENDERLY_ACCOUNT_SLUG}/${process.env.TENDERLY_PROJECT_SLUG}/simulator/${result.simulation.simulation.id}`);
    }

    // Safe Transaction
    console.log('\n📋 Safe Transaction:');
    console.log('  Safe Tx Hash:', result.safeTxHash);
    console.log('  Treasury:', result.treasury.address);
    console.log('  Threshold:', result.treasury.threshold);
    console.log('  Network:', result.treasury.network);

    // Proposal
    console.log('\n📝 Proposal:');
    console.log('  Status:', result.proposal.status);
    console.log('  Safe Address:', result.proposal.safeAddress);

    // GitHub Context
    if (result.github) {
      console.log('\n🔗 GitHub Context:');
      console.log('  Issue Title:', result.github.issue.title);
      console.log('  Issue URL:', result.github.issue.url);
      console.log('  Author:', result.github.issue.author.login);
      console.log('  Repository:', result.github.githubContext.owner + '/' + result.github.githubContext.repo);
      console.log('  Issue Number:', result.github.githubContext.issueNumber);
    }

    // Next Steps
    console.log('\n📌 Next Steps:');
    console.log('  1. Review simulation results above');
    console.log('  2. If simulation succeeds, second owner can sign');
    console.log('  3. Once 2-of-2 threshold is met, transaction can be executed');
    console.log('  4. Monitor execution with: node monitor-execution-trace.js <txHash>');

  } catch (error) {
    console.error('❌ Workflow failed:', error.message);
    if (error.response) {
      console.error('  Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Example usage
async function example() {
  // Example: Call THEOS Final Oracle getAll() function
  const THEOS_ORACLE = '0x8BCbC66A5bb808A8871F667f2dd92a017B3DaFAC';
  
  const oracleInterface = new ethers.Interface([
    'function getAll() external view returns (address, address, address, address, address, bytes32, address)'
  ]);
  const txData = oracleInterface.encodeFunctionData('getAll', []);

  const txParams = {
    to: THEOS_ORACLE,
    data: txData,
    value: '0',
    gas: '8000000',
  };

  // Link to GitHub issue #1
  await linkToGitHubIssue(1, txParams);
}

// Get issue number from command line or use example
const issueNumber = process.argv[2] ? parseInt(process.argv[2]) : null;

// Run if executed directly
if (require.main === module) {
  if (issueNumber) {
    // Use provided issue number with example transaction
    const THEOS_ORACLE = '0x8BCbC66A5bb808A8871F667f2dd92a017B3DaFAC';
    const oracleInterface = new ethers.Interface([
      'function getAll() external view returns (address, address, address, address, address, bytes32, address)'
    ]);
    const txData = oracleInterface.encodeFunctionData('getAll', []);
    
    linkToGitHubIssue(issueNumber, {
      to: THEOS_ORACLE,
      data: txData,
      value: '0',
      gas: '8000000',
    }).catch(console.error);
  } else {
    example().catch(console.error);
  }
}

module.exports = { linkToGitHubIssue };
