// hooks/usePresence.js

import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function usePresence(
  userId
) {
  const [online, setOnline] =
    useState(false);

  useEffect(() => {
    if (!userId) return;

    const loadPresence =
      async () => {
        const { data } =
          await supabase
            .from("user_presence")
            .select("*")
            .eq("user_id", userId)
            .single();

        setOnline(
          data?.is_online || false
        );
      };

    loadPresence();

    const channel = supabase
      .channel(
        `presence-${userId}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_presence",
          filter:
            `user_id=eq.${userId}`,
        },
        (payload) => {
          setOnline(
            payload.new?.is_online
          );
        }
      )
      .subscribe();

    return () =>
      supabase.removeChannel(
        channel
      );
  }, [userId]);

  return online;
}