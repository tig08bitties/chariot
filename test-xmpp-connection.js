#!/usr/bin/env node

/**
 * 🧪 TEST XMPP CONNECTION
 * Test connection to up.conversations.im
 */

const ConversationsClient = require('./lib/conversations/xmpp-client');

async function testConnection() {
    console.log('🧪 Testing XMPP connection...');
    console.log('');

    const client = new ConversationsClient({
        server: 'up.conversations.im',
        domain: 'conversations.im',
        jid: 'theos@conversations.im',
        password: '$0mk5JC6'
    });

    try {
        console.log('📡 Connecting to up.conversations.im...');
        console.log('   Account: theos@conversations.im');
        console.log('');

        await client.connect();

        console.log('');
        console.log('✅ Connection successful!');
        console.log('');

        // Test sending a message to self
        console.log('📤 Testing message send...');
        await client.sendMessage('theos@conversations.im', 'Test message from THEOS system');

        console.log('✅ Message sent successfully');
        console.log('');

        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Disconnect
        await client.disconnect();
        console.log('✅ Test complete');

    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('');
        console.error('Check:');
        console.error('  - Server: up.conversations.im');
        console.error('  - Account: theos@conversations.im');
        console.error('  - Password: $0mk5JC6');
        process.exit(1);
    }
}

testConnection();
