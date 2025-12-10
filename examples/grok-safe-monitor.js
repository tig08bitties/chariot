/**
 * Example: Monitor Safe Wallet via Grok
 * Demonstrates using Grok API to check Safe wallet status
 */

require('dotenv').config();
const { GrokClient } = require('../lib/xai/grok-client');

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('║ 🏦 GROK SAFE MONITOR EXAMPLE ║');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  try {
    const client = new GrokClient();

    const treasuryAddress = '0xb4C173AaFe428845f0b96610cf53576121BAB221';

    console.log(`📋 Query: What is the status of the Safe wallet at ${treasuryAddress}?\n`);

    const stream = await client.streamText(
      `What is the status of the Safe wallet at ${treasuryAddress}? Is it the Treasury of Light?`,
      'You are a helpful assistant for the THEOS Sovereign OS. Use the getSafeStatus tool to check Safe wallet information.',
      { includeTheosTools: true, maxSteps: 3 }
    );

    await client.processStream(stream, {
      onText: (text) => process.stdout.write(text),
      onToolCall: (name, args) => {
        console.log(`\n[🔧 Tool Call: ${name}]`);
        console.log(`   Address: ${args.safeAddress}`);
        console.log(`   Chain ID: ${args.chainId}`);
      },
      onToolResult: (name, result) => {
        const parsed = JSON.parse(result);
        console.log(`\n[✅ Tool Result: ${name}]`);
        console.log(`   Is Treasury of Light: ${parsed.isTreasuryOfLight}`);
        console.log(`   Threshold: ${parsed.threshold}`);
        console.log(`   Owners: ${parsed.owners.length}`);
        console.log(`   Status: ${parsed.status}`);
      },
    });

    console.log('\n\n');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('✅ EXAMPLE COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
