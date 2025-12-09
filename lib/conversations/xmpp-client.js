/**
 * 💬 CONVERSATIONS/XMPP CLIENT
 * XMPP client for theos.conversations.me
 * Alternative to Telegram for messaging
 */

const { client } = require('@xmpp/client');
const { jid } = require('@xmpp/jid');
const OpenPGPEncryption = require('./openpgp-encryption');

class ConversationsClient {
    constructor(options = {}) {
        this.server = options.server || 'up.conversations.im';
        this.domain = options.domain || 'conversations.im';
        this.jid = options.jid || 'theos@conversations.im';
        this.password = options.password || process.env.XMPP_PASSWORD || '$0mk5JC6';
        this.client = null;
        this.connected = false;
        
        // OpenPGP encryption
        this.pgp = new OpenPGPEncryption({
            privateKey: options.openpgpPrivateKey || process.env.OPENPGP_PRIVATE_KEY,
            publicKey: options.openpgpPublicKey || process.env.OPENPGP_PUBLIC_KEY,
            passphrase: options.openpgpPassphrase || process.env.OPENPGP_PASSPHRASE
        });
        this.encryptionEnabled = false;
    }

    /**
     * Initialize and connect
     * @returns {Promise<void>}
     */
    async connect() {
        // Initialize OpenPGP if keys provided
        if (this.pgp.privateKeyArmored || this.pgp.publicKeyArmored) {
            await this.pgp.initialize();
            this.encryptionEnabled = true;
            console.log('🔐 OpenPGP encryption enabled');
        }

        this.client = client({
            service: `xmpp://${this.server}`,
            domain: this.domain,
            username: this.jid.split('@')[0],
            password: this.password
        });

        this.client.on('online', (address) => {
            console.log('✅ XMPP connected:', address.toString());
            this.connected = true;
        });

        this.client.on('offline', () => {
            console.log('⚠️  XMPP disconnected');
            this.connected = false;
        });

        this.client.on('error', (error) => {
            console.error('❌ XMPP error:', error);
        });

        this.client.on('stanza', (stanza) => {
            this.handleStanza(stanza);
        });

        await this.client.start();
    }

    /**
     * Handle incoming XMPP stanzas
     * @param {Object} stanza - XMPP stanza
     */
    handleStanza(stanza) {
        if (stanza.is('message')) {
            this.handleMessage(stanza);
        } else if (stanza.is('presence')) {
            this.handlePresence(stanza);
        }
    }

    /**
     * Handle incoming messages
     * @param {Object} message - XMPP message
     */
    async handleMessage(message) {
        const from = message.attrs.from;
        let body = message.getChildText('body');
        
        // Try to decrypt if encryption is enabled
        if (this.encryptionEnabled && body.startsWith('-----BEGIN PGP MESSAGE-----')) {
            try {
                body = await this.pgp.decrypt(body);
                console.log(`🔓 Decrypted message from ${from}`);
            } catch (error) {
                console.warn(`⚠️  Decryption failed for ${from}:`, error.message);
            }
        }
        
        console.log(`💬 Message from ${from}: ${body}`);
        
        // Process webhook notifications, system messages, etc.
        this.emit('message', { from, body, message, encrypted: body !== message.getChildText('body') });
    }

    /**
     * Handle presence updates
     * @param {Object} presence - XMPP presence
     */
    handlePresence(presence) {
        const from = presence.attrs.from;
        const type = presence.attrs.type || 'available';
        
        console.log(`👤 Presence: ${from} is ${type}`);
    }

    /**
     * Send message
     * @param {string} to - Recipient JID
     * @param {string} body - Message body
     * @param {Object} options - Options (encrypt, sign, recipientPublicKey)
     * @returns {Promise<void>}
     */
    async sendMessage(to, body, options = {}) {
        if (!this.connected) {
            throw new Error('Not connected to XMPP');
        }

        let messageBody = body;

        // Encrypt if requested and encryption enabled
        if (options.encrypt && this.encryptionEnabled) {
            if (options.recipientPublicKey) {
                messageBody = await this.pgp.encrypt(body, options.recipientPublicKey);
                console.log(`🔐 Encrypted message for ${to}`);
            } else if (this.pgp.publicKey) {
                // Encrypt to self (for storage)
                messageBody = await this.pgp.encrypt(body);
                console.log(`🔐 Encrypted message (self)`);
            }
        }

        // Sign if requested
        if (options.sign && this.encryptionEnabled) {
            messageBody = await this.pgp.sign(messageBody);
            console.log(`✍️  Signed message`);
        }

        const message = this.client.send({
            to: to,
            type: 'chat',
            body: messageBody
        });

        console.log(`📤 Sent to ${to}: ${body.substring(0, 50)}...`);
        return message;
    }

    /**
     * Send webhook notification
     * @param {string} recipient - Recipient JID
     * @param {Object} webhookData - Webhook event data
     * @param {Object} options - Encryption options
     * @returns {Promise<void>}
     */
    async sendWebhookNotification(recipient, webhookData, options = {}) {
        const message = `🔔 Webhook Event\n\n` +
            `Type: ${webhookData.type}\n` +
            `Workflow: ${webhookData.workflow?.name || 'N/A'}\n` +
            `Status: ${webhookData.workflow?.conclusion || webhookData.workflow?.status}\n` +
            `Repository: ${webhookData.repository?.full_name}\n` +
            `Proof: ${webhookData.proof?.hash?.substring(0, 16)}...`;

        await this.sendMessage(recipient, message, {
            encrypt: options.encrypt !== false && this.encryptionEnabled,
            sign: options.sign !== false && this.encryptionEnabled,
            recipientPublicKey: options.recipientPublicKey
        });
    }

    /**
     * Send witness update notification
     * @param {string} recipient - Recipient JID
     * @param {string} ipfsCid - IPFS CID
     * @param {string} ensDomain - ENS domain
     * @param {Object} options - Encryption options
     * @returns {Promise<void>}
     */
    async sendWitnessUpdate(recipient, ipfsCid, ensDomain, options = {}) {
        const message = `📜 Witness Updated\n\n` +
            `IPFS CID: ${ipfsCid}\n` +
            `ENS: ${ensDomain}\n` +
            `Gateway: https://cloudflare-ipfs.com/ipfs/${ipfsCid}`;

        await this.sendMessage(recipient, message, {
            encrypt: options.encrypt !== false && this.encryptionEnabled,
            sign: options.sign !== false && this.encryptionEnabled,
            recipientPublicKey: options.recipientPublicKey
        });
    }

    /**
     * Disconnect
     * @returns {Promise<void>}
     */
    async disconnect() {
        if (this.client) {
            await this.client.stop();
            this.connected = false;
            console.log('✅ XMPP disconnected');
        }
    }
}

module.exports = ConversationsClient;
