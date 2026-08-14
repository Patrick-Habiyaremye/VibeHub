// src/features/messaging/api/reactions.api.js

import { supabase } from "../../../supabaseClient";

/*
 * This assumes a message_reactions table:
 *
 * id
 * message_id
 * user_id
 * reaction
 * created_at
 *
 * UNIQUE(message_id, user_id)
 */

export async function reactToMessage({
  messageId,
  userId,
  reaction,
}) {
  if (!messageId || !userId || !reaction) {
    throw new Error(
      "messageId, userId and reaction are required"
    );
  }

  const { data, error } = await supabase
    .from("message_reactions")
    .upsert(
      {
        message_id: messageId,
        user_id: userId,
        reaction,
        created_at: new Date().toISOString(),
      },
      {
        onConflict: "message_id,user_id",
      }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function removeMessageReaction({
  messageId,
  userId,
}) {
  const { error } = await supabase
    .from("message_reactions")
    .delete()
    .eq("message_id", messageId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function getMessageReactions(
  messageId
) {
  const { data, error } = await supabase
    .from("message_reactions")
    .select("*")
    .eq("message_id", messageId);

  if (error) {
    throw error;
  }

  return data || [];
}