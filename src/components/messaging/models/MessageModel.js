// src/features/messaging/models/MessageModel.js

export default class MessageModel {
  constructor(data = {}) {
    this.id = data.id ?? null;

    this.senderId =
      data.senderId ??
      data.sender_id ??
      null;

    this.receiverId =
      data.receiverId ??
      data.receiver_id ??
      null;

    this.content = data.content ?? "";

    this.mediaUrl =
      data.mediaUrl ??
      data.media_url ??
      null;

    this.mediaType =
      data.mediaType ??
      data.media_type ??
      null;

    this.storyId =
      data.storyId ??
      data.story_id ??
      null;

    this.createdAt =
      data.createdAt ??
      data.created_at ??
      null;

    this.deliveredAt =
      data.deliveredAt ??
      data.delivered_at ??
      null;

    this.seenAt =
      data.seenAt ??
      data.seen_at ??
      null;

    this.isRead =
      data.isRead ??
      data.is_read ??
      Boolean(this.seenAt);

    this.replyToId =
      data.replyToId ??
      data.reply_to_id ??
      null;

    this.reactionCount =
      data.reactionCount ??
      data.reaction_count ??
      0;

    this.optimistic = Boolean(data.optimistic);
  }

  get isText() {
    return !this.mediaUrl;
  }

  get isMedia() {
    return Boolean(this.mediaUrl);
  }

  get isSeen() {
    return Boolean(this.seenAt);
  }

  get isDelivered() {
    return Boolean(this.deliveredAt);
  }

  toJSON() {
    return {
      id: this.id,
      senderId: this.senderId,
      receiverId: this.receiverId,
      content: this.content,
      mediaUrl: this.mediaUrl,
      mediaType: this.mediaType,
      storyId: this.storyId,
      createdAt: this.createdAt,
      deliveredAt: this.deliveredAt,
      seenAt: this.seenAt,
      isRead: this.isRead,
      replyToId: this.replyToId,
      reactionCount: this.reactionCount,
      optimistic: this.optimistic,
    };
  }
}