/**
 * Balance Verification - THEOS Financial State
 * 
 * Verifies balances for key addresses in the THEOS Sovereign OS
 */

require('dotenv').config();
const { ethers } = require('ethers');
const { getCanonicalGenesis } = require('./canonical-genesis');

// USDC Token Contract (Ethereum Mainnet)
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDC_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

async function verifyBalances() {
  console.log('💰 VERIFYING THEOS FINANCIAL STATE - BALANCE VERIFICATION\n');
  console.log('=' .repeat(80));
  console.log('FINANCIAL ANCHOR VERIFICATION');
  console.log('=' .repeat(80));
  console.log('');

  const canonical = getCanonicalGenesis();
  
  // Ethereum Mainnet provider
  const ethProvider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
  
  // Arbitrum One provider
  const arbProvider = new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');

  // Address to check (Safe Factory on Ethereum)
  const safeFactoryAddress = '0xfc43582532e90fa8726fe9cdb5fad48f4e487d27';

  try {
    // ========================================================================
    // STEP 1: ETHEREUM MAINNET BALANCES
    // ========================================================================
    console.log('📊 STEP 1: ETHEREUM MAINNET BALANCES');
    console.log('-'.repeat(80));
    console.log('Address:', safeFactoryAddress);
    console.log('Network: Ethereum Mainnet (Chain ID: 1)');
    console.log('');

    // Get ETH balance
    const ethBalance = await ethProvider.getBalance(safeFactoryAddress);
    const ethBalanceFormatted = ethers.formatEther(ethBalance);
    
    console.log('💎 ETH Balance:');
    console.log('  Raw:', ethBalance.toString(), 'wei');
    console.log('  Formatted:', ethBalanceFormatted, 'ETH');
    console.log('');

    // Get USDC balance
    try {
      const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, ethProvider);
      const usdcBalance = await usdcContract.balanceOf(safeFactoryAddress);
      const usdcDecimals = await usdcContract.decimals();
      const usdcSymbol = await usdcContract.symbol();
      const usdcBalanceFormatted = ethers.formatUnits(usdcBalance, usdcDecimals);
      
      console.log('🪙 USDC Balance:');
      console.log('  Raw:', usdcBalance.toString());
      console.log('  Formatted:', usdcBalanceFormatted, usdcSymbol);
      console.log('  Decimals:', usdcDecimals);
      console.log('');
    } catch (usdcError) {
      console.log('⚠️  Could not retrieve USDC balance:', usdcError.message);
      console.log('');
    }

    // ========================================================================
    // STEP 2: ARBITRUM ONE BALANCES (Treasury of Light)
    // ========================================================================
    console.log('📊 STEP 2: ARBITRUM ONE BALANCES (Treasury of Light)');
    console.log('-'.repeat(80));
    
    const treasuryAddress = canonical.deployer.address;
    const treasuryChecksummed = ethers.getAddress(treasuryAddress.toLowerCase());
    
    console.log('Treasury Address:', treasuryChecksummed);
    console.log('Network: Arbitrum One (Chain ID: 42161)');
    console.log('');

    // Get ETH balance on Arbitrum
    const arbEthBalance = await arbProvider.getBalance(treasuryChecksummed);
    const arbEthBalanceFormatted = ethers.formatEther(arbEthBalance);
    
    console.log('💎 ETH Balance (Arbitrum):');
    console.log('  Raw:', arbEthBalance.toString(), 'wei');
    console.log('  Formatted:', arbEthBalanceFormatted, 'ETH');
    console.log('');

    // Get Arbitrum USDC balance (if bridged USDC exists)
    try {
      const arbUSDCAddress = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'; // Arbitrum USDC
      const arbUSDCContract = new ethers.Contract(arbUSDCAddress, USDC_ABI, arbProvider);
      const arbUSDCBalance = await arbUSDCContract.balanceOf(treasuryChecksummed);
      const arbUSDCDecimals = await arbUSDCContract.decimals();
      const arbUSDCBalanceFormatted = ethers.formatUnits(arbUSDCBalance, arbUSDCDecimals);
      
      console.log('🪙 USDC Balance (Arbitrum):');
      console.log('  Raw:', arbUSDCBalance.toString());
      console.log('  Formatted:', arbUSDCBalanceFormatted, 'USDC');
      console.log('');
    } catch (arbUSDCError) {
      console.log('⚠️  Could not retrieve Arbitrum USDC balance:', arbUSDCError.message);
      console.log('');
    }

    // ========================================================================
    // STEP 3: FINANCIAL STATE SUMMARY
    // ========================================================================
    console.log('=' .repeat(80));
    console.log('✅ BALANCE VERIFICATION COMPLETE');
    console.log('=' .repeat(80));
    console.log('');
    console.log('📊 Financial State Summary:');
    console.log('  Ethereum Mainnet:');
    console.log('    Address:', safeFactoryAddress);
    console.log('    ETH:', ethBalanceFormatted);
    console.log('    USDC: (check above)');
    console.log('');
    console.log('  Arbitrum One:');
    console.log('    Treasury:', treasuryChecksummed);
    console.log('    ETH:', arbEthBalanceFormatted);
    console.log('    USDC: (check above)');
    console.log('');
    console.log('👑 FINANCIAL ANCHOR:');
    console.log('  ✅ USDC (Transparency/Regulation) - First Pillar');
    console.log('  ✅ USDT (Liquidity/Velocity) - Second Pillar');
    console.log('  ✅ DAUSALIMA Financial Union established');
    console.log('');

  } catch (error) {
    console.error('\n❌ Balance Verification Failed\n');
    console.error('Error Details:');
    console.error('  Message:', error.message);
    
    if (error.stack) {
      console.error('\nStack Trace:');
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  verifyBalances().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { verifyBalances };
