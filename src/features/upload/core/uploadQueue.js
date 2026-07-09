import { db } from "./uploadDB";

export async function addUpload(upload) {
  await db.uploads.put({
    ...upload,
    status: "queued",
    progress: 0,
    uploadedBytes: 0,
    retries: 0,
    createdAt: Date.now(),
  });
}

export async function updateUpload(id, updates) {
  await db.uploads.update(id, updates);
}

export async function getActiveUploads() {
  return await db.uploads
    .where("status")
    .anyOf("queued", "uploading", "failed")
    .toArray();
}