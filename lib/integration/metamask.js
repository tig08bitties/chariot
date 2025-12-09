// MetaMaskSDKAdapter — MetaMask SDK Integration
import { MetaMaskSDKIntegration } from '../../../integrations/wallet/metamask-sdk.js';

export class MetaMaskSDKAdapter {
  constructor(opts = {}) {
    this.metamask = new MetaMaskSDKIntegration(opts);
    this.initialized = false;
  }

  async initialize(opts = {}) {
    const result = await this.metamask.initialize(opts);
    this.initialized = result.success;
    return result;
  }

  async connect() {
    return await this.metamask.connect();
  }

  async switchNetwork(networkName) {
    return await this.metamask.switchNetwork(networkName);
  }

  async getCurrentNetwork() {
    return await this.metamask.getCurrentNetwork();
  }

  getProvider(networkName) {
    return this.metamask.getProvider(networkName);
  }

  listNetworks() {
    return this.metamask.listNetworks();
  }

  getNetworkConfig(networkName) {
    return this.metamask.getNetworkConfig(networkName);
  }
}
