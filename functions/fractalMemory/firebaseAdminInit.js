// functions/fractalMemory/firebaseAdminInit.js
import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

let initialized = false;

export async function getFirestore() {
  if (!initialized) {
    const serviceAccountPath = new URL('./serviceAccountKey.json', import.meta.url).pathname;
    const serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf8'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'dripverse-137',
    });

    initialized = true;
  }

  return admin.firestore();
}
