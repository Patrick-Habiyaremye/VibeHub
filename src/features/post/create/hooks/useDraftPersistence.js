// hooks/useDraftPersistence.js
//
// Owns *where* drafts live between sessions. Today that's localStorage;
// swapping to a backend "drafts" endpoint later means editing this one
// file, not every place that reads/writes a draft.

import { useEffect, useRef } from "react";

const STORAGE_PREFIX = "vibe.draft.";
const AUTOSAVE_DELAY_MS = 600;

export function loadPersistedDraft(authorId) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + authorId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // corrupt or unavailable storage — treat as no draft, don't crash
  }
}

export function clearPersistedDraft(authorId) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + authorId);
  } catch {
    /* best-effort */
  }
}

// Debounced autosave. File blobs aren't JSON-serializable, so media blocks
// persist their metadata only (the raw File is lost on refresh — acceptable
// for a draft-recovery feature, not acceptable for the actual publish path).
export function useDraftPersistence(draft, { enabled = true } = {}) {
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!enabled || !draft) return;

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      try {
        const safeBlocks = draft.blocks.map(({ file, ...rest }) => rest);
        localStorage.setItem(
          STORAGE_PREFIX + draft.authorId,
          JSON.stringify({ ...draft, blocks: safeBlocks })
        );
      } catch {
        /* storage full/unavailable — silently skip, autosave is best-effort */
      }
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timeoutRef.current);
  }, [draft, enabled]);
}