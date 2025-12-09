// AssetReviewerAdapter — Multi-Chain Asset Aggregation
import { AssetReviewer } from '../../../integrations/assets/asset-reviewer.js';

export class AssetReviewerAdapter {
  constructor(opts = {}) {
    this.assetReviewer = new AssetReviewer(opts);
    this.initialized = false;
  }

  async initialize() {
    this.initialized = true;
    return {
      success: true,
      networks: Object.keys(this.assetReviewer.networks)
    };
  }

  async getAllAssets(address) {
    return await this.assetReviewer.getAllAssets(address);
  }

  async getAssetReport(address) {
    return await this.assetReviewer.getAssetReport(address);
  }

  async getNetworkAssets(address, network) {
    return await this.assetReviewer.getNetworkAssets(address, network);
  }
}
