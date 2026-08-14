// src/features/messaging/api/conversations.api.js

import { supabase } from "../../../supabaseClient";

function normalizePair(userA, userB) {
  if (!userA || !userB) {
    throw new Error("Both user IDs are required");
  }

  return userA < userB
    ? [userA, userB]
    : [userB, userA];
}

/**
 * Find an existing one-to-one conversation.
 */
export async function getConversationBetween(userA, userB) {
  const [user1_id, user2_id] = normalizePair(userA, userB);

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user1_id", user1_id)
    .eq("user2_id", user2_id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get or create a one-to-one conversation.
 *
 * IMPORTANT:
 * The database should have a unique constraint on:
 *
 * UNIQUE(user1_id, user2_id)
 *
 * because both IDs are normalized before insert.
 */
export async function getOrCreateConversation(userA, userB) {
  if (userA === userB) {
    throw new Error("You cannot create a conversation with yourself");
  }

  const [user1_id, user2_id] = normalizePair(userA, userB);

  const existing = await getConversationBetween(
    user1_id,
    user2_id
  );

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user1_id,
      user2_id,
    })
    .select("*")
    .single();

  if (error) {
    // Race condition:
    // another client may have created it simultaneously.
    if (error.code === "23505") {
      return getConversationBetween(
        user1_id,
        user2_id
      );
    }

    throw error;
  }

  return data;
}

/**
 * Get conversations for the current user.
 *
 * Participant profiles are fetched separately because your
 * conversations table uses user1_id/user2_id.
 */
export async function getConversations(userId) {
  if (!userId) return [];

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("*")
    .or(
      `user1_id.eq.${userId},user2_id.eq.${userId}`
    )
    .order("last_message_at", {
      ascending: false,
      nullsFirst: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  if (!conversations?.length) {
    return [];
  }

  const participantIds = [
    ...new Set(
      conversations.flatMap((conversation) => [
        conversation.user1_id,
        conversation.user2_id,
      ])
    ),
  ].filter(Boolean);

  const { data: profiles, error: profileError } =
    await supabase
      .from("profiles")
      .select("id, username, name, avatar_url")
      .in("id", participantIds);

  if (profileError) {
    throw profileError;
  }

  const profileMap = new Map(
    (profiles || []).map((profile) => [
      profile.id,
      profile,
    ])
  );

  return conversations.map((conversation) => {
    const participantId =
      conversation.user1_id === userId
        ? conversation.user2_id
        : conversation.user1_id;

    const participant =
      profileMap.get(participantId) || null;

    return {
      ...conversation,

      participant_id: participantId,

      username:
        participant?.username ||
        participant?.name ||
        "Unknown user",

      name:
        participant?.name ||
        participant?.username ||
        "Unknown user",

      avatar_url:
        participant?.avatar_url || null,

      participant,

      is_online: false,

      unread_count: 0,
    };
  });
}

/**
 * Update conversation preview.
 *
 * Usually this should be performed by a database trigger,
 * not by the client.
 *
 * This function exists for controlled client-side fallback.
 */
export async function updateConversationPreview(
  conversationId,
  lastMessage,
  lastMessageAt
) {
  const { data, error } = await supabase
    .from("conversations")
    .update({
      last_message: lastMessage,
      last_message_at: lastMessageAt,
    })
    .eq("id", conversationId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}