/**
 * 📦 IPFS PORTAL WITH WITNESS.TXT
 * Manages IPFS storage and retrieval using witness.txt as the portal entry point
 */

const fs = require('fs');
const path = require('path');

class IPFSPortal {
    constructor(options = {}) {
        this.ipfs = options.ipfs;
        this.witnessPath = options.witnessPath || path.join(__dirname, '../../witness.txt');
        this.witnessCID = null;
    }

    /**
     * Initialize IPFS portal with witness.txt
     */
    async initialize() {
        if (!this.ipfs) {
            console.warn('⚠️  IPFS not configured, using mock mode');
            return;
        }

        // Store witness.txt in IPFS
        await this.storeWitness();
    }

    /**
     * Store witness.txt in IPFS
     * @returns {string|null} IPFS CID
     */
    async storeWitness() {
        if (!this.ipfs) {
            return null;
        }

        try {
            if (!fs.existsSync(this.witnessPath)) {
                console.warn('⚠️  witness.txt not found at:', this.witnessPath);
                return null;
            }

            const witnessContent = fs.readFileSync(this.witnessPath, 'utf8');
            const result = await this.ipfs.add(witnessContent);
            
            this.witnessCID = result.path;
            console.log('📜 Witness.txt stored in IPFS:', this.witnessCID);
            
            return this.witnessCID;
        } catch (error) {
            console.error('❌ Failed to store witness.txt in IPFS:', error);
            return null;
        }
    }

    /**
     * Get witness.txt from IPFS
     * @param {string} cid - IPFS CID (optional, uses stored CID if not provided)
     * @returns {string|null} Witness content
     */
    async getWitness(cid = null) {
        if (!this.ipfs) {
            return null;
        }

        try {
            const targetCID = cid || this.witnessCID;
            if (!targetCID) {
                console.warn('⚠️  No witness CID available');
                return null;
            }

            const chunks = [];
            for await (const chunk of this.ipfs.cat(targetCID)) {
                chunks.push(chunk);
            }

            const content = Buffer.concat(chunks).toString('utf8');
            return content;
        } catch (error) {
            console.error('❌ Failed to retrieve witness.txt from IPFS:', error);
            return null;
        }
    }

    /**
     * Store event with witness reference
     * @param {Object} event - Event to store
     * @returns {string|null} IPFS CID
     */
    async storeEvent(event) {
        if (!this.ipfs) {
            return null;
        }

        try {
            // Ensure witness is stored
            if (!this.witnessCID) {
                await this.storeWitness();
            }

            const eventData = {
                event: event,
                witness: {
                    cid: this.witnessCID,
                    path: this.witnessPath,
                    gateway: this.getWitnessGateway()
                },
                timestamp: new Date().toISOString()
            };

            const eventJson = JSON.stringify(eventData, null, 2);
            const result = await this.ipfs.add(eventJson);
            
            console.log('📦 Event stored in IPFS with witness reference:', result.path);
            return result.path;
        } catch (error) {
            console.error('❌ Failed to store event in IPFS:', error);
            return null;
        }
    }

    /**
     * Get witness gateway URL
     * @returns {string} Gateway URL
     */
    getWitnessGateway() {
        if (!this.witnessCID) {
            return null;
        }

        const gateways = [
            `https://cloudflare-ipfs.com/ipfs/${this.witnessCID}`,
            `https://ipfs.io/ipfs/${this.witnessCID}`,
            `https://gateway.pinata.cloud/ipfs/${this.witnessCID}`,
            `http://127.0.0.1:8080/ipfs/${this.witnessCID}`
        ];

        return gateways[0]; // Return primary gateway
    }

    /**
     * Get all gateway URLs for witness
     * @returns {Array<string>} Gateway URLs
     */
    getAllGateways() {
        if (!this.witnessCID) {
            return [];
        }

        return [
            `https://cloudflare-ipfs.com/ipfs/${this.witnessCID}`,
            `https://ipfs.io/ipfs/${this.witnessCID}`,
            `https://gateway.pinata.cloud/ipfs/${this.witnessCID}`,
            `https://dweb.link/ipfs/${this.witnessCID}`,
            `http://127.0.0.1:8080/ipfs/${this.witnessCID}`
        ];
    }

    /**
     * Get witness CID
     * @returns {string|null}
     */
    getWitnessCID() {
        return this.witnessCID;
    }
}

module.exports = IPFSPortal;
