/**
 * 🔐 OPENPGP ENCRYPTION FOR XMPP
 * OpenPGP encryption support for Conversations/XMPP messages
 */

const openpgp = require('openpgp');

class OpenPGPEncryption {
    constructor(options = {}) {
        this.privateKeyArmored = options.privateKey || process.env.OPENPGP_PRIVATE_KEY;
        this.publicKeyArmored = options.publicKey || process.env.OPENPGP_PUBLIC_KEY;
        this.passphrase = options.passphrase || process.env.OPENPGP_PASSPHRASE;
        this.privateKey = null;
        this.publicKey = null;
    }

    /**
     * Initialize OpenPGP keys
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.privateKeyArmored) {
            try {
                this.privateKey = await openpgp.readPrivateKey({
                    armoredKey: this.privateKeyArmored
                });

                // Decrypt private key if passphrase provided
                if (this.passphrase) {
                    this.privateKey = await openpgp.decryptKey({
                        privateKey: this.privateKey,
                        passphrase: this.passphrase
                    });
                }

                console.log('✅ OpenPGP private key loaded');
            } catch (error) {
                console.error('❌ Failed to load private key:', error.message);
                throw error;
            }
        }

        if (this.publicKeyArmored) {
            try {
                this.publicKey = await openpgp.readKey({
                    armoredKey: this.publicKeyArmored
                });
                console.log('✅ OpenPGP public key loaded');
            } catch (error) {
                console.error('❌ Failed to load public key:', error.message);
            }
        }
    }

    /**
     * Encrypt message
     * @param {string} message - Plaintext message
     * @param {string|Array} recipientKeys - Recipient public key(s) (armored)
     * @returns {Promise<string>} Encrypted message (armored)
     */
    async encrypt(message, recipientKeys = null) {
        if (!recipientKeys && !this.publicKey) {
            // No encryption if no recipient keys
            return message;
        }

        try {
            const keys = [];
            
            // Add recipient keys
            if (recipientKeys) {
                const keyArray = Array.isArray(recipientKeys) ? recipientKeys : [recipientKeys];
                for (const keyArmored of keyArray) {
                    const key = await openpgp.readKey({ armoredKey: keyArmored });
                    keys.push(key);
                }
            }

            // Add own public key for decryption
            if (this.publicKey) {
                keys.push(this.publicKey);
            }

            const encrypted = await openpgp.encrypt({
                message: await openpgp.createMessage({ text: message }),
                encryptionKeys: keys
            });

            return await encrypted;
        } catch (error) {
            console.error('❌ Encryption failed:', error.message);
            throw error;
        }
    }

    /**
     * Decrypt message
     * @param {string} encryptedMessage - Encrypted message (armored)
     * @returns {Promise<string>} Decrypted plaintext
     */
    async decrypt(encryptedMessage) {
        if (!this.privateKey) {
            throw new Error('Private key not available for decryption');
        }

        try {
            const message = await openpgp.readMessage({
                armoredMessage: encryptedMessage
            });

            const { data: decrypted } = await openpgp.decrypt({
                message,
                decryptionKeys: this.privateKey
            });

            return decrypted;
        } catch (error) {
            console.error('❌ Decryption failed:', error.message);
            throw error;
        }
    }

    /**
     * Sign message
     * @param {string} message - Message to sign
     * @returns {Promise<string>} Signed message (armored)
     */
    async sign(message) {
        if (!this.privateKey) {
            return message; // No signing if no private key
        }

        try {
            const signed = await openpgp.sign({
                message: await openpgp.createMessage({ text: message }),
                signingKeys: this.privateKey
            });

            return await signed;
        } catch (error) {
            console.error('❌ Signing failed:', error.message);
            throw error;
        }
    }

    /**
     * Verify signed message
     * @param {string} signedMessage - Signed message (armored)
     * @param {string} signerPublicKey - Signer's public key (armored)
     * @returns {Promise<{verified: boolean, message: string}>}
     */
    async verify(signedMessage, signerPublicKey) {
        try {
            const message = await openpgp.readMessage({
                armoredMessage: signedMessage
            });

            const signerKey = await openpgp.readKey({
                armoredKey: signerPublicKey
            });

            const verificationResult = await openpgp.verify({
                message,
                verificationKeys: signerKey
            });

            const { verified, keyID } = verificationResult.signatures[0];
            await verified; // Wait for verification

            return {
                verified: true,
                message: await message.getText(),
                keyID: keyID.toHex()
            };
        } catch (error) {
            console.error('❌ Verification failed:', error.message);
            return {
                verified: false,
                message: null,
                error: error.message
            };
        }
    }

    /**
     * Generate new key pair
     * @param {Object} options - Key generation options
     * @returns {Promise<{privateKey: string, publicKey: string}>}
     */
    async generateKeyPair(options = {}) {
        const {
            name = 'THEOS',
            email = 'theos@conversations.im',
            passphrase = this.passphrase || process.env.OPENPGP_PASSPHRASE
        } = options;

        try {
            const { privateKey, publicKey } = await openpgp.generateKey({
                type: 'ecc',
                curve: 'curve25519',
                userIDs: [{ name, email }],
                passphrase: passphrase
            });

            return {
                privateKey: privateKey,
                publicKey: publicKey
            };
        } catch (error) {
            console.error('❌ Key generation failed:', error.message);
            throw error;
        }
    }

    /**
     * Get public key (armored)
     * @returns {string|null}
     */
    getPublicKey() {
        return this.publicKeyArmored;
    }
}

module.exports = OpenPGPEncryption;
