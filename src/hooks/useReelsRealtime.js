import { useEffect } from "react";
import { supabase } from "../supabaseClient";
import { normalizeReel } from "../utils/normalizeReel";

export default function useReelsRealtime(setReels, user) {
  useEffect(() => {
    if (!user) return;

    const fetchFullReel = async (id) => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          id,
          video_url,
          content,
          created_at,
          user_id,
          profiles (
            id,
            username,
            avatar_url
          ),
          reactions (
            emoji,
            user_id
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Fetch reel error:", error);
        return null;
      }

      return data;
    };

    const channel = supabase
      .channel("reels-realtime")

      // ✅ NEW REEL
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
          filter: "media_type=eq.video",
        },
        async (payload) => {   // ✅ FIX: make it async
          const fullReel = await fetchFullReel(payload.new.id);
          if (!fullReel) return;

          setReels((prev) => {
            if (prev.some((r) => r.id === fullReel.id)) return prev;

            return [
              normalizeReel(fullReel, user?.id),
              ...prev,
            ];
          });
        }
      )

      // ✅ UPDATE
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          setReels((prev) =>
            prev.map((r) =>
              r.id === payload.new.id
                ? normalizeReel(payload.new, user?.id)
                : r
            )
          );
        }
      )

      // ✅ DELETE
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          setReels((prev) =>
            prev.filter((r) => r.id !== payload.old.id)
          );
        }
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setReels, user]);
}