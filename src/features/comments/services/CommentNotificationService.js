// src/features/comments/services/CommentNotificationService.js
//
// Every call here is fire-and-forget from the caller's perspective —
// failures are caught and logged, NEVER thrown, so a broken notifications
// pipeline (e.g. the missing INSERT policy flagged above, until you run
// that migration) never blocks someone from actually commenting/liking.

import * as api from "../api/comments.api";
import { NOTIFICATION_TYPES } from "../constants/comment.constants";

async function safeNotify(params, label) {
  try {
    await api.insertNotification(params);
  } catch (error) {
    console.warn(`[CommentNotificationService] ${label} failed (non-fatal):`, error.message);
  }
}

export default class CommentNotificationService {
  static notifyNewComment({ ownerId, actorId, contentType, contentId, commentId }) {
    return safeNotify(
      { userId: ownerId, actorId, type: NOTIFICATION_TYPES.NEW_COMMENT, contentType, contentId, commentId },
      "notifyNewComment"
    );
  }

  static notifyNewReply({ parentAuthorId, actorId, contentType, contentId, commentId }) {
    return safeNotify(
      { userId: parentAuthorId, actorId, type: NOTIFICATION_TYPES.NEW_REPLY, contentType, contentId, commentId },
      "notifyNewReply"
    );
  }

  static notifyLike({ commentOwnerId, actorId, contentType, contentId, commentId }) {
    return safeNotify(
      { userId: commentOwnerId, actorId, type: NOTIFICATION_TYPES.COMMENT_LIKE, contentType, contentId, commentId },
      "notifyLike"
    );
  }
}