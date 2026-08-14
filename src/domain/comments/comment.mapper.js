export function normalizeComment(raw) {
return {
    id: raw.id,
    content: raw.content,
    userId: raw.user_id,
    parentId: raw.parent_id,
    createdAt: raw.created_at,
    likes: raw.likes_count ?? 0,
    username: raw.profiles?.username ?? "User",
    avatar: raw.profiles?.avatar_url ?? null,
  };
}

export function normalizeListResponse(data) {
  if (!Array.isArray(data)) return [];

  return data.map(normalizeComment);
}