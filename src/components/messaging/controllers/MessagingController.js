// src/features/messaging/controllers/MessagingController.js

import MessagingService from "../services/MessagingService";

export default class MessagingController {
  constructor({
    userId,
    onError,
  } = {}) {
    this.userId = userId;
    this.onError = onError;
  }

  setUser(userId) {
    this.userId = userId;
  }

  // ------------------------------------------
  // CONVERSATIONS
  // ------------------------------------------

  async getConversations() {
    if (!this.userId) {
      return [];
    }

    try {
      return await MessagingService.getConversations(
        this.userId
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getOrCreateConversation(
    otherUserId
  ) {
    this.assertAuthenticated();

    if (!otherUserId) {
      throw new Error(
        "A recipient is required."
      );
    }

    if (
      otherUserId === this.userId
    ) {
      throw new Error(
        "You cannot start a conversation with yourself."
      );
    }

    try {
      return await MessagingService.getOrCreateConversation(
        this.userId,
        otherUserId
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // ------------------------------------------
  // MESSAGES
  // ------------------------------------------

  async getMessages(
    conversationId,
    options = {}
  ) {
    this.assertAuthenticated();

    if (!conversationId) {
      return [];
    }

    try {
      return await MessagingService.getMessages(
        conversationId,
        this.userId,
        options
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async sendTextMessage({
    conversationId,
    receiverId,
    content,
    replyToId = null,
  }) {
    this.assertAuthenticated();

    const cleaned =
      String(content ?? "").trim();

    if (!cleaned) {
      throw new Error(
        "Message cannot be empty."
      );
    }

    if (!receiverId) {
      throw new Error(
        "Recipient is required."
      );
    }

    if (receiverId === this.userId) {
      throw new Error(
        "You cannot message yourself."
      );
    }

    try {
      return await MessagingService.sendMessage(
        {
          conversationId,
          senderId: this.userId,
          receiverId,
          content: cleaned,
          replyToId,
        }
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // ------------------------------------------
  // MESSAGE STATE
  // ------------------------------------------

  async markConversationSeen(
    conversationId
  ) {
    this.assertAuthenticated();

    if (!conversationId) {
      return;
    }

    try {
      return await MessagingService.markConversationSeen(
        conversationId,
        this.userId
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async markMessageDelivered(
    messageId
  ) {
    this.assertAuthenticated();

    if (!messageId) return;

    try {
      return await MessagingService.markMessageDelivered(
        messageId,
        this.userId
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // ------------------------------------------
  // MESSAGE ACTIONS
  // ------------------------------------------

  async editMessage(
    messageId,
    content
  ) {
    this.assertAuthenticated();

    const cleaned =
      String(content ?? "").trim();

    if (!cleaned) {
      throw new Error(
        "Message cannot be empty."
      );
    }

    try {
      return await MessagingService.editMessage(
        messageId,
        this.userId,
        cleaned
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async deleteMessage(
    messageId
  ) {
    this.assertAuthenticated();

    if (!messageId) {
      throw new Error(
        "Message id is required."
      );
    }

    try {
      return await MessagingService.deleteMessage(
        messageId,
        this.userId
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // ------------------------------------------
  // UNREAD
  // ------------------------------------------

  async getUnreadCount() {
    this.assertAuthenticated();

    try {
      return await MessagingService.getUnreadCount(
        this.userId
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // ------------------------------------------
  // VALIDATION
  // ------------------------------------------

  assertAuthenticated() {
    if (!this.userId) {
      throw new Error(
        "You must be authenticated to use messaging."
      );
    }
  }

  handleError(error) {
    console.error(
      "[MessagingController]",
      error
    );

    this.onError?.(error);
  }
}