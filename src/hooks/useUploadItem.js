// hooks/useUploadItem.js
//
// Subscribes to a single upload item. Useful for a list-row component
// showing a per-item progress bar — without this, every progress tick on
// any item (uploadWorker fires onProgress frequently) would re-render the
// entire list via useUploadQueueUI's array, since the parent uploads map
// gets a new reference on every patch.

import { useUploadStore } from "../store/uploadStore";

export function useUploadItem(id) {
  return useUploadStore((s) => s.uploads[id]);
}