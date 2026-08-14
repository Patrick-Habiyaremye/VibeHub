// src/features/messaging/hooks/usePresence.js

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "../../../supabaseClient";

export default function usePresence(userId) {
  const [isOnline, setIsOnline] =
    useState(false);

  const [lastSeen, setLastSeen] =
    useState(null);

  const loadPresence = useCallback(
    async () => {
      if (!userId) {
        setIsOnline(false);
        setLastSeen(null);
        return;
      }

      const { data, error } =
        await supabase
          .from("user_presence")
          .select(
            "user_id,is_online,last_seen"
          )
          .eq("user_id", userId)
          .maybeSingle();

      if (error) {
        console.error(
          "[usePresence]",
          error
        );
        return;
      }

      setIsOnline(
        Boolean(data?.is_online)
      );

      setLastSeen(
        data?.last_seen || null
      );
    },
    [userId]
  );

  useEffect(() => {
    loadPresence();

    if (!userId) return;

    const channel = supabase
      .channel(`presence-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_presence",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const presence = payload.new;

          setIsOnline(
            Boolean(presence?.is_online)
          );

          setLastSeen(
            presence?.last_seen || null
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadPresence]);

  return {
    isOnline,
    lastSeen,
    reload: loadPresence,
  };
}