#!/usr/bin/env node

/**
 * 🚀 START DUAL-GATE SERVER
 * Run: node webhook-server.js
 * 
 * Routes webhooks to:
 * - THEOS Gate (theos.brave) - Identity Plane - workflow_run events
 * - BRIDGEWORLD Gate (bridgeworld.lol) - Traversal Plane - workflow_job events
 */

const DualGateServer = require('./lib/webhook/dual-gate-server');

// Configuration
const config = {
    port: process.env.PORT || 3000,
    theosSecret: process.env.THEOS_WEBHOOK_SECRET || 
        'A2F43359B434E98561E628D02E6D1B0F52FD402099D440EAA377045742F7524A8EDE3DD5BF7002E721D259693FA7E875440B29B8DE7B4D8EE7C5BB08F48DF942',
    bridgeworldSecret: process.env.BRIDGEWORLD_WEBHOOK_SECRET || 
        'vQSMpXuEy9NrcjDsoQK2RxHxGKTyvCWsqFjzqSnPMck',
    ipfs: process.env.IPFS_API_URL ? require('ipfs-http-client').create(process.env.IPFS_API_URL) : null
};

// Create and start dual-gate server
const server = new DualGateServer(config);
server.start();
