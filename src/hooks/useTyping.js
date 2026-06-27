// 

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { setTyping as setTypingAPI } from "../api/typing";

export default function useTyping({ conversationKey, userId }) {
  const [typingUsers, setTypingUsers] = useState([]);
  const timeoutRef = useRef(null);

  // 📡 LISTEN realtime typing updates
  useEffect(() => {
    if (!conversationKey) return;

    const channel = supabase
      .channel(`typing-${conversationKey}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "typing_status",
          filter: `conversation_key=eq.${conversationKey}`,
        },
        (payload) => {
          const data = payload.new;

          if (!data) return;

          setTypingUsers((prev) => {
            const filtered = prev.filter(
              (u) => u.user_id !== data.user_id
            );

            if (data.is_typing) {
              return [...filtered, data];
            }

            return filtered;
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [conversationKey]);

  // ✍️ WRITE typing state (debounced)
  const setTyping = useCallback(
    async (isTyping) => {
      if (!conversationKey || !userId) return;

      await setTypingAPI(conversationKey, userId, isTyping);
    },
    [conversationKey, userId]
  );

  // ⌨️ SMART debounce typing (Instagram style)
  const startTyping = useCallback(() => {
    setTyping(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 1200);
  }, [setTyping]);

  return {
    typingUsers,
    startTyping,
  };
}