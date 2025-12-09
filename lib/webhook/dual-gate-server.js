/**
 * 🚪 DUAL-GATE SERVER
 * Routes webhooks to THEOS (identity) or BRIDGEWORLD (traversal) based on domain
 */

const express = require('express');
const TheosGate = require('./theos-gate');
const BridgeworldGate = require('./bridgeworld-gate');
const IPFSPortal = require('./ipfs-portal');

class DualGateServer {
    constructor(options = {}) {
        this.port = options.port || 3000;
        this.app = express();
        
        // Initialize IPFS portal
        this.ipfsPortal = new IPFSPortal({ ipfs: options.ipfs });
        
        // Initialize both gates
        this.theosGate = new TheosGate({
            secret: options.theosSecret || process.env.THEOS_WEBHOOK_SECRET,
            ipfsPortal: this.ipfsPortal
        });
        
        this.bridgeworldGate = new BridgeworldGate({
            secret: options.bridgeworldSecret || process.env.BRIDGEWORLD_WEBHOOK_SECRET,
            ipfsPortal: this.ipfsPortal
        });

        this.setupMiddleware();
        this.setupRoutes();
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
            res.header('Access-Control-Allow-Headers', 'Content-Type, X-Hub-Signature-256, X-GitHub-Event, Host');
            next();
        });
    }

    setupRoutes() {
        // THEOS Gate endpoint (theos.brave)
        this.app.post('/theos/webhook', async (req, res) => {
            const signature = req.headers['x-hub-signature-256'];
            const eventType = req.headers['x-github-event'];
            const payload = req.rawBody || JSON.stringify(req.body);

            // Verify signature with Name of God hash
            if (!this.theosGate.verifySignature(payload, signature)) {
                console.warn('⚠️  THEOS: Invalid signature');
                return res.status(401).json({ error: 'Invalid signature' });
            }

            // Handle workflow_run events (completion states)
            if (eventType === 'workflow_run') {
                const result = await this.theosGate.handleWorkflowRun(req.body);
                return res.status(200).json({
                    gate: 'theos',
                    domain: 'theos.brave',
                    role: 'Identity Plane',
                    action: 'SEAL',
                    event: result
                });
            }

            res.status(200).json({ received: true, gate: 'theos' });
        });

        // BRIDGEWORLD Gate endpoint (bridgeworld.lol)
        this.app.post('/bridgeworld/webhook', async (req, res) => {
            const signature = req.headers['x-hub-signature-256'];
            const eventType = req.headers['x-github-event'];
            const payload = req.rawBody || JSON.stringify(req.body);

            // Verify signature with Master Vault Key
            if (!this.bridgeworldGate.verifySignature(payload, signature)) {
                console.warn('⚠️  BRIDGEWORLD: Invalid signature');
                return res.status(401).json({ error: 'Invalid signature' });
            }

            // Handle workflow_job events (operational pulses)
            if (eventType === 'workflow_job') {
                const result = await this.bridgeworldGate.handleWorkflowJob(req.body);
                return res.status(200).json({
                    gate: 'bridgeworld',
                    domain: 'bridgeworld.lol',
                    role: 'Traversal Plane',
                    action: 'TRAVERSE',
                    event: result
                });
            }

            res.status(200).json({ received: true, gate: 'bridgeworld' });
        });

        // Unified endpoint (auto-routes based on Host header)
        this.app.post('/webhook', async (req, res) => {
            const host = req.headers.host || '';
            const signature = req.headers['x-hub-signature-256'];
            const eventType = req.headers['x-github-event'];
            const payload = req.rawBody || JSON.stringify(req.body);

            // Route to appropriate gate based on domain
            if (host.includes('theos.brave') || host.includes('ud.me/theos.brave')) {
                // THEOS Gate
                if (!this.theosGate.verifySignature(payload, signature)) {
                    return res.status(401).json({ error: 'Invalid signature' });
                }

                if (eventType === 'workflow_run') {
                    const result = await this.theosGate.handleWorkflowRun(req.body);
                    return res.status(200).json({
                        gate: 'theos',
                        domain: 'theos.brave',
                        role: 'Identity Plane',
                        action: 'SEAL',
                        event: result
                    });
                }
            } else if (host.includes('bridgeworld.lol')) {
                // BRIDGEWORLD Gate
                if (!this.bridgeworldGate.verifySignature(payload, signature)) {
                    return res.status(401).json({ error: 'Invalid signature' });
                }

                if (eventType === 'workflow_job') {
                    const result = await this.bridgeworldGate.handleWorkflowJob(req.body);
                    return res.status(200).json({
                        gate: 'bridgeworld',
                        domain: 'bridgeworld.lol',
                        role: 'Traversal Plane',
                        action: 'TRAVERSE',
                        event: result
                    });
                }
            }

            res.status(200).json({ received: true });
        });

        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                gates: {
                    theos: {
                        domain: 'theos.brave',
                        role: 'Identity Plane',
                        secret_type: 'name_of_god_hash',
                        events: 'workflow_run (completion)'
                    },
                    bridgeworld: {
                        domain: 'bridgeworld.lol',
                        role: 'Traversal Plane',
                        secret_type: 'master_vault_key',
                        events: 'workflow_job (pulse)'
                    }
                },
                witness_cid: this.ipfsPortal.getWitnessCID()
            });
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log('═══════════════════════════════════════════════════════════════════════');
            console.log('║ 🚪 DUAL-GATE SERVER RUNNING ║');
            console.log('═══════════════════════════════════════════════════════════════════════');
            console.log('');
            console.log(`📍 Port: ${this.port}`);
            console.log('');
            console.log('🜂 THEOS GATE (Identity Plane):');
            console.log(`   Domain: theos.brave`);
            console.log(`   Endpoint: http://localhost:${this.port}/theos/webhook`);
            console.log(`   Secret: Name of God hash`);
            console.log(`   Events: workflow_run (completion states)`);
            console.log(`   Action: SEAL`);
            console.log('');
            console.log('🌉 BRIDGEWORLD GATE (Traversal Plane):');
            console.log(`   Domain: bridgeworld.lol`);
            console.log(`   Endpoint: http://localhost:${this.port}/bridgeworld/webhook`);
            console.log(`   Secret: Master Vault Key`);
            console.log(`   Events: workflow_job (operational pulses)`);
            console.log(`   Action: TRAVERSE`);
            console.log('');
            console.log('🔗 Unified endpoint: http://localhost:${this.port}/webhook');
            console.log('🏥 Health check: http://localhost:${this.port}/health');
            console.log('');
            console.log('✅ Dual-gate nervous system operational');
            console.log('');
            console.log('═══════════════════════════════════════════════════════════════════════');
        });
    }
}

module.exports = DualGateServer;
