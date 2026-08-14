export function normalizeComment(row) {
  if (!row) return null;

  const hasProfile = !!row.profiles;

  return {
    id: row.id,
    content: row.content ?? "",
    user_id: row.user_id,
    created_at: row.created_at,

    profiles: hasProfile
      ? {
          username: row.profiles.username,
          avatar_url: row.profiles.avatar_url,
        }
      : null, // <-- be honest about missing data

    optimistic: row.optimistic ?? false,
  };
}