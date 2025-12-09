/**
 * 🔗 ENS/IPNS MANAGER
 * Manages ENS and IPNS records for witness.txt and dynamic content
 * Domain: tig08bitties.uni.eth
 */

const { ethers } = require('ethers');
const ipns = require('ipns');

class ENSIPNSManager {
    constructor(options = {}) {
        this.provider = options.provider || new ethers.providers.JsonRpcProvider(
            options.rpcUrl || 'https://eth.llamarpc.com'
        );
        this.signer = options.signer; // Wallet for transactions
        this.ensDomain = options.ensDomain || 'tig08bitties.uni.eth';
        this.ipfs = options.ipfs;
    }

    /**
     * Resolve ENS domain to content hash
     * @param {string} domain - ENS domain (default: tig08bitties.uni.eth)
     * @returns {Promise<string|null>} IPFS CID or null
     */
    async resolveENS(domain = null) {
        try {
            const targetDomain = domain || this.ensDomain;
            const resolver = await this.provider.getResolver(targetDomain);
            
            if (!resolver) {
                console.warn(`⚠️  No resolver found for ${targetDomain}`);
                return null;
            }

            // Get contenthash (IPFS/IPNS)
            const contentHash = await resolver.getContentHash();
            return contentHash;
        } catch (error) {
            console.error('❌ ENS resolution failed:', error);
            return null;
        }
    }

    /**
     * Set ENS content hash
     * @param {string} cid - IPFS CID
     * @param {string} domain - ENS domain
     * @returns {Promise<string>} Transaction hash
     */
    async setENSContentHash(cid, domain = null) {
        if (!this.signer) {
            throw new Error('Signer required for ENS updates');
        }

        const targetDomain = domain || this.ensDomain;
        const resolver = await this.provider.getResolver(targetDomain);
        
        if (!resolver) {
            throw new Error(`No resolver found for ${targetDomain}`);
        }

        // Convert CID to contenthash format
        const contentHash = this.cidToContentHash(cid);
        
        // Set contenthash
        const tx = await resolver.setContentHash(contentHash);
        await tx.wait();

        console.log(`✅ ENS content hash updated: ${targetDomain} → ${cid}`);
        return tx.hash;
    }

    /**
     * Create IPNS key and publish CID
     * @param {string} cid - IPFS CID to publish
     * @returns {Promise<{key: string, name: string}>} IPNS key and name
     */
    async publishIPNS(cid) {
        if (!this.ipfs) {
            throw new Error('IPFS instance required for IPNS');
        }

        try {
            // Create IPNS key
            const key = await this.ipfs.key.gen('theos-witness', { type: 'rsa', size: 2048 });
            
            // Publish CID to IPNS
            await this.ipfs.name.publish(cid, { key: key.name });
            
            console.log(`✅ IPNS published: ${key.name} → ${cid}`);
            
            return {
                key: key.id,
                name: key.name,
                cid: cid
            };
        } catch (error) {
            console.error('❌ IPNS publish failed:', error);
            throw error;
        }
    }

    /**
     * Resolve IPNS name to CID
     * @param {string} ipnsName - IPNS name
     * @returns {Promise<string>} IPFS CID
     */
    async resolveIPNS(ipnsName) {
        if (!this.ipfs) {
            throw new Error('IPFS instance required for IPNS');
        }

        try {
            const cid = await this.ipfs.name.resolve(ipnsName);
            return cid.toString();
        } catch (error) {
            console.error('❌ IPNS resolution failed:', error);
            throw error;
        }
    }

    /**
     * Update witness.txt in IPFS and publish to ENS/IPNS
     * @param {string} witnessContent - Witness.txt content
     * @returns {Promise<{cid: string, ipns: string, ens: string}>}
     */
    async updateWitness(witnessContent) {
        // Store in IPFS
        const cid = await this.ipfs.add(witnessContent);
        console.log(`📜 Witness.txt stored: ${cid.path}`);

        // Publish to IPNS
        const ipnsResult = await this.publishIPNS(cid.path);
        console.log(`🔗 IPNS published: ${ipnsResult.name}`);

        // Update ENS (if signer available)
        let ensTx = null;
        if (this.signer) {
            try {
                ensTx = await this.setENSContentHash(cid.path);
                console.log(`🔗 ENS updated: ${ensTx}`);
            } catch (error) {
                console.warn('⚠️  ENS update failed (may need resolver setup):', error.message);
            }
        }

        return {
            cid: cid.path,
            ipns: ipnsResult.name,
            ens: ensTx || 'manual_update_required'
        };
    }

    /**
     * Convert IPFS CID to contenthash format
     * @param {string} cid - IPFS CID
     * @returns {string} Contenthash hex string
     */
    cidToContentHash(cid) {
        // Remove /ipfs/ prefix if present
        const cleanCid = cid.replace(/^\/ipfs\//, '');
        
        // For IPFS CIDs, format as: 0xe3010170... (ipfs code + multihash)
        // This is a simplified version - full implementation would use multiformats
        return `0xe3010170${cleanCid}`;
    }

    /**
     * Get witness.txt from ENS/IPNS
     * @returns {Promise<string>} Witness content
     */
    async getWitness() {
        // Try ENS first
        const ensContentHash = await this.resolveENS();
        if (ensContentHash) {
            const cid = this.contentHashToCID(ensContentHash);
            const content = await this.ipfs.cat(cid);
            return content.toString();
        }

        // Fallback to IPNS
        // (Would need to store IPNS name somewhere)
        throw new Error('No witness found in ENS/IPNS');
    }

    /**
     * Convert contenthash to CID
     * @param {string} contentHash - Contenthash hex string
     * @returns {string} IPFS CID
     */
    contentHashToCID(contentHash) {
        // Extract CID from contenthash
        // Simplified - full implementation would parse multihash
        return contentHash.replace(/^0xe3010170/, '');
    }
}

module.exports = ENSIPNSManager;
