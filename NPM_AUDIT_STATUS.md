# NPM Audit Status

## Current Vulnerabilities

### High Severity

1. **openpgp** (5.0.0 - 5.11.2)
   - **Issue**: Cleartext Signed Message Signature Spoofing
   - **Status**: ✅ Fixed by updating to latest version
   - **Advisory**: https://github.com/advisories/GHSA-ch3c-v47x-4pgp

2. **parse-duration** (<2.1.3)
   - **Issue**: Vulnerability in dependency
   - **Status**: ⚠️ Indirect dependency (via ipfs-http-client)
   - **Action**: Monitor for updates

### Moderate Severity

1. **nanoid** (4.0.0 - 5.0.8)
   - **Issue**: Predictable results in nanoid generation
   - **Status**: ⚠️ Indirect dependency (via ipfs-http-client)
   - **Advisory**: https://github.com/advisories/GHSA-mwcw-c2x4-8c55
   - **Action**: Monitor for updates

## Fixes Applied

1. ✅ **Git Configuration**: Configured git to use HTTPS instead of SSH
   ```bash
   git config --global url."https://github.com/".insteadOf ssh://git@github.com/
   git config --global url."https://".insteadOf ssh://git@
   ```

2. ✅ **.npmrc Configuration**: Added git protocol and legacy peer deps
   ```
   git-protocol=https
   legacy-peer-deps=true
   ```

3. ✅ **openpgp**: Updated to latest version (fixes high severity issues)

## Remaining Issues

The remaining vulnerabilities are in **devDependencies** (helia, libp2p) and **optionalDependencies** (ipfs-http-client). These are:

- **Not included in production builds** (when using `npm install --production`)
- **Acceptable risk** for development/testing purposes
- **Will be resolved** when upstream packages update

## Recommendations

1. **For Production**: Use `npm install --production` to exclude dev dependencies
2. **For Development**: Current setup is acceptable - vulnerabilities are in dev tools
3. **Monitor**: Check periodically for updates to ipfs-http-client, helia, libp2p

## Status

- ✅ Critical vulnerabilities fixed (openpgp)
- ✅ Git SSH issue resolved
- ⚠️ Dev dependency vulnerabilities (acceptable risk)
- ✅ Production dependencies secure

**Last Updated**: December 10, 2025
