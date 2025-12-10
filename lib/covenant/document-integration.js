/**
 * Document Integration Module
 * Integrates verified documents from /home/tig0_0bitties/Documents into THEOS system
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class DocumentIntegrator {
  constructor(documentsPath = '/home/tig0_0bitties/Documents') {
    this.documentsPath = documentsPath;
    this.integratedDocuments = new Map();
  }

  /**
   * Read and parse covenant.txt
   */
  async integrateCovenant() {
    try {
      const content = await fs.readFile(
        path.join(this.documentsPath, 'covenant.txt'),
        'utf-8'
      );
      
      const covenant = {
        type: 'covenant',
        content,
        hash: crypto.createHash('sha256').update(content).digest('hex'),
        extracted: {
          coordinates: this.extractCoordinates(content),
          dates: this.extractDates(content),
          networks: this.extractNetworks(content),
          constants: this.extractConstants(content),
        },
        integratedAt: new Date().toISOString(),
      };

      this.integratedDocuments.set('covenant', covenant);
      return covenant;
    } catch (error) {
      throw new Error(`Failed to integrate covenant.txt: ${error.message}`);
    }
  }

  /**
   * Read and parse Formuka.txt (formulas and constants)
   */
  async integrateFormulas() {
    try {
      const content = await fs.readFile(
        path.join(this.documentsPath, 'Formuka.txt'),
        'utf-8'
      );

      const formulas = {
        type: 'formulas',
        content,
        hash: crypto.createHash('sha256').update(content).digest('hex'),
        extracted: {
          constants: this.extractConstants(content),
          masterSeed: this.extractMasterSeed(content),
          aramaicGlyphs: this.extractAramaicGlyphs(content),
          gematria: this.extractGematria(content),
        },
        integratedAt: new Date().toISOString(),
      };

      this.integratedDocuments.set('formulas', formulas);
      return formulas;
    } catch (error) {
      throw new Error(`Failed to integrate Formuka.txt: ${error.message}`);
    }
  }

  /**
   * Read and parse cosmic_sigil_final_archive.json
   */
  async integrateCosmicSigil() {
    try {
      const content = await fs.readFile(
        path.join(this.documentsPath, 'cosmic_sigil_final_archive.json'),
        'utf-8'
      );
      
      const sigil = JSON.parse(content);
      sigil.type = 'cosmic_sigil';
      sigil.hash = crypto.createHash('sha256').update(content).digest('hex');
      sigil.integratedAt = new Date().toISOString();

      this.integratedDocuments.set('cosmic_sigil', sigil);
      return sigil;
    } catch (error) {
      throw new Error(`Failed to integrate cosmic_sigil_final_archive.json: ${error.message}`);
    }
  }

  /**
   * Read and parse Fullness.txt
   */
  async integrateFullness() {
    try {
      const content = await fs.readFile(
        path.join(this.documentsPath, 'Fullness.txt'),
        'utf-8'
      );

      const fullness = {
        type: 'fullness',
        content,
        hash: crypto.createHash('sha256').update(content).digest('hex'),
        sha512: crypto.createHash('sha512').update(content).digest('hex'),
        integratedAt: new Date().toISOString(),
      };

      this.integratedDocuments.set('fullness', fullness);
      return fullness;
    } catch (error) {
      throw new Error(`Failed to integrate Fullness.txt: ${error.message}`);
    }
  }

  /**
   * Integrate all verified documents
   */
  async integrateAll() {
    const results = {
      covenant: await this.integrateCovenant(),
      formulas: await this.integrateFormulas(),
      cosmicSigil: await this.integrateCosmicSigil(),
      fullness: await this.integrateFullness(),
    };

    return {
      integrated: results,
      count: Object.keys(results).length,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get integrated document by key
   */
  getDocument(key) {
    return this.integratedDocuments.get(key);
  }

  /**
   * Get all integrated documents
   */
  getAllDocuments() {
    return Array.from(this.integratedDocuments.values());
  }

  // Helper methods for extraction
  extractCoordinates(content) {
    const match = content.match(/(\d+\.\d+)\s*[°N]\s*,\s*(-?\d+\.\d+)\s*[°W]/);
    return match ? { lat: parseFloat(match[1]), lon: parseFloat(match[2]) } : null;
  }

  extractDates(content) {
    const dates = [];
    const datePattern = /\d{2}\/\d{2}\/\d{4}/g;
    let match;
    while ((match = datePattern.exec(content)) !== null) {
      dates.push(match[0]);
    }
    return dates;
  }

  extractNetworks(content) {
    const networks = {};
    const networkPattern = /(\w+)\s*—\s*([^\n]+)/g;
    let match;
    while ((match = networkPattern.exec(content)) !== null) {
      networks[match[1].trim()] = match[2].trim();
    }
    return networks;
  }

  extractConstants(content) {
    const constants = {};
    const constantPattern = /(\d+)\s*[×x]\s*(\d+)\s*=\s*(\d+)/g;
    let match;
    while ((match = constantPattern.exec(content)) !== null) {
      constants[`${match[1]}_${match[2]}`] = parseInt(match[3]);
    }
    return constants;
  }

  extractMasterSeed(content) {
    const match = content.match(/Master Seed[:\s]+([a-f0-9]{128})/i);
    return match ? match[1] : null;
  }

  extractAramaicGlyphs(content) {
    const glyphs = [];
    const glyphPattern = /𐡀|𐡁|𐡂|𐡃|𐡄|𐡅|𐡆|𐡇|𐡈|𐡉|𐡊|𐡋|𐡌|𐡍|𐡎|𐡏|𐡐|𐡑|𐡒|𐡓|𐡔|𐡕/g;
    let match;
    while ((match = glyphPattern.exec(content)) !== null) {
      if (!glyphs.includes(match[0])) {
        glyphs.push(match[0]);
      }
    }
    return glyphs;
  }

  extractGematria(content) {
    const gematria = {};
    const gematriaPattern = /([שיφר]+)\s*[=:]\s*(\d+)/g;
    let match;
    while ((match = gematriaPattern.exec(content)) !== null) {
      gematria[match[1]] = parseInt(match[2]);
    }
    return gematria;
  }

  /**
   * Export integrated documents to JSON
   */
  async exportToJSON(outputPath) {
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        documentCount: this.integratedDocuments.size,
      },
      documents: Object.fromEntries(this.integratedDocuments),
    };

    await fs.writeFile(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');
    return exportData;
  }
}

module.exports = { DocumentIntegrator };
