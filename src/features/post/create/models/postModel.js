// features/create/models/postModel.js
//
// Single source of truth for what a "post" looks like and what makes it
// valid. Import `isValidPost` in BOTH the composer (client-side UX guard)
// and the save layer / backend (final authority) so the rule can never
// drift between the two — that drift is what caused "Post cannot be
// empty" to fire on media-only posts.

export const POST_TYPES = Object.freeze({
  IMAGE: "image",
  VIDEO: "video",
  QUOTE: "quote",
});

export function createEmptyPost() {
  return {
    id: null,
    type: null,

    text: "",
    media: {
      url: null,
      type: null, // "image" | "video"
    },

    quoteStyle: {
      background: null,
      emoji: null,
    },

    createdAt: null,
    authorId: null,
  };
}

/**
 * A post is valid if it has text OR media. Never require both.
 * `draft.media` may be either an uploaded { url, type } or a pending
 * { file, type } — either shape counts as "has media".
 */
export function isValidPost(draft) {
  const hasText = Boolean(draft?.text && draft.text.trim().length > 0);
  const hasMedia = Boolean(draft?.media?.file || draft?.media?.url);
  return hasText || hasMedia;
}

/**
 * Determines the post type from a draft. Media always wins over text —
 * a photo with a caption is an image post, not a quote post. Only when
 * there is no media at all does text become a quote post.
 */
export function resolvePostType(draft) {
  if (draft?.media?.type === "image") return POST_TYPES.IMAGE;
  if (draft?.media?.type === "video") return POST_TYPES.VIDEO;
  if (draft?.text && draft.text.trim().length > 0) return POST_TYPES.QUOTE;
  return null;
}

/**
 * Enforces strict separation between quote styling and media posts.
 * Call this whenever media is attached/removed so quoteStyle can never
 * leak onto an image/video post (requirement #2B in the fix spec).
 */
export function stripQuoteStyleIfMedia(draft) {
  if (draft.media?.file || draft.media?.url) {
    return { ...draft, quoteStyle: { background: null, emoji: null } };
  }
  return draft;
}