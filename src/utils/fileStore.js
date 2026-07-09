const DB_NAME = "upload_files_db";
const STORE_NAME = "files";
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ✅ SAVE FILE
export async function saveFile(id, file) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    store.put(file, id);

    tx.oncomplete = () => {
      console.log("✅ File saved:", id);
      resolve();
    };

    tx.onerror = () => reject(tx.error);
  });
}

// ✅ GET FILE
export async function getFile(id) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    const request = store.get(id);

    request.onsuccess = () => {
      console.log("📦 Loaded file:", id, request.result);
      resolve(request.result);
    };

    request.onerror = () => reject(request.error);
  });
}

// ✅ DELETE FILE
export async function deleteFile(id) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    store.delete(id);

    tx.oncomplete = () => {
      console.log("🗑️ Deleted file:", id);
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}