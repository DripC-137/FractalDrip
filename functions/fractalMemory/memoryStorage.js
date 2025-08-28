// functions/fractalMemory/memoryStorage.js

import { createRequire } from "module";
const require = createRequire(import.meta.url);

// adjust this path ONLY if your secrets folder is elsewhere
const serviceAccount = require('../../../fractaldrip_secrets/serviceAccountKey.json');

import { encryptMemory, decryptMemory } from "./memoryEncryptor.js";
import { getKeyForUID } from "./keyManager.js";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import config from "./memoryConfig.js";

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: config.FIREBASE.STORAGE_BUCKET,
  });
}

const db = getFirestore();
const bucket = getStorage().bucket();

/**
 * Stores encrypted memory block in the specified tier
 */
async function storeMemory(uid, memoryText, tier = "fast", metadata = {}) {
  if (!uid || !memoryText) throw new Error("Missing uid or memoryText");

  const key = await getKeyForUID(uid);
  const encrypted = encryptMemory(memoryText, key, "v1");

  const docData = {
    encrypted,
    uid,
    tier,
    timestamp: Date.now(),
    ...metadata,
  };

  if (tier === "fast" || tier === "buffer") {
    const collectionName = tier === "fast" ? "memory_fast" : "memory_buffer";
    const docRef = db.collection(`users/${uid}/${collectionName}`).doc();
    await docRef.set(docData);
    return { success: true, location: `Firestore/${collectionName}/${docRef.id}` };
  } else if (tier === "archive") {
    // Save JSON to Storage. File name uses timestamp for easy ordering.
    const filePath = `users/${uid}/memory_archive/${Date.now()}.json`;
    const file = bucket.file(filePath);
    await file.save(JSON.stringify(docData), { contentType: "application/json" });
    return { success: true, location: `Storage/${filePath}` };
  } else {
    throw new Error(`Unknown memory tier: ${tier}`);
  }
}

/**
 * Alias for storeMemory to accept object input
 */
async function saveMemory({ uid, content, tier = "fast", metadata = {} }) {
  return storeMemory(uid, content, tier, metadata);
}

/**
 * Retrieve most recent memory from a tier:
 * - fast/buffer: reads latest doc from Firestore subcollection
 * - archive: lists files in bucket prefix and downloads latest file
 *
 * Returns decrypted plaintext string or null if none found.
 */
async function retrieveMemory(uid, tier = "fast") {
  if (!uid) throw new Error("Missing uid");

  if (tier === "fast" || tier === "buffer") {
    const collectionName = tier === "fast" ? "memory_fast" : "memory_buffer";

    const snapshot = await db
      .collection(`users/${uid}/${collectionName}`)
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0].data();
    if (!doc || !doc.encrypted) {
      console.warn("retrieveMemory: no encrypted payload found in document");
      return null;
    }

    const encrypted = doc.encrypted;
    const key = await getKeyForUID(uid);

    try {
      const plaintext = decryptMemory(encrypted, key, true); // allow fallback
      return plaintext;
    } catch (err) {
      console.error("Memory decryption failed (fast/buffer):", err);
      throw err;
    }
  } else if (tier === "archive") {
    const prefix = `users/${uid}/memory_archive/`;
    // getFiles returns [files]
    const [files] = await bucket.getFiles({ prefix });
    if (!files || files.length === 0) return null;

    // Sort by filename descending (names contain timestamps)
    files.sort((a, b) => {
      const na = a.name.split('/').pop();
      const nb = b.name.split('/').pop();
      // numeric compare if possible
      const an = parseInt(na.replace(/\D/g, ''), 10);
      const bn = parseInt(nb.replace(/\D/g, ''), 10);
      if (!Number.isNaN(an) && !Number.isNaN(bn)) return bn - an;
      return nb.localeCompare(na);
    });

    const latestFile = files[0];
    try {
      const [contents] = await latestFile.download();
      const json = JSON.parse(contents.toString("utf8"));
      const encrypted = json.encrypted || json; // support different shapes
      const key = await getKeyForUID(uid);
      const plaintext = decryptMemory(encrypted, key, true);
      return plaintext;
    } catch (err) {
      console.error("Memory retrieval failed (archive):", err);
      throw err;
    }
  } else {
    throw new Error(`Unknown memory tier: ${tier}`);
  }
}

/**
 * Helpful debug: counts memory in each tier for a user
 * Returns { fastCount, bufferCount, archiveCount }
 */
async function debugDumpUserMemory(uid) {
  if (!uid) throw new Error("Missing uid for debugDumpUserMemory");

  const fastSnap = await db.collection(`users/${uid}/memory_fast`).get().catch(() => null);
  const bufferSnap = await db.collection(`users/${uid}/memory_buffer`).get().catch(() => null);

  let archiveCount = 0;
  try {
    const [files] = await bucket.getFiles({ prefix: `users/${uid}/memory_archive/` });
    archiveCount = (files && files.length) || 0;
  } catch (err) {
    // if storage not configured or permission issue, return -1 to indicate unknown
    console.warn("debugDumpUserMemory: storage listing failed:", err.message);
    archiveCount = -1;
  }

  return {
    fastCount: fastSnap ? fastSnap.size : 0,
    bufferCount: bufferSnap ? bufferSnap.size : 0,
    archiveCount,
  };
}

export default {
  storeMemoryBlock: storeMemory,
  saveMemory,
  retrieveMemoryBlock: retrieveMemory,
  debugDumpUserMemory,
};
