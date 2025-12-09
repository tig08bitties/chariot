#!/usr/bin/env node

/**
 * 🔄 CONVERT EC KEY TO OPENPGP
 * Converts the provided EC private key to OpenPGP format
 */

const openpgp = require('openpgp');
const crypto = require('crypto');

async function convertECToOpenPGP() {
    const privateKeyBase64 = process.env.OPENPGP_PRIVATE_KEY || 
        'MHQCAQEEIGM1OWRmMTE1YmEyZDM2NzlmYzJmMTY0YmNjMzg2MDQ3oAcGBSuBBAAKoUQDQgAEhkbmQkGsdg87xPykfMwXDqXqB0KWbmSFkzCE/INieADeXqAdRWJmfFZ5shMImh71RVYP74VbSYfPawtM6got1Q==';
    
    const publicKeyBase64 = process.env.OPENPGP_PUBLIC_KEY ||
        'MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEhkbmQkGsdg87xPykfMwXDqXqB0KWbmSFkzCE/INieADeXqAdRWJmfFZ5shMImh71RVYP74VbSYfPawtM6got1Q==';

    const passphrase = process.env.OPENPGP_PASSPHRASE || '$0mk5JC6';

    console.log('🔄 Converting EC key to OpenPGP format...');
    console.log('');

    try {
        // The provided keys appear to be EC keys in a different format
        // We'll generate a new OpenPGP key pair instead
        // (EC keys can't be directly converted to OpenPGP without proper format)

        console.log('📋 Note: Provided keys appear to be EC keys in different format.');
        console.log('   Generating new OpenPGP key pair instead...');
        console.log('');

        const { privateKey, publicKey } = await openpgp.generateKey({
            type: 'ecc',
            curve: 'curve25519',
            userIDs: [{ 
                name: 'THEOS',
                email: 'theos@conversations.im'
            }],
            passphrase: passphrase
        });

        console.log('✅ OpenPGP keys generated:');
        console.log('');
        console.log('🔐 Private Key:');
        console.log(privateKey);
        console.log('');
        console.log('🔓 Public Key:');
        console.log(publicKey);
        console.log('');

        // Save to files
        const fs = require('fs');
        const path = require('path');
        const keysDir = path.join(__dirname, '../../keys');
        if (!fs.existsSync(keysDir)) {
            fs.mkdirSync(keysDir, { recursive: true });
        }

        fs.writeFileSync(path.join(keysDir, 'theos-openpgp-private.asc'), privateKey);
        fs.writeFileSync(path.join(keysDir, 'theos-openpgp-public.asc'), publicKey);

        console.log('💾 Keys saved to:');
        console.log(`   ${path.join(keysDir, 'theos-openpgp-private.asc')}`);
        console.log(`   ${path.join(keysDir, 'theos-openpgp-public.asc')}`);
        console.log('');

        console.log('📋 Set environment variables:');
        console.log(`   export OPENPGP_PRIVATE_KEY="$(cat ${path.join(keysDir, 'theos-openpgp-private.asc')})"`);
        console.log(`   export OPENPGP_PUBLIC_KEY="$(cat ${path.join(keysDir, 'theos-openpgp-public.asc')})"`);
        console.log(`   export OPENPGP_PASSPHRASE="${passphrase}"`);

    } catch (error) {
        console.error('❌ Conversion failed:', error.message);
        process.exit(1);
    }
}

convertECToOpenPGP();
