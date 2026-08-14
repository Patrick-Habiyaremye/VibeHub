/**
 * Converts a raw profile post into the canonical post shape
 * consumed by ProfileGridItem and other post UI.
 *
 * Canonical shape:
 *
 * {
 *   id,
 *   user_id,
 *   content,
 *   media: {
 *     kind,
 *     path,
 *     url,
 *     poster,
 *     thumbnail
 *   },
 *   style,
 *   reaction_count,
 *   comment_count,
 *   created_at,
 *   updated_at
 * }
 */

export function normalizeProfilePost(raw) {
  if (!raw) return null;

  // ---------------------------------------------
  // MEDIA
  // ---------------------------------------------

  const rawMedia =
    raw.media ??
    raw.media_data ??
    raw.media_json ??
    null;

  let media = null;

  if (rawMedia && typeof rawMedia === "object") {
    const kind =
      rawMedia.kind ??
      rawMedia.type ??
      raw.type ??
      null;

    const url =
      rawMedia.url ??
      rawMedia.publicUrl ??
      rawMedia.public_url ??
      null;

    const path =
      rawMedia.path ??
      rawMedia.storagePath ??
      rawMedia.storage_path ??
      null;

    const poster =
      rawMedia.poster ??
      rawMedia.poster_url ??
      rawMedia.posterUrl ??
      null;

    const thumbnail =
      rawMedia.thumbnail ??
      rawMedia.thumbnail_url ??
      rawMedia.thumbnailUrl ??
      null;

    if (kind) {
      media = {
        kind,
        path,
        url,
        poster,
        thumbnail,
      };
    }
  }

  // ---------------------------------------------
  // FALLBACK FOR LEGACY / RAW POSTS
  // ---------------------------------------------

  if (!media) {
    const kind =
      raw.media_kind ??
      raw.media_type ??
      raw.type ??
      null;

    const url =
      raw.media_url ??
      raw.image_url ??
      raw.video_url ??
      null;

    if (kind) {
      media = {
        kind,
        path: raw.media_path ?? null,
        url,
        poster:
          raw.poster_url ??
          raw.video_poster ??
          null,
        thumbnail:
          raw.thumbnail_url ??
          raw.video_thumbnail ??
          null,
      };
    }
  }

  // ---------------------------------------------
  // NORMALIZED POST
  // ---------------------------------------------

  return {
    id: raw.id ?? null,

    user_id:
      raw.user_id ??
      raw.userId ??
      null,

    content:
      typeof raw.content === "string"
        ? raw.content
        : "",

    media,

    style:
      raw.style ??
      raw.post_style ??
      null,

    reaction_count:
      Number.isFinite(Number(raw.reaction_count))
        ? Number(raw.reaction_count)
        : 0,

    comment_count:
      Number.isFinite(Number(raw.comment_count))
        ? Number(raw.comment_count)
        : 0,

    created_at:
      raw.created_at ??
      raw.createdAt ??
      null,

    updated_at:
      raw.updated_at ??
      raw.updatedAt ??
      null,

    deleted:
      Boolean(raw.deleted),
  };
}