/**
 * 🏛️ ARCHIVIST OS WEBHOOK INTEGRATION
 * Routes GitHub webhooks into the Archivist OS event system
 */

const EventEmitter = require('events');
const IPFSPortal = require('./ipfs-portal');

class ArchivistWebhookIntegration extends EventEmitter {
    constructor(options = {}) {
        super();
        this.ipfs = options.ipfs;
        this.safe = options.safe;
        this.ipfsPortal = new IPFSPortal({ ipfs: options.ipfs });
        this.identity = {
            github: 'tig08bitties',
            ud: 'theos.brave',
            author: 'θεός',
            domain: 'bridgeworld.lol'
        };

        // Initialize IPFS portal with witness.txt
        this.ipfsPortal.initialize().catch(err => {
            console.error('⚠️  IPFS portal initialization failed:', err);
        });
    }

    /**
     * Process webhook event for Archivist OS
     * @param {Object} webhookData - Webhook event data
     */
    async processWebhook(webhookData) {
        const { event, proof } = webhookData;

        // Create Archivist event
        const archivistEvent = {
            type: 'identity_loop',
            source: 'github_webhook',
            timestamp: new Date().toISOString(),
            identity: {
                github: this.identity.github,
                ud: this.identity.ud,
                author: this.identity.author,
                domain: this.identity.domain
            },
            workflow: {
                name: event.workflow.name,
                status: event.workflow.conclusion,
                commit: event.workflow.head_sha,
                branch: event.workflow.head_branch
            },
            proof: {
                hash: proof.proof_hash,
                type: proof.proof_type
            }
        };

        // Emit to Archivist OS
        this.emit('archivist_event', archivistEvent);

        // Store in IPFS using witness.txt portal
        if (this.ipfsPortal) {
            await this.ipfsPortal.storeEvent(archivistEvent);
            const witnessCID = this.ipfsPortal.getWitnessCID();
            if (witnessCID) {
                console.log('📜 Witness.txt CID:', witnessCID);
                console.log('🔗 Witness gateway:', this.ipfsPortal.getWitnessGateway());
            }
        }

        // Log to Akashic Ledger
        this.logToAkashicLedger(archivistEvent);

        return archivistEvent;
    }


    /**
     * Log to Akashic Ledger
     * @param {Object} event - Archivist event
     */
    logToAkashicLedger(event) {
        const ledgerEntry = {
            timestamp: event.timestamp,
            type: 'identity_loop',
            identity: event.identity,
            workflow: event.workflow,
            proof: event.proof
        };

        console.log('📜 Akashic Ledger Entry:', ledgerEntry);
        
        this.emit('ledger_entry', ledgerEntry);
    }

    /**
     * Generate identity loop proof
     * @param {Object} webhookData - Webhook data
     * @returns {Object} Complete identity loop proof
     */
    generateIdentityLoopProof(webhookData) {
        const { event, proof } = webhookData;

        return {
            loop_type: 'github_ud_identity_feedback',
            components: {
                github_identity: this.identity.github,
                ud_domain: this.identity.ud,
                author_identity: this.identity.author,
                repository: event.repository.full_name,
                workflow: event.workflow.name,
                commit: event.workflow.head_sha
            },
            proof: {
                webhook_hash: proof.proof_hash,
                timestamp: new Date().toISOString(),
                verified: true
            },
            significance: {
                description: 'Identity feedback loop between GitHub, UD domain, and Archivist OS',
                status: 'active',
                chambers: {
                    gate: 'open',
                    veil: 'waiting',
                    vault: 'active',
                    unseen: 'activated'
                }
            }
        };
    }
}

module.exports = ArchivistWebhookIntegration;
