// src/features/comments/repository/CommentRepository.js

// src/features/comments/repository/CommentRepository.js
//
// Pure data-access layer: talks to api/, normalizes via CommentModel,
// returns the {success,data,meta} contract. NO validation, permission
// checks, moderation, or notifications here — that's the engine layer's
// job. This file should never grow business rules.

import * as api from "../api/comments.api";
import CommentModel from "../models/CommentModel";

function fail(error, fallback) {
  return { success: false, message: error?.message || fallback, code: error?.code ?? null };
}
function ok(data, meta) {
  return meta !== undefined ? { success: true, data, meta } : { success: true, data };
}

export default class CommentRepository {
  static async getComments({ contentType, contentId, cursor = null, page = 1, limit = 20, sort, userId = null }) {
    try {
      const rows = await api.fetchComments({ contentType, contentId, cursor, page, limit, sort });
      const likedIds = userId ? await api.fetchLikedCommentIds({ commentIds: rows.map((r) => r.id), userId }) : [];
      const likedSet = new Set(likedIds);

      const data = rows.map((r) => CommentModel.fromRaw(r, { likedByMe: likedSet.has(r.id) }));
      const nextCursor = rows.length ? rows[rows.length - 1].created_at : null;

      return ok(data, { nextCursor, nextPage: page + 1, hasMore: rows.length === limit });
    } catch (error) {
      return fail(error, "Failed to load comments.");
    }
  }

  static async getReplies({ parentId, cursor = null, limit = 20, userId = null }) {
    try {
      const rows = await api.fetchReplies({ parentId, cursor, limit });
      const likedIds = userId ? await api.fetchLikedCommentIds({ commentIds: rows.map((r) => r.id), userId }) : [];
      const likedSet = new Set(likedIds);

      const data = rows.map((r) => CommentModel.fromRaw(r, { likedByMe: likedSet.has(r.id) }));
      const nextCursor = rows.length ? rows[rows.length - 1].created_at : null;

      return ok(data, { nextCursor, hasMore: rows.length === limit });
    } catch (error) {
      return fail(error, "Failed to load replies.");
    }
  }

  static async insert({ contentType, contentId, parentId = null, userId, content }) {
    try {
      const row = await api.insertComment({ contentType, contentId, parentId, userId, content });
      return ok(CommentModel.fromRaw(row, { likedByMe: false }));
    } catch (error) {
      return fail(error, "Failed to post comment.");
    }
  }

  static async update({ id, userId, content }) {
    try {
      const row = await api.updateCommentContent({ id, userId, content });
      return ok(CommentModel.fromRaw(row));
    } catch (error) {
      return fail(error, "Failed to update comment.");
    }
  }

  static async remove({ id, userId }) {
    try {
      await api.deleteCommentRow({ id, userId });
      return ok(true);
    } catch (error) {
      return fail(error, "Failed to delete comment.");
    }
  }

  static async setLiked({ commentId, userId, liked }) {
    try {
      if (liked) await api.likeComment({ commentId, userId });
      else await api.unlikeComment({ commentId, userId });
      return ok(true);
    } catch (error) {
      return fail(error, "Failed to update like.");
    }
  }
}