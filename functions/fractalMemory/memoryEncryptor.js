// functions/fractalMemory/memoryEncryptor.js

import crypto from "crypto";
import config from "./memoryConfig.js";
import LZUTF8 from "lzutf8"; // Compression lib

// Compress text before encryption
function compressText(text) {
  return LZUTF8.compress(text, { outputEncoding: "StorageBinaryString" });
}

// Decompress text after decryption
function decompressText(compressed) {
  return LZUTF8.decompress(compressed, { inputEncoding: "StorageBinaryString" });
}

// Base64url helpers
function toBase64Url(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4 !== 0) str += "=";
  return Buffer.from(str, "base64");
}

/**
 * Encrypt memory string with AES-GCM & compress before encrypting
 * @param {string} plaintext
 * @param {Buffer} key
 * @param {string} keyVersion
 * @returns {object} encrypted payload metadata + ciphertext
 */
export function encryptMemory(plaintext, key, keyVersion = "default") {
  const iv = crypto.randomBytes(config.ENCRYPTION.IV_LENGTH);
  const cipher = crypto.createCipheriv(config.ENCRYPTION.ALGORITHM, key, iv, {
    authTagLength: config.ENCRYPTION.TAG_LENGTH,
  });

  const compressedText = compressText(plaintext);
  const ciphertext = Buffer.concat([cipher.update(compressedText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    v: config.ENCRYPTION.VERSION,
    iv: toBase64Url(iv),
    tag: toBase64Url(tag),
    ciphertext: toBase64Url(ciphertext),
    keyVersion,
    compressed: true,
  };
}

/**
 * Decrypt encrypted payload, decompress if needed
 * @param {object} encrypted
 * @param {Buffer} key
 * @param {boolean} allowFallback
 * @param {Buffer|null} fallbackKey
 */
export function decryptMemory(encrypted, key, allowFallback = false, fallbackKey = null) {
  try {
    const iv = fromBase64Url(encrypted.iv);
    const tag = fromBase64Url(encrypted.tag);
    const ciphertext = fromBase64Url(encrypted.ciphertext);

    const decipher = crypto.createDecipheriv(config.ENCRYPTION.ALGORITHM, key, iv, {
      authTagLength: config.ENCRYPTION.TAG_LENGTH,
    });
    decipher.setAuthTag(tag);

    const decryptedBuffer = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    const decryptedString = decryptedBuffer.toString("utf8");

    return encrypted.compressed ? decompressText(decryptedString) : decryptedString;
  } catch (error) {
    if (allowFallback && fallbackKey) {
      try {
        return decryptMemory(encrypted, fallbackKey, false, null);
      } catch (_) {
        throw new Error("Decryption failed with fallback key.");
      }
    }
    throw new Error("Decryption failed. Possibly corrupted payload or invalid key.");
  }
}
