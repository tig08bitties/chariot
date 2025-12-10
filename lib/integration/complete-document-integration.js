/**
 * Complete Document Integration
 * Integrates all verified documents into THEOS system
 */

const { DocumentIntegration } = require('../documents/document-integration');
const { COVENANT_FORMULAS } = require('../documents/covenant-formulas-integrated');
const { StellarSDKIntegration } = require('../stellar/stellar-sdk-integration');
const { StellariumIntegration } = require('../stellar/stellarium-integration');

class CompleteDocumentIntegration {
  constructor() {
    this.docIntegrator = new DocumentIntegration();
    this.stellar = new StellarSDKIntegration({ network: 'testnet' });
    this.stellarium = new StellariumIntegration();
    this.integrated = false;
  }

  /**
   * Initialize all integrations
   */
  async initialize() {
    console.log('🔧 Initializing document integration...\n');

    // Integrate documents
    const documents = await this.docIntegrator.integrateAll();

    // Initialize Stellar
    await this.stellar.initialize();

    this.integrated = true;

    return {
      documents,
      stellar: {
        initialized: true,
        network: this.stellar.network,
      },
      stellarium: {
        initialized: true,
      },
    };
  }

  /**
   * Get complete integrated data
   */
  getIntegratedData() {
    if (!this.integrated) {
      throw new Error('Integration not initialized. Call initialize() first.');
    }

    return {
      formulas: this.docIntegrator.getDocument('formulas'),
      structure: this.docIntegrator.getDocument('structure'),
      cosmicSigil: this.docIntegrator.getDocument('cosmicSigil'),
      gnosticTexts: this.docIntegrator.getDocument('gnosticTexts'),
      covenantFormulas: COVENANT_FORMULAS,
      stellar: {
        chariotAddress: this.stellar.chariotAddress,
      },
      stellarium: {
        alignment: this.stellarium.getCovenantAlignment(),
        resonance: this.stellarium.getTemporalResonance(),
      },
    };
  }

  /**
   * Store covenant data on Stellar
   */
  async storeOnStellar() {
    const cosmicSigil = this.docIntegrator.getDocument('cosmicSigil');
    
    if (!cosmicSigil) {
      throw new Error('Cosmic sigil not integrated');
    }

    // Store covenant seal
    const sealResult = await this.stellar.storeCovenantSeal(cosmicSigil.seal);
    
    // Store master seed hash
    const seedResult = await this.stellar.setDataEntry(
      'MASTER_SEED_HASH',
      cosmicSigil.masterSeedHash
    );

    return {
      seal: sealResult,
      seed: seedResult,
    };
  }

  /**
   * Get complete integration report
   */
  async getIntegrationReport() {
    const data = this.getIntegratedData();

    return {
      timestamp: new Date().toISOString(),
      status: 'integrated',
      components: {
        documents: {
          formulas: !!data.formulas,
          structure: !!data.structure,
          cosmicSigil: !!data.cosmicSigil,
          gnosticTexts: !!data.gnosticTexts,
        },
        stellar: {
          initialized: true,
          chariotAddress: data.stellar.chariotAddress,
        },
        stellarium: {
          initialized: true,
          alignment: data.stellarium.alignment,
        },
      },
      summary: {
        totalFormulas: Object.keys(data.covenantFormulas || {}).length,
        totalNetworks: Object.keys(data.structure?.networks || {}).length,
        masterSeedHash: data.cosmicSigil?.masterSeedHash?.substring(0, 16) + '...',
      },
    };
  }
}

module.exports = { CompleteDocumentIntegration };
