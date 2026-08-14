// utils/uploadWorker.js
//
// Drives a single upload item from "uploading" through to done/failed.
// Deliberately callback-based (onSettle) rather than a Promise the
// scheduler awaits — pausing an upload doesn't resolve or reject it, it
// just stops, so a Promise-based contract would either hang forever or
// force a double-settle bug when the item is later resumed as a fresh
// runUpload() call. onSettle fires exactly once, only on true completion
// (success, permanent error, or cancel) — never on pause.

import { activeUploads, getActiveUpload } from "./uploadRegistry";
import { getFile, deleteFile } from "./fileStore";
import { removeItem } from "./queueStore";
import { createResumableUpload, resumeIfPossible } from "./resumableUploader";
import { supabase } from "../supabaseClient";
import { useUploadStore } from "../store/uploadStore";
import { broadcastQueueRemoval } from "./uploadChannel";
import { QUEUE_UX } from "./config";
// NOTE: intentional circular import with uploadManager.js (it imports
// runUpload/pauseActiveUpload/cancelActiveUpload from here). This is safe
// under ES modules because emitQueueChange is only ever *called* inside
// callbacks that fire well after both modules have finished evaluating —
// never at module top-level.
import { emitQueueChange } from "./uploadManager";

/**
 * @param {object} item - queue item (id, path, userId, caption, ...)
 * @param {object} handlers
 * @param {() => void} handlers.onSettle - called exactly once, when this
 *   attempt truly finishes (not on pause).
 */
export async function runUpload(item, { onSettle } = {}) {
  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    onSettle?.();
  };

  const file = await getFile(item.fileId ?? item.id);
  if (!file) {
    emitQueueChange(item.id, { status: "failed", error: "Local file missing" });
    settle();
    return;
  }

  const upload = createResumableUpload({
    file,
    path: item.path,
    id: item.id,

    onProgress: (progress) => {
      emitQueueChange(item.id, { progress, status: "uploading" });
    },

    onError: (err) => {
      activeUploads.delete(item.id);
      emitQueueChange(item.id, { status: "failed", error: err.message });
      settle();
    },

    onSuccess: async () => {
      try {
        const { data } = supabase.storage.from("reels").getPublicUrl(item.path);

        // IMPORTANT: pass the same id the upload item already used. Without
        // this, the server row gets its own auto-generated id, which is a
        // *different* id than the "uploading…" placeholder the feed was
        // showing — so once this item disappears from the queue, the feed
        // would briefly show the real reel as a duplicate second card
        // instead of seamlessly taking over the same card. Requires the
        // `reels.id` column to accept a client-supplied UUID (the default
        // is only used when the column is omitted from the insert).
        //
        // FIX: supabase-js never throws on a rejected insert — it returns
        // { data, error } — so this MUST be checked explicitly. Before this
        // fix, a rejected insert (RLS mismatch, bad column, etc.) still fell
        // through to "done" with a finalUrl, so the UI showed a finished,
        // playable reel that was never actually written to the database.
  const { error: insertError } = await supabase.from("reels").insert({
  id: item.id,
  user_id: item.userId,
  video_url: data.publicUrl,
  caption: item.caption,
  width: item.width,
  height: item.height,
});

if (insertError) throw insertError;

        emitQueueChange(item.id, {
          status: "done",
          progress: 100,
          // Carry the real, final video URL onto the item itself. Without
          // this, the card kept showing the local pre-upload blob for its
          // whole ~1.5s linger, and once removed from the queue there was
          // a gap until useReels() happened to refetch and pick up the
          // real row — during which the reel could vanish from the feed
          // entirely. Now the placeholder IS the real card from the
          // instant it's done; removal timing stops mattering.
          finalUrl: data.publicUrl,
        });

        await removeItem(item.id);
        await deleteFile(item.fileId ?? item.id);
        await deleteFile(`${item.id}:thumb`).catch(() => {});

        // Let the UI show the "done" checkmark briefly, then drop it from
        // the live queue — the real reel now lives in the server-fetched
        // feed under the same id, so nothing is lost by removing it here.
        setTimeout(() => {
          useUploadStore.getState().remove(item.id);
          broadcastQueueRemoval(item.id);
        }, QUEUE_UX.DONE_LINGER_MS);
      } catch (err) {
        emitQueueChange(item.id, {
          status: "failed",
          error: `Uploaded but failed to save record: ${err.message}`,
        });
      } finally {
        activeUploads.delete(item.id);
        settle();
      }
    },
  });

  activeUploads.set(item.id, upload);

  // Resume support: if a previous (paused/interrupted) attempt exists for
  // this fingerprint, continue from there instead of re-uploading from 0.
  await resumeIfPossible(upload);

  upload.start();
}

/**
 * Pause an actively-uploading item in place. Returns true if something was
 * actually paused. The tus.Upload instance is left in the registry so a
 * later resumeUpload() can pick the same in-memory instance back up
 * instantly, without waiting on findPreviousUploads.
 */
export function pauseActiveUpload(id) {
  const upload = getActiveUpload(id);
  if (!upload) return false;
  upload.abort(); // stops without deleting server-side progress
  return true;
}

/**
 * Cancel an item outright: abort the transfer AND ask the server to
 * discard whatever partial bytes it already has, then clean up local
 * copies. Returns true if an active transfer was actually stopped.
 */
export function cancelActiveUpload(id) {
  const upload = getActiveUpload(id);
  let wasActive = false;

  if (upload) {
    wasActive = true;
    upload.abort(true).catch((err) =>
      console.warn("Cancel: server-side abort failed (continuing):", err)
    );
    activeUploads.delete(id);
  }

  removeItem(id).catch(() => {});
  deleteFile(id).catch(() => {});
  deleteFile(`${id}:thumb`).catch(() => {});

  return wasActive;
}