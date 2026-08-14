// utils/uploadManager.js
//
// Orchestrates the upload queue: decides how many uploads run at once,
// starts new ones as slots free up, and exposes pause/resume/cancel/retry
// for individual items. Only the elected leader tab (see leaderElection.js
// / tabLeader.js) actually starts uploads — other tabs just mirror state
// via BroadcastChannel so their UI stays live.

import { useUploadStore } from "../store/uploadStore";
import { runUpload, pauseActiveUpload, cancelActiveUpload } from "./uploadWorker";
import { isTabLeader } from "./tabLeader";
import { broadcastQueueUpdate } from "./uploadChannel";
import { upsertItem } from "./queueStore";
import { CONCURRENCY } from "./config";

function computeMaxConcurrent() {
  const cores = navigator.hardwareConcurrency || 2;
  const effectiveType = navigator.connection?.effectiveType;

  // On slow connections, running many transfers at once just makes every
  // single one slower (and more likely to time out). Prefer fewer, faster
  // uploads over many stalled ones.
  if (effectiveType === "slow-2g" || effectiveType === "2g") {
    return CONCURRENCY.SLOW_CONNECTION_MAX;
  }
  if (effectiveType === "3g") return CONCURRENCY.MEDIUM_CONNECTION_MAX;

  return Math.min(CONCURRENCY.DEFAULT_CAP, Math.max(1, Math.floor(cores / 2)));
}

const MAX_CONCURRENT = computeMaxConcurrent();
let activeCount = 0;

// Local (same-tab) pub/sub, independent of the cross-tab BroadcastChannel.
// Kept for backward compatibility with call sites that pass an onUpdate
// callback (e.g. initLeaderElection(onUpdate) in older code).
const listeners = new Set();

export function attachQueueListener(callback) {
  if (typeof callback !== "function") return () => {};
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyLocal(item) {
  for (const fn of listeners) {
    try {
      fn(item);
    } catch (err) {
      console.error("queue listener threw:", err);
    }
  }
}

/**
 * Central "something about this item changed" hook. Updates the store,
 * persists to IndexedDB, and tells every tab (including this one).
 */
export function emitQueueChange(id, patch) {
  const { update } = useUploadStore.getState();
  update(id, patch);

  const item = useUploadStore.getState().uploads[id];
  if (item) {
    upsertItem(item).catch((err) =>
      console.error("Failed to persist queue item:", err)
    );
  }

  notifyLocal(item);
  broadcastQueueUpdate(item);
}

/**
 * Fill any free upload slots with pending items. Safe to call as often as
 * you like — it no-ops if this tab isn't the leader or there's nothing to
 * do. This replaces polling: call it whenever the queue might have
 * changed (item added, item finished, leadership gained, tab restored).
 */
export function scheduleProcessing() {
  if (!isTabLeader()) return;

  const { getNextPending } = useUploadStore.getState();

  while (activeCount < MAX_CONCURRENT) {
    const next = getNextPending();
    if (!next) break;

    activeCount++;
    emitQueueChange(next.id, { status: "uploading", error: null });

    runUpload(next, {
      onSettle: () => {
        activeCount = Math.max(0, activeCount - 1);
        scheduleProcessing();
      },
    });
  }
}

/** Back-compat alias — some call sites still call processQueue(). */
export function processQueue(onUpdate) {
  if (onUpdate) attachQueueListener(onUpdate);
  scheduleProcessing();
}

/**
 * @param {string} id
 * @param {Object} [opts]
 * @param {boolean} [opts.auto] - true if this pause was triggered by the
 *   network monitor (connection lost) rather than the user tapping pause.
 *   Auto-paused items are safe for the network monitor to silently resume
 *   later; user-paused items should stay paused until the user acts.
 */
export function pauseUpload(id, { auto = false } = {}) {
  const paused = pauseActiveUpload(id);
  if (!paused) return false; // wasn't actively uploading, nothing to pause

  activeCount = Math.max(0, activeCount - 1);
  emitQueueChange(id, { status: "paused", autoPaused: auto });
  scheduleProcessing(); // let another pending item take the freed slot
  return true;
}

export function resumeUpload(id) {
  const item = useUploadStore.getState().uploads[id];
  if (!item) return;
  if (item.status !== "paused" && item.status !== "failed") return;

  // Re-queue it: getNextPending only returns "pending" items, so this is
  // what actually lets scheduleProcessing pick it back up. runUpload will
  // transparently resume from the last uploaded byte via tus's own
  // findPreviousUploads/fingerprint matching.
  emitQueueChange(id, { status: "pending", error: null, autoPaused: false });
  scheduleProcessing();
}

export function retryUpload(id) {
  const item = useUploadStore.getState().uploads[id];
  if (!item || item.status !== "failed") return;
  emitQueueChange(id, {
    status: "pending",
    error: null,
    retryCount: (item.retryCount || 0) + 1,
  });
  scheduleProcessing();
}

export async function cancelUpload(id) {
  const wasActive = cancelActiveUpload(id);
  if (wasActive) activeCount = Math.max(0, activeCount - 1);

  const { remove } = useUploadStore.getState();
  remove(id);
  broadcastQueueUpdate({ id, status: "canceled" });

  scheduleProcessing();
}