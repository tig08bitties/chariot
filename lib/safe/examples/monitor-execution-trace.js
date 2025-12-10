/**
 * Example: Monitor Safe Transaction Execution with Full Trace
 * 
 * This script demonstrates how to monitor a Treasury of Light transaction
 * after execution, including full trace analysis from Tenderly.
 */

require('dotenv').config();
const { ethers } = require('ethers');
const { SafeTenderlyIntegration } = require('../../integration/safe-tenderly-integration');

// Treasury of Light address
const TREASURY_OF_LIGHT = '0xb4C173AaFe428845f0b96610cf53576121BAB221';

async function monitorExecution(txHash) {
  if (!txHash) {
    console.error('❌ Please provide a transaction hash');
    console.log('Usage: node monitor-execution-trace.js <txHash>');
    process.exit(1);
  }

  console.log('🔍 Monitoring Safe Transaction Execution...\n');
  console.log('Transaction Hash:', txHash);
  console.log('Safe Address:', TREASURY_OF_LIGHT);
  console.log('');

  // Initialize provider (Arbitrum One)
  const provider = new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');

  // Initialize integration
  const integration = new SafeTenderlyIntegration(
    provider,
    null,
    process.env.TENDERLY_API_KEY,
    process.env.TENDERLY_ACCOUNT_SLUG,
    process.env.TENDERLY_PROJECT_SLUG,
    'arbitrum'
  );

  try {
    // Monitor transaction
    const result = await integration.monitorSafeTransaction(
      TREASURY_OF_LIGHT,
      txHash
    );

    console.log('✅ Monitoring Complete\n');
    
    // Transaction Details
    console.log('📊 Transaction Details:');
    console.log('  Hash:', result.transaction.hash);
    console.log('  Status:', result.transaction.status ? 'Success ✅' : 'Failed ❌');
    console.log('  Block Number:', result.transaction.block_number);
    console.log('  Gas Used:', result.transaction.gas_used);
    console.log('  Gas Price:', result.transaction.gas_price, 'wei');
    console.log('  From:', result.transaction.from);
    console.log('  To:', result.transaction.to);
    console.log('  Value:', ethers.formatEther(result.transaction.value || '0'), 'ETH');

    // Safe Information
    console.log('\n🏛️ Safe Information:');
    console.log('  Address:', result.safe.address);
    console.log('  Owners:', result.safe.owners.join(', '));
    console.log('  Threshold:', `${result.safe.threshold}-of-${result.safe.owners.length}`);
    console.log('  Balance:', result.safe.balance, 'ETH');

    // Trace Information
    if (result.trace && result.trace.length > 0) {
      console.log('\n🔍 Transaction Trace:');
      console.log('  Total Calls:', result.trace.length);
      
      result.trace.forEach((call, index) => {
        console.log(`\n  Call ${index + 1}:`);
        console.log('    Type:', call.type);
        console.log('    From:', call.from);
        console.log('    To:', call.to);
        console.log('    Value:', ethers.formatEther(call.value || '0'), 'ETH');
        if (call.input) {
          console.log('    Input:', call.input.substring(0, 66) + '...');
        }
        if (call.output) {
          console.log('    Output:', call.output.substring(0, 66) + '...');
        }
        if (call.error) {
          console.log('    Error:', call.error);
        }
      });
    }

    // Safe Transaction Details
    if (result.safeTransaction) {
      console.log('\n📋 Safe Transaction Details:');
      console.log('  Safe Tx Hash:', result.safeTransaction.safeTxHash);
      console.log('  Executor:', result.safeTransaction.executor);
      console.log('  Is Executed:', result.safeTransaction.isExecuted);
      console.log('  Confirmations:', result.safeTransaction.confirmations?.length || 0);
    }

    // Tenderly URL
    console.log('\n🔗 View on Tenderly:');
    console.log(`  https://dashboard.tenderly.co/${process.env.TENDERLY_ACCOUNT_SLUG}/${process.env.TENDERLY_PROJECT_SLUG}/tx/${result.networkId}/${txHash}`);

    // Arbiscan URL
    console.log('\n🔗 View on Arbiscan:');
    console.log(`  https://arbiscan.io/tx/${txHash}`);

  } catch (error) {
    console.error('❌ Monitoring failed:', error.message);
    if (error.response) {
      console.error('  Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Get transaction hash from command line
const txHash = process.argv[2];

// Run if executed directly
if (require.main === module) {
  monitorExecution(txHash).catch(console.error);
}

module.exports = { monitorExecution };
