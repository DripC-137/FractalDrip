// functions/fractalMemory/testEncryptor.js

import { encryptMemory, decryptMemory } from './memoryEncryptor.js';
import { deriveKeyFromPassword } from './utils/keyGen.js';

const TEST_PASSWORD = 'fractalSecretPass123';
const PLAINTEXT = 'This is a secret fractal memory block.';

async function runTest() {
  const key = await deriveKeyFromPassword(TEST_PASSWORD);

  console.log('🔐 PLAINTEXT:', PLAINTEXT);

  const encrypted = encryptMemory(PLAINTEXT, key, 'v1');
  console.log('🧊 ENCRYPTED:', encrypted);

  const decrypted = decryptMemory(encrypted, key);
  console.log('✅ DECRYPTED:', decrypted);
}

runTest().catch(console.error);
