// src/utils/normalizePost.js
//
// CANONICAL POST NORMALIZER
//
// Every post entering the frontend should pass through this function.
//
// Canonical shape:
//
// {
//   id,
//   user_id,
//   content,
//   type: "quote" | "image" | "video" | null,
//
//   media: {
//     kind,
//     type,
//     url,
//     path,
//     poster,
//     thumbnail,
//   },
//
//   style: {
//     background,
//   },
//
//   user: {
//     id,
//     username,
//     fullName,
//     avatar,
//   },
//
//   createdAt,
//   updatedAt,
//   created_at,
//   updated_at,
//
//   reaction_count,
//   comment_count,
//
//   stats: {
//     likes,
//     comments,
//   },
//
//   commentsPreview,
//   deleted,
// }

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function buildPublicStorageUrl(path) {
  if (!path || typeof path !== "string") {
    return null;
  }

  // Already a complete URL.
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const baseUrl = import.meta.env.VITE_SUPABASE_URL;

  if (!baseUrl) {
    if (import.meta.env.DEV) {
      console.warn(
        "[normalizePost] VITE_SUPABASE_URL is missing"
      );
    }

    return null;
  }

  return `${baseUrl}/storage/v1/object/public/posts/${path}`;
}

function normalizeProfile(raw, fallbackUserId = null) {
  if (!raw) {
    return null;
  }

  // Supabase relationships can occasionally arrive as an array
  // depending on the relationship/query shape.
  const profile = Array.isArray(raw) ? raw[0] : raw;

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

function normalizeMedia(raw, content) {
  const rawMedia = raw?.media;

  let kind =
    rawMedia?.kind ??
    rawMedia?.type ??
    raw?.media_kind ??
    raw?.media_type ??
    raw?.type ??
    null;

  /*
   * Quote fallback.
   *
   * Important:
   * Do not assume every text post is a quote if the database explicitly
   * says it has another type.
   */
  if (!kind && typeof content === "string" && content.trim()) {
    kind = "quote";
  }

  if (
    kind !== "quote" &&
    kind !== "image" &&
    kind !== "video"
  ) {
    return null;
  }

  // ----------------------------------------
  // QUOTE
  // ----------------------------------------

  if (kind === "quote") {
    return {
      kind: "quote",
      type: "quote",
      url: null,
      path: null,
      poster: null,
      thumbnail: null,
    };
  }

  // ----------------------------------------
  // IMAGE / VIDEO
  // ----------------------------------------

  const path =
    rawMedia?.path ??
    rawMedia?.storagePath ??
    rawMedia?.storage_path ??
    null;

  const url =
    rawMedia?.url ??
    rawMedia?.publicUrl ??
    rawMedia?.public_url ??
    buildPublicStorageUrl(path);

  const poster =
    rawMedia?.poster ??
    rawMedia?.poster_url ??
    rawMedia?.posterUrl ??
    null;

  const thumbnail =
    rawMedia?.thumbnail ??
    rawMedia?.thumbnail_url ??
    rawMedia?.thumbnailUrl ??
    null;

  return {
    kind,
    type: kind,
    url,
    path,
    poster,
    thumbnail,
  };
}

export default function normalizePost(raw) {
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
  // CONTENT
  // ----------------------------------------

  const content =
    typeof raw.content === "string"
      ? raw.content
      : "";

  // ----------------------------------------
  // MEDIA
  // ----------------------------------------

  const media = normalizeMedia(
    raw,
    content
  );

  // ----------------------------------------
  // TYPE
  // ----------------------------------------

  const type =
    media?.kind ??
    raw.type ??
    null;

  // ----------------------------------------
  // USER
  // ----------------------------------------

  const user =
    normalizeProfile(
      raw.profiles ??
        raw.profile ??
        raw.user,
      userId
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
  // STATS
  // ----------------------------------------

  const reactionCount = toFiniteNumber(
    raw.reaction_count ??
      raw.reactions_count ??
      raw.likes_count ??
      raw.stats?.likes,
    0
  );

  const commentCount = toFiniteNumber(
    raw.comment_count ??
      raw.comments_count ??
      raw.stats?.comments,
    0
  );

  // ----------------------------------------
  // STYLE
  // ----------------------------------------

  const style = {
    background:
      raw.style?.background ??
      raw.post_style?.background ??
      null,
  };

  // ----------------------------------------
  // FINAL CANONICAL OBJECT
  // ----------------------------------------

  const normalized = {
    id,

    user_id: userId,

    content,

    type,

    media,

    style,

    user,

    createdAt,

    updatedAt,

    // Compatibility aliases.
    // Keep these temporarily because existing components
    // still use snake_case timestamps.
    created_at: createdAt,
    updated_at: updatedAt,

    reaction_count: reactionCount,

    comment_count: commentCount,

    stats: {
      likes: reactionCount,
      comments: commentCount,
    },

    commentsPreview:
      Array.isArray(raw.comments_preview)
        ? raw.comments_preview
        : Array.isArray(raw.commentsPreview)
        ? raw.commentsPreview
        : [],

    deleted:
      Boolean(raw.deleted),
  };

  if (import.meta.env.DEV) {
    console.debug(
      "[normalizePost]",
      normalized
    );
  }

  return normalized;
}