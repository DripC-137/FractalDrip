import crypto from 'crypto';
import config from './memoryConfig.js';
import LZUTF8 from 'lzutf8'; // Compression lib

// Compress text before encryption
function compressText(text) {
  return LZUTF8.compress(text, { outputEncoding: 'StorageBinaryString' });
}

// Decompress text after decryption
function decompressText(compressed) {
  return LZUTF8.decompress(compressed, { inputEncoding: 'StorageBinaryString' });
}

// Convert Buffer to base64url (Firestore/URL-safe)
function toBase64Url(buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Convert base64url back to Buffer
function fromBase64Url(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4 !== 0) str += '=';
  return Buffer.from(str, 'base64');
}

// Encrypt a memory string with AES-GCM and LZUTF8 compression
export function encryptMemory(plaintext, key, keyVersion = 'default') {
  const iv = crypto.randomBytes(config.ENCRYPTION.IV_LENGTH);
  const cipher = crypto.createCipheriv(config.ENCRYPTION.ALGORITHM, key, iv, {
    authTagLength: config.ENCRYPTION.TAG_LENGTH,
  });

  const compressedText = compressText(plaintext); // Returns a string
  const ciphertext = Buffer.concat([
    cipher.update(compressedText, 'utf8'),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  return {
    v: config.ENCRYPTION.VERSION,
    iv: toBase64Url(iv),
    tag: toBase64Url(tag),
    ciphertext: toBase64Url(ciphertext),
    keyVersion,
    compressed: true, // ✅ explicitly mark compression in metadata
  };
}

// Decrypt memory payload with AES-GCM and LZUTF8 decompression
export function decryptMemory(encrypted, key, allowFallback = false, fallbackKey = null) {
  try {
    const iv = fromBase64Url(encrypted.iv);
    const tag = fromBase64Url(encrypted.tag);
    const ciphertext = fromBase64Url(encrypted.ciphertext);

    const decipher = crypto.createDecipheriv(config.ENCRYPTION.ALGORITHM, key, iv, {
      authTagLength: config.ENCRYPTION.TAG_LENGTH,
    });
    decipher.setAuthTag(tag);

    const decryptedBuffer = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]);

    const decryptedString = decryptedBuffer.toString('utf8');

    return encrypted.compressed
      ? decompressText(decryptedString)
      : decryptedString;
  } catch (err) {
    if (allowFallback && fallbackKey) {
      try {
        return decryptMemory(encrypted, fallbackKey, false, null);
      } catch (_) {
        throw new Error('Decryption failed with fallback key.');
      }
    }
    throw new Error('Decryption failed. Possibly due to corrupted payload or invalid key.');
  }
}
