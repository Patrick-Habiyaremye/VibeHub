// features/messaging/normalizers/normalizeConversation.js

export default function normalizeConversation(
  conversation,
  currentUserId,
  profilesById = {}
) {
  if (!conversation) return null;

  const otherUserId =
    conversation.user1_id === currentUserId
      ? conversation.user2_id
      : conversation.user1_id;

  const participant = profilesById[otherUserId];

  return {
    id: conversation.id,

    userId: otherUserId,

    username:
      participant?.username ||
      "Unknown user",

    avatar_url:
      participant?.avatar_url || null,

    lastMessage:
      conversation.last_message || "",

    lastMessageAt:
      conversation.last_message_at || null,

    unreadCount:
      conversation.unread_count || 0,

    isOnline:
      participant?.is_online || false,

    raw: conversation,
  };
}