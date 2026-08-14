// Normalized shape for a profile record. Keeps the rest of the app decoupled
// from whatever field names/casing the backend happens to return.
export function createProfileModel(raw = {}) {
  return {
    id: raw.id ?? raw.user_id ?? null,
    userId: raw.user_id ?? raw.id ?? null,
    username: raw.username ?? "",
    fullName: raw.full_name ?? raw.username ?? "",
    bio: raw.bio ?? "",
    location: raw.location ?? "",
    website: raw.website ?? "",
    avatarUrl: raw.avatar_url ?? null,
    coverImage: raw.cover_image ?? null,
    isVerified: Boolean(raw.is_verified),
    createdAt: raw.created_at ?? null,
    supportersCount: raw.supporters_count ?? 0,
    supportingCount: raw.supporting_count ?? 0,
    streakCount: raw.streak_count ?? 0,
  };
}