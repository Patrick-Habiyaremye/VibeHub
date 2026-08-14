// src/features/comments/utils/normalizeComment.js

// export default function normalizeComment(raw, extra = {}) {
//   if (!raw) return null;

//   return {
//     id: raw.id,
//     contentType: raw.content_type,
//     contentId: raw.content_id,
//     parentId: raw.parent_id ?? null,
//     userId: raw.user_id,
//     content: raw.content,
//     likesCount: raw.likes_count ?? 0,
//     repliesCount: raw.replies_count ?? 0,
//     likedByMe: extra.likedByMe ?? false,
//     user: raw.profiles
//       ? { id: raw.profiles.id, username: raw.profiles.username, avatarUrl: raw.profiles.avatar_url }
//       : null,
//     createdAt: raw.created_at,
//     updatedAt: raw.updated_at ?? null,
//   };
// }

// Thin compatibility wrapper — CommentModel is the source of truth.
import CommentModel from "../models/CommentModel";

export default function normalizeComment(raw, extra = {}) {
  return CommentModel.fromRaw(raw, extra);
}