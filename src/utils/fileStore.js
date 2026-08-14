// utils/fileStore.js
//
// Stores the raw file Blobs (original or compressed) in IndexedDB, keyed
// by upload id. Kept separate from queueStore.js (metadata) so we never
// have to pull large binary data just to read/update status.

import { openDB } from "idb";

const DB_NAME = "upload-db";
const STORE_NAME = "files";

let dbPromise;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export async function saveFile(id, file) {
  const db = await getDB();
  await db.put(STORE_NAME, file, id);
}

export async function getFile(id) {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

export async function deleteFile(id) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

/** All keys currently stored — used by storageIntegrity.js to find orphans. */
export async function listFileIds() {
  const db = await getDB();
  return db.getAllKeys(STORE_NAME);
}

/**
 * Best-effort check for whether we likely have room for another file of
 * `sizeBytes`. Not all browsers support storage.estimate(), so callers
 * should treat `null` as "unknown" rather than "no room".
 */
export async function hasStorageRoom(sizeBytes) {
  if (!navigator.storage?.estimate) return null;
  try {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    if (!quota) return null;
    // Leave a 10% safety margin.
    return usage + sizeBytes < quota * 0.9;
  } catch {
    return null;
  }
}
