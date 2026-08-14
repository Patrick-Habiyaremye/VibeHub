// src/features/messaging/hooks/useConversations.js

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../../../supabaseClient";
import  normalizeConversation  from "../normalizers/normalizeConversation";

export default function useConversations(userId) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadConversations = useCallback(
    async ({ silent = false } = {}) => {
      if (!userId) {
        setConversations([]);
        setLoading(false);
        return;
      }

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        /*
         * Fetch conversations where current user participates.
         *
         * We intentionally don't depend on a conversations_view here.
         * This keeps the feature portable and makes the data contract
         * explicit.
         */
        const { data, error: queryError } = await supabase
          .from("conversations")
          .select(`
            id,
            user1_id,
            user2_id,
            last_message,
            last_message_at,
            created_at,
            user1:profiles!conversations_user1_id_fkey(
              id,
              username,
              name,
              avatar_url
            ),
            user2:profiles!conversations_user2_id_fkey(
              id,
              username,
              name,
              avatar_url
            )
          `)
          .or(
            `user1_id.eq.${userId},user2_id.eq.${userId}`
          )
          .order("last_message_at", {
            ascending: false,
            nullsFirst: false,
          });

        if (queryError) {
          throw queryError;
        }

        const normalized = (data || []).map((conversation) =>
          normalizeConversation(conversation, userId)
        );

        /*
         * Fetch unread counts separately.
         *
         * This avoids trying to make the conversation query
         * responsible for every piece of derived state.
         */
        const conversationIds = normalized.map((c) => c.id);

        let unreadMap = new Map();

        if (conversationIds.length > 0) {
          const { data: unreadRows, error: unreadError } =
            await supabase
              .from("messages")
              .select("id, sender_id, receiver_id, created_at")
              .eq("receiver_id", userId)
              .is("seen_at", null);

          if (unreadError) {
            console.warn(
              "[useConversations] unread query failed:",
              unreadError
            );
          } else {
            for (const message of unreadRows || []) {
              const conversation = normalized.find(
                (item) =>
                  (item.user1_id === message.sender_id &&
                    item.user2_id === message.receiver_id) ||
                  (item.user2_id === message.sender_id &&
                    item.user1_id === message.receiver_id)
              );

              if (!conversation) continue;

              const current =
                unreadMap.get(conversation.id) || 0;

              unreadMap.set(
                conversation.id,
                current + 1
              );
            }
          }
        }

        const enriched = normalized.map((conversation) => ({
          ...conversation,
          unread_count:
            unreadMap.get(conversation.id) || 0,
        }));

        setConversations(enriched);
      } catch (err) {
        console.error(
          "[useConversations] failed:",
          err
        );

        setError(err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  /*
   * Conversation changes.
   */
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`conversation-list-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          loadConversations({ silent: true });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          loadConversations({ silent: true });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadConversations]);

  const unreadTotal = useMemo(
    () =>
      conversations.reduce(
        (total, conversation) =>
          total + (conversation.unread_count || 0),
        0
      ),
    [conversations]
  );

  return {
    conversations,
    unreadTotal,
    loading,
    refreshing,
    error,
    reload: loadConversations,
  };
}