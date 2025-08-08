const memoryConfig = {
  // Firebase Paths
  FIRESTORE_PATHS: {
    USERS: 'users',
    MEMORY: 'memory',
    FAST: 'fast',
    BUFFER: 'buffer',
    ARCHIVE: 'archive',
    METADATA: 'memoryMeta',
    ROUTING_INDEX: 'routingIndex',
  },

  FIREBASE: {
    STORAGE_BUCKET: 'dripverse-137.appspot.com', // ✅ Injected your real bucket
  },

  STORAGE_BASE_PATH: 'memory', // Firebase Storage base path

  // Tier limits
  TIER_LIMITS: {
    FAST: 10,
    BUFFER_SHARD_SIZE: 50,
    ARCHIVE_SHARD_SIZE: 100,
  },

  // Compression
  COMPRESSION: {
    ENABLED: true,
    LEVEL: 9,
  },

  // Encryption
  ENCRYPTION: {
    ENABLED: true,
    ALGORITHM: 'aes-256-gcm',
    KEY_SIZE: 32,   // 256-bit key
    IV_LENGTH: 12,  // Required by GCM
    TAG_LENGTH: 16, // Required by GCM
    VERSION: 'v1',  // Optional, included in output
  },

  // Hashing
  HASH: {
    TYPE: 'SHA3-512',
  },

  // Memory tier names
  TIERS: ['fast', 'buffer', 'archive'],
};

export default memoryConfig;
