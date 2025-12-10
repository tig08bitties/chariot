#!/usr/bin/env node

/**
 * Test tn5250 connection to pub400.com
 * 
 * Usage: node scripts/test-tn5250.js
 */

require('dotenv').config();

const { UnifiedTerminal } = require('../lib/terminal/unified-terminal');

const config = {
  tn5250Host: process.env.TN5250_HOST || 'pub400.com',
  tn5250User: process.env.TN5250_USER || 'THEOS',
  tn5250Password: process.env.TN5250_PASSWORD || 'winter25',
  tn5250Env: process.env.TN5250_ENV || 'QPADEV0001',
};

console.log(`
═══════════════════════════════════════════════════════════════════════
║               tn5250 Connection Test - pub400.com                   ║
═══════════════════════════════════════════════════════════════════════

Host: ${config.tn5250Host}
User: ${config.tn5250User}
Environment: ${config.tn5250Env}

`);

async function main() {
  const terminal = new UnifiedTerminal(config);
  
  // Initialize
  console.log('⟐ Initializing terminal...');
  const status = await terminal.initialize();
  console.log('✓ tn5250 status:', status.tn5250);
  
  // Create session
  console.log('\n⟐ Creating tn5250 session...');
  
  try {
    const session = await terminal.createTn5250Session('test-pub400', config.tn5250Host, {
      user: config.tn5250User,
      password: config.tn5250Password,
    });
    
    console.log('✓ Session created:', session.id);
    
    // Listen for data
    let buffer = '';
    terminal.on('data', ({ sessionId, data }) => {
      buffer += data;
      process.stdout.write(data);
    });
    
    terminal.on('close', ({ sessionId, code }) => {
      console.log(`\n\n⟐ Session ${sessionId} closed with code ${code}`);
      process.exit(0);
    });
    
    // Wait for connection, then send login
    console.log('\n⟐ Waiting for login screen...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if we have a login prompt
    if (buffer.includes('User') || buffer.includes('Sign') || buffer.length > 100) {
      console.log('\n⟐ Sending login credentials...');
      await terminal.tn5250Login(session.id, config.tn5250User, config.tn5250Password);
    }
    
    // Keep session alive for 30 seconds
    console.log('\n⟐ Session active. Press Ctrl+C to exit or wait 30 seconds...');
    
    setTimeout(() => {
      console.log('\n⟐ Test complete, closing session...');
      terminal.close(session.id);
    }, 30000);
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

main();
