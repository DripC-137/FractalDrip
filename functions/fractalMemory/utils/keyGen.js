// utils/keyGen.js

import crypto from 'crypto';
import memoryConfig from '../memoryConfig.js';

// Deterministic UID-based key
export function generateUserKey(uid) {
  return crypto
    .createHash('sha256') // deterministic, 32-byte key
    .update(uid + '|fractal_salt_21984')
    .digest(); // returns Buffer
}

// Password-based key derivation (e.g. for user-supplied password)
export function deriveKeyFromPassword(password, salt = 'fractal_salt_21984') {
  return crypto.scryptSync(password, salt, memoryConfig.ENCRYPTION.KEY_SIZE);
}
