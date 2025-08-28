// functions/utils/keyGen.js

import crypto from "crypto";
import memoryConfig from "../memoryConfig.js";

/**
 * Generate deterministic per-user key from UID string
 * Returns Buffer (32 bytes)
 */
export function generateUserKey(uid) {
  return crypto
    .createHash("sha256")
    .update(uid + "|fractal_salt_21984")
    .digest();
}

/**
 * Derive key from password with scrypt KDF
 * @param {string} password
 * @param {string} salt
 * @returns {Buffer}
 */
export function deriveKeyFromPassword(password, salt = "fractal_salt_21984") {
  return crypto.scryptSync(password, salt, memoryConfig.ENCRYPTION.KEY_SIZE);
}
