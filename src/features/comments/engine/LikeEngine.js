// src/features/comments/engine/LikeEngine.js

import CommentRepository from "../repository/CommentRepository";
import CommentPermissionService from "../services/CommentPermissionService";
import CommentNotificationService from "../services/CommentNotificationService";
import CommentAnalyticsService from "../services/CommentAnalyticsService";

function fail(message, code) {
  return { success: false, message, code };
}

export default class LikeEngine {
  static async setLiked({ commentId, commentOwnerId, contentType, contentId, user, liked }) {
    if (!CommentPermissionService.canParticipate(user)) {
      return fail("You must be signed in to like a comment.", "UNAUTHORIZED");
    }

    const result = await CommentRepository.setLiked({ commentId, userId: user.id, liked });

    if (result.success) {
      if (liked && commentOwnerId) {
        CommentNotificationService.notifyLike({
          commentOwnerId,
          actorId: user.id,
          contentType,
          contentId,
          commentId,
        });
      }
      CommentAnalyticsService.track(liked ? "comment_liked" : "comment_unliked", { commentId });
    }

    return result;
  }
}