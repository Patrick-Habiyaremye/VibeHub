/**
 * Converts the raw profile returned by the repository/database
 * into the canonical profile model used throughout the application.
 *
 * IMPORTANT:
 * UI code should only consume this normalized shape.
 */
// export function normalizeProfile(raw) {
//   if (!raw) {
//     return null;
//   }

//   return {
//     // -----------------------------------------
//     // Identity
//     // -----------------------------------------

//     id: raw.id ?? null,

//     userId:
//       raw.userId ??
//       raw.user_id ??
//       raw.id ??
//       null,

//     fullName:
//       raw.fullName ??
//       raw.full_name ??
//       null,

//     username:
//       raw.username ??
//       null,

//     // -----------------------------------------
//     // Profile media
//     // -----------------------------------------

//     avatarUrl:
//       raw.avatarUrl ??
//       raw.avatar_url ??
//       null,

//     coverImage:
//       raw.coverImage ??
//       raw.cover_image ??
//       raw.coverUrl ??
//       raw.cover_url ??
//       null,

//     // -----------------------------------------
//     // Profile information
//     // -----------------------------------------

//     bio:
//       raw.bio ??
//       null,

//     location:
//       raw.location ??
//       null,

//     website:
//       raw.website ??
//       null,

//     // -----------------------------------------
//     // Account state
//     // -----------------------------------------

//     isVerified:
//       raw.isVerified ??
//       raw.is_verified ??
//       false,

//     // -----------------------------------------
//     // Dates
//     // -----------------------------------------

//     createdAt:
//       raw.createdAt ??
//       raw.created_at ??
//       null,

//     updatedAt:
//       raw.updatedAt ??
//       raw.updated_at ??
//       null,

//     // -----------------------------------------
//     // Profile metrics
//     // -----------------------------------------

//     kindnessScore:
//       raw.kindnessScore ??
//       raw.kindness_score ??
//       0,

//     smileCount:
//       raw.smileCount ??
//       raw.smile_count ??
//       0,

//     gratitudeReceived:
//       raw.gratitudeReceived ??
//       raw.gratitude_received ??
//       0,

//     streak:
//       raw.streak ??
//       raw.streak_count ??
//       0,
//   };
// }


// src/features/profile/utils/normalizeProfile.js

export function normalizeProfile(raw) {
  if (!raw) return null;

  const fullName =
    raw.full_name ??
    raw.fullName ??
    "";

  const username =
    raw.username ??
    "";

  return {
    id: raw.id ?? null,

    username,

    fullName,

    // Temporary convenience value.
    // If your naming convention guarantees that the
    // last part of full_name is the preferred first/display name.
    displayFirstName:
      fullName.trim().split(/\s+/).filter(Boolean).at(-1) ?? "",

    avatarUrl:
      raw.avatar_url ?? null,

    coverImage:
      raw.cover_image ?? null,

    bio:
      raw.bio ?? "",

    role:
      raw.role ?? null,

    isOnboarded:
      raw.is_onboarded ?? false,

    banned:
      raw.banned ?? false,

    streakCount:
      raw.streak_count ?? 0,

    lastActiveDate:
      raw.last_active_date ?? null,

    createdAt:
      raw.created_at ?? null,
  };
}