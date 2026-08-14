// store/uploadStore.js
//
// The single shared source of truth for in-flight uploads. Every util
// (uploadManager, uploadWorker, uploadActions, restoreQueue,
// networkMonitor) and every hook reads/writes through this — it did not
// exist yet, which is why none of the code wired to it could actually run.

import { create } from "zustand";

export const useUploadStore = create((set, get) => ({
  uploads: {}, // id -> item

  /**
   * Upsert a single item — used both for brand-new uploads and for
   * replacing an item wholesale (e.g. a full item object arriving from
   * another tab via BroadcastChannel).
   */
  enqueue: (item) =>
    set((state) => ({
      uploads: { ...state.uploads, [item.id]: item },
    })),

  /**
   * Patch an existing item. No-ops if the item isn't known yet (this is
   * intentional — see enqueue() for the "might not exist locally yet"
   * case, e.g. cross-tab sync).
   */
  update: (id, patch) =>
    set((state) => {
      const existing = state.uploads[id];
      if (!existing) return state;
      return {
        uploads: { ...state.uploads, [id]: { ...existing, ...patch } },
      };
    }),

  remove: (id) =>
    set((state) => {
      const { [id]: _removed, ...rest } = state.uploads;
      return { uploads: rest };
    }),

  /** Bulk-replace the whole map — used by restoreQueue() on app start. */
  setUploads: (uploadsById) => set({ uploads: uploadsById }),

  /**
   * Oldest pending item, or null. This is what the scheduler in
   * uploadManager.js polls to decide what to start next.
   */
  getNextPending: () => {
    const pending = Object.values(get().uploads)
      .filter((item) => item.status === "pending")
      .sort((a, b) => a.createdAt - b.createdAt);
    return pending[0] || null;
  },
}));
