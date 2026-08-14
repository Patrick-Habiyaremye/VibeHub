// src/features/comments/engine/ReplyEngine.js

import CommentRepository from "../repository/CommentRepository";
import ModerationEngine from "./ModerationEngine";
import CommentPermissionService from "../services/CommentPermissionService";
import CommentNotificationService from "../services/CommentNotificationService";
import CommentAnalyticsService from "../services/CommentAnalyticsService";
import { MAX_COMMENT_LENGTH } from "../constants/comment.constants";

function fail(message, code) {
  return { success: false, message, code };
}

function validateLength(content) {
  const trimmed = typeof content === "string" ? content.trim() : "";
  if (!trimmed) return { valid: false, error: "Reply cannot be empty." };
  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return { valid: false, error: `Reply is too long (max ${MAX_COMMENT_LENGTH} characters).` };
  }
  return { valid: true, content: trimmed };
}

export default class ReplyEngine {
  static getReplies(params) {
    return CommentRepository.getReplies(params);
  }

  static async addReply({ contentType, contentId, parentId, parentAuthorId, user, content }) {
    if (!CommentPermissionService.canParticipate(user)) {
      return fail("You must be signed in to reply.", "UNAUTHORIZED");
    }

    const validation = validateLength(content);
    if (!validation.valid) return fail(validation.error, "INVALID_CONTENT");

    const moderation = ModerationEngine.check(validation.content);
    if (!moderation.allowed) return fail(moderation.reason, "MODERATION_BLOCKED");

    const result = await CommentRepository.insert({
      contentType,
      contentId,
      parentId,
      userId: user.id,
      content: validation.content,
    });

    if (result.success) {
      if (parentAuthorId) {
        CommentNotificationService.notifyNewReply({
          parentAuthorId,
          actorId: user.id,
          contentType,
          contentId,
          commentId: result.data.id,
        });
      }
      CommentAnalyticsService.track("reply_posted", { contentType, contentId, parentId });
    }

    return result;
  }

  static async deleteReply({ id, user, existingReply }) {
    if (!CommentPermissionService.canModify(existingReply, user)) {
      return fail("You can only delete your own replies.", "FORBIDDEN");
    }
    return CommentRepository.remove({ id, userId: user.id });
  }
}