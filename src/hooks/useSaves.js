// hooks/useSaves.js
//
// FIX: hydration is now gated on authLoading (never hydrates or clears
// while auth is still resolving — §3's required lifecycle), keyed per
// user.id (re-hydrates on user CHANGE, not just on first-ever mount),
// and clears the store the moment `user` becomes null. Store access uses
// per-field selectors (so this hook only re-renders on the slices it
// actually reads) plus useSavesStore.getState() for actions inside the
// effect — using the whole destructured store object as an effect
// dependency would re-run the effect on every store mutation, since a
// fresh object is handed back on each change.

import { useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useSavesStore } from "../store/savesStore";
import { saveContent, unsaveContent, getMySaves } from "../api/savesApi";

export function useSaves() {
  const { user, authLoading } = useAuth();

  const saved = useSavesStore((s) => s.saved);
  const pending = useSavesStore((s) => s.pending);
  const hydratedForUserId = useSavesStore((s) => s.hydratedForUserId);
  const loading = useSavesStore((s) => s.loading);

  useEffect(() => {
    if (authLoading) return; // don't hydrate or clear until auth state is known

    const { clear, hydrate, setLoading } = useSavesStore.getState();

    if (!user?.id) {
      if (useSavesStore.getState().hydratedForUserId !== null) clear();
      return;
    }

    if (useSavesStore.getState().hydratedForUserId === user.id) return; // already current

    let cancelled = false;
    setLoading(true);

    getMySaves()
      .then((rows) => {
        if (!cancelled) hydrate(user.id, rows);
      })
      .catch((err) => {
        console.error("useSaves: hydration failed", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, authLoading]);

  const isSaved = useCallback((type, id) => !!saved[`${type}:${id}`], [saved]);
  const isSaving = useCallback((type, id) => !!pending[`${type}:${id}`], [pending]);

  const save = useCallback(async (contentType, contentId) => {
    const store = useSavesStore.getState();
    if (store.isPending(contentType, contentId)) return;
    const previous = store.isSaved(contentType, contentId);

    store.setSaved(contentType, contentId, true);
    store.setPending(contentType, contentId, true);
    try {
      await saveContent({ contentType, contentId });
    } catch (err) {
      store.setSaved(contentType, contentId, previous);
      throw err;
    } finally {
      store.setPending(contentType, contentId, false);
    }
  }, []);

  const unsave = useCallback(async (contentType, contentId) => {
    const store = useSavesStore.getState();
    if (store.isPending(contentType, contentId)) return;
    const previous = store.isSaved(contentType, contentId);

    store.setSaved(contentType, contentId, false);
    store.setPending(contentType, contentId, true);
    try {
      await unsaveContent({ contentType, contentId });
    } catch (err) {
      store.setSaved(contentType, contentId, previous);
      throw err;
    } finally {
      store.setPending(contentType, contentId, false);
    }
  }, []);

  const toggleSave = useCallback(
    async (contentType, contentId) => {
      const currentlySaved = useSavesStore.getState().isSaved(contentType, contentId);
      return currentlySaved ? unsave(contentType, contentId) : save(contentType, contentId);
    },
    [save, unsave]
  );

  return {
    isSaved,
    isSaving, // per-item pending — needed by SaveButton/ReelActions for disabled state
    save,
    unsave,
    toggleSave,
    loading,   // global hydration-in-flight flag, per spec's requested shape
    hydrated: hydratedForUserId !== null,
  };
}