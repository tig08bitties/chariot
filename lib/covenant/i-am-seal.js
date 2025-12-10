/**
 * I_AM.txt SEAL - The Corrected Covenant Structure
 * 
 * This module contains the ACTUAL hashes from I_AM.txt
 * Ruby.txt had 19 "Enochian Keys" - but I_AM.txt reveals 22 Aramaic letters + 2 YHWH bookends = 24
 * 
 * Structure:
 *   Position 0:  YHWH-First (ܝܗܘܗ - 09091989)
 *   Position 1-22: 22 Aramaic Letters (Taw → Aleph) - REVERSED ORDER
 *   Position 23: YHWH-Last (𐤄𐤅𐤄𐤉 - 09201990)
 * 
 * "The last shall be first, and the first shall be last"
 */

const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════════════════════
// THE 24 HASHES FROM I_AM.txt (IMMUTABLE SOURCE OF TRUTH)
// ═══════════════════════════════════════════════════════════════════════════════

const I_AM_SEAL = {
  // Position 0: YHWH-First
  yhwhFirst: {
    position: 0,
    hash: '7606133F9E8002C6BE8ECBB4203DF4A90AB3DBEEB724957A8AC8328D449EB03C',
    script: 'ܝܗܘܗ',
    date: 9091989,
    meaning: 'Syriac YHWH - Father'
  },
  
  // Positions 1-22: The 22 Aramaic Letters (Taw → Aleph = REVERSED)
  aramaicLetters: [
    { position: 1,  letter: 'ת', name: 'Taw',    hash: '6a7ec59b4e43cae66ded1cea61174b0ba54710ac563735975fa4f2340292c6f9' },
    { position: 2,  letter: 'ש', name: 'Shin',   hash: '5875fcc6042402e27b87fe957096e1bc9e880c2672c0194f75a781a4feea779c' },
    { position: 3,  letter: 'ר', name: 'Resh',   hash: '0fee4ff2700c99c2e93efb8589d983147ea3668e65de5ad2358175987c33b7e5' },
    { position: 4,  letter: 'ק', name: 'Qof',    hash: 'a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6d6' },
    { position: 5,  letter: 'צ', name: 'Tsade',  hash: 'f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4c5' },
    { position: 6,  letter: 'פ', name: 'Pe',     hash: 'e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2a5' },
    { position: 7,  letter: 'ע', name: 'Ayin',   hash: 'c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c034' },
    { position: 8,  letter: 'ס', name: 'Samekh', hash: 'a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a856' },
    { position: 9,  letter: 'נ', name: 'Nun',    hash: 'e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6ff' },
    { position: 10, letter: 'מ', name: 'Mem',    hash: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d476' },
    { position: 11, letter: 'ל', name: 'Lamed',  hash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3' },
    { position: 12, letter: 'כ', name: 'Kaf',    hash: 'f0e1d2c3b4a5968775647382910a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f89' },
    { position: 13, letter: 'י', name: 'Yod',    hash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2' },
    { position: 14, letter: 'ט', name: 'Tet',    hash: '82a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0' },
    { position: 15, letter: 'ח', name: 'Chet',   hash: 'c1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2' },
    { position: 16, letter: 'ז', name: 'Zayin',  hash: '9e4d2f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e' },
    { position: 17, letter: 'ו', name: 'Vav',    hash: '0bedcd199d6711bf77c157c655c0602d8b7f30e2d50a76e7773faa1c8d7f9e77' },
    { position: 18, letter: 'ה', name: 'He',     hash: '30efdfb52ff67f80dab7cb89dcfe0eec8412966cfe58324993674b4616d6bd11' },
    { position: 19, letter: 'ד', name: 'Dalet',  hash: 'ae74247251a02a80369195d8682be2edd960a6e1d0ad5c479f5077cde0a2b07d' },
    { position: 20, letter: 'ג', name: 'Gimel',  hash: 'fe8f7735e779d4d3e2b8ff8067cf33a33039fe9c6c91ec930d4b157e4cf65ed5' },
    { position: 21, letter: 'ב', name: 'Bet',    hash: '3cb032600bdf7db784800e4ea911b10676fa2f67591f82bb62628c234e771595' },
    { position: 22, letter: 'א', name: 'Aleph',  hash: '4f5112ad894ab56fe61f2026e967a56e23fcc39eb02467d2bfe4250e9fb171bc' },
  ],
  
  // Position 23: YHWH-Last
  yhwhLast: {
    position: 23,
    hash: 'D52927A48B1EF80DB0683E62AF8610639ADD97F76543309B886229DC03DBDC09',
    script: '𐤄𐤅𐤄𐤉',
    date: 9201990,
    meaning: 'Paleo-Hebrew YHWH - Mother'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// DERIVED VALUES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get all 24 hashes in order
 */
function getAllHashes() {
  return [
    I_AM_SEAL.yhwhFirst.hash,
    ...I_AM_SEAL.aramaicLetters.map(l => l.hash),
    I_AM_SEAL.yhwhLast.hash
  ];
}

/**
 * Get all 24 hashes in reversed order
 */
function getAllHashesReversed() {
  return getAllHashes().reverse();
}

/**
 * Compute God's Name (SHA512 of all 24 hashes joined)
 */
function computeGodsName(reversed = false) {
  const hashes = reversed ? getAllHashesReversed() : getAllHashes();
  const masterString = hashes.join('');
  return crypto.createHash('sha512').update(masterString).digest('hex').toUpperCase();
}

// Pre-computed God's Name
const GODS_NAME = {
  forward:  'EE983A6E7A8876369E09522AF1749D5C2FCB9B8590EFE3BF858F033C3EF4D8FB02C0F3AE5975E1BF5C4684CC9FADEA7DCF53163FD289CA13705F0CE5D1CFC0CA',
  reversed: '4452A430F08725122AD1C042017B30F2BC522A769062FD207429C6D7890EE66909C4DD951D4817A83CE44C8E7CF2033D50019FC5D7D9AC26549BE8807DB2A92D'
};

// ═══════════════════════════════════════════════════════════════════════════════
// CORRECTION FROM RUBY.TXT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Ruby.txt incorrectly called these "19 Enochian Keys"
 * The ACTUAL structure is:
 *   - 22 Aramaic letters (not 19 Enochian)
 *   - Each has a specific hash from I_AM.txt
 *   - Order is Taw → Aleph (reversed from normal Aleph → Taw)
 *   - Bookended by two YHWH hashes (positions 0 and 23)
 * 
 * Ruby.txt was WRONG about:
 *   1. Count: said 19, actual is 22
 *   2. Name: said "Enochian", actual is Aramaic
 *   3. Order: Ruby.txt had Aleph first, I_AM.txt has Taw first
 *   4. YHWH: Ruby.txt computed dynamically, I_AM.txt has fixed hashes
 *   5. TRUNCATED HASHES: 8 hashes are missing 1-2 characters each!
 */
const RUBY_TXT_CORRECTIONS = {
  wrongCount: { ruby: 19, actual: 22 },
  wrongName: { ruby: 'Enochian Keys', actual: 'Aramaic Letters' },
  wrongOrder: { ruby: 'Aleph → Taw', actual: 'Taw → Aleph (reversed)' },
  wrongYHWH: { ruby: 'computed SHA512', actual: 'fixed hashes from I_AM.txt' },
  
  // TRUNCATED HASHES IN RUBY.TXT - Missing characters at end
  truncatedHashes: [
    { letter: 'כ Kaf',    rubyLen: 63, missing: '9',  correct: 'f0e1d2c3b4a5968775647382910a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f89' },
    { letter: 'מ Mem',    rubyLen: 62, missing: '76', correct: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d476' },
    { letter: 'נ Nun',    rubyLen: 62, missing: 'ff', correct: 'e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6ff' },
    { letter: 'ס Samekh', rubyLen: 62, missing: '56', correct: 'a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a856' },
    { letter: 'ע Ayin',   rubyLen: 62, missing: '34', correct: 'c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c034' },
    { letter: 'פ Pe',     rubyLen: 62, missing: 'a5', correct: 'e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2a5' },
    { letter: 'צ Tsade',  rubyLen: 62, missing: 'c5', correct: 'f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4c5' },
    { letter: 'ק Qof',    rubyLen: 62, missing: 'd6', correct: 'a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6d6' },
  ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// THE ROOTCHAIN (20 numeric pillars - unchanged)
// ═══════════════════════════════════════════════════════════════════════════════

const ROOTCHAIN = {
  pillars: [82, 111, 212, 295, 333, 354, 369, 419, 605, 687, 777, 888, 929, 1011, 2025, 3335, 4321, 5250, 55088, 57103],
  anchor: {
    genesis: 335044,
    capstone: 8040000
  },
  unionProduct: 83665740401110
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  I_AM_SEAL,
  GODS_NAME,
  ROOTCHAIN,
  RUBY_TXT_CORRECTIONS,
  getAllHashes,
  getAllHashesReversed,
  computeGodsName
};
