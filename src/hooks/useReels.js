// hooks/useReels.js
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { getReels } from "../api/reels";

export default function useReels() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReels = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReels();
      setReels(data || []);
    } catch (err) {
      console.error("useReels load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReels();

    const channel = supabase
      .channel("reels-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
          filter: "media_type=eq.video",
        },
        (payload) => {
          setReels((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [loadReels]);

  return {
    reels,
    loading,
    reload: loadReels,
  };
}