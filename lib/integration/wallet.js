// WalletAdapter — Multi-Wallet Integration
import { WalletAdapter } from '../../../integrations/wallet/wallet-adapter.js';

export class WalletAdapterIntegration {
  constructor(opts = {}) {
    this.walletAdapter = new WalletAdapter(opts);
    this.initialized = false;
  }

  async initialize() {
    this.initialized = true;
    return {
      success: true,
      supportedTypes: this.walletAdapter.supportedTypes
    };
  }

  async connectAutonomys(opts = {}) {
    return await this.walletAdapter.connectAutonomys(opts);
  }

  async connectMetaMask() {
    return await this.walletAdapter.connectMetaMask();
  }

  async connectWalletConnect(opts = {}) {
    return await this.walletAdapter.connectWalletConnect(opts);
  }

  async connectGeneric(opts = {}) {
    return await this.walletAdapter.connectGeneric(opts);
  }

  getActiveWallet() {
    return this.walletAdapter.getActiveWallet();
  }

  getProvider() {
    return this.walletAdapter.getProvider();
  }

  getSigner() {
    return this.walletAdapter.getSigner();
  }

  async getAddress() {
    return await this.walletAdapter.getAddress();
  }

  async sendTransaction(tx) {
    return await this.walletAdapter.sendTransaction(tx);
  }

  async signMessage(message) {
    return await this.walletAdapter.signMessage(message);
  }

  disconnect() {
    return this.walletAdapter.disconnect();
  }
}
