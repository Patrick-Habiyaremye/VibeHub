// src/features/messaging/api/messages.api.js

import { supabase } from "../../../supabaseClient";
import {
  getOrCreateConversation,
} from "./conversations.api";

/**
 * Fetch messages for a conversation.
 *
 * Pagination is cursor-based.
 */
export async function getMessages({
  conversationId,
  limit = 50,
  before = null,
}) {
  if (!conversationId) {
    throw new Error("conversationId is required");
  }

  let query = supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!sender_id(
        id,
        username,
        name,
        avatar_url
      )
    `)
    .eq("conversation_id", conversationId)
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data || []).reverse();
}

/**
 * Compatibility fallback for your CURRENT schema.
 *
 * Your current messages table does not show conversation_id.
 * Therefore this function can still fetch messages using
 * sender/receiver.
 */
export async function getMessagesBetweenUsers(
  userId,
  otherUserId,
  { limit = 50, before = null } = {}
) {
  if (!userId || !otherUserId) {
    return [];
  }

  let query = supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!sender_id(
        id,
        username,
        name,
        avatar_url
      )
    `)
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data || []).reverse();
}

/**
 * Send a text message.
 *
 * Uses your current sender_id / receiver_id schema.
 */
export async function sendTextMessage({
  senderId,
  receiverId,
  content,
}) {
  if (!senderId || !receiverId) {
    throw new Error(
      "senderId and receiverId are required"
    );
  }

  if (senderId === receiverId) {
    throw new Error(
      "You cannot message yourself"
    );
  }

  const cleanContent = content?.trim();

  if (!cleanContent) {
    throw new Error("Message cannot be empty");
  }

  if (cleanContent.length > 10000) {
    throw new Error(
      "Message is too long"
    );
  }

  const conversation =
    await getOrCreateConversation(
      senderId,
      receiverId
    );

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content: cleanContent,
      created_at: now,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  /*
   * Create delivery receipt for receiver.
   */
  await createDeliveryReceipt({
    messageId: data.id,
    userId: receiverId,
  });

  /*
   * Client-side fallback.
   *
   * Prefer moving this to a PostgreSQL trigger later.
   */
  try {
    await supabase
      .from("conversations")
      .update({
        last_message: cleanContent,
        last_message_at: now,
      })
      .eq("id", conversation.id);
  } catch (error) {
    console.warn(
      "Conversation preview update failed:",
      error
    );
  }

  return {
    ...data,
    conversation_id: conversation.id,
  };
}

/**
 * Send media message.
 */
export async function sendMediaMessage({
  senderId,
  receiverId,
  mediaUrl,
  mediaType,
  content = "",
}) {
  if (!senderId || !receiverId) {
    throw new Error(
      "senderId and receiverId are required"
    );
  }

  if (!mediaUrl) {
    throw new Error("mediaUrl is required");
  }

  const conversation =
    await getOrCreateConversation(
      senderId,
      receiverId
    );

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content: content?.trim() || "",
      media_url: mediaUrl,
      media_type: mediaType,
      created_at: now,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  await createDeliveryReceipt({
    messageId: data.id,
    userId: receiverId,
  });

  await supabase
    .from("conversations")
    .update({
      last_message:
        content?.trim() ||
        `[${mediaType || "media"}]`,
      last_message_at: now,
    })
    .eq("id", conversation.id);

  return data;
}

/**
 * Create recipient delivery receipt.
 */
export async function createDeliveryReceipt({
  messageId,
  userId,
}) {
  const { data, error } = await supabase
    .from("message_receipts")
    .upsert(
      {
        message_id: messageId,
        user_id: userId,
        delivered_at: new Date().toISOString(),
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

/**
 * Mark messages as seen.
 */
export async function markMessagesSeen({
  senderId,
  receiverId,
}) {
  if (!senderId || !receiverId) {
    return;
  }

  const now = new Date().toISOString();

  const { data: messages, error } = await supabase
    .from("messages")
    .select("id")
    .eq("sender_id", senderId)
    .eq("receiver_id", receiverId)
    .is("seen_at", null);

  if (error) {
    throw error;
  }

  if (!messages?.length) {
    return [];
  }

  const messageIds = messages.map(
    (message) => message.id
  );

  const { error: receiptError } =
    await supabase
      .from("message_receipts")
      .update({
        seen_at: now,
      })
      .in("message_id", messageIds)
      .eq("user_id", receiverId);

  if (receiptError) {
    throw receiptError;
  }

  /*
   * Compatibility with your existing messages schema.
   */
  const { error: messageError } =
    await supabase
      .from("messages")
      .update({
        seen_at: now,
        is_read: true,
      })
      .in("id", messageIds);

  if (messageError) {
    console.warn(
      "Legacy message read state update failed:",
      messageError
    );
  }

  return messageIds;
}

/**
 * Get unread count.
 */
export async function getUnreadCount(userId) {
  if (!userId) return 0;

  const { count, error } = await supabase
    .from("messages")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("receiver_id", userId)
    .is("seen_at", null);

  if (error) {
    throw error;
  }

  return count || 0;
}

/**
 * Edit a message.
 */
export async function editMessage({
  messageId,
  userId,
  content,
}) {
  const cleanContent = content?.trim();

  if (!cleanContent) {
    throw new Error(
      "Message cannot be empty"
    );
  }

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

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Soft-delete a message.
 */
export async function deleteMessage({
  messageId,
  userId,
}) {
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

  if (error) {
    throw error;
  }

  return data;
}