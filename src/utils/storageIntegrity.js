// utils/storageIntegrity.js
//
// A crash or killed tab can leave the two IndexedDB stores out of sync:
// a queue row pointing at a file that was never saved (or got deleted)
// wastes effort trying to upload nothing; a saved file with no queue row
// pointing at it just sits there consuming disk quota forever. Run this
// once at startup (before restoreQueue) to clean both directions up.

import { getAllItems, removeItem } from "./queueStore";
import { getFile, deleteFile, listFileIds } from "./fileStore";
import { useUploadStore } from "../store/uploadStore";

export async function reconcileStorage() {
  const items = await getAllItems();
  const referencedFileIds = new Set(items.map((item) => item.fileId ?? item.id));

  // Direction 1: queue rows with no backing file.
  for (const item of items) {
    if (item.status === "done") continue; // done items already had their file deleted on success

    const file = await getFile(item.fileId ?? item.id).catch(() => null);
    if (!file) {
      console.warn(`Dropping orphaned queue item ${item.id} — no backing file found.`);
      await removeItem(item.id);
      useUploadStore.getState().remove?.(item.id);
    }
  }

  // Direction 2: saved files (including thumbnails) with no queue row.
  const fileIds = await listFileIds();
  for (const fileId of fileIds) {
    const baseId = typeof fileId === "string" ? fileId.split(":")[0] : fileId;
    if (!referencedFileIds.has(baseId)) {
      console.warn(`Deleting orphaned stored file ${fileId} — no matching queue item.`);
      await deleteFile(fileId);
    }
  }
}
