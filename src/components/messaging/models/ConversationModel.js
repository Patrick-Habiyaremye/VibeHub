// src/features/messaging/models/ConversationModel.js

import ParticipantModel from "./ParticipantModel";

export default class ConversationModel {
  constructor(data = {}, currentUserId = null) {
    this.id = data.id ?? null;

    this.user1Id =
      data.user1Id ??
      data.user1_id ??
      null;

    this.user2Id =
      data.user2Id ??
      data.user2_id ??
      null;

    this.lastMessage =
      data.lastMessage ??
      data.last_message ??
      "";

    this.lastMessageAt =
      data.lastMessageAt ??
      data.last_message_at ??
      null;

    this.createdAt =
      data.createdAt ??
      data.created_at ??
      null;

    this.unreadCount =
      Number(
        data.unreadCount ??
        data.unread_count ??
        0
      );

    this.currentUserId = currentUserId;

    this.participant =
      data.participant
        ? new ParticipantModel(data.participant)
        : null;
  }

  get otherUserId() {
    if (!this.currentUserId) return null;

    return this.user1Id === this.currentUserId
      ? this.user2Id
      : this.user1Id;
  }

  get isValid() {
    return Boolean(
      this.id &&
      this.user1Id &&
      this.user2Id
    );
  }

  toJSON() {
    return {
      id: this.id,
      user1Id: this.user1Id,
      user2Id: this.user2Id,
      lastMessage: this.lastMessage,
      lastMessageAt: this.lastMessageAt,
      createdAt: this.createdAt,
      unreadCount: this.unreadCount,
      participant: this.participant?.toJSON() ?? null,
    };
  }
}