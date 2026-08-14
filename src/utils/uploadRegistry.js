// utils/uploadRegistry.js
//
// Maps an upload item id -> the live tus.Upload instance controlling it.
// This is how pause/resume/cancel reach into an in-flight transfer.

export const activeUploads = new Map();

export function getActiveUpload(id) {
  return activeUploads.get(id) || null;
}

export function isUploadActive(id) {
  return activeUploads.has(id);
}