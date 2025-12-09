/**
 * 🔗 TON + CONVERSATIONS INTEGRATION
 * Integrates TON blockchain with Conversations/XMPP messaging
 * Domain: theos.conversations.me
 */

const TONIntegration = require('../ton/ton-integration');
const ConversationsClient = require('../conversations/xmpp-client');
const EventEmitter = require('events');

class TONConversationsIntegration extends EventEmitter {
    constructor(options = {}) {
        super();
        
        // TON integration
        this.ton = new TONIntegration({
            endpoint: options.tonEndpoint,
            apiKey: options.tonApiKey
        });

        // Conversations/XMPP client
        this.conversations = new ConversationsClient({
            server: 'up.conversations.im',
            domain: 'conversations.im',
            jid: options.xmppJid || 'theos@conversations.im',
            password: options.xmppPassword || process.env.XMPP_PASSWORD || '$0mk5JC6'
        });

        // Setup event handlers
        this.setupEventHandlers();
    }

    /**
     * Setup event handlers
     */
    setupEventHandlers() {
        // XMPP message handler
        this.conversations.on('message', (data) => {
            this.handleXMPPMessage(data);
        });

        // Webhook processing
        this.on('webhook', async (webhookData) => {
            await this.processWebhookWithTON(webhookData);
        });
    }

    /**
     * Initialize both services
     * @returns {Promise<void>}
     */
    async initialize() {
        console.log('🔗 Initializing TON + Conversations integration...');

        // Initialize TON wallet (if mnemonic provided)
        if (process.env.TON_MNEMONIC) {
            await this.ton.initializeWallet(process.env.TON_MNEMONIC);
        }

        // Connect to XMPP
        await this.conversations.connect();

        console.log('✅ TON + Conversations integration initialized');
    }

    /**
     * Process webhook and store on TON, notify via XMPP
     * @param {Object} webhookData - Webhook event
     * @returns {Promise<Object>} Processing result
     */
    async processWebhookWithTON(webhookData) {
        const { event, proof } = webhookData;

        // Store witness hash on TON
        let tonTxHash = null;
        if (proof?.ipfs_cid) {
            try {
                tonTxHash = await this.ton.storeWitnessHash(proof.ipfs_cid);
                console.log('💎 Witness hash stored on TON:', tonTxHash);
            } catch (error) {
                console.warn('⚠️  TON storage failed:', error.message);
            }
        }

        // Send notification via XMPP
        const notificationRecipients = process.env.XMPP_NOTIFICATION_RECIPIENTS?.split(',') || [];
        for (const recipient of notificationRecipients) {
            try {
                await this.conversations.sendWebhookNotification(recipient, {
                    ...event,
                    ton_tx: tonTxHash
                });
            } catch (error) {
                console.warn(`⚠️  XMPP notification failed for ${recipient}:`, error.message);
            }
        }

        return {
            ton: tonTxHash,
            xmpp: notificationRecipients.length,
            processed: true
        };
    }

    /**
     * Handle XMPP messages
     * @param {Object} data - Message data
     */
    handleXMPPMessage(data) {
        const { from, body } = data;

        // Process commands
        if (body.startsWith('/')) {
            this.handleCommand(from, body);
        } else {
            // Regular message
            this.emit('message', { from, body });
        }
    }

    /**
     * Handle XMPP commands
     * @param {string} from - Sender JID
     * @param {string} command - Command string
     */
    async handleCommand(from, command) {
        const [cmd, ...args] = command.substring(1).split(' ');

        switch (cmd) {
            case 'status':
                await this.conversations.sendMessage(from, this.getStatus());
                break;
            case 'witness':
                await this.sendWitnessInfo(from);
                break;
            case 'balance':
                const address = args[0] || this.ton.getWalletAddress();
                if (address) {
                    const balance = await this.ton.getBalance(address);
                    await this.conversations.sendMessage(from, `Balance: ${balance} nanoTON`);
                }
                break;
            default:
                await this.conversations.sendMessage(from, 'Unknown command');
        }
    }

    /**
     * Get system status
     * @returns {string}
     */
    getStatus() {
        return `🔗 THEOS System Status\n\n` +
            `TON: ${this.ton.getWalletAddress() ? 'Connected' : 'Not initialized'}\n` +
            `XMPP: ${this.conversations.connected ? 'Connected' : 'Disconnected'}\n` +
            `Server: up.conversations.im\n` +
            `Account: theos@conversations.im\n` +
            `ENS: tig08bitties.uni.eth`;
    }

    /**
     * Send witness information
     * @param {string} to - Recipient JID
     */
    async sendWitnessInfo(to) {
        // This would fetch latest witness info
        const message = `📜 Witness Information\n\n` +
            `Status: Active\n` +
            `ENS: tig08bitties.uni.eth\n` +
            `XMPP: theos@conversations.im\n` +
            `Server: up.conversations.im\n` +
            `Chambers: All Complete`;

        await this.conversations.sendMessage(to, message);
    }

    /**
     * Update witness and notify
     * @param {string} ipfsCid - IPFS CID
     * @param {string} ensDomain - ENS domain
     * @returns {Promise<void>}
     */
    async updateWitness(ipfsCid, ensDomain) {
        // Store on TON
        const tonTxHash = await this.ton.storeWitnessHash(ipfsCid);

        // Notify via XMPP
        const recipients = process.env.XMPP_NOTIFICATION_RECIPIENTS?.split(',') || [];
        for (const recipient of recipients) {
            await this.conversations.sendWitnessUpdate(recipient, ipfsCid, ensDomain);
        }

        console.log('✅ Witness updated on TON and notified via XMPP');
    }
}

module.exports = TONConversationsIntegration;
