import { useEffect } from "react";
import { supabase } from "../supabaseClient";
import normalizeReel from "../utils/normalizeReel";

export default function useReelsRealtime(insertTop, remove, user) {
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("reels-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reels" },
        async (payload) => {
          const { data, error } = await supabase
            .from("reels")
            .select(`*, profiles(id, username, avatar_url)`)
            .eq("id", payload.new.id)
            .single();

          if (error || !data) return;
          insertTop(normalizeReel(data));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "reels" },
        (payload) => remove(payload.old.id)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [insertTop, remove, user]);
}