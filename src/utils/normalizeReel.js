// src/utils/normalizeReel.js
//
// CANONICAL REEL NORMALIZER
//
// Every reel entering the frontend should pass through this function.
//
// Canonical shape:
//
// {
//   id,
//   user_id,
//   content,
//
//   type: "video",
//
//   user: {
//     id,
//     username,
//     fullName,
//     avatar,
//   },
//
//   media: {
//     kind: "video",
//     type: "video",
//     url,
//     poster,
//     thumbnail,
//     width,
//     height,
//   },
//
//   tags,
//   duration,
//
//   hasThumbnail,
//
//   likesCount,
//   commentsCount,
//   viewsCount,
//   sharesCount,
//
//   stats: {
//     likes,
//     comments,
//     views,
//     shares,
//   },
//
//   createdAt,
//   created_at,
//
//   myReaction
// }
//
// IMPORTANT:
// `saved` is intentionally NOT stored on the reel.
// Saved state belongs to the universal saves system.

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function normalizeProfile(raw, fallbackUserId = null) {
  if (!raw) {
    return null;
  }

  // Supabase relationship can be returned as an object
  // or an array depending on the relationship/query.
  const profile = Array.isArray(raw)
    ? raw[0]
    : raw;

  if (!profile) {
    return null;
  }

  return {
    id:
      profile.id ??
      fallbackUserId ??
      null,

    username:
      profile.username ??
      null,

    fullName:
      profile.full_name ??
      profile.fullName ??
      null,

    avatar:
      profile.avatar_url ??
      profile.avatarUrl ??
      null,
  };
}

export default function normalizeReel(raw) {
  if (!raw) {
    return null;
  }

  // ----------------------------------------
  // IDENTITY
  // ----------------------------------------

  const id =
    raw.id ??
    null;

  const userId =
    raw.user_id ??
    raw.userId ??
    null;

  // ----------------------------------------
  // MEDIA
  // ----------------------------------------

  const videoUrl =
    raw.video_url ??
    raw.videoUrl ??
    raw.media?.url ??
    null;

  const thumbnailUrl =
    raw.thumbnail_url ??
    raw.thumbnailUrl ??
    raw.media?.thumbnail ??
    raw.media?.thumbnail_url ??
    raw.media?.poster ??
    raw.media?.poster_url ??
    null;

  const width =
    raw.width ??
    raw.media?.width ??
    null;

  const height =
    raw.height ??
    raw.media?.height ??
    null;

  // ----------------------------------------
  // USER
  // ----------------------------------------

  const user = normalizeProfile(
    raw.profiles ??
      raw.profile ??
      raw.user,
    userId
  );

  // ----------------------------------------
  // CONTENT
  // ----------------------------------------

  const content =
    typeof raw.caption === "string"
      ? raw.caption
      : typeof raw.content === "string"
      ? raw.content
      : "";

  // ----------------------------------------
  // STATS
  // ----------------------------------------

  const likesCount = toFiniteNumber(
    raw.likes_count ??
      raw.likesCount,
    0
  );

  const commentsCount = toFiniteNumber(
    raw.comments_count ??
      raw.commentsCount,
    0
  );

  const viewsCount = toFiniteNumber(
    raw.views_count ??
      raw.viewsCount,
    0
  );

  const sharesCount = toFiniteNumber(
    raw.shares_count ??
      raw.sharesCount,
    0
  );

  // ----------------------------------------
  // TIMESTAMPS
  // ----------------------------------------

  const createdAt =
    raw.created_at ??
    raw.createdAt ??
    null;

  const updatedAt =
    raw.updated_at ??
    raw.updatedAt ??
    null;

  // ----------------------------------------
  // THUMBNAIL
  // ----------------------------------------

  const hasThumbnail =
    Boolean(thumbnailUrl);

  // ----------------------------------------
  // FINAL CANONICAL OBJECT
  // ----------------------------------------

  const normalized = {
    id,

    user_id: userId,

    content,

    type: "video",

    user,

    media: {
      kind: "video",
      type: "video",

      url: videoUrl,

      poster: thumbnailUrl,

      thumbnail: thumbnailUrl,

      width,

      height,
    },

    tags:
      Array.isArray(raw.tags)
        ? raw.tags
        : [],

    duration:
      raw.duration ??
      null,

    hasThumbnail,

    likesCount,

    commentsCount,

    viewsCount,

    sharesCount,

    stats: {
      likes: likesCount,
      comments: commentsCount,
      views: viewsCount,
      shares: sharesCount,
    },

    createdAt,

    updatedAt,

    // Compatibility aliases.
    created_at: createdAt,
    updated_at: updatedAt,

    /*
     * Per-user reaction is NOT stored in the reels row.
     *
     * If your feed later hydrates this value from reel_reactions,
     * it can safely overwrite this property.
     */
    myReaction:
      raw.myReaction ??
      raw.my_reaction ??
      null,
  };

  if (import.meta.env.DEV) {
    console.debug(
      "[normalizeReel]",
      normalized
    );
  }

  return Object.freeze(normalized);
}