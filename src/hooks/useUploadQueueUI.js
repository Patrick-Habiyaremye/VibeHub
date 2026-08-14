// hooks/useUploadQueueUI.js
//
// Reactive list of everything in the upload queue, newest first. This
// replaces the earlier utils/useUploadQueueUI.js and utils/useUploadSync.js
// — both should be deleted; this hook subsumes what they did, correctly:
//
// - Changes made IN THIS TAB already re-render automatically, because
//   emitQueueChange/enqueue/remove all go through the Zustand store, and
//   this hook subscribes to that store. No extra plumbing needed.
// - Changes made in OTHER TABS need the BroadcastChannel listener below —
//   BroadcastChannel never delivers a message back to the tab that sent
//   it, so this is the only way this tab finds out about them.

import { useEffect } from "react";
import { useUploadStore } from "../store/uploadStore";
import { uploadChannel, QUEUE_UPDATE } from "../utils/uploadChannel";

export function useUploadQueueUI() {
  const uploads = useUploadStore((s) => s.uploads);
  const enqueue = useUploadStore((s) => s.enqueue);
  const removeFromStore = useUploadStore((s) => s.remove);

  useEffect(() => {
    const handleMessage = (event) => {
      const { type, item } = event.data || {};
      if (type !== QUEUE_UPDATE || !item) return;

      if (item.status === "canceled") {
        removeFromStore(item.id);
      } else {
        // Full-item upsert — the sending tab always broadcasts the
        // complete post-change item, never a partial patch, so it's safe
        // to just overwrite whatever (if anything) we had locally.
        enqueue(item);
      }
    };

    uploadChannel.addEventListener("message", handleMessage);
    return () => uploadChannel.removeEventListener("message", handleMessage);
  }, [enqueue, removeFromStore]);

  return Object.values(uploads).sort((a, b) => b.createdAt - a.createdAt);
}