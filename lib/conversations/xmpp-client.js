/**
 * 💬 CONVERSATIONS/XMPP CLIENT
 * XMPP client for theos.conversations.me
 * Alternative to Telegram for messaging
 */

const { Client } = require('@xmpp/client');
const { jid } = require('@xmpp/jid');

class ConversationsClient {
    constructor(options = {}) {
        this.server = options.server || 'up.conversations.im';
        this.domain = options.domain || 'conversations.im';
        this.jid = options.jid || 'theos@conversations.im';
        this.password = options.password || process.env.XMPP_PASSWORD || '$0mk5JC6';
        this.client = null;
        this.connected = false;
    }

    /**
     * Initialize and connect
     * @returns {Promise<void>}
     */
    async connect() {
        this.client = new Client({
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
    handleMessage(message) {
        const from = message.attrs.from;
        const body = message.getChildText('body');
        
        console.log(`💬 Message from ${from}: ${body}`);
        
        // Process webhook notifications, system messages, etc.
        this.emit('message', { from, body, message });
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
     * @returns {Promise<void>}
     */
    async sendMessage(to, body) {
        if (!this.connected) {
            throw new Error('Not connected to XMPP');
        }

        const message = this.client.send({
            to: to,
            type: 'chat',
            body: body
        });

        console.log(`📤 Sent to ${to}: ${body}`);
        return message;
    }

    /**
     * Send webhook notification
     * @param {string} recipient - Recipient JID
     * @param {Object} webhookData - Webhook event data
     * @returns {Promise<void>}
     */
    async sendWebhookNotification(recipient, webhookData) {
        const message = `🔔 Webhook Event\n\n` +
            `Type: ${webhookData.type}\n` +
            `Workflow: ${webhookData.workflow?.name || 'N/A'}\n` +
            `Status: ${webhookData.workflow?.conclusion || webhookData.workflow?.status}\n` +
            `Repository: ${webhookData.repository?.full_name}\n` +
            `Proof: ${webhookData.proof?.hash?.substring(0, 16)}...`;

        await this.sendMessage(recipient, message);
    }

    /**
     * Send witness update notification
     * @param {string} recipient - Recipient JID
     * @param {string} ipfsCid - IPFS CID
     * @param {string} ensDomain - ENS domain
     * @returns {Promise<void>}
     */
    async sendWitnessUpdate(recipient, ipfsCid, ensDomain) {
        const message = `📜 Witness Updated\n\n` +
            `IPFS CID: ${ipfsCid}\n` +
            `ENS: ${ensDomain}\n` +
            `Gateway: https://cloudflare-ipfs.com/ipfs/${ipfsCid}`;

        await this.sendMessage(recipient, message);
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
