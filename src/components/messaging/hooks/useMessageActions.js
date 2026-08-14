// src/features/messaging/hooks/useMessageActions.js

import { useCallback, useState } from "react";

import { supabase } from "../../../supabaseClient";

export default function useMessageActions({
  userId,
  onUpdated,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (operation) => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation();
      return result;
    } catch (err) {
      console.error(
        "[useMessageActions]",
        err
      );

      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const editMessage = useCallback(
    async (messageId, content) => {
      if (!userId) {
        throw new Error("Authentication required.");
      }

      const cleanContent = content?.trim();

      if (!cleanContent) {
        throw new Error(
          "Message cannot be empty."
        );
      }

      const result = await execute(async () => {
        const { data, error } = await supabase
          .from("messages")
          .update({
            content: cleanContent,
            edited_at: new Date().toISOString(),
          })
          .eq("id", messageId)
          .eq("sender_id", userId)
          .select()
          .single();

        if (error) throw error;

        onUpdated?.(data);

        return data;
      });

      return result;
    },
    [userId, execute, onUpdated]
  );

  const deleteMessage = useCallback(
    async (messageId) => {
      if (!userId) {
        throw new Error("Authentication required.");
      }

      return execute(async () => {
        /*
         * Soft delete is preferable to physical deletion.
         *
         * If you don't have deleted_at yet, add:
         *
         * ALTER TABLE messages
         * ADD COLUMN deleted_at timestamptz;
         */
        const { data, error } = await supabase
          .from("messages")
          .update({
            deleted_at: new Date().toISOString(),
            content: "",
          })
          .eq("id", messageId)
          .eq("sender_id", userId)
          .select()
          .single();

        if (error) throw error;

        onDeleted?.(data);

        return data;
      });
    },
    [userId, execute, onDeleted]
  );

  const markMessageDelivered = useCallback(
    async (messageId, recipientId = userId) => {
      if (!recipientId) return;

      return execute(async () => {
        const { error } = await supabase
          .from("message_receipts")
          .upsert(
            {
              message_id: messageId,
              user_id: recipientId,
              delivered_at:
                new Date().toISOString(),
            },
            {
              onConflict:
                "message_id,user_id",
            }
          );

        if (error) throw error;
      });
    },
    [userId, execute]
  );

  const markMessageSeen = useCallback(
    async (messageId, recipientId = userId) => {
      if (!recipientId) return;

      return execute(async () => {
        const now = new Date().toISOString();

        const { error } = await supabase
          .from("message_receipts")
          .upsert(
            {
              message_id: messageId,
              user_id: recipientId,
              delivered_at: now,
              seen_at: now,
            },
            {
              onConflict:
                "message_id,user_id",
            }
          );

        if (error) throw error;
      });
    },
    [userId, execute]
  );

  const toggleReaction = useCallback(
    async (messageId, reaction) => {
      if (!userId) {
        throw new Error("Authentication required.");
      }

      if (!reaction) return;

      return execute(async () => {
        /*
         * Assumes:
         *
         * message_reactions
         * -----------------
         * id
         * message_id
         * user_id
         * reaction
         * created_at
         */

        const { data: existing, error: findError } =
          await supabase
            .from("message_reactions")
            .select("id")
            .eq("message_id", messageId)
            .eq("user_id", userId)
            .eq("reaction", reaction)
            .maybeSingle();

        if (findError) throw findError;

        if (existing) {
          const { error } = await supabase
            .from("message_reactions")
            .delete()
            .eq("id", existing.id);

          if (error) throw error;

          return {
            action: "removed",
            reaction,
          };
        }

        const { data, error } =
          await supabase
            .from("message_reactions")
            .insert({
              message_id: messageId,
              user_id: userId,
              reaction,
            })
            .select()
            .single();

        if (error) throw error;

        return {
          action: "added",
          reaction: data,
        };
      });
    },
    [userId, execute]
  );

  return {
    loading,
    error,
    editMessage,
    deleteMessage,
    markMessageDelivered,
    markMessageSeen,
    toggleReaction,
  };
}