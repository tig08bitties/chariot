/**
 * 🔗 COMPLETE WEBHOOK HANDLER
 * Integrates all systems: Dual-Gate + TON + Conversations + ENS/IPNS + Helia + Agentek
 */

const DualGateServer = require('./dual-gate-server');
const TONConversationsIntegration = require('../integration/ton-conversations-integration');
const CompleteIntegration = require('../integration/complete-integration');

class CompleteWebhookHandler {
    constructor(options = {}) {
        // Complete integration (ENS/IPNS + Helia + Agentek)
        this.completeIntegration = new CompleteIntegration({
            ipfs: options.ipfs,
            provider: options.provider,
            signer: options.signer,
            ensDomain: 'tig08bitties.uni.eth',
            theosSecret: options.theosSecret,
            bridgeworldSecret: options.bridgeworldSecret
        });

        // TON + Conversations integration
        this.tonConversations = new TONConversationsIntegration({
            tonEndpoint: options.tonEndpoint,
            tonApiKey: options.tonApiKey,
            xmppJid: options.xmppJid,
            xmppPassword: options.xmppPassword
        });

        // Dual-gate server
        this.dualGateServer = new DualGateServer({
            port: options.port || 3000,
            theosSecret: options.theosSecret,
            bridgeworldSecret: options.bridgeworldSecret,
            ipfs: options.ipfs
        });

        // Setup cross-integration
        this.setupCrossIntegration();
    }

    /**
     * Setup cross-integration between all systems
     */
    setupCrossIntegration() {
        // When webhook is processed, also process through TON + Conversations
        this.completeIntegration.agent.on('processed', async (data) => {
            await this.tonConversations.processWebhookWithTON(data.event);
        });

        // When witness is updated, notify via XMPP and store on TON
        this.completeIntegration.ensManager.on('witness_updated', async (data) => {
            await this.tonConversations.updateWitness(data.cid, 'tig08bitties.uni.eth');
        });
    }

    /**
     * Initialize all systems
     * @returns {Promise<void>}
     */
    async initialize() {
        console.log('🔗 Initializing complete webhook handler...');

        // Initialize complete integration
        await this.completeIntegration.initialize();

        // Initialize TON + Conversations
        await this.tonConversations.initialize();

        console.log('✅ Complete webhook handler initialized');
    }

    /**
     * Start all services
     * @returns {Promise<void>}
     */
    async start() {
        await this.initialize();
        this.dualGateServer.start();
        console.log('🚀 Complete webhook handler running');
    }

    /**
     * Process webhook through all systems
     * @param {Object} webhookData - Webhook event
     * @param {string} gate - 'theos' or 'bridgeworld'
     * @returns {Promise<Object>} Complete processing result
     */
    async processComplete(webhookData, gate = 'theos') {
        // Process through complete integration
        const integrationResult = await this.completeIntegration.processWebhook(webhookData, gate);

        // Process through TON + Conversations
        const tonConversationsResult = await this.tonConversations.processWebhookWithTON(webhookData);

        return {
            integration: integrationResult,
            ton_conversations: tonConversationsResult,
            complete: true
        };
    }
}

module.exports = CompleteWebhookHandler;
