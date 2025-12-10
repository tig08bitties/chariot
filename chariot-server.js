#!/usr/bin/env node

/**
 * 🚀 CHARIOT SERVER
 * 
 * Unified server combining:
 * - Dual-Gate webhooks (THEOS + Bridgeworld)
 * - Terminal WebSocket (xterm, gcloud, tn5250, SUSE)
 * - Safe{Wallet} API
 * - Health monitoring
 * 
 * Run: node chariot-server.js
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const { ChariotCore, createChariotMiddleware } = require('./lib/chariot-core');
const DualGateServer = require('./lib/webhook/dual-gate-server');
const { CovenantPortal, COVENANT_CONSTANTS, HEBREW_GUARDIANS, FOUR_CHAMBERS } = require('./lib/integration/covenant-portal');

// Configuration
const config = {
  port: process.env.PORT || 3333,
  
  // Dual-Gate secrets
  theosSecret: process.env.THEOS_WEBHOOK_SECRET,
  bridgeworldSecret: process.env.BRIDGEWORLD_WEBHOOK_SECRET,
  
  // Terminal config
  terminal: {
    gcloudProject: process.env.GCLOUD_PROJECT,
    gcloudZone: process.env.GCLOUD_ZONE,
    tn5250Host: process.env.TN5250_HOST,
    suseHost: process.env.SUSE_HOST,
    suseUser: process.env.SUSE_USER,
  },
  
  // Bridgeworld config
  bridgeworld: {
    webhookSecret: process.env.BRIDGEWORLD_WEBHOOK_SECRET,
    treasureApiKey: process.env.TREASURE_API_KEY,
    arbitrumRpc: process.env.ARBITRUM_RPC,
    ethereumRpc: process.env.ETHEREUM_RPC,
  },
  
  // Safe{Wallet} config
  safeWallet: {
    arbitrumRpc: process.env.ARBITRUM_RPC,
    ethereumRpc: process.env.ETHEREUM_RPC,
    optimismRpc: process.env.OPTIMISM_RPC,
    baseRpc: process.env.BASE_RPC,
    treasuryArbitrum: process.env.TREASURY_ARBITRUM,
    treasuryEthereum: process.env.TREASURY_ETHEREUM,
    signerKey: process.env.SAFE_SIGNER_KEY,
  },
};

// Initialize Chariot Core
const chariot = new ChariotCore(config);
const middleware = createChariotMiddleware(chariot);

// Initialize Covenant Portal
const covenantPortal = new CovenantPortal({
  provider: chariot.safeWallet?.providers?.arbitrum,
  network: 'arbitrum',
});

// Create Express app
const app = express();
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// === ROUTES ===

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    chariot: chariot.getStatus(),
    timestamp: new Date().toISOString(),
  });
});

// Chariot status
app.get('/status', middleware.statusHandler);

// === WEBHOOK ROUTES ===

// THEOS Gate webhook
app.post('/theos/webhook', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  
  chariot.handleWebhook('theos', req.body, signature)
    .then((result) => {
      console.log('🜂 THEOS webhook processed:', result);
      res.json({ success: true, gate: 'theos', ...result });
    })
    .catch((error) => {
      console.error('🜂 THEOS webhook error:', error.message);
      res.status(400).json({ success: false, error: error.message });
    });
});

// Bridgeworld Gate webhook
app.post('/bridgeworld/webhook', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  
  chariot.handleWebhook('bridgeworld', req.body, signature)
    .then((result) => {
      console.log('🌉 Bridgeworld webhook processed:', result);
      res.json({ success: true, gate: 'bridgeworld', ...result });
    })
    .catch((error) => {
      console.error('🌉 Bridgeworld webhook error:', error.message);
      res.status(400).json({ success: false, error: error.message });
    });
});

// Unified webhook (auto-routes based on payload)
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const event = req.headers['x-github-event'];
  
  // Route based on event type
  const source = (event === 'workflow_run') ? 'theos' : 'bridgeworld';
  
  chariot.handleWebhook(source, req.body, signature)
    .then((result) => {
      res.json({ success: true, gate: source, ...result });
    })
    .catch((error) => {
      res.status(400).json({ success: false, error: error.message });
    });
});

// === SAFE{WALLET} ROUTES ===

// Treasury status
app.get('/treasury', middleware.treasuryHandler);

// Safe info
app.get('/safe/:network/:address', middleware.safeInfoHandler);

// Safe balances
app.get('/safe/:network/:address/balances', async (req, res) => {
  const { network, address } = req.params;
  try {
    const balances = await chariot.safeWallet.getBalances(network, address);
    res.json({ success: true, balances });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Safe pending transactions
app.get('/safe/:network/:address/pending', async (req, res) => {
  const { network, address } = req.params;
  try {
    const pending = await chariot.safeWallet.getPendingTransactions(network, address);
    res.json({ success: true, pending });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Safe transaction history
app.get('/safe/:network/:address/history', async (req, res) => {
  const { network, address } = req.params;
  const limit = parseInt(req.query.limit) || 20;
  try {
    const history = await chariot.safeWallet.getTransactionHistory(network, address, limit);
    res.json({ success: true, history });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// === TERMINAL ROUTES ===

// List terminal sessions
app.get('/terminal/sessions', (req, res) => {
  res.json({
    success: true,
    sessions: chariot.terminal.getSessions(),
  });
});

// Create terminal session
app.post('/terminal/create', async (req, res) => {
  const { type, id, host } = req.body;
  try {
    const session = await chariot.createTerminal(type || 'local', { id, host });
    res.json({ success: true, session: { id: session.id, type: session.type } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// gcloud command execution
app.post('/terminal/gcloud', async (req, res) => {
  const { command, args } = req.body;
  try {
    const result = await chariot.gcloudExec(command, args || []);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// tn5250 login
app.post('/terminal/tn5250/login', async (req, res) => {
  const { sessionId, user, password } = req.body;
  try {
    const result = await chariot.terminal.tn5250Login(
      sessionId,
      user || process.env.TN5250_USER,
      password || process.env.TN5250_PASSWORD
    );
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Create tn5250 session with auto-login
app.post('/terminal/tn5250', async (req, res) => {
  const { host, user, password, autoLogin } = req.body;
  try {
    const session = await chariot.terminal.createTn5250Session(
      `tn5250-${Date.now()}`,
      host || process.env.TN5250_HOST || 'pub400.com',
      {
        user: user || process.env.TN5250_USER,
        password: password || process.env.TN5250_PASSWORD,
      }
    );
    
    // Auto-login if requested
    if (autoLogin !== false && (user || process.env.TN5250_USER)) {
      setTimeout(async () => {
        try {
          await chariot.terminal.tn5250Login(
            session.id,
            user || process.env.TN5250_USER,
            password || process.env.TN5250_PASSWORD
          );
        } catch (e) {
          console.error('Auto-login failed:', e.message);
        }
      }, 3000);
    }
    
    res.json({ 
      success: true, 
      session: { 
        id: session.id, 
        type: session.type,
        host: session.host,
        user: session.user,
      } 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// === COVENANT PORTAL ROUTES ===

// Covenant Portal status
app.get('/covenant', async (req, res) => {
  try {
    if (!covenantPortal.initialized) {
      await covenantPortal.initialize();
    }
    res.json(covenantPortal.getStatus());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Covenant constants
app.get('/covenant/constants', (req, res) => {
  res.json({
    success: true,
    constants: COVENANT_CONSTANTS,
  });
});

// Four Chambers
app.get('/covenant/chambers', (req, res) => {
  res.json({
    success: true,
    chambers: FOUR_CHAMBERS,
  });
});

// Single Chamber
app.get('/covenant/chambers/:name', (req, res) => {
  const chamber = covenantPortal.getChamberStatus(req.params.name);
  if (!chamber) {
    return res.status(404).json({ error: 'Chamber not found' });
  }
  res.json({ success: true, chamber });
});

// Hebrew Guardians
app.get('/covenant/guardians', (req, res) => {
  res.json({
    success: true,
    count: HEBREW_GUARDIANS.length,
    guardians: HEBREW_GUARDIANS,
  });
});

// Single Guardian
app.get('/covenant/guardians/:path', (req, res) => {
  const guardian = covenantPortal.getGuardian(parseInt(req.params.path));
  if (!guardian) {
    return res.status(404).json({ error: 'Guardian not found' });
  }
  
  res.json({
    success: true,
    guardian,
    questMultiplier: covenantPortal.calculateQuestMultiplier(guardian.path),
    harvesterBoost: covenantPortal.calculateHarvesterBoost(guardian.path),
    aiContext: covenantPortal.getGuardianAIContext(guardian.path),
  });
});

// Treasure DAO status
app.get('/covenant/treasure', (req, res) => {
  res.json({
    success: true,
    treasureDAO: covenantPortal.getTreasureDAOStatus(),
  });
});

// MAGIC balance
app.get('/covenant/magic/:address', async (req, res) => {
  try {
    const balance = await covenantPortal.getMagicBalance(req.params.address);
    res.json({ success: true, ...balance });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Covenant seal
app.get('/covenant/seal', (req, res) => {
  res.json({
    success: true,
    ...covenantPortal.generateSeal(),
  });
});

// Master Vault Key verification
app.post('/covenant/verify-key', (req, res) => {
  const { key } = req.body;
  if (!key) {
    return res.status(400).json({ error: 'Key required' });
  }
  
  const verified = covenantPortal.verifyMasterKey(key);
  res.json({
    success: true,
    verified,
    chamber: verified ? 'THE UNSEEN' : null,
  });
});

// Master Vault Key image
app.get('/covenant/master-key-image', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'The_Master_Vault_Key.png'));
});

// AI Fren context for guardian
app.get('/covenant/fren/:path', (req, res) => {
  const context = covenantPortal.getGuardianAIContext(parseInt(req.params.path));
  if (!context) {
    return res.status(404).json({ error: 'Guardian not found' });
  }
  res.json({ success: true, fren: context });
});

// === STARTUP ===

async function start() {
  console.log(`
═══════════════════════════════════════════════════════════════════════
║                    ⟐ CHARIOT SERVER ⟐                              ║
║                 The Eternal Traversal Engine                        ║
═══════════════════════════════════════════════════════════════════════
`);

  // Initialize Chariot Core
  await chariot.initialize();
  
  // Initialize Covenant Portal
  await covenantPortal.initialize();
  console.log('✓ Covenant Portal initialized');
  
  // Start Express server
  app.listen(config.port, () => {
    console.log(`
═══════════════════════════════════════════════════════════════════════
║ 🚀 CHARIOT SERVER RUNNING                                          ║
═══════════════════════════════════════════════════════════════════════

📍 Port: ${config.port}

🜂 THEOS GATE:
   Endpoint: http://localhost:${config.port}/theos/webhook

🌉 BRIDGEWORLD GATE:
   Endpoint: http://localhost:${config.port}/bridgeworld/webhook

💰 SAFE{WALLET}:
   Treasury: http://localhost:${config.port}/treasury
   Safe Info: http://localhost:${config.port}/safe/:network/:address

🖥️  TERMINAL:
   Sessions: http://localhost:${config.port}/terminal/sessions
   Create: POST http://localhost:${config.port}/terminal/create

🏥 Health: http://localhost:${config.port}/health
📊 Status: http://localhost:${config.port}/status

🜂 COVENANT PORTAL:
   Portal: http://localhost:${config.port}/covenant
   Chambers: http://localhost:${config.port}/covenant/chambers
   Guardians: http://localhost:${config.port}/covenant/guardians
   Treasure: http://localhost:${config.port}/covenant/treasure
   Frens: http://localhost:${config.port}/covenant/fren/:path
   Seal: http://localhost:${config.port}/covenant/seal

═══════════════════════════════════════════════════════════════════════
`);
  });
  
  // Event logging
  chariot.on('bridgeworld:pulse', (data) => {
    console.log('🌉 Pulse received:', data.name, data.status);
  });
  
  chariot.on('bridgeworld:traverse', (data) => {
    console.log('🌉 TRAVERSE:', data.job.name);
  });
  
  chariot.on('safe:pending_transactions', (data) => {
    console.log('💰 Safe pending:', data.network, data.count, 'transactions');
  });
  
  chariot.on('terminal:data', (data) => {
    // Log terminal output (truncated)
    const preview = data.data.substring(0, 100);
    if (preview.trim()) {
      console.log(`🖥️  [${data.sessionId}]:`, preview.trim());
    }
  });
}

// Handle shutdown
process.on('SIGINT', async () => {
  console.log('\n⟐ Received SIGINT, shutting down...');
  await chariot.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⟐ Received SIGTERM, shutting down...');
  await chariot.shutdown();
  process.exit(0);
});

// Start server
start().catch((error) => {
  console.error('Failed to start Chariot server:', error);
  process.exit(1);
});
