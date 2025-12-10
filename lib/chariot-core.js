/**
 * Chariot Core — The Eternal Traversal Engine
 * 
 * Unified integration of:
 * - Dual-Gate System (THEOS + Bridgeworld)
 * - Terminal Integration (xterm, gcloud, tn5250, SUSE)
 * - Safe{Wallet} Multi-Sig Treasury
 * - Cloud Services (GitHub, Replit, Coder)
 * 
 * "The Chariot moves between worlds"
 */

const EventEmitter = require('events');
const { UnifiedTerminal } = require('./terminal/unified-terminal');
const { BridgeworldGate } = require('./integration/bridgeworld-gate');
const { SafeWalletGate } = require('./integration/safe-wallet-gate');

class ChariotCore extends EventEmitter {
  constructor(opts = {}) {
    super();
    
    this.config = {
      name: 'Chariot',
      version: '1.0.0',
      mode: opts.mode || 'production',
      ...opts,
    };
    
    // Initialize subsystems
    this.terminal = new UnifiedTerminal(opts.terminal || {});
    this.bridgeworld = new BridgeworldGate(opts.bridgeworld || {});
    this.safeWallet = new SafeWalletGate(opts.safeWallet || {});
    
    // State
    this.initialized = false;
    this.startTime = null;
    
    // Wire up events
    this._wireEvents();
  }

  _wireEvents() {
    // Terminal events
    this.terminal.on('data', (data) => this.emit('terminal:data', data));
    this.terminal.on('close', (data) => this.emit('terminal:close', data));
    this.terminal.on('initialized', (status) => this.emit('terminal:initialized', status));
    
    // Bridgeworld events
    this.bridgeworld.on('webhook', (data) => this.emit('bridgeworld:webhook', data));
    this.bridgeworld.on('pulse', (data) => this.emit('bridgeworld:pulse', data));
    this.bridgeworld.on('traverse', (data) => this.emit('bridgeworld:traverse', data));
    this.bridgeworld.on('connected', (data) => this.emit('bridgeworld:connected', data));
    this.bridgeworld.on('error', (data) => this.emit('bridgeworld:error', data));
    
    // Safe{Wallet} events
    this.safeWallet.on('network_connected', (data) => this.emit('safe:network_connected', data));
    this.safeWallet.on('network_error', (data) => this.emit('safe:network_error', data));
    this.safeWallet.on('pending_transactions', (data) => this.emit('safe:pending_transactions', data));
    this.safeWallet.on('nonce_changed', (data) => this.emit('safe:nonce_changed', data));
    this.safeWallet.on('error', (data) => this.emit('safe:error', data));
  }

  /**
   * Initialize all subsystems
   */
  async initialize() {
    console.log('⟐ INITIALIZING CHARIOT CORE...');
    this.startTime = new Date();
    
    const results = {
      terminal: null,
      bridgeworld: null,
      safeWallet: null,
    };
    
    // Initialize terminal
    try {
      results.terminal = await this.terminal.initialize();
      console.log('✓ Terminal subsystem initialized');
    } catch (error) {
      console.error('✗ Terminal initialization failed:', error.message);
      results.terminal = { error: error.message };
    }
    
    // Initialize Bridgeworld gate (webhook ready even if API not reachable)
    try {
      results.bridgeworld = await this.bridgeworld.connect();
      if (results.bridgeworld.connected) {
        console.log('✓ Bridgeworld gate connected');
      } else {
        console.log('✓ Bridgeworld webhook gate ready (API offline)');
      }
    } catch (error) {
      console.error('✗ Bridgeworld connection failed:', error.message);
      results.bridgeworld = { error: error.message, webhookReady: true };
    }
    
    // Initialize Safe{Wallet}
    try {
      results.safeWallet = await this.safeWallet.initialize();
      console.log('✓ Safe{Wallet} initialized');
    } catch (error) {
      console.error('✗ Safe{Wallet} initialization failed:', error.message);
      results.safeWallet = { error: error.message };
    }
    
    this.initialized = true;
    console.log('⟐ CHARIOT CORE READY');
    
    this.emit('initialized', results);
    return results;
  }

  /**
   * Create terminal session
   */
  async createTerminal(type = 'local', opts = {}) {
    switch (type) {
      case 'local':
        return this.terminal.createLocalSession(opts.id);
      case 'gcloud':
        return this.terminal.createGcloudSession(opts.id);
      case 'tn5250':
        return this.terminal.createTn5250Session(opts.id, opts.host);
      case 'suse':
        return this.terminal.createSuseSession(opts.id, opts.host);
      default:
        throw new Error(`Unknown terminal type: ${type}`);
    }
  }

  /**
   * Handle incoming webhook
   */
  async handleWebhook(source, payload, signature) {
    switch (source) {
      case 'bridgeworld':
        return this.bridgeworld.handleWebhook(payload, signature);
      default:
        throw new Error(`Unknown webhook source: ${source}`);
    }
  }

  /**
   * Get Safe information
   */
  async getSafeInfo(network, address) {
    return this.safeWallet.getSafeInfo(network, address);
  }

  /**
   * Get Treasury of Light status
   */
  async getTreasuryStatus() {
    return this.safeWallet.getTreasuryStatus();
  }

  /**
   * Execute gcloud command
   */
  async gcloudExec(command, args = []) {
    return this.terminal.gcloudExec(command, args);
  }

  /**
   * Get full system status
   */
  getStatus() {
    return {
      name: this.config.name,
      version: this.config.version,
      mode: this.config.mode,
      initialized: this.initialized,
      uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
      subsystems: {
        terminal: {
          sessions: this.terminal.getSessions(),
        },
        bridgeworld: this.bridgeworld.getStatus(),
        safeWallet: this.safeWallet.getStatus(),
      },
    };
  }

  /**
   * Shutdown gracefully
   */
  async shutdown() {
    console.log('⟐ SHUTTING DOWN CHARIOT CORE...');
    
    // Close all terminal sessions
    for (const session of this.terminal.getSessions()) {
      this.terminal.close(session.id);
    }
    
    this.initialized = false;
    this.emit('shutdown');
    
    console.log('⟐ CHARIOT CORE STOPPED');
  }
}

// Express middleware factory
function createChariotMiddleware(chariot) {
  return {
    /**
     * Webhook handler middleware
     */
    webhookHandler: (req, res, next) => {
      const source = req.params.source || req.query.source || 'bridgeworld';
      const signature = req.headers['x-hub-signature-256'] || req.headers['x-signature'];
      
      chariot.handleWebhook(source, req.body, signature)
        .then((result) => {
          res.json({ success: true, ...result });
        })
        .catch((error) => {
          res.status(400).json({ success: false, error: error.message });
        });
    },
    
    /**
     * Status endpoint middleware
     */
    statusHandler: (req, res) => {
      res.json(chariot.getStatus());
    },
    
    /**
     * Treasury status endpoint middleware
     */
    treasuryHandler: async (req, res) => {
      try {
        const status = await chariot.getTreasuryStatus();
        res.json({ success: true, treasury: status });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    },
    
    /**
     * Safe info endpoint middleware
     */
    safeInfoHandler: async (req, res) => {
      const { network, address } = req.params;
      try {
        const info = await chariot.getSafeInfo(network, address);
        res.json({ success: true, safe: info });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
    },
  };
}

module.exports = { ChariotCore, createChariotMiddleware };
