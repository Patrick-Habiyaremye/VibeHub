// src/features/messaging/services/MessagingService.js

import { supabase } from "../../../supabaseClient";

function conversationKey(userA, userB) {
  return [userA, userB]
    .sort()
    .join("-");
}

export const MessagingService = {
  /*
   * Find existing one-to-one conversation.
   */
  async findConversation(userA, userB) {
    const { data, error } =
      await supabase
        .from("conversations")
        .select("*")
        .or(
          `and(user1_id.eq.${userA},user2_id.eq.${userB}),and(user1_id.eq.${userB},user2_id.eq.${userA})`
        )
        .maybeSingle();

    if (error) throw error;

    return data;
  },

  /*
   * Get existing conversation or create it.
   *
   * This is what allows users to message each other
   * without a friend request.
   */
  async getOrCreateConversation(
    userA,
    userB
  ) {
    if (!userA || !userB) {
      throw new Error(
        "Both users are required."
      );
    }

    if (userA === userB) {
      throw new Error(
        "You cannot create a conversation with yourself."
      );
    }

    const existing =
      await this.findConversation(
        userA,
        userB
      );

    if (existing) {
      return existing;
    }

    const [user1, user2] =
      [userA, userB].sort();

    const { data, error } =
      await supabase
        .from("conversations")
        .insert({
          user1_id: user1,
          user2_id: user2,
        })
        .select()
        .single();

    /*
     * Another request may have created the
     * conversation at exactly the same time.
     */
    if (
      error?.code === "23505"
    ) {
      return this.findConversation(
        userA,
        userB
      );
    }

    if (error) throw error;

    return data;
  },

  async sendTextMessage({
    senderId,
    receiverId,
    content,
  }) {
    const cleanContent =
      content?.trim();

    if (!senderId || !receiverId) {
      throw new Error(
        "Sender and receiver are required."
      );
    }

    if (!cleanContent) {
      throw new Error(
        "Message cannot be empty."
      );
    }

    if (senderId === receiverId) {
      throw new Error(
        "You cannot message yourself."
      );
    }

    const conversation =
      await this.getOrCreateConversation(
        senderId,
        receiverId
      );

    const { data, error } =
      await supabase
        .from("messages")
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content: cleanContent,
        })
        .select()
        .single();

    if (error) throw error;

    /*
     * Keep conversation preview synchronized.
     */
    const { error: conversationError } =
      await supabase
        .from("conversations")
        .update({
          last_message: cleanContent,
          last_message_at:
            data.created_at ||
            new Date().toISOString(),
        })
        .eq("id", conversation.id);

    if (conversationError) {
      console.error(
        "[MessagingService] conversation update failed:",
        conversationError
      );
    }

    return {
      message: data,
      conversation,
    };
  },

  async getMessages({
    senderId,
    receiverId,
    limit = 50,
    before = null,
  }) {
    let query = supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(limit);

    if (before) {
      query = query.lt(
        "created_at",
        before
      );
    }

    const { data, error } =
      await query;

    if (error) throw error;

    return (data || []).reverse();
  },

  async markConversationSeen({
    conversationId,
    userId,
  }) {
    if (!conversationId || !userId) {
      return;
    }

    const { data: conversation, error } =
      await supabase
        .from("conversations")
        .select(
          "user1_id,user2_id"
        )
        .eq("id", conversationId)
        .single();

    if (error) throw error;

    const otherUser =
      conversation.user1_id === userId
        ? conversation.user2_id
        : conversation.user1_id;

    const { data: messages, error: messageError } =
      await supabase
        .from("messages")
        .select("id")
        .eq("sender_id", otherUser)
        .eq("receiver_id", userId);

    if (messageError) {
      throw messageError;
    }

    if (!messages?.length) return;

    const now =
      new Date().toISOString();

    const receipts =
      messages.map((message) => ({
        message_id: message.id,
        user_id: userId,
        delivered_at: now,
        seen_at: now,
      }));

    const { error: receiptError } =
      await supabase
        .from("message_receipts")
        .upsert(receipts, {
          onConflict:
            "message_id,user_id",
        });

    if (receiptError) {
      throw receiptError;
    }
  },

  getConversationKey:
    conversationKey,
};

export default MessagingService;