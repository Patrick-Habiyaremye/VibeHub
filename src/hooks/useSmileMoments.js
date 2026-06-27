import { useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function useSmileMoments({
  onInsert,
  onReaction,
  onView,
}) {
  useEffect(() => {
    const channel = supabase
      .channel("smile-moments-realtime")

      // NEW STORIES
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "smile_moments",
        },
        (payload) => {
          onInsert?.(payload.new);
        }
      )

      // REACTIONS
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "smile_moment_reactions",
        },
        (payload) => {
          onReaction?.(payload.new);
        }
      )

      // VIEWS
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "smile_moments_views",
        },
        (payload) => {
          onView?.(payload.new);
        }
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onInsert, onReaction, onView]);
}