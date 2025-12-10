/**
 * Bridgeworld Gate Integration
 * 
 * Connects chariot to bridgeworld.lol — The Traversal Plane
 * 
 * Features:
 * - Webhook routing for workflow_job events
 * - Treasure ecosystem integration
 * - Hyperlane cross-chain messaging
 * - MetaMask/ConnectKit wallet connection
 */

const axios = require('axios');
const crypto = require('crypto');
const EventEmitter = require('events');

class BridgeworldGate extends EventEmitter {
  constructor(opts = {}) {
    super();
    
    this.config = {
      // Bridgeworld API
      apiUrl: opts.apiUrl || 'https://bridgeworld.lol/api',
      webhookSecret: opts.webhookSecret || process.env.BRIDGEWORLD_WEBHOOK_SECRET,
      
      // Treasure ecosystem
      treasureApiKey: opts.treasureApiKey || process.env.TREASURE_API_KEY,
      magicContract: opts.magicContract || '0x539bdE0d7Dbd336b79148AA742883198BBF60342',
      
      // Chain configs
      chains: {
        arbitrum: {
          chainId: 42161,
          rpc: opts.arbitrumRpc || process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
          blockscout: 'https://arbitrum.blockscout.com/api',
        },
        ethereum: {
          chainId: 1,
          rpc: opts.ethereumRpc || process.env.ETHEREUM_RPC || 'https://eth.llamarpc.com',
          blockscout: 'https://eth.blockscout.com/api',
        },
      },
      
      // Hyperlane
      hyperlaneMailbox: opts.hyperlaneMailbox || '0xc005dc82818d67AF737725bD4bf75435d065D239',
    };
    
    this.connected = false;
    this.lastPulse = null;
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload, signature) {
    if (!this.config.webhookSecret) {
      console.warn('⚠️ No webhook secret configured, skipping verification');
      return true;
    }
    
    const hmac = crypto.createHmac('sha256', this.config.webhookSecret);
    const digest = 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );
  }

  /**
   * Handle incoming webhook
   */
  async handleWebhook(payload, signature) {
    // Verify signature
    if (signature && !this.verifySignature(payload, signature)) {
      throw new Error('Invalid webhook signature');
    }
    
    const event = payload;
    const action = event.action;
    
    this.emit('webhook', { event, action });
    
    // Handle workflow_job events (operational pulses)
    if (event.workflow_job) {
      return this._handleWorkflowJob(event.workflow_job, action);
    }
    
    // Handle push events
    if (event.pusher) {
      return this._handlePush(event);
    }
    
    // Handle deployment events
    if (event.deployment) {
      return this._handleDeployment(event);
    }
    
    return { status: 'received', action };
  }

  async _handleWorkflowJob(job, action) {
    const pulse = {
      id: job.id,
      name: job.name,
      status: job.status,
      conclusion: job.conclusion,
      started_at: job.started_at,
      completed_at: job.completed_at,
      runner: job.runner_name,
    };
    
    this.lastPulse = pulse;
    this.emit('pulse', pulse);
    
    // TRAVERSE action on completion
    if (job.conclusion === 'success') {
      this.emit('traverse', {
        job: pulse,
        timestamp: new Date().toISOString(),
      });
    }
    
    return { status: 'pulse_received', pulse };
  }

  async _handlePush(event) {
    const push = {
      ref: event.ref,
      before: event.before,
      after: event.after,
      pusher: event.pusher.name,
      commits: event.commits?.length || 0,
    };
    
    this.emit('push', push);
    return { status: 'push_received', push };
  }

  async _handleDeployment(event) {
    const deployment = {
      id: event.deployment.id,
      environment: event.deployment.environment,
      ref: event.deployment.ref,
      task: event.deployment.task,
    };
    
    this.emit('deployment', deployment);
    return { status: 'deployment_received', deployment };
  }

  /**
   * Query Treasure ecosystem data
   */
  async queryTreasure(endpoint, params = {}) {
    try {
      const response = await axios.get(`https://api.treasure.lol/${endpoint}`, {
        params,
        headers: {
          'X-API-Key': this.config.treasureApiKey,
        },
      });
      return response.data;
    } catch (error) {
      this.emit('error', { source: 'treasure', error: error.message });
      throw error;
    }
  }

  /**
   * Query Blockscout for contract data
   */
  async queryBlockscout(chain, module, action, params = {}) {
    const chainConfig = this.config.chains[chain];
    if (!chainConfig) {
      throw new Error(`Unknown chain: ${chain}`);
    }
    
    try {
      const response = await axios.get(chainConfig.blockscout, {
        params: {
          module,
          action,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      this.emit('error', { source: 'blockscout', chain, error: error.message });
      throw error;
    }
  }

  /**
   * Get MAGIC token balance
   */
  async getMagicBalance(address) {
    return this.queryBlockscout('arbitrum', 'account', 'tokenbalance', {
      contractaddress: this.config.magicContract,
      address,
    });
  }

  /**
   * Get contract ABI from Blockscout
   */
  async getContractAbi(chain, address) {
    return this.queryBlockscout(chain, 'contract', 'getabi', {
      address,
    });
  }

  /**
   * Send Hyperlane cross-chain message
   */
  async sendHyperlaneMessage(destinationDomain, recipient, messageBody) {
    // This would integrate with Hyperlane SDK
    const message = {
      destination: destinationDomain,
      recipient,
      body: messageBody,
      timestamp: Date.now(),
    };
    
    this.emit('hyperlane_message', message);
    return message;
  }

  /**
   * Connect to bridgeworld.lol
   */
  async connect() {
    try {
      const response = await axios.get(`${this.config.apiUrl}/health`, {
        timeout: 5000,
      });
      this.connected = response.status === 200;
      this.emit('connected', { apiUrl: this.config.apiUrl });
      return { connected: this.connected };
    } catch (error) {
      // Bridgeworld API may not be available, but gate is still operational
      this.connected = false;
      console.log('⚠️ Bridgeworld API not reachable (webhook gate still operational)');
      return { connected: false, webhookReady: true };
    }
  }

  /**
   * Get gate status
   */
  getStatus() {
    return {
      connected: this.connected,
      lastPulse: this.lastPulse,
      chains: Object.keys(this.config.chains),
      magicContract: this.config.magicContract,
    };
  }
}

module.exports = { BridgeworldGate };
