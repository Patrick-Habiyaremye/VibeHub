import { useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function useReactionsRealtime(setReels, user) {
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("reactions-realtime")

      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "reactions",
      }, (payload) => {
        const r = payload.new || payload.old;
        if (!r) return;

        setReels((prev) =>
          prev.map((reel) => {
            if (reel.id !== r.reel_id) return reel;

            let counts = { ...(reel.reaction_counts || {}) };
            let userReaction = reel.user_reaction;

            if (payload.eventType === "INSERT") {
              counts[r.emoji] = (counts[r.emoji] || 0) + 1;
              if (r.user_id === user.id) userReaction = r.emoji;
            }

            if (payload.eventType === "DELETE") {
              counts[r.emoji] = Math.max((counts[r.emoji] || 1) - 1, 0);
              if (r.user_id === user.id) userReaction = null;
            }

            return {
              ...reel,
              reaction_counts: counts,
              user_reaction: userReaction,
            };
          })
        );
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [setReels, user]);
}