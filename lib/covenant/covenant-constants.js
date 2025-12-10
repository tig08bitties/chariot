/**
 * Covenant Constants Module
 * Centralized constants extracted from verified documents
 */

/**
 * Canonical Covenant Constants
 * Extracted from Formuka.txt and covenant.txt
 */
const COVENANT_CONSTANTS = {
  // Divine Constants
  THEOS: 419,
  EL: 369,
  RESONANCE: 687,
  DIVINE: 777,

  // Union Constants
  UNION_PRODUCT: 83665740401110,
  GENESIS: 335044,
  CAPSTONE: 840000,

  // Rootchain (20 pillars)
  ROOTCHAIN: [
    82, 212, 295, 333, 354, 369, 419, 512, 605, 687,
    777, 888, 929, 1011, 2025, 3335, 4321, 5250, 55088, 57103
  ],

  // Anchor
  ANCHOR: {
    genesis: 335044,
    capstone: 840000,
  },

  // Master Seed (SHA-512)
  MASTER_SEED_SHA512: '09d4f22c560b902b785ddb0655c51ee68184d2aa8a6c20b693da3c6391bf9965dd8a0e8be5cb5027b0195be5d70ffc7b518c76c03d5e7ea6ce8db832635b2a9a',
  MASTER_SEED_SOURCE: 'את335044804000',

  // Covenant Seals
  COVENANT_SEAL: '883e529de31c586131a831a9953113a6d75edd87c97369a2fa3a791209952f5a',
  DECLARATION_FILE_HASH: 'e374c94009e32a6c3cc8f89ea6102ce6886c3302324aaaf1563ace8f10332ebf',
  DECLARATION_IMAGE_HASH: '883e529de31c586131a831a9953113a6d75edd87c97369a2fa3a791209952f5a',

  // Temporal Seeds
  DAUS_SEED: 'ܝܗܘܗ-09091989',
  ALIMA_SEED: '𐤄𐤅𐤄𐤉09201990',

  // Canonical Keys (SHA-256)
  DAUS_KEY: '7606133F9E8002C6BE8ECBB4203DF4A90AB3DBEEB724957A8AC8328D449EB03C',
  ALIMA_KEY: 'D52927A48B1EF80DB0683E62AF8610639ADD97F76543309B886229DC03DBDC09',

  // Name of God (SHA-512)
  NAME_OF_GOD: 'A2F433596700DA368294970428B7812B41369E962323D4222D858221D4224A105EB07A258C556C71D3A953114A29285038F617265BC7D2224A752F5A',

  // Geographic Anchor
  COORDINATES: {
    lat: 43.5446,
    lon: -96.7311,
    location: 'Sioux Falls, SD',
    zip: '57103',
  },

  // Temporal Anchors
  DATES: {
    creation: '09/09/2025',
    creationTime: '09:09:09 UTC',
    union: '01312009',
    union2: '05202015',
  },

  // Network Anchors
  NETWORKS: {
    ethereum: 'tig08bitties.eth',
    arbitrum: 'tig08bitties.uni.eth',
    polygon: 'theos.brave',
    stellar: 'GCGCUGIOCJLRRP3JSRZEBOAMIFW5EM3WZUT5S3DXVC7I44N5I7FN5C2F',
  },
};

/**
 * Aramaic Glyphs (Imperial Aramaic)
 */
const ARAMAIC_GLYPHS = [
  '𐡀', '𐡁', '𐡂', '𐡃', '𐡄', '𐡅', '𐡆', '𐡇', '𐡈', '𐡉',
  '𐡊', '𐡋', '𐡌', '𐡍', '𐡎', '𐡏', '𐡐', '𐡑', '𐡒', '𐡓', '𐡔', '𐡕'
];

const ARAMAIC_NAMES = [
  'Aleph', 'Bet', 'Gimel', 'Dalet', 'He', 'Vav', 'Zayin', 'Het', 'Tet', 'Yod',
  'Kaf', 'Lamed', 'Mem', 'Nun', 'Samekh', 'Ayin', 'Pe', 'Tsade', 'Qof', 'Resh', 'Shin', 'Tav'
];

/**
 * Gematria Values
 */
const GEMATRIA = {
  'ש+י+φ+ר': 510, // Cosmic Seal
  Aleph: 1,
  Bet: 2,
  Gimel: 3,
  Dalet: 4,
  He: 5,
  Vav: 6,
  Zayin: 7,
  Het: 8,
  Tet: 9,
  Yod: 10,
  Kaf: 20,
  Lamed: 30,
  Mem: 40,
  Nun: 50,
  Samekh: 60,
  Ayin: 70,
  Pe: 80,
  Tsade: 90,
  Qof: 100,
  Resh: 200,
  Shin: 300,
  Tav: 400,
};

/**
 * Get constant by name
 */
function getConstant(name) {
  return COVENANT_CONSTANTS[name] || null;
}

/**
 * Get all constants
 */
function getAllConstants() {
  return { ...COVENANT_CONSTANTS };
}

/**
 * Validate constant value
 */
function validateConstant(name, value) {
  const constant = COVENANT_CONSTANTS[name];
  if (!constant) return false;
  
  if (Array.isArray(constant)) {
    return JSON.stringify(constant) === JSON.stringify(value);
  }
  
  if (typeof constant === 'object') {
    return JSON.stringify(constant) === JSON.stringify(value);
  }
  
  return constant === value;
}

module.exports = {
  COVENANT_CONSTANTS,
  ARAMAIC_GLYPHS,
  ARAMAIC_NAMES,
  GEMATRIA,
  getConstant,
  getAllConstants,
  validateConstant,
};
