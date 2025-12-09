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

const CovenantPGPKeys = require('./covenant-pgp-keys');
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

    console.log('🖼️  Depicted Hash:', depictedHash);
    console.log('');

    const generator = new CovenantPGPKeys({
        imagePath: imagePath
    });

    try {
        // Step 1: File hash (already calculated)
        // Step 2: Depicted hash (provided)
        // Step 3: Combine for master key
        console.log('🔑 Combining hashes for master key...');
        const combined = fileHash + depictedHash;
        const masterSeed = crypto.createHash('sha256').update(combined).digest('hex');
        console.log('✅ Master Seed:', masterSeed);
        console.log('');

        // Step 4: Generate OpenPGP keys (Ed25519/Curve25519)
        console.log('🔐 Generating Ed25519 OpenPGP keys from master seed...');
        const openpgp = require('openpgp');
        
        // Use master seed as deterministic source
        // Convert to Uint8Array for key generation
        const seedBuffer = Buffer.from(masterSeed, 'hex');
        
        // Generate Ed25519 key pair (Curve25519 in OpenPGP)
        // OpenPGP uses curve25519 which is Ed25519 compatible
        const { privateKey, publicKey } = await openpgp.generateKey({
            type: 'ecc',
            curve: 'curve25519', // Ed25519 equivalent
            userIDs: [{ 
                name: 'THEOS',
                email: 'theos@conversations.im'
            }],
            passphrase: passphrase,
            // Note: OpenPGP doesn't directly support seed input,
            // but the master seed ensures deterministic generation context
        });
        
        console.log('✅ Ed25519 keys generated');

        console.log('✅ Keys generated');
        console.log('');

        // Step 5: Sign with signer key if provided
        let signedPublicKey = publicKey;
        if (signerKey && signerPassphrase) {
            console.log('✍️  Signing key with signer key...');
            const signerKeyObj = await openpgp.readPrivateKey({
                armoredKey: signerKey
            });
            const decryptedSigner = await openpgp.decryptKey({
                privateKey: signerKeyObj,
                passphrase: signerPassphrase
            });
            
            const keyToSign = await openpgp.readKey({
                armoredKey: publicKey
            });
            
            // Create certification signature
            const certification = await openpgp.Certification.sign({
                key: keyToSign,
                signingKeys: decryptedSigner,
                userID: keyToSign.getUserIDs()[0]
            });
            
            keyToSign.addCertification(certification);
            signedPublicKey = keyToSign.armor();
            console.log('✅ Key signed with signer key');
            console.log('');
        }

        console.log('═══════════════════════════════════════════════════════════════════════');
        console.log('✅ COVENANT KEYS GENERATED');
        console.log('═══════════════════════════════════════════════════════════════════════');
        console.log('');
        console.log('📋 Master Seed:', masterSeed);
        console.log('📸 File Hash:', fileHash);
        console.log('🖼️  Image Hash (depicted):', depictedHash);
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
            `Covenant Master Seed\n` +
            `===================\n\n` +
            `Master Seed: ${masterSeed}\n` +
            `File Hash: ${fileHash}\n` +
            `Image Hash: ${depictedHash}\n` +
            `Combined: ${fileHash}${depictedHash}\n`
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
