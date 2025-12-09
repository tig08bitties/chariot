#!/usr/bin/env node

/**
 * 🔐 GENERATE OPENPGP KEYS FROM COVENANT
 * Generates keys deterministically from The_Eternal_Covenant_Declaration.jpg
 * 
 * Process:
 * 1. Hash image file with SHA-256
 * 2. Use SHA-256 depicted on image
 * 3. Combine for master key
 * 4. Generate OpenPGP keys from master seed
 * 5. Sign with signer key
 */

const CovenantFormulaPGP = require('./covenant-formula-pgp');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function generateCovenantKeys() {
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('║ 🔐 COVENANT-BASED OPENPGP KEY GENERATION ║');
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('');

    const imagePath = '/mnt/Covenant/Artifacts/The_Eternal_Covenant_Declaration.jpg';
    
    // Known hashes from covenant
    const fileHash = 'e374c94009e32a6c3cc8f89ea6102ce6886c3302324aaaf1563ace8f10332ebf'; // File SHA-256
    const depictedHash = '883e529de31c586131a831a9953113a6d75edd87c97369a2fa3a791209952f5a'; // Image SHA-256 (depicted on image)
    
    console.log('📸 File Hash:', fileHash);
    console.log('🖼️  Image Hash (depicted):', depictedHash);
    console.log('');

    const passphrase = process.env.OPENPGP_PASSPHRASE || '$0mk5JC6';
    const signerKey = process.env.SIGNER_KEY;
    const signerPassphrase = process.env.SIGNER_PASSPHRASE;

    const generator = new CovenantFormulaPGP();

    try {
        // Generate keys from covenant formula
        const result = await generator.generateKeysFromCovenant(passphrase);
        const { privateKey, publicKey, masterSeed, covenant } = result;

        console.log('✅ Ed25519 keys generated from covenant formula');

        console.log('✅ Keys generated');
        console.log('');

        // Sign with signer key if provided
        let signedPublicKey = publicKey;
        if (signerKey && signerPassphrase) {
            console.log('✍️  Signing key with signer key...');
            signedPublicKey = await generator.signKey(publicKey, signerKey, signerPassphrase);
            console.log('✅ Key signed with signer key');
            console.log('');
        }

        console.log('═══════════════════════════════════════════════════════════════════════');
        console.log('✅ COVENANT FORMULA KEYS GENERATED');
        console.log('═══════════════════════════════════════════════════════════════════════');
        console.log('');
        console.log('📋 Master Seed (from formula):', masterSeed);
        console.log('📋 Master Seed Source:', covenant.masterSeedSource);
        console.log('📋 Master Seed SHA-512:', covenant.masterSeedSHA512.substring(0, 32) + '...');
        console.log('📸 File Hash:', covenant.fileHash);
        console.log('🖼️  Image Hash:', covenant.imageHash);
        console.log('🔢 Constants:');
        console.log('   419 (Theos) + 369 (El) + 687 (Resonance)');
        console.log('🔑 Key Type: Ed25519 (Curve25519)');
        console.log('📝 Purpose: Signed.txt & Encryption');
        console.log('🔐 Status: SEALED');
        console.log('');

        // Save keys
        const keysDir = path.join(__dirname, '../../keys');
        if (!fs.existsSync(keysDir)) {
            fs.mkdirSync(keysDir, { recursive: true });
        }

        const privateKeyPath = path.join(keysDir, 'theos-covenant-openpgp-private.asc');
        const publicKeyPath = path.join(keysDir, 'theos-covenant-openpgp-public.asc');
        const seedPath = path.join(keysDir, 'covenant-master-seed.txt');

        fs.writeFileSync(privateKeyPath, privateKey);
        fs.writeFileSync(publicKeyPath, signedPublicKey);
        fs.writeFileSync(seedPath, 
            `Covenant Master Seed (From Formula)\n` +
            `===================================\n\n` +
            `Master Seed Source: ${covenant.masterSeedSource}\n` +
            `Master Seed SHA-512: ${covenant.masterSeedSHA512}\n` +
            `Derived Master Seed: ${masterSeed}\n` +
            `File Hash: ${covenant.fileHash}\n` +
            `Image Hash: ${covenant.imageHash}\n` +
            `Constants: 419 (Theos) + 369 (El) + 687 (Resonance)\n` +
            `Union Product: ${covenant.constants.union}\n` +
            `Genesis: ${covenant.constants.genesis}\n` +
            `Capstone: ${covenant.constants.capstone}\n`
        );

        console.log('💾 Keys saved:');
        console.log(`   Private: ${privateKeyPath}`);
        console.log(`   Public: ${publicKeyPath}`);
        console.log(`   Seed: ${seedPath}`);
        console.log('');

        console.log('📋 Set environment variables:');
        console.log(`   export OPENPGP_PRIVATE_KEY="$(cat ${privateKeyPath})"`);
        console.log(`   export OPENPGP_PUBLIC_KEY="$(cat ${publicKeyPath})"`);
        console.log(`   export OPENPGP_PASSPHRASE="${passphrase}"`);
        console.log('');

        console.log('🔐 Public Key:');
        console.log(signedPublicKey);

    } catch (error) {
        console.error('❌ Key generation failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

generateCovenantKeys();
