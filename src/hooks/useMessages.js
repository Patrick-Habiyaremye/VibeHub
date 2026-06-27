// hooks/useMessages.js

import { useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function useMessages({
  userId,
  receiverId,
  onMessage,
}) {
  useEffect(() => {
    const channel = supabase
      .channel(
        `messages-${userId}-${receiverId}`
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new;

          const belongsToChat =
            (msg.sender_id === userId &&
              msg.receiver_id === receiverId) ||
            (msg.sender_id === receiverId &&
              msg.receiver_id === userId);

          if (belongsToChat) {
            onMessage(msg);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, receiverId, onMessage]);
}