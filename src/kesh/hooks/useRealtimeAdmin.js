import { useEffect } from "react";
import { supabase } from "../../supabaseClient";

export default function useRealtimeAdmin({ table, onChange }) {
  useEffect(() => {
    const channel = supabase
      .channel(`admin-${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload) => onChange?.(payload)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [table, onChange]);
}