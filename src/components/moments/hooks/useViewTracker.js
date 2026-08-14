import { useCallback, useRef } from "react";
import { supabase } from "../../../supabaseClient";

/**
 * Tracks + dedupes story-moment views for the current session.
 *
 * - Fires at most once per moment per mount (Set-based cache — no
 *   duplicate rows, no duplicate optimistic bumps)
 * - Optimistically bumps the caller's local views_count immediately
 * - Network failure never throws or blocks playback — it's swallowed,
 *   and the moment is un-marked so a later retry (e.g. reopening the
 *   story) can attempt the sync again
 */
export function useViewTracker({ userId, onOptimisticView }) {
  const seenRef = useRef(new Set());

  const recordView = useCallback(
    async (moment) => {
      if (!moment || !userId) return;
      if (moment.user_id === userId) return; // owners don't "view" their own story
      if (seenRef.current.has(moment.id)) return;

      seenRef.current.add(moment.id);
      onOptimisticView?.(moment.id);

      try {
        const { error } = await supabase
          .from("smile_moment_views")
          .upsert(
            { moment_id: moment.id, user_id: userId },
            { onConflict: "moment_id,user_id" }
          );
        if (error) throw error;
      } catch (err) {
        seenRef.current.delete(moment.id);
        console.error("View sync failed (will retry next time it's seen):", err);
      }
    },
    [userId, onOptimisticView]
  );

  const hasSeen = useCallback((momentId) => seenRef.current.has(momentId), []);

  return { recordView, hasSeen };
}