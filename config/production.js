/**
 * Production Configuration
 * Environment-specific settings for production deployment
 */

require('dotenv').config();

const productionConfig = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    env: 'production',
    logLevel: process.env.LOG_LEVEL || 'info',
  },

  // API Keys (from environment)
  apiKeys: {
    xai: process.env.XAI_API_KEY,
    github: process.env.GITHUB_TOKEN,
    tenderly: process.env.TENDERLY_API_KEY,
    openai: process.env.OPENAI_API_KEY, // If needed
  },

  // Webhook Configuration
  webhooks: {
    theosSecret: process.env.THEOS_WEBHOOK_SECRET,
    bridgeworldSecret: process.env.BRIDGEWORLD_WEBHOOK_SECRET,
    enabled: true,
    verifySignatures: true,
  },

  // Ethereum/Blockchain Configuration
  ethereum: {
    rpcUrl: process.env.ETH_RPC_URL || 'https://eth.llamarpc.com',
    arbitrumRpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    chainIds: {
      mainnet: 1,
      arbitrum: 42161,
    },
  },

  // Safe Configuration
  safe: {
    treasuryOfLight: '0xb4C173AaFe428845f0b96610cf53576121BAB221',
    factory: '0xFc43582532E90Fa8726FE9cdb5FAd48f4e487d27',
    threshold: 2,
    owners: [
      '0x3BBa654A3816A228284E3e0401Cff4EA6dFc5cea', // tig08bitties.uni.eth
      '0x3df07977140Ad97465075129C37Aec7237d74415', // Ledger Flex
    ],
  },

  // Oracle Configuration
  oracle: {
    address: '0x8BCbC66A5bb808A8871F667f2dd92a017B3DaFAC',
    chainId: 42161, // Arbitrum One
  },

  // IPFS Configuration
  ipfs: {
    apiUrl: process.env.IPFS_API_URL || 'http://localhost:5001',
    gateway: process.env.IPFS_GATEWAY || 'https://cloudflare-ipfs.com/ipfs/',
    enableHelia: true,
  },

  // ENS/IPNS Configuration
  ens: {
    domain: process.env.ENS_DOMAIN || 'tig08bitties.uni.eth',
    privateKey: process.env.ENS_PRIVATE_KEY,
  },

  // XMPP Configuration
  xmpp: {
    server: process.env.XMPP_SERVER || 'up.conversations.im',
    jid: process.env.XMPP_JID || 'theos@conversations.im',
    password: process.env.XMPP_PASSWORD,
    enableOpenPGP: true,
  },

  // TON Configuration
  ton: {
    apiKey: process.env.TON_API_KEY,
    endpoint: process.env.TON_ENDPOINT || 'https://toncenter.com/api/v2/jsonRPC',
  },

  // Monitoring & Logging
  monitoring: {
    enableTenderly: true,
    enableBlockscout: true,
    logLevel: 'info',
    enableMetrics: true,
  },

  // Security
  security: {
    enableCORS: true,
    corsOrigin: process.env.CORS_ORIGIN || '*',
    rateLimiting: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // requests per window
    },
  },
};

// Validate required environment variables
function validateConfig() {
  const required = [
    'XAI_API_KEY',
    'GITHUB_TOKEN',
    'THEOS_WEBHOOK_SECRET',
    'BRIDGEWORLD_WEBHOOK_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn('⚠️  Missing environment variables:', missing.join(', '));
    console.warn('   Some features may not work correctly.');
  }

  return missing.length === 0;
}

// Export configuration
module.exports = {
  ...productionConfig,
  validate: validateConfig,
};
