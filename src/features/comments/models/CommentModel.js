// src/features/comments/models/CommentModel.js
//
// Canonical shape for a comment throughout this feature. Repository/
// engines/hooks/components all consume THIS shape — nothing reads a raw
// Supabase row directly outside this file.

export default class CommentModel {
  constructor(raw, extra = {}) {
    this.id = raw.id;
    this.contentType = raw.content_type;
    this.contentId = raw.content_id;
    this.parentId = raw.parent_id ?? null;
    this.userId = raw.user_id;
    this.content = raw.content;
    this.likesCount = raw.likes_count ?? 0;
    this.repliesCount = raw.replies_count ?? 0;
    this.likedByMe = extra.likedByMe ?? false;
    this.user = raw.profiles
      ? { id: raw.profiles.id, username: raw.profiles.username, avatarUrl: raw.profiles.avatar_url }
      : null;
    this.createdAt = raw.created_at;
    this.updatedAt = raw.updated_at ?? null;
    this.optimistic = extra.optimistic ?? false;
  }

  static fromRaw(raw, extra = {}) {
    if (!raw) return null;
    return new CommentModel(raw, extra);
  }
}