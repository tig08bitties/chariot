#!/usr/bin/env node
/**
 * Document Integration Script
 * Integrates verified documents from /home/tig0_0bitties/Documents
 */

const { DocumentIntegration } = require('../lib/documents/document-integration');
const path = require('path');

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('║ 📚 DOCUMENT INTEGRATION - THEOS COVENANT SYSTEM ║');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const integrator = new DocumentIntegration();

  try {
    // Integrate all documents
    const results = await integrator.integrateAll();

    console.log('✅ Integration Results:\n');
    console.log(`📋 Formulas: ${results.formulas ? '✅ Extracted' : '❌ Failed'}`);
    console.log(`🏛️  Structure: ${results.structure ? '✅ Extracted' : '❌ Failed'}`);
    console.log(`✨ Cosmic Sigil: ${results.cosmicSigil ? '✅ Extracted' : '❌ Failed'}`);
    console.log(`📜 Gnostic Texts: ${results.gnosticTexts ? '✅ Extracted' : '❌ Failed'}`);
    console.log(`🔐 Crypto Metadata: ${results.cryptoMetadata ? '✅ Extracted' : '❌ Failed'}`);

    // Save integration
    const outputPath = path.join(__dirname, '../data/integrated-documents.json');
    await integrator.saveIntegration(outputPath);
    console.log(`\n💾 Saved integration to: ${outputPath}`);

    // Display summary
    console.log('\n📊 Integration Summary:');
    if (results.formulas) {
      console.log(`   Constants: ${Object.keys(results.formulas.constants || {}).length} items`);
    }
    if (results.structure) {
      console.log(`   Networks: ${Object.keys(results.structure.networks || {}).length} networks`);
    }
    if (results.cosmicSigil) {
      console.log(`   Master Seed: ${results.cosmicSigil.masterSeedHash?.substring(0, 16)}...`);
    }

    console.log('\n✅ Document integration complete!');
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Integration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
