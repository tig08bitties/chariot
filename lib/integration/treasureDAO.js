// TreasureDAOAdapter — Full Implementation
// Replaces stub with complete TreasureDAO integration
import { TreasureDAO } from '../../../integrations/theos/TreasureDAO.js';

export class TreasureDAOAdapter {
  constructor({ magicToken = 'MAGIC', treasury, bridgeworld, network = 'arbitrum', chainId = 42161 } = {}) {
    this.magicToken = magicToken;
    this.treasury = treasury || '0xf9E197Aa9fa7C3b27A1A1313CaD5851B55F2FD71';
    this.bridgeworld = bridgeworld || '0x81FA605235E4c32d8b440eEBE43D82e9E083166b';
    
    // Initialize full TreasureDAO instance
    this.treasureDAO = new TreasureDAO({
      network,
      chainId,
      magicToken,
      treasury: this.treasury,
      bridgeworld: this.bridgeworld
    });
    
    this.initialized = false;
  }

  async initialize(provider = null, signer = null) {
    const result = await this.treasureDAO.initialize(provider, signer);
    this.initialized = result.success;
    return result;
  }

  async getMagicBalance(address) {
    return await this.treasureDAO.getMagicBalance(address);
  }

  async transferMagic(to, amount) {
    return await this.treasureDAO.transferMagic(to, amount);
  }

  async approveMagic(spender, amount) {
    return await this.treasureDAO.approveMagic(spender, amount);
  }

  async getPlayerAssets(address) {
    return await this.treasureDAO.getPlayerAssets(address);
  }

  async activateAtlasPortal(address, options = {}) {
    return await this.treasureDAO.activateAtlasPortal(address, options);
  }

  async interact(fn, params) {
    if (!this.initialized) await this.initialize();
    // Delegate to TreasureDAO instance
    if (typeof this.treasureDAO[fn] === 'function') {
      return await this.treasureDAO[fn](...params);
    }
    return { success: false, error: `Function ${fn} not found` };
  }

  // Expose full TreasureDAO instance for advanced usage
  getTreasureDAO() {
    return this.treasureDAO;
  }
}
