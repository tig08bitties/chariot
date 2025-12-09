/**
 * 🔐 GITHUB WEBHOOK VERIFIER
 * Verifies GitHub webhook signatures and routes events to Archivist OS
 */

const crypto = require('crypto');

class GitHubWebhookVerifier {
    constructor(secret) {
        this.secret = secret;
    }

    /**
     * Verify GitHub webhook signature
     * @param {string} payload - Raw request body
     * @param {string} signature - X-Hub-Signature-256 header
     * @returns {boolean}
     */
    verifySignature(payload, signature) {
        if (!signature) {
            return false;
        }

        const hmac = crypto.createHmac('sha256', this.secret);
        const digest = 'sha256=' + hmac.update(payload).digest('hex');
        
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(digest)
        );
    }

    /**
     * Parse webhook event
     * @param {Object} event - GitHub webhook event
     * @returns {Object} Parsed event data
     */
    parseEvent(event) {
        const {
            action,
            workflow_job,
            repository,
            sender
        } = event;

        return {
            type: 'workflow_job',
            action: action,
            workflow: {
                name: workflow_job?.workflow_name,
                status: workflow_job?.status,
                conclusion: workflow_job?.conclusion,
                run_id: workflow_job?.run_id,
                run_url: workflow_job?.run_url,
                head_sha: workflow_job?.head_sha,
                head_branch: workflow_job?.head_branch,
                started_at: workflow_job?.started_at,
                completed_at: workflow_job?.completed_at
            },
            repository: {
                name: repository?.name,
                full_name: repository?.full_name,
                url: repository?.html_url
            },
            sender: {
                login: sender?.login,
                id: sender?.id,
                avatar: sender?.avatar_url
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Generate identity proof from webhook
     * @param {Object} event - Parsed event
     * @returns {Object} Identity proof
     */
    generateIdentityProof(event) {
        const proofData = {
            domain: 'theos.brave',
            repository: event.repository.full_name,
            workflow: event.workflow.name,
            commit: event.workflow.head_sha,
            status: event.workflow.conclusion,
            timestamp: event.timestamp,
            identity: {
                github: event.sender.login,
                ud: 'theos.brave',
                author: 'θεός'
            }
        };

        // Generate proof hash
        const proofString = JSON.stringify(proofData);
        const proofHash = crypto.createHash('sha256').update(proofString).digest('hex');

        return {
            ...proofData,
            proof_hash: proofHash,
            proof_type: 'github_webhook_identity_loop'
        };
    }
}

module.exports = GitHubWebhookVerifier;
