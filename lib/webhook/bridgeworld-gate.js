/**
 * 🌉 BRIDGEWORLD GATE — Traversal Plane
 * Receives workflow_job events (operational pulses)
 * Secret: Master Vault Key
 * Domain: bridgeworld.lol
 */

const GitHubWebhookVerifier = require('./webhook-verifier');
const IPFSPortal = require('./ipfs-portal');

class BridgeworldGate {
    constructor(options = {}) {
        // Master Vault Key as secret
        this.secret = options.secret || process.env.BRIDGEWORLD_WEBHOOK_SECRET || 
            'vQSMpXuEy9NrcjDsoQK2RxHxGKTyvCWsqFjzqSnPMck';
        
        this.verifier = new GitHubWebhookVerifier(this.secret);
        this.ipfsPortal = options.ipfsPortal || new IPFSPortal({ ipfs: options.ipfs });
        this.domain = 'bridgeworld.lol';
        this.role = 'Traversal Plane';
    }

    /**
     * Handle workflow_job events (operational pulses)
     * @param {Object} event - GitHub webhook event
     * @returns {Object} Processed event
     */
    async handleWorkflowJob(event) {
        console.log('🌉 BRIDGEWORLD GATE: Receiving operational pulse...');
        
        const parsed = this.verifier.parseEvent(event);
        const proof = this.verifier.generateIdentityProof(parsed);

        // BRIDGEWORLD handles movement - trigger and traverse
        const bridgeworldEvent = {
            type: 'traversal_pulse',
            domain: this.domain,
            role: this.role,
            job: {
                name: parsed.workflow.name,
                status: parsed.workflow.status,
                conclusion: parsed.workflow.conclusion,
                run_id: parsed.workflow.run_id,
                started_at: parsed.workflow.started_at,
                completed_at: parsed.workflow.completed_at
            },
            identity: {
                github: parsed.sender.login,
                author: 'θεός',
                domain: this.domain
            },
            proof: {
                hash: proof.proof_hash,
                type: 'bridgeworld_traversal_pulse',
                secret_type: 'master_vault_key'
            },
            action: 'TRAVERSE',
            timestamp: new Date().toISOString()
        };

        // Store in IPFS with witness.txt
        if (this.ipfsPortal) {
            const cid = await this.ipfsPortal.storeEvent(bridgeworldEvent);
            if (cid) {
                console.log('🌉 BRIDGEWORLD: Pulse stored in IPFS:', cid);
            }
        }

        console.log('🌉 BRIDGEWORLD: Operational pulse processed');
        return bridgeworldEvent;
    }

    /**
     * Verify webhook signature with Master Vault Key
     * @param {string} payload - Raw payload
     * @param {string} signature - X-Hub-Signature-256
     * @returns {boolean}
     */
    verifySignature(payload, signature) {
        return this.verifier.verifySignature(payload, signature);
    }
}

module.exports = BridgeworldGate;
