// hooks/useComposerSession.js
//
// The one hook CreatePost / ComposerStudio actually call. It's the "session"
// referenced in the architecture diagram: everything downstream (BlockEditor,
// PreviewPane, publish button) is a thin, mostly-presentational consumer of
// what this hook returns. All state transitions flow through DraftEngine so
// this file stays free of block-shape knowledge.

import { useCallback, useMemo, useRef, useState } from "react";
import { createDraft, AUDIENCES } from "../models/composerModel";
import * as DraftEngine from "../engines/DraftEngine";
import { projectDraft, summarizeDraft } from "../engines/PreviewEngine";
import { publishDraft, PublishError } from "../engines/PublishEngine";
import { suggestMood } from "../engines/StyleEngine";
import { useDraftPersistence, loadPersistedDraft, clearPersistedDraft } from "./useDraftPersistence";

export function useComposerSession({ authorId, api } = {}) {
  const [draft, setDraft] = useState(
    () => loadPersistedDraft(authorId) || createDraft({ authorId })
  );
  const [status, setStatus] = useState("idle"); // idle | publishing | published | error
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const progressTimer = useRef(null);

  useDraftPersistence(draft, { enabled: status !== "published" });

  const mutate = useCallback((fn) => setDraft((current) => fn(current)), []);

  const addBlock = useCallback((type, opts) => mutate((d) => DraftEngine.addBlock(d, type, opts)), [mutate]);
  const removeBlock = useCallback((id) => mutate((d) => DraftEngine.removeBlock(d, id)), [mutate]);
  const updateBlock = useCallback((id, patch) => mutate((d) => DraftEngine.updateBlock(d, id, patch)), [mutate]);
  const reorderBlocks = useCallback((from, to) => mutate((d) => DraftEngine.reorderBlocks(d, from, to)), [mutate]);
  const setAudience = useCallback((audience) => mutate((d) => DraftEngine.setAudience(d, audience)), [mutate]);
  const setMood = useCallback((mood) => mutate((d) => DraftEngine.setMood(d, mood)), [mutate]);

  // Auto-suggest a mood the first time there's enough text to guess from,
  // but never override a mood the user already picked.
  const autoSuggestMood = useCallback(() => {
    if (draft.theme?.mood) return;
    const suggestion = suggestMood(draft.blocks);
    if (suggestion) setMood(suggestion);
  }, [draft, setMood]);

  const preview = useMemo(() => projectDraft(draft), [draft]);
  const summary = useMemo(() => summarizeDraft(draft), [draft]);

  const publish = useCallback(async () => {
    setStatus("publishing");
    setError(null);
    setProgress(0);

    // No real byte-level progress is available from the current publish
    // path (see PublishProgress.jsx header comment) — ramp toward 90%
    // while the request is in flight so the ring isn't static, then snap
    // to 100 on success/settle on error below.
    clearInterval(progressTimer.current);
    progressTimer.current = setInterval(() => {
      setProgress((p) => (p < 90 ? Math.min(90, p + 4 + Math.random() * 8) : p));
    }, 250);

    try {
      const result = await publishDraft(draft, { api });
      clearInterval(progressTimer.current);
      setProgress(100);
      setStatus("published");
      clearPersistedDraft(authorId);
      return result;
    } catch (err) {
      clearInterval(progressTimer.current);
      setStatus("error");
      setError(err instanceof PublishError ? err.message : "Something went wrong. Try again.");
      throw err;
    }
  }, [draft, api, authorId]);

  const reset = useCallback(() => {
    clearInterval(progressTimer.current);
    clearPersistedDraft(authorId);
    setDraft(createDraft({ authorId }));
    setStatus("idle");
    setError(null);
    setProgress(0);
  }, [authorId]);

  return {
    draft,
    preview,
    summary,
    status,
    error,
    progress,
    audiences: Object.values(AUDIENCES),
    actions: {
      addBlock,
      removeBlock,
      updateBlock,
      reorderBlocks,
      setAudience,
      setMood,
      autoSuggestMood,
      publish,
      reset,
    },
  };
}