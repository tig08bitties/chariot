/**
 * 🔔 GITHUB WEBHOOK RECEIVER
 * Receives and processes GitHub webhooks for Archivist OS integration
 */

const GitHubWebhookVerifier = require('./webhook-verifier');
const EventEmitter = require('events');

class WebhookReceiver extends EventEmitter {
    constructor(options = {}) {
        super();
        this.secret = options.secret || process.env.GITHUB_WEBHOOK_SECRET;
        this.verifier = new GitHubWebhookVerifier(this.secret);
        this.eventLog = [];
    }

    /**
     * Handle incoming webhook request
     * @param {Object} req - Express/HTTP request object
     * @param {Object} res - Express/HTTP response object
     */
    async handleWebhook(req, res) {
        const signature = req.headers['x-hub-signature-256'];
        const eventType = req.headers['x-github-event'];
        const payload = JSON.stringify(req.body);

        // Verify signature
        if (!this.verifier.verifySignature(payload, signature)) {
            console.warn('⚠️  Invalid webhook signature');
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // Parse event
        const parsedEvent = this.verifier.parseEvent(req.body);
        
        // Generate identity proof
        const identityProof = this.verifier.generateIdentityProof(parsedEvent);

        // Log event
        this.eventLog.push({
            timestamp: new Date().toISOString(),
            event: parsedEvent,
            proof: identityProof
        });

        // Emit event for Archivist OS
        this.emit('webhook', {
            type: eventType,
            event: parsedEvent,
            proof: identityProof
        });

        // Respond to GitHub
        res.status(200).json({
            received: true,
            event_type: eventType,
            proof_hash: identityProof.proof_hash
        });

        console.log('✅ Webhook received and verified:', {
            workflow: parsedEvent.workflow.name,
            status: parsedEvent.workflow.conclusion,
            proof: identityProof.proof_hash
        });
    }

    /**
     * Get event log
     * @returns {Array} Event log
     */
    getEventLog() {
        return this.eventLog;
    }

    /**
     * Get latest event
     * @returns {Object|null}
     */
    getLatestEvent() {
        return this.eventLog.length > 0 
            ? this.eventLog[this.eventLog.length - 1]
            : null;
    }
}

module.exports = WebhookReceiver;
