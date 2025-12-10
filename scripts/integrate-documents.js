#!/usr/bin/env node
/**
 * Document Integration Script
 * Integrates verified documents from /home/tig0_0bitties/Documents into THEOS system
 */

const { DocumentIntegrator } = require('../lib/covenant/document-integration');
const path = require('path');
const fs = require('fs').promises;

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('║ 📚 THEOS DOCUMENT INTEGRATION ║');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  try {
    const integrator = new DocumentIntegrator('/home/tig0_0bitties/Documents');

    console.log('📖 Integrating verified documents...\n');

    // Integrate all documents
    const result = await integrator.integrateAll();

    console.log(`✅ Successfully integrated ${result.count} documents:\n`);
    
    Object.entries(result.integrated).forEach(([key, doc]) => {
      console.log(`  • ${key}: ${doc.type}`);
      console.log(`    Hash: ${doc.hash.substring(0, 16)}...`);
      if (doc.extracted) {
        const extractedKeys = Object.keys(doc.extracted);
        console.log(`    Extracted: ${extractedKeys.join(', ')}`);
      }
      console.log('');
    });

    // Export to JSON
    const outputPath = path.join(__dirname, '..', 'data', 'integrated-documents.json');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await integrator.exportToJSON(outputPath);

    console.log(`📦 Exported to: ${outputPath}\n`);

    // Display summary
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('✅ DOCUMENT INTEGRATION COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════════\n');

    return result;
  } catch (error) {
    console.error('❌ Integration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
