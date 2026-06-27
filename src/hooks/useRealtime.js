import { useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function useRealtime({
  channelName,
  table,
  event = "*",
  filter,
  callback,
}) {
  useEffect(() => {
    if (!table || !callback) return;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event,
          schema: "public",
          table,
          filter,
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    channelName,
    table,
    event,
    filter,
    callback,
  ]);
}