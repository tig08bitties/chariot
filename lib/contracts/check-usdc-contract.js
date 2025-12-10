/**
 * Check USDC Contract on Blockscout
 * 
 * Example: https://eth.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
 * USDC Token on Ethereum Mainnet
 */

require('dotenv').config();
const { BlockscoutClient } = require('./blockscout-client');

const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

async function checkUSDCContract() {
  console.log('🔍 Checking USDC Contract on Blockscout...\n');
  console.log('Address:', USDC_ADDRESS);
  console.log('Network: Ethereum Mainnet');
  console.log('');

  const blockscout = new BlockscoutClient('ethereum');

  try {
    // Get contract information
    console.log('📋 Getting contract information...');
    const contractInfo = await blockscout.getContract(USDC_ADDRESS);
    console.log('✅ Contract found\n');
    console.log('Contract Details:');
    console.log('  Address:', contractInfo.hash || USDC_ADDRESS);
    console.log('  Type:', contractInfo.is_contract ? 'Contract' : 'EOA');
    console.log('  Name:', contractInfo.name || 'N/A');
    console.log('  Is Token:', contractInfo.is_token || false);
    console.log('  Token Type:', contractInfo.token?.type || 'N/A');
    console.log('');

    // Get token information
    console.log('🪙 Getting token information...');
    try {
      const tokenInfo = await blockscout.getTokenInfo(USDC_ADDRESS);
      console.log('✅ Token information retrieved\n');
      console.log('Token Details:');
      console.log('  Name:', tokenInfo.name || 'N/A');
      console.log('  Symbol:', tokenInfo.symbol || 'N/A');
      console.log('  Decimals:', tokenInfo.decimals || 'N/A');
      console.log('  Total Supply:', tokenInfo.total_supply || 'N/A');
      console.log('  Type:', tokenInfo.type || 'N/A');
      console.log('');
    } catch (tokenError) {
      console.log('⚠️  Token information not available:', tokenError.message);
      console.log('');
    }

    // Get source code
    console.log('📄 Getting source code...');
    try {
      const sourceCode = await blockscout.getContractSourceCode(USDC_ADDRESS);
      console.log('✅ Source code retrieved\n');
      console.log('Source Code Details:');
      console.log('  Compiler Version:', sourceCode.compiler_version || 'N/A');
      console.log('  Optimization:', sourceCode.optimization_enabled ? 'Yes' : 'No');
      console.log('  Contract Name:', sourceCode.name || 'N/A');
      console.log('  Is Verified:', sourceCode.is_verified || false);
      console.log('  Has Source Code:', !!sourceCode.source_code);
      
      if (sourceCode.source_code) {
        const codeLength = sourceCode.source_code.length;
        console.log('  Source Code Length:', codeLength, 'characters');
        console.log('  Source Code Preview:', sourceCode.source_code.substring(0, 100) + '...');
      }
      console.log('');
    } catch (sourceError) {
      console.log('⚠️  Source code not available:', sourceError.message);
      console.log('   Contract may not be verified');
      console.log('');
    }

    // Get ABI
    console.log('📋 Getting ABI...');
    try {
      const abi = await blockscout.getContractABI(USDC_ADDRESS);
      console.log('✅ ABI retrieved\n');
      console.log('ABI Details:');
      console.log('  Functions:', abi.filter(item => item.type === 'function').length);
      console.log('  Events:', abi.filter(item => item.type === 'event').length);
      console.log('  Errors:', abi.filter(item => item.type === 'error').length);
      console.log('  Total Items:', abi.length);
      console.log('');
    } catch (abiError) {
      console.log('⚠️  ABI not available:', abiError.message);
      console.log('');
    }

    // Get URLs
    console.log('🔗 Blockscout URLs:');
    console.log('  Contract:', blockscout.getContractURL(USDC_ADDRESS));
    console.log('  Token:', blockscout.getTokenURL(USDC_ADDRESS));
    console.log('');

    console.log('✅ Contract check complete');

  } catch (error) {
    console.error('\n❌ Contract Check Failed\n');
    console.error('Error Details:');
    console.error('  Message:', error.message);
    
    if (error.status) {
      console.error('  HTTP Status:', error.status);
      console.error('  Status Text:', error.statusText);
    }
    
    if (error.responseData) {
      console.error('  Response Data:', JSON.stringify(error.responseData, null, 2));
    }
    
    console.error('\n💡 Troubleshooting:');
    console.error('  1. Check network connectivity');
    console.error('  2. Verify contract address is correct');
    console.error('  3. Ensure Blockscout API is accessible');
    console.error('  4. Check if contract exists on network');
    
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  checkUSDCContract().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { checkUSDCContract };
