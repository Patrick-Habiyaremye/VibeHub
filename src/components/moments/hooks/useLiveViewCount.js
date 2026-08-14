import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

/**
 * Live view count for the story owner. Fetches the true count on open
 * (the moment's cached views_count can be stale by the time the viewer
 * sheet is opened) and subscribes to realtime inserts on
 * smile_moment_views so the number ticks up while the owner is
 * watching, without a manual refresh.
 */
export function useLiveViewCount(momentId, fallbackCount = 0, { enabled = true } = {}) {
  const [count, setCount] = useState(fallbackCount);

  useEffect(() => {
    setCount(fallbackCount);
    if (!enabled || !momentId) return;

    let cancelled = false;

    (async () => {
      const { count: exact, error } = await supabase
        .from("smile_moment_views")
        .select("*", { count: "exact", head: true })
        .eq("moment_id", momentId);
      if (!cancelled && !error && typeof exact === "number") setCount(exact);
    })();

    const channel = supabase
      .channel(`moment-views-${momentId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "smile_moment_views", filter: `moment_id=eq.${momentId}` },
        () => !cancelled && setCount((c) => c + 1)
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [momentId, enabled]);

  return count;
}