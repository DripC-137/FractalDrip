// functions/fractalMemory/keyManager.js

import crypto from 'crypto';
import memoryConfig from './memoryConfig.js';

const { ENCRYPTION, HASH } = memoryConfig;

// === Key Generator (TEMP — replace with your own key derivation logic) ===
export function getKeyForUID(uid) {
  const secret = `user-secret-${uid}-salty`; // 🔐 Replace with secure per-user key logic
  return crypto.createHash('sha256').update(secret).digest().slice(0, ENCRYPTION.KEY_SIZE);
}

// === IV Generator ===
export function generateIV() {
  return crypto.randomBytes(ENCRYPTION.IV_LENGTH);
}

// === Content Hasher ===
export function hashContent(data) {
  return crypto.createHash(HASH.TYPE.toLowerCase()).update(data).digest('hex');
}
