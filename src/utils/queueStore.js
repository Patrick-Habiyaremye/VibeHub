// export const persistItem = upsertItem;

// utils/queueStore.js
//
// Persists upload-queue metadata (NOT the file bytes — see fileStore.js)
// so the queue survives reloads/crashes. Single source of truth for
// "what uploads exist and what state are they in".

import { openDB } from "idb";

const DB_NAME = "upload-queue";
const STORE_NAME = "uploads";

let dbPromise;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export async function upsertItem(item) {
  const db = await getDB();
  await db.put(STORE_NAME, { ...item, updatedAt: Date.now() });
}

export async function getItem(id) {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

export async function removeItem(id) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function getAllItems() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}