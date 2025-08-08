import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

import { encryptMemory } from './memoryEncryptor.js';
import { getKeyForUID } from './keyManager.js';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import config from './memoryConfig.js';

// ✅ Firebase Admin init (safe once)
if (!global._firebaseApp) {
  global._firebaseApp = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: config.FIREBASE.STORAGE_BUCKET,
  });
}
const db = getFirestore();
const bucket = getStorage().bucket();

// ✅ Core store function
async function storeMemory(uid, memoryText, tier = 'fast', metadata = {}) {
  const key = await getKeyForUID(uid);
  const encrypted = encryptMemory(memoryText, key, 'v1');

  const docData = {
    encrypted,
    uid,
    tier,
    timestamp: Date.now(),
    ...metadata,
  };

  if (tier === 'fast' || tier === 'buffer') {
    const collectionName = tier === 'fast' ? 'memory_fast' : 'memory_buffer';
    const docRef = db.collection(`users/${uid}/${collectionName}`).doc();
    await docRef.set(docData);
    return { success: true, location: `Firestore/${collectionName}/${docRef.id}` };
  } else if (tier === 'archive') {
    const filePath = `users/${uid}/memory_archive/${Date.now()}.json`;
    const file = bucket.file(filePath);
    await file.save(JSON.stringify(docData), {
      contentType: 'application/json',
    });
    return { success: true, location: `Storage/${filePath}` };
  } else {
    throw new Error(`Unknown memory tier: ${tier}`);
  }
}

// ✅ Optional semantic alias
async function saveMemory({ uid, content, tier = 'fast', metadata = {} }) {
  return storeMemory(uid, content, tier, metadata);
}

// 🧪 Dummy for now
function retrieveMemory() {
  throw new Error('Not implemented yet');
}

function debugDumpUserMemory() {
  throw new Error('Not implemented yet');
}

// ✅ Export
export default {
  storeMemoryBlock: storeMemory,
  saveMemory,
  retrieveMemoryBlock: retrieveMemory,
  debugDumpUserMemory,
};
