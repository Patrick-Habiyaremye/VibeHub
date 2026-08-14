// utils/profileSelectors.js

/*
 * ---------------------------------------------------------
 * Profile identity
 * ---------------------------------------------------------
 */

export function selectIsOwnProfile(currentUser, profile) {
  if (!currentUser || !profile) {
    return false;
  }

  return (
    currentUser.id === profile.id ||
    currentUser.id === profile.userId ||
    currentUser.id === profile.user_id
  );
}

export function selectDisplayName(profile) {
  return (
    profile?.fullName ||
    profile?.full_name ||
    profile?.username ||
    ""
  );
}

/*
 * ---------------------------------------------------------
 * Avatar
 * ---------------------------------------------------------
 *
 * Supports both:
 *
 *   avatarUrl      ← normalized application format
 *   avatar_url     ← Supabase/database format
 *
 * The engine should eventually normalize everything to
 * camelCase, but this selector is intentionally defensive.
 */

export function selectAvatarImage({
  avatarPreview,
  avatarFailed,
  profile,
  fallback,
}) {
  // A freshly selected/uploading image always wins.
  if (avatarPreview) {
    return avatarPreview;
  }

  // If the current image has already failed, don't keep
  // returning the broken URL.
  if (avatarFailed) {
    return fallback;
  }

  const avatarUrl =
    profile?.avatarUrl ||
    profile?.avatar_url ||
    profile?.avatar ||
    null;

  return avatarUrl || fallback;
}

/*
 * ---------------------------------------------------------
 * Cover
 * ---------------------------------------------------------
 */

export function selectCoverImage({
  coverPreview,
  coverFailed,
  profile,
  fallback,
}) {
  if (coverPreview) {
    return coverPreview;
  }

  if (coverFailed) {
    return fallback;
  }

  const coverUrl =
    profile?.coverImage ||
    profile?.cover_image ||
    profile?.coverUrl ||
    profile?.cover_url ||
    null;

  return coverUrl || fallback;
}

/*
 * ---------------------------------------------------------
 * Custom avatar / cover detection
 * ---------------------------------------------------------
 */

export function selectHasCustomAvatar({
  avatarPreview,
  avatarUrl,
}) {
  return Boolean(
    avatarPreview ||
      avatarUrl
  );
}

export function selectHasCustomCover({
  coverPreview,
  coverImage,
}) {
  return Boolean(
    coverPreview ||
      coverImage
  );
}