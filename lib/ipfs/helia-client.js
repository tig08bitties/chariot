/**
 * 🌐 HELIA CLIENT
 * Client-side IPFS node using Helia
 * Enables browser-based IPFS access for bridgeworld.lol portal
 */

// Browser-compatible Helia setup
class HeliaClient {
    constructor(options = {}) {
        this.helia = null;
        this.initialized = false;
        this.options = {
            gateway: options.gateway || 'https://cloudflare-ipfs.com/ipfs/',
            ...options
        };
    }

    /**
     * Initialize Helia (browser IPFS node)
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.initialized) {
            return;
        }

        try {
            // Dynamic import for browser compatibility
            const { createHelia } = await import('helia');
            const { createLibp2p } = await import('libp2p');
            const { webSockets } = await import('@libp2p/websockets');
            const { webRTC } = await import('@libp2p/webrtc');
            const { memory } = await import('@helia/blockstore-memory');

            // Create LibP2P node
            const libp2p = await createLibp2p({
                transports: [
                    webSockets(),
                    webRTC()
                ],
                connectionEncryption: [() => {}], // Simplified
                streamMuxers: [() => {}], // Simplified
            });

            // Create Helia instance
            this.helia = await createHelia({
                libp2p,
                blockstore: memory()
            });

            this.initialized = true;
            console.log('✅ Helia initialized (browser IPFS node)');
        } catch (error) {
            console.warn('⚠️  Helia initialization failed, using gateway fallback:', error);
            // Fallback to gateway-only mode
            this.initialized = false;
        }
    }

    /**
     * Get content from IPFS (via Helia or gateway)
     * @param {string} cid - IPFS CID
     * @returns {Promise<string>} Content
     */
    async get(cid) {
        // Try Helia first
        if (this.helia && this.initialized) {
            try {
                const chunks = [];
                for await (const chunk of this.helia.blockstore.get(cid)) {
                    chunks.push(chunk);
                }
                return Buffer.concat(chunks).toString('utf8');
            } catch (error) {
                console.warn('⚠️  Helia get failed, using gateway:', error);
            }
        }

        // Fallback to gateway
        const response = await fetch(`${this.options.gateway}${cid}`);
        if (!response.ok) {
            throw new Error(`Gateway fetch failed: ${response.statusText}`);
        }
        return await response.text();
    }

    /**
     * Add content to IPFS (via Helia or gateway API)
     * @param {string} content - Content to add
     * @returns {Promise<string>} IPFS CID
     */
    async add(content) {
        // Try Helia first
        if (this.helia && this.initialized) {
            try {
                const cid = await this.helia.blockstore.put(content);
                return cid.toString();
            } catch (error) {
                console.warn('⚠️  Helia add failed, using gateway API:', error);
            }
        }

        // Fallback to gateway API (if available)
        // Or return null to indicate client-side add not available
        throw new Error('Client-side IPFS add requires Helia initialization');
    }

    /**
     * Get witness.txt from IPFS
     * @param {string} cid - Witness CID (optional, will resolve from ENS if not provided)
     * @returns {Promise<string>} Witness content
     */
    async getWitness(cid = null) {
        if (!cid) {
            // Resolve from ENS
            const ensManager = await import('./ens/ens-ipns-manager.js');
            const manager = new ensManager.ENSIPNSManager();
            cid = await manager.resolveENS('tig08bitties.uni.eth');
        }

        return await this.get(cid);
    }

    /**
     * Check if Helia is available
     * @returns {boolean}
     */
    isHeliaAvailable() {
        return this.initialized && this.helia !== null;
    }
}

module.exports = HeliaClient;
