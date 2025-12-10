/**
 * Example: Simulate Safe Transaction on Tenderly Before Execution
 * 
 * This script demonstrates how to simulate a Treasury of Light transaction
 * on Tenderly before actually executing it on-chain.
 */

require('dotenv').config();
const { ethers } = require('ethers');
const { SafeTenderlyIntegration } = require('../../integration/safe-tenderly-integration');

// Treasury of Light address
const TREASURY_OF_LIGHT = '0xb4C173AaFe428845f0b96610cf53576121BAB221';

async function simulateBeforeExecution() {
  console.log('🔬 Simulating Safe Transaction on Tenderly...\n');

  // Initialize provider (Arbitrum One)
  const provider = new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
  
  // Initialize signer (optional - needed for signing, not simulation)
  // const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Initialize integration
  const integration = new SafeTenderlyIntegration(
    provider,
    null, // No signer needed for simulation
    process.env.TENDERLY_API_KEY,
    process.env.TENDERLY_ACCOUNT_SLUG,
    process.env.TENDERLY_PROJECT_SLUG,
    'arbitrum'
  );

  // Example: Simulate calling THEOS Final Oracle
  const THEOS_ORACLE = '0x8BCbC66A5bb808A8871F667f2dd92a017B3DaFAC';
  
  // Create transaction data (example: call getAll() function)
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

  try {
    // Simulate transaction
    const result = await integration.simulateSafeTransaction(
      TREASURY_OF_LIGHT,
      txParams
    );

    console.log('✅ Simulation Complete\n');
    console.log('📊 Simulation Results:');
    console.log('  Status:', result.simulation.transaction.status ? 'Success' : 'Failed');
    console.log('  Gas Used:', result.simulation.transaction.gas_used);
    console.log('  Network:', result.networkId);
    console.log('\n📋 Safe Information:');
    console.log('  Address:', result.safe.address);
    console.log('  Owners:', result.safe.owners.length);
    console.log('  Threshold:', result.safe.threshold);
    console.log('  Balance:', result.safe.balance, 'ETH');
    
    if (result.simulation.transaction.status) {
      console.log('\n✅ Transaction will succeed - safe to execute');
    } else {
      console.log('\n❌ Transaction will fail - review before executing');
      console.log('  Error:', result.simulation.transaction.transaction_info?.error_message);
    }

    // Save simulation URL if available
    if (result.simulation.simulation?.id) {
      console.log('\n🔗 Simulation URL:');
      console.log(`  https://dashboard.tenderly.co/${process.env.TENDERLY_ACCOUNT_SLUG}/${process.env.TENDERLY_PROJECT_SLUG}/simulator/${result.simulation.simulation.id}`);
    }

  } catch (error) {
    console.error('❌ Simulation failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  simulateBeforeExecution().catch(console.error);
}

module.exports = { simulateBeforeExecution };
