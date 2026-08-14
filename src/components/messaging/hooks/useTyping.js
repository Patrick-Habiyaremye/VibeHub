// src/features/messaging/hooks/useTyping.js

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "../../../supabaseClient";

const TYPING_TIMEOUT = 1500;

export default function useTyping({
  conversationKey,
  userId,
}) {
  const [typingUsers, setTypingUsers] =
    useState([]);

  const timeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const setTypingState = useCallback(
    async (isTyping) => {
      if (!conversationKey || !userId) return;

      try {
        const { error } = await supabase
          .from("typing_status")
          .upsert(
            {
              conversation_key:
                conversationKey,
              user_id: userId,
              is_typing: isTyping,
              updated_at:
                new Date().toISOString(),
            },
            {
              onConflict:
                "conversation_key,user_id",
            }
          );

        if (error) {
          console.error(
            "[useTyping] update failed:",
            error
          );
        }

        isTypingRef.current = isTyping;
      } catch (error) {
        console.error(
          "[useTyping] unexpected error:",
          error
        );
      }
    },
    [conversationKey, userId]
  );

  const startTyping = useCallback(() => {
    if (!conversationKey || !userId) {
      return;
    }

    if (!isTypingRef.current) {
      setTypingState(true);
    }

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setTypingState(false);
    }, TYPING_TIMEOUT);
  }, [conversationKey, userId, setTypingState]);

  useEffect(() => {
    if (!conversationKey) {
      setTypingUsers([]);
      return;
    }

    const channel = supabase
      .channel(
        `typing-${conversationKey}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "typing_status",
          filter:
            `conversation_key=eq.${conversationKey}`,
        },
        (payload) => {
          const typing = payload.new;

          if (!typing?.user_id) return;

          setTypingUsers((previous) => {
            const withoutUser =
              previous.filter(
                (item) =>
                  item.user_id !==
                  typing.user_id
              );

            if (!typing.is_typing) {
              return withoutUser;
            }

            return [
              ...withoutUser,
              typing,
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationKey]);

  /*
   * Always stop typing when leaving the conversation.
   */
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);

      if (
        conversationKey &&
        userId &&
        isTypingRef.current
      ) {
        supabase
          .from("typing_status")
          .upsert(
            {
              conversation_key:
                conversationKey,
              user_id: userId,
              is_typing: false,
              updated_at:
                new Date().toISOString(),
            },
            {
              onConflict:
                "conversation_key,user_id",
            }
          );
      }
    };
  }, [conversationKey, userId]);

  return {
    typingUsers,
    startTyping,
    setTyping: setTypingState,
  };
}