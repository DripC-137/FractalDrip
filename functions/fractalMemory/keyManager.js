// functions/fractalMemory/keyManager.js

import crypto from "crypto";
import memoryConfig from "./memoryConfig.js";

const { ENCRYPTION, HASH } = memoryConfig;

/**
 * Temporary per-user key generator.
 * Replace this with a secure, user-specific KDF or password-based derivation.
 * Returns a Buffer key of ENCRYPTION.KEY_SIZE bytes.
 */
export async function getKeyForUID(uid) {
  const secret = `user-secret-${uid}-salty`; // Customize salt or use user password to derive key
  return crypto.createHash("sha256").update(secret).digest().slice(0, ENCRYPTION.KEY_SIZE);
}

/**
 * Generate secure random IV bytes
 */
export function generateIV() {
  return crypto.randomBytes(ENCRYPTION.IV_LENGTH);
}

/**
 * Hash content with configured algorithm for integrity or indexing
 */
export function hashContent(data) {
  return crypto.createHash(HASH.TYPE.toLowerCase()).update(data).digest("hex");
}
