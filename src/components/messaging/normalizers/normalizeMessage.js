export default function normalizeMessage(message) {
  if (!message) return null;

  return {
    ...message,

    id: message.id,
    conversationId:
      message.conversation_id ?? message.conversationId,

    senderId:
      message.sender_id ?? message.senderId,

    content: message.content ?? "",

    type:
      message.message_type ??
      message.type ??
      "text",

    replyToId:
      message.reply_to_id ??
      message.replyToId ??
      null,

    createdAt:
      message.created_at ??
      message.createdAt,

    editedAt:
      message.edited_at ??
      null,

    deletedAt:
      message.deleted_at ??
      null,

    optimistic:
      Boolean(message.optimistic),

    status:
      message.status ?? "sent",
  };
}