/**
 * 🤖 WEBHOOK AGENT (Agentek-style)
 * Autonomous agent for processing webhooks and managing IPFS/ENS
 */

const EventEmitter = require('events');

class WebhookAgent extends EventEmitter {
    constructor(options = {}) {
        super();
        this.name = options.name || 'theos-webhook-agent';
        this.ipfs = options.ipfs;
        this.ensManager = options.ensManager;
        this.helia = options.helia;
        this.state = {
            processed: 0,
            errors: 0,
            lastProcessed: null
        };
        this.rules = [];
    }

    /**
     * Add processing rule
     * @param {Object} rule - Rule configuration
     */
    addRule(rule) {
        this.rules.push({
            trigger: rule.trigger,
            condition: rule.condition || (() => true),
            action: rule.action,
            priority: rule.priority || 0
        });

        // Sort by priority
        this.rules.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Process webhook event
     * @param {Object} event - Webhook event
     * @returns {Promise<Object>} Processing result
     */
    async process(event) {
        console.log(`🤖 Agent processing: ${event.type || 'unknown'}`);

        try {
            // Find matching rules
            const matchingRules = this.rules.filter(rule => {
                if (typeof rule.trigger === 'string') {
                    return event.type === rule.trigger || event.action === rule.trigger;
                }
                if (typeof rule.trigger === 'function') {
                    return rule.trigger(event);
                }
                return false;
            }).filter(rule => rule.condition(event));

            // Execute rules in priority order
            const results = [];
            for (const rule of matchingRules) {
                try {
                    const result = await rule.action(event, this);
                    results.push({ rule: rule.trigger, result, success: true });
                } catch (error) {
                    results.push({ rule: rule.trigger, error: error.message, success: false });
                    this.state.errors++;
                }
            }

            this.state.processed++;
            this.state.lastProcessed = new Date().toISOString();

            this.emit('processed', { event, results, state: this.state });

            return {
                success: true,
                results,
                state: this.state
            };
        } catch (error) {
            this.state.errors++;
            this.emit('error', { event, error });
            throw error;
        }
    }

    /**
     * Auto-process webhook and update IPFS/ENS
     */
    async autoProcessWebhook(webhookData) {
        const { event, proof } = webhookData;

        // Store in IPFS
        let ipfsCid = null;
        if (this.ipfs) {
            const eventData = {
                event,
                proof,
                timestamp: new Date().toISOString(),
                agent: this.name
            };
            const result = await this.ipfs.add(JSON.stringify(eventData, null, 2));
            ipfsCid = result.path;
            console.log(`📦 Stored in IPFS: ${ipfsCid}`);
        }

        // Update witness.txt if workflow completed
        if (event.workflow?.conclusion === 'success' && event.workflow?.name) {
            await this.updateWitness();
        }

        // Update ENS/IPNS if configured
        if (this.ensManager && ipfsCid) {
            try {
                await this.ensManager.updateWitness(await this.getWitnessContent());
                console.log('🔗 ENS/IPNS updated');
            } catch (error) {
                console.warn('⚠️  ENS/IPNS update failed:', error.message);
            }
        }

        return { ipfsCid, processed: true };
    }

    /**
     * Get witness content
     */
    async getWitnessContent() {
        const fs = require('fs');
        const path = require('path');
        const witnessPath = path.join(__dirname, '../../witness.txt');
        return fs.readFileSync(witnessPath, 'utf8');
    }

    /**
     * Update witness.txt in IPFS
     */
    async updateWitness() {
        if (!this.ipfs) {
            return;
        }

        const witnessContent = await this.getWitnessContent();
        const result = await this.ipfs.add(witnessContent);
        console.log(`📜 Witness updated in IPFS: ${result.path}`);
        return result.path;
    }

    /**
     * Get agent state
     */
    getState() {
        return {
            ...this.state,
            rules: this.rules.length,
            name: this.name
        };
    }
}

module.exports = WebhookAgent;
