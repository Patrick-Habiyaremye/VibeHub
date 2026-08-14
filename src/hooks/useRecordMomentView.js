// hooks/useRecordMomentView.js
//
// Call this from whatever component actually displays a moment full-screen
// (e.g. StoryViewer), once per momentId. It records the view via the
// `record_moment_view` RPC, which upserts on (moment_id, user_id) so
// re-watching the same moment never throws a duplicate-key error and the
// owner's own view is never logged against their own moment.
//
// Usage inside StoryViewer:
//
//   useRecordMomentView(activeMoment?.id);
//
// If you want to require a short dwell time before it counts (closer to
// Instagram/WhatsApp behavior — a half-second flick-through shouldn't
// count as a "view"), pass a delay:
//
//   useRecordMomentView(activeMoment?.id, { delayMs: 800 });

import { useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";

export function useRecordMomentView(momentId, { delayMs = 0 } = {}) {
  const recordedRef = useRef(new Set());

  useEffect(() => {
    if (!momentId || recordedRef.current.has(momentId)) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      recordedRef.current.add(momentId);

      const { error } = await supabase.rpc("record_moment_view", {
        p_moment_id: momentId,
      });

      if (error) {
        // Don't block viewing on this — just stop us from retrying a
        // moment we already attempted, and log for debugging.
        console.error("record_moment_view failed:", error);
      }
    }, delayMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [momentId, delayMs]);
}