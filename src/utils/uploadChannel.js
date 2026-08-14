// utils/uploadChannel.js
//
// Single shared BroadcastChannel used to keep every open tab's UI in sync.
// Do not close this channel from consumers (see useUploadSync.js) — it is
// a process-wide singleton also relied on by leader election.

const CHANNEL_NAME = "upload_channel";

export const QUEUE_UPDATE = "QUEUE_UPDATE";

export const uploadChannel = new BroadcastChannel(CHANNEL_NAME);

/**
 * Tell every other tab (and, if `alsoLocal` is true, anyone locally
 * subscribed via attachQueueListener) that the queue changed.
 * `item` is optional — omit it for a generic "go re-read the queue" ping.
 */
export function broadcastQueueUpdate(item) {
  try {
    uploadChannel.postMessage({ type: QUEUE_UPDATE, item, at: Date.now() });
  } catch (err) {
    // BroadcastChannel can throw if the tab is being torn down; never let
    // that crash an in-flight upload callback.
    console.warn("broadcastQueueUpdate failed:", err);
  }
}

/**
 * Tell every other tab that an item is gone entirely (canceled, or a
 * "done" item that finished lingering) — as opposed to broadcastQueueUpdate,
 * which sends a full item to upsert. Receivers should remove `id`, not
 * try to merge a partial object into their store.
 */
export function broadcastQueueRemoval(id) {
  broadcastQueueUpdate({ id, removed: true });
}