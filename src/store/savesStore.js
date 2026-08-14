// store/savesStore.js
//
// FIX: replaced the boolean `hydrated` flag with `hydratedForUserId`
// (string|null). The old boolean meant "have we EVER hydrated, for
// anyone" — once true, it stayed true across sign-out/sign-in, which is
// the leak described in §3/TEST 7/TEST 8. Tracking the specific user id
// we hydrated FOR means useSaves can correctly detect "this is a
// different user than who we have data for" and re-hydrate, and `clear()`
// resets it to null so a signed-out state is unambiguous.

import { create } from "zustand";

function key(contentType, contentId) {
  return `${contentType}:${contentId}`;
}

export const useSavesStore = create((set, get) => ({
  saved: {},              // "type:id" -> boolean
  pending: {},             // "type:id" -> boolean (per-item mutation in flight)
  hydratedForUserId: null, // which user's saves are currently loaded, or null
  loading: false,          // hydration request in flight

  isSaved: (contentType, contentId) => !!get().saved[key(contentType, contentId)],
  isPending: (contentType, contentId) => !!get().pending[key(contentType, contentId)],

  setLoading: (value) => set({ loading: value }),

  setSaved: (contentType, contentId, value) =>
    set((state) => ({ saved: { ...state.saved, [key(contentType, contentId)]: value } })),

  setPending: (contentType, contentId, value) =>
    set((state) => ({ pending: { ...state.pending, [key(contentType, contentId)]: value } })),

  hydrate: (userId, rows) =>
    set(() => ({
      saved: Object.fromEntries(rows.map((r) => [key(r.content_type, r.content_id), true])),
      hydratedForUserId: userId,
    })),

  /** Called on sign-out (or when auth resolves to no user). */
  clear: () => set({ saved: {}, pending: {}, hydratedForUserId: null }),
}));