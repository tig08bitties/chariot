/**
 * Development Configuration
 * Environment-specific settings for development
 */

require('dotenv').config();

const developmentConfig = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',
    env: 'development',
    logLevel: process.env.LOG_LEVEL || 'debug',
  },

  // API Keys (from environment, with fallbacks)
  apiKeys: {
    xai: process.env.XAI_API_KEY || 'dev-key-placeholder',
    github: process.env.GITHUB_TOKEN || 'dev-token-placeholder',
    tenderly: process.env.TENDERLY_API_KEY || 'dev-tenderly-key',
  },

  // Webhook Configuration
  webhooks: {
    theosSecret: process.env.THEOS_WEBHOOK_SECRET || 'dev-secret',
    bridgeworldSecret: process.env.BRIDGEWORLD_WEBHOOK_SECRET || 'dev-secret',
    enabled: true,
    verifySignatures: false, // Disable in dev for easier testing
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

  // Safe Configuration (same as production)
  safe: {
    treasuryOfLight: '0xb4C173AaFe428845f0b96610cf53576121BAB221',
    factory: '0xFc43582532E90Fa8726FE9cdb5FAd48f4e487d27',
    threshold: 2,
    owners: [
      '0x3BBa654A3816A228284E3e0401Cff4EA6dFc5cea',
      '0x3df07977140Ad97465075129C37Aec7237d74415',
    ],
  },

  // Oracle Configuration
  oracle: {
    address: '0x8BCbC66A5bb808A8871F667f2dd92a017B3DaFAC',
    chainId: 42161,
  },

  // IPFS Configuration
  ipfs: {
    apiUrl: process.env.IPFS_API_URL || 'http://localhost:5001',
    gateway: process.env.IPFS_GATEWAY || 'https://cloudflare-ipfs.com/ipfs/',
    enableHelia: true,
  },

  // Monitoring & Logging
  monitoring: {
    enableTenderly: true,
    enableBlockscout: true,
    logLevel: 'debug',
    enableMetrics: false, // Disable in dev
  },

  // Security (relaxed for development)
  security: {
    enableCORS: true,
    corsOrigin: '*',
    rateLimiting: {
      enabled: false, // Disable in dev
      windowMs: 15 * 60 * 1000,
      max: 1000,
    },
  },
};

module.exports = developmentConfig;
