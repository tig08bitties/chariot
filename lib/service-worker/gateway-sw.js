/**
 * 🔄 SERVICE WORKER GATEWAY
 * Browser-based IPFS gateway for bridgeworld.lol portal
 * Enables direct IPFS access without external gateways
 */

// Service Worker for IPFS Gateway
const IPFS_GATEWAY_CACHE = 'ipfs-gateway-cache-v1';
const WITNESS_CID_KEY = 'witness-cid';

self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');
    event.waitUntil(
        caches.open(IPFS_GATEWAY_CACHE).then((cache) => {
            console.log('✅ IPFS Gateway cache created');
            return cache.addAll([
                '/',
                '/witness.txt',
                '/lib/ipfs/helia-client.js'
            ]);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker activated');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== IPFS_GATEWAY_CACHE) {
                        console.log('🗑️  Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Handle IPFS CID requests
    if (url.pathname.startsWith('/ipfs/')) {
        event.respondWith(handleIPFSRequest(event.request));
        return;
    }

    // Handle IPNS requests
    if (url.pathname.startsWith('/ipns/')) {
        event.respondWith(handleIPNSRequest(event.request));
        return;
    }

    // Handle witness.txt requests
    if (url.pathname === '/witness.txt' || url.pathname.endsWith('/witness.txt')) {
        event.respondWith(handleWitnessRequest(event.request));
        return;
    }

    // Default: network first, cache fallback
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});

/**
 * Handle IPFS CID requests
 */
async function handleIPFSRequest(request) {
    const url = new URL(request.url);
    const cid = url.pathname.replace('/ipfs/', '');

    // Check cache first
    const cache = await caches.open(IPFS_GATEWAY_CACHE);
    const cached = await cache.match(request);
    if (cached) {
        return cached;
    }

    // Try multiple gateways
    const gateways = [
        `https://cloudflare-ipfs.com/ipfs/${cid}`,
        `https://ipfs.io/ipfs/${cid}`,
        `https://gateway.pinata.cloud/ipfs/${cid}`,
        `https://dweb.link/ipfs/${cid}`
    ];

    for (const gatewayUrl of gateways) {
        try {
            const response = await fetch(gatewayUrl);
            if (response.ok) {
                // Cache the response
                await cache.put(request, response.clone());
                return response;
            }
        } catch (error) {
            console.warn(`⚠️  Gateway failed: ${gatewayUrl}`, error);
        }
    }

    return new Response('IPFS content not found', { status: 404 });
}

/**
 * Handle IPNS requests
 */
async function handleIPNSRequest(request) {
    const url = new URL(request.url);
    const ipnsName = url.pathname.replace('/ipns/', '');

    // Resolve IPNS to CID (would need IPNS resolver)
    // For now, check if we have a cached mapping
    const cache = await caches.open(IPFS_GATEWAY_CACHE);
    const ipnsKey = `ipns:${ipnsName}`;
    const cachedCid = await cache.match(ipnsKey);

    if (cachedCid) {
        const cid = await cachedCid.text();
        return handleIPFSRequest(new Request(`/ipfs/${cid}`));
    }

    // Fallback: try to resolve via gateway
    const gatewayUrl = `https://ipfs.io/ipns/${ipnsName}`;
    try {
        const response = await fetch(gatewayUrl);
        if (response.ok) {
            // Cache the IPNS -> CID mapping
            const cid = extractCIDFromResponse(response);
            await cache.put(ipnsKey, new Response(cid));
            return response;
        }
    } catch (error) {
        console.warn('⚠️  IPNS resolution failed:', error);
    }

    return new Response('IPNS content not found', { status: 404 });
}

/**
 * Handle witness.txt requests
 */
async function handleWitnessRequest(request) {
    const cache = await caches.open(IPFS_GATEWAY_CACHE);
    
    // Check for cached witness CID
    const witnessCidResponse = await cache.match(WITNESS_CID_KEY);
    if (witnessCidResponse) {
        const witnessCid = await witnessCidResponse.text();
        const witnessRequest = new Request(`/ipfs/${witnessCid}`);
        return handleIPFSRequest(witnessRequest);
    }

    // Try to get from ENS
    try {
        // This would need to be implemented with ENS resolver
        // For now, return cached witness.txt if available
        const cached = await cache.match('/witness.txt');
        if (cached) {
            return cached;
        }
    } catch (error) {
        console.warn('⚠️  Witness resolution failed:', error);
    }

    return new Response('Witness not found', { status: 404 });
}

/**
 * Extract CID from response (helper)
 */
function extractCIDFromResponse(response) {
    // This would parse the response to extract CID
    // Simplified version
    return response.headers.get('x-ipfs-path')?.replace('/ipfs/', '') || null;
}

// Store witness CID (called from main thread)
self.addEventListener('message', (event) => {
    if (event.data.type === 'SET_WITNESS_CID') {
        const cid = event.data.cid;
        caches.open(IPFS_GATEWAY_CACHE).then((cache) => {
            cache.put(WITNESS_CID_KEY, new Response(cid));
            console.log('📜 Witness CID stored:', cid);
        });
    }
});
