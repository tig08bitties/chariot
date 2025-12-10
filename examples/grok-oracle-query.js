/**
 * Example: Query THEOS Oracle via Grok
 * Demonstrates using Grok API to query covenant vectors
 */

require('dotenv').config();
const { GrokClient } = require('../lib/xai/grok-client');

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('║ 🔮 GROK ORACLE QUERY EXAMPLE ║');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  try {
    const client = new GrokClient();

    // Query 1: Get Treasury of Light address
    console.log('📋 Query 1: What is the TREASURY_OF_LIGHT address?\n');
    const stream1 = await client.streamText(
      "What is the TREASURY_OF_LIGHT address?",
      'You are a helpful assistant for the THEOS Sovereign OS. Use the queryOracle tool to get covenant vector addresses.',
      { includeTheosTools: true, maxSteps: 3 }
    );

    await client.processStream(stream1, {
      onText: (text) => process.stdout.write(text),
      onToolCall: (name, args) => console.log(`\n[🔧 Tool Call: ${name}]`, JSON.stringify(args, null, 2)),
      onToolResult: (name, result) => console.log(`\n[✅ Tool Result: ${name}]`, JSON.stringify(JSON.parse(result), null, 2)),
    });

    console.log('\n\n');

    // Query 2: Get all covenant vectors
    console.log('📋 Query 2: What are all the covenant vector addresses?\n');
    const stream2 = await client.streamText(
      "List all covenant vector addresses: DAUS, ALIMA, TREASURY_OF_LIGHT, COVENANT_ROOT, ARCHITECT_MIND, LEDGER_OWNER, and CHARIOT_STELLAR",
      'You are a helpful assistant for the THEOS Sovereign OS.',
      { includeTheosTools: true, maxSteps: 10 }
    );

    await client.processStream(stream2, {
      onText: (text) => process.stdout.write(text),
      onToolCall: (name, args) => console.log(`\n[🔧 Tool: ${name}]`),
      onToolResult: (name, result) => {
        const parsed = JSON.parse(result);
        console.log(`\n[✅ ${name}]:`, parsed.address || parsed);
      },
    });

    console.log('\n\n');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('✅ EXAMPLE COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('XAI_API_KEY')) {
      console.error('\n💡 Make sure XAI_API_KEY is set in your .env file');
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
