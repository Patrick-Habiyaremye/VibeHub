// src/features/comments/engine/CommentEngine.js
//
// Business orchestration for top-level comments: validation, permission
// checks, moderation, then Repository, then notifications + analytics
// (both fire-and-forget, never block the returned result).

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
  if (!trimmed) return { valid: false, error: "Comment cannot be empty." };
  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return { valid: false, error: `Comment is too long (max ${MAX_COMMENT_LENGTH} characters).` };
  }
  return { valid: true, content: trimmed };
}

export default class CommentEngine {
  static getComments(params) {
    return CommentRepository.getComments(params);
  }

  static async addComment({ contentType, contentId, ownerId, user, content }) {
    if (!CommentPermissionService.canParticipate(user)) {
      return fail("You must be signed in to comment.", "UNAUTHORIZED");
    }

    const validation = validateLength(content);
    if (!validation.valid) return fail(validation.error, "INVALID_CONTENT");

    const moderation = ModerationEngine.check(validation.content);
    if (!moderation.allowed) return fail(moderation.reason, "MODERATION_BLOCKED");

    const result = await CommentRepository.insert({
      contentType,
      contentId,
      userId: user.id,
      content: validation.content,
    });

    if (result.success) {
      if (ownerId) {
        CommentNotificationService.notifyNewComment({
          ownerId,
          actorId: user.id,
          contentType,
          contentId,
          commentId: result.data.id,
        });
      }
      CommentAnalyticsService.track("comment_posted", { contentType, contentId });
    }

    return result;
  }

  static async updateComment({ id, user, content, existingComment }) {
    if (!CommentPermissionService.canModify(existingComment, user)) {
      return fail("You can only edit your own comments.", "FORBIDDEN");
    }

    const validation = validateLength(content);
    if (!validation.valid) return fail(validation.error, "INVALID_CONTENT");

    const moderation = ModerationEngine.check(validation.content);
    if (!moderation.allowed) return fail(moderation.reason, "MODERATION_BLOCKED");

    return CommentRepository.update({ id, userId: user.id, content: validation.content });
  }

  static async deleteComment({ id, user, existingComment }) {
    if (!CommentPermissionService.canModify(existingComment, user)) {
      return fail("You can only delete your own comments.", "FORBIDDEN");
    }

    const result = await CommentRepository.remove({ id, userId: user.id });
    if (result.success) {
      CommentAnalyticsService.track("comment_deleted", { commentId: id });
    }
    return result;
  }
}