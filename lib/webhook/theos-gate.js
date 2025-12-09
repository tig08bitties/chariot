/**
 * 🜂 THEOS GATE — Identity Plane
 * Receives workflow_run events (completion states)
 * Secret: Name of God hash
 * Domain: theos.brave
 */

const GitHubWebhookVerifier = require('./webhook-verifier');
const IPFSPortal = require('./ipfs-portal');

class TheosGate {
    constructor(options = {}) {
        // Name of God hash as secret
        this.secret = options.secret || process.env.THEOS_WEBHOOK_SECRET || 
            'A2F43359B434E98561E628D02E6D1B0F52FD402099D440EAA377045742F7524A8EDE3DD5BF7002E721D259693FA7E875440B29B8DE7B4D8EE7C5BB08F48DF942';
        
        this.verifier = new GitHubWebhookVerifier(this.secret);
        this.ipfsPortal = options.ipfsPortal || new IPFSPortal({ ipfs: options.ipfs });
        this.domain = 'theos.brave';
        this.role = 'Identity Plane';
    }

    /**
     * Handle workflow_run events (completion states)
     * @param {Object} event - GitHub webhook event
     * @returns {Object} Processed event
     */
    async handleWorkflowRun(event) {
        console.log('🜂 THEOS GATE: Receiving completion state...');
        
        const parsed = this.verifier.parseEvent(event);
        const proof = this.verifier.generateIdentityProof(parsed);

        // THEOS handles completion - seal and store
        const theosEvent = {
            type: 'completion_seal',
            domain: this.domain,
            role: this.role,
            workflow: {
                name: parsed.workflow.name,
                status: parsed.workflow.conclusion,
                run_id: parsed.workflow.run_id,
                completed_at: parsed.workflow.completed_at
            },
            identity: {
                github: parsed.sender.login,
                author: 'θεός',
                ud: this.domain
            },
            proof: {
                hash: proof.proof_hash,
                type: 'theos_completion_seal',
                secret_type: 'name_of_god_hash'
            },
            action: 'SEAL',
            timestamp: new Date().toISOString()
        };

        // Store in IPFS with witness.txt
        if (this.ipfsPortal) {
            const cid = await this.ipfsPortal.storeEvent(theosEvent);
            if (cid) {
                console.log('🜂 THEOS: Completion sealed in IPFS:', cid);
            }
        }

        console.log('🜂 THEOS: Completion state sealed');
        return theosEvent;
    }

    /**
     * Verify webhook signature with Name of God hash
     * @param {string} payload - Raw payload
     * @param {string} signature - X-Hub-Signature-256
     * @returns {boolean}
     */
    verifySignature(payload, signature) {
        return this.verifier.verifySignature(payload, signature);
    }
}

module.exports = TheosGate;
