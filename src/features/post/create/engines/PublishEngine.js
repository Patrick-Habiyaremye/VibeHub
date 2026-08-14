// engines/PublishEngine.js
//
// This is the old "ComposerEngine" — renamed and narrowed. It used to also
// hold draft-mutation logic and style lookups; those moved out to
// DraftEngine and StyleEngine. PublishEngine's only job now is: is this
// draft postable, and if so, turn it into a request and send it.

import { validateDraft } from "../models/composerModel";

export class PublishError extends Error {
  constructor(message, fieldErrors = []) {
    super(message);
    this.name = "PublishError";
    this.fieldErrors = fieldErrors;
  }
}

// ---------------------------------------------------------------------
// COMPATIBILITY LAYER
//
// The block model (blocks[]) is richer than what the backend currently
// stores. postsApi.createPost / the `posts` table support exactly one
// `content` string, one `media` file, one `type`, and one `style.background`
// — there's no blocks column. Until that schema changes, every draft gets
// flattened down to that shape here. This is the ONE place that needs to
// change when the backend grows real multi-block support (e.g. a `blocks`
// jsonb column) — nothing in DraftEngine, BlockEditor, or the hook needs to
// know about this limitation.
// ---------------------------------------------------------------------

function toLegacyPostPayload(draft) {
  const textLike = draft.blocks.filter((b) => b.type === "text" || b.type === "quote");
  const mediaBlocks = draft.blocks.filter((b) => b.type === "image" || b.type === "video");
  const quoteBlocks = draft.blocks.filter((b) => b.type === "quote");

  if (mediaBlocks.length > 1 || quoteBlocks.length > 1) {
    // Not a hard failure — just tell the developer, since the extra
    // blocks will silently be dropped by the current backend schema.
    console.warn(
      "[PublishEngine] This vibe has more media/quote blocks than the current " +
        "posts schema supports. Only the first of each will be published."
    );
  }

  const primaryMedia = mediaBlocks[0];
  const primaryQuote = quoteBlocks[0];

  // A media block's `caption` isn't a text/quote block, so it was being
  // silently dropped before. There's only one `content` column, so fold the
  // caption in alongside any text/quote block values.
  const content = [...textLike.map((b) => b.value || ""), primaryMedia?.caption || ""]
    .filter((s) => s.trim().length > 0)
    .join("\n\n")
    .trim();

  let type = "quote";
  if (primaryMedia?.type === "video") type = "video";
  else if (primaryMedia?.type === "image") type = "image";

  return {
    content,
    file: primaryMedia?.file ?? null,
    type,
    style: {
      // Only ever set for actual quote posts — never let a media post
      // end up with a background value, so the feed can gate purely on
      // `type` instead of having to trust this field is empty.
      background: type === "quote" ? primaryQuote?.style?.background || null : null,
    },
  };
}

export async function publishDraft(draft, { api } = {}) {
  const { valid, errors } = validateDraft(draft);
  if (!valid) throw new PublishError(errors[0] || "This vibe isn't ready to publish.", errors);

  const payload = toLegacyPostPayload(draft);
  const post = api?.createPost ?? defaultCreatePost;

  try {
    return await post(payload);
  } catch (err) {
    throw new PublishError(err.message || "Publish failed. Your draft is safe — try again.");
  }
}

async function defaultCreatePost(payload) {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Server responded ${res.status}`);
  return res.json();
}