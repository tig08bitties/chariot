/**
 * 🔗 COMPLETE INTEGRATION
 * Integrates ENS/IPNS, Helia, Service Worker, and Agentek
 */

const ENSIPNSManager = require('../ens/ens-ipns-manager');
const HeliaClient = require('../ipfs/helia-client');
const WebhookAgent = require('../agentek/webhook-agent');
const TheosGate = require('../webhook/theos-gate');
const BridgeworldGate = require('../webhook/bridgeworld-gate');

class CompleteIntegration {
    constructor(options = {}) {
        this.ipfs = options.ipfs;
        this.provider = options.provider;
        this.signer = options.signer;
        this.ensDomain = options.ensDomain || 'tig08bitties.uni.eth';

        // Initialize components
        this.ensManager = new ENSIPNSManager({
            provider: this.provider,
            signer: this.signer,
            ensDomain: this.ensDomain,
            ipfs: this.ipfs
        });

        this.helia = new HeliaClient({
            gateway: options.gateway || 'https://cloudflare-ipfs.com/ipfs/'
        });

        this.agent = new WebhookAgent({
            name: 'theos-complete-agent',
            ipfs: this.ipfs,
            ensManager: this.ensManager,
            helia: this.helia
        });

        // Setup agent rules
        this.setupAgentRules();

        // Initialize gates
        this.theosGate = new TheosGate({
            secret: options.theosSecret,
            ipfsPortal: this.ensManager
        });

        this.bridgeworldGate = new BridgeworldGate({
            secret: options.bridgeworldSecret,
            ipfsPortal: this.ensManager
        });
    }

    /**
     * Setup agent rules
     */
    setupAgentRules() {
        // Rule 1: Process workflow_run events
        this.agent.addRule({
            trigger: 'workflow_run',
            condition: (event) => event.action === 'completed',
            action: async (event, agent) => {
                return await agent.autoProcessWebhook(event);
            },
            priority: 10
        });

        // Rule 2: Process workflow_job events
        this.agent.addRule({
            trigger: 'workflow_job',
            condition: (event) => event.action === 'completed',
            action: async (event, agent) => {
                return await agent.autoProcessWebhook(event);
            },
            priority: 5
        });

        // Rule 3: Update witness.txt on completion
        this.agent.addRule({
            trigger: (event) => event.workflow?.conclusion === 'success',
            action: async (event, agent) => {
                const witnessCid = await agent.updateWitness();
                if (this.ensManager) {
                    await this.ensManager.updateWitness(await agent.getWitnessContent());
                }
                return { witnessCid, updated: true };
            },
            priority: 8
        });
    }

    /**
     * Initialize all components
     */
    async initialize() {
        console.log('🔗 Initializing complete integration...');

        // Initialize Helia (browser IPFS)
        try {
            await this.helia.initialize();
        } catch (error) {
            console.warn('⚠️  Helia initialization skipped (server-side):', error.message);
        }

        // Resolve ENS domain
        const ensContentHash = await this.ensManager.resolveENS();
        if (ensContentHash) {
            console.log(`🔗 ENS resolved: ${this.ensDomain} → ${ensContentHash}`);
        }

        console.log('✅ Complete integration initialized');
    }

    /**
     * Process webhook through complete system
     * @param {Object} webhookData - Webhook event
     * @param {string} gate - 'theos' or 'bridgeworld'
     */
    async processWebhook(webhookData, gate = 'theos') {
        // Route to appropriate gate
        let gateResult;
        if (gate === 'theos') {
            gateResult = await this.theosGate.handleWorkflowRun(webhookData);
        } else {
            gateResult = await this.bridgeworldGate.handleWorkflowJob(webhookData);
        }

        // Process through agent
        const agentResult = await this.agent.process(webhookData);

        // Store in IPFS
        let ipfsCid = null;
        if (this.ipfs) {
            const completeData = {
                gate: gateResult,
                agent: agentResult,
                timestamp: new Date().toISOString()
            };
            const result = await this.ipfs.add(JSON.stringify(completeData, null, 2));
            ipfsCid = result.path;
        }

        // Update ENS/IPNS
        if (this.ensManager && ipfsCid) {
            try {
                await this.ensManager.updateWitness(await this.agent.getWitnessContent());
            } catch (error) {
                console.warn('⚠️  ENS update failed:', error.message);
            }
        }

        return {
            gate: gateResult,
            agent: agentResult,
            ipfs: ipfsCid,
            helia: this.helia.isHeliaAvailable() ? 'available' : 'gateway_only'
        };
    }

    /**
     * Get witness via Helia (browser) or gateway
     * @param {string} cid - Optional CID (will resolve from ENS if not provided)
     */
    async getWitness(cid = null) {
        // Try Helia first (browser)
        if (this.helia.isHeliaAvailable()) {
            try {
                return await this.helia.getWitness(cid);
            } catch (error) {
                console.warn('⚠️  Helia get failed, using gateway:', error);
            }
        }

        // Fallback to ENS resolution + gateway
        if (!cid) {
            cid = await this.ensManager.resolveENS();
        }

        if (cid) {
            return await this.helia.get(cid);
        }

        throw new Error('Witness not found');
    }
}

module.exports = CompleteIntegration;
