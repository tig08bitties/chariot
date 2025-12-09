/**
 * 🚀 WEBHOOK SERVER
 * Express server for receiving GitHub webhooks
 */

const express = require('express');
const WebhookReceiver = require('./webhook-receiver');
const ArchivistWebhookIntegration = require('./archivist-integration');

class WebhookServer {
    constructor(options = {}) {
        this.port = options.port || 3000;
        this.app = express();
        this.receiver = new WebhookReceiver({
            secret: options.secret || process.env.GITHUB_WEBHOOK_SECRET
        });
        this.integration = new ArchivistWebhookIntegration(options);

        this.setupMiddleware();
        this.setupRoutes();
        this.setupEventHandlers();
    }

    setupMiddleware() {
        // Parse JSON body
        this.app.use(express.json({
            verify: (req, res, buf) => {
                req.rawBody = buf.toString('utf8');
            }
        }));

        // CORS
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type, X-Hub-Signature-256, X-GitHub-Event');
            next();
        });
    }

    setupRoutes() {
        // Webhook endpoint
        this.app.post('/webhook', (req, res) => {
            this.receiver.handleWebhook(req, res);
        });

        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                identity: {
                    github: 'tig08bitties',
                    ud: 'theos.brave',
                    author: 'θεός'
                },
                events_received: this.receiver.getEventLog().length
            });
        });

        // Event log
        this.app.get('/events', (req, res) => {
            res.json({
                events: this.receiver.getEventLog(),
                count: this.receiver.getEventLog().length
            });
        });

        // Latest event
        this.app.get('/events/latest', (req, res) => {
            const latest = this.receiver.getLatestEvent();
            res.json(latest || { message: 'No events yet' });
        });
    }

    setupEventHandlers() {
        // Forward webhook events to Archivist integration
        this.receiver.on('webhook', async (webhookData) => {
            console.log('🔔 Webhook received, processing for Archivist OS...');
            
            const archivistEvent = await this.integration.processWebhook(webhookData);
            const loopProof = this.integration.generateIdentityLoopProof(webhookData);

            console.log('✅ Identity loop proof generated:', loopProof.proof.webhook_hash);
            console.log('🏛️  Archivist event:', archivistEvent.type);
        });

        // IPFS storage events
        this.integration.on('ipfs_stored', (data) => {
            console.log('📦 IPFS stored:', data.ipfs_hash);
        });

        // Ledger entries
        this.integration.on('ledger_entry', (entry) => {
            console.log('📜 Ledger entry:', entry.type);
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log('═══════════════════════════════════════════════════════════════════════');
            console.log('║ 🔔 WEBHOOK SERVER RUNNING ║');
            console.log('═══════════════════════════════════════════════════════════════════════');
            console.log('');
            console.log(`📍 Port: ${this.port}`);
            console.log(`🔗 Webhook endpoint: http://localhost:${this.port}/webhook`);
            console.log(`🏥 Health check: http://localhost:${this.port}/health`);
            console.log(`📋 Events: http://localhost:${this.port}/events`);
            console.log('');
            console.log('🔐 Identity:');
            console.log(`   GitHub: tig08bitties`);
            console.log(`   UD: theos.brave`);
            console.log(`   Author: θεός`);
            console.log('');
            console.log('✅ Ready to receive GitHub webhooks');
            console.log('');
            console.log('═══════════════════════════════════════════════════════════════════════');
        });
    }
}

module.exports = WebhookServer;
