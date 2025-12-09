#!/usr/bin/env node

/**
 * 🔑 GENERATE OPENPGP KEYS FOR XMPP
 * Generates OpenPGP key pair for theos@conversations.im
 */

const OpenPGPEncryption = require('./openpgp-encryption');
const fs = require('fs');
const path = require('path');

async function generateKeys() {
    console.log('🔑 Generating OpenPGP keys for theos@conversations.im...');
    console.log('');

    const pgp = new OpenPGPEncryption();

    // Get passphrase from environment or prompt
    const passphrase = process.env.OPENPGP_PASSPHRASE || 
        (process.argv[2] ? process.argv[2] : null);

    if (!passphrase) {
        console.error('❌ Passphrase required');
        console.error('   Usage: node generate-pgp-keys.js <passphrase>');
        console.error('   Or set: export OPENPGP_PASSPHRASE="your-passphrase"');
        process.exit(1);
    }

    try {
        const { privateKey, publicKey } = await pgp.generateKeyPair({
            name: 'THEOS',
            email: 'theos@conversations.im',
            passphrase: passphrase
        });

        // Save keys
        const keysDir = path.join(__dirname, '../../keys');
        if (!fs.existsSync(keysDir)) {
            fs.mkdirSync(keysDir, { recursive: true });
        }

        const privateKeyPath = path.join(keysDir, 'theos-openpgp-private.asc');
        const publicKeyPath = path.join(keysDir, 'theos-openpgp-public.asc');

        fs.writeFileSync(privateKeyPath, privateKey);
        fs.writeFileSync(publicKeyPath, publicKey);

        console.log('✅ Keys generated and saved:');
        console.log(`   Private: ${privateKeyPath}`);
        console.log(`   Public: ${publicKeyPath}`);
        console.log('');
        console.log('📋 Add to environment variables:');
        console.log(`   export OPENPGP_PRIVATE_KEY="$(cat ${privateKeyPath})"`);
        console.log(`   export OPENPGP_PUBLIC_KEY="$(cat ${publicKeyPath})"`);
        console.log(`   export OPENPGP_PASSPHRASE="${passphrase}"`);
        console.log('');
        console.log('🔐 Public Key (share with recipients):');
        console.log(publicKey);
        console.log('');

    } catch (error) {
        console.error('❌ Key generation failed:', error.message);
        process.exit(1);
    }
}

generateKeys();
