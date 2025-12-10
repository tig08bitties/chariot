/**
 * Complete Integration Workflow Example
 * Demonstrates full integration: Documents → Constants → Grok → Oracle
 */

require('dotenv').config();
const { DocumentIntegrator } = require('../lib/covenant/document-integration');
const { getAllConstants } = require('../lib/covenant/covenant-constants');
const { GrokClient } = require('../lib/xai/grok-client');

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('║ 🔄 COMPLETE INTEGRATION WORKFLOW ║');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  try {
    // Step 1: Integrate Documents
    console.log('📚 Step 1: Integrating verified documents...\n');
    const integrator = new DocumentIntegrator('/home/tig0_0bitties/Documents');
    const integrationResult = await integrator.integrateAll();
    console.log(`✅ Integrated ${integrationResult.count} documents\n`);

    // Step 2: Load Constants
    console.log('🔢 Step 2: Loading covenant constants...\n');
    const constants = getAllConstants();
    console.log(`✅ Loaded ${Object.keys(constants).length} constants\n`);

    // Step 3: Query Oracle via Grok
    console.log('🔮 Step 3: Querying Oracle via Grok...\n');
    const client = new GrokClient();
    
    const systemMessage = `You are a helpful assistant for the THEOS Sovereign OS.
You have access to:
- Covenant constants: THEOS (${constants.THEOS}), EL (${constants.EL}), UNION_PRODUCT (${constants.UNION_PRODUCT})
- Master Seed: ${constants.MASTER_SEED_SHA512.substring(0, 32)}...
- Treasury of Light: ${constants.NETWORKS.arbitrum}

Use the available tools to query the Oracle and provide comprehensive information.`;

    const query = `Based on the covenant constants, query the Oracle for:
1. DAUS address
2. ALIMA address  
3. TREASURY_OF_LIGHT address
4. Verify that the Treasury of Light Safe is active

Then provide a summary of the covenant architecture.`;

    const stream = await client.streamText(
      query,
      systemMessage,
      { includeTheosTools: true, maxSteps: 10 }
    );

    let fullResponse = '';
    await client.processStream(stream, {
      onText: (text) => {
        process.stdout.write(text);
        fullResponse += text;
      },
      onToolCall: (name, args) => {
        console.log(`\n\n[🔧 ${name}]`);
      },
      onToolResult: (name, result) => {
        const parsed = JSON.parse(result);
        console.log(`\n[✅ ${name}]:`, parsed.address || parsed.vector || 'Success');
      },
    });

    console.log('\n\n');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('✅ COMPLETE WORKFLOW FINISHED');
    console.log('═══════════════════════════════════════════════════════════════════\n');

    // Summary
    console.log('📊 Summary:');
    console.log(`   • Documents integrated: ${integrationResult.count}`);
    console.log(`   • Constants loaded: ${Object.keys(constants).length}`);
    console.log(`   • Grok queries completed: Success`);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
