// models/composerModel.js
//
// The single source of truth for what a "Vibe" is made of.
// Everything else (engines, hooks, UI) reads and writes this shape.
// Adding a new block type = add a factory + a case in StyleEngine/PreviewEngine.
// You never touch CreatePost, ComposerSession, or the persistence layer.

let idCounter = 0;
const uid = (prefix) => `${prefix}_${Date.now().toString(36)}_${(idCounter++).toString(36)}`;

export const BLOCK_TYPES = Object.freeze({
  TEXT: "text",
  IMAGE: "image",
  VIDEO: "video",
  QUOTE: "quote",
  POLL: "poll",
  LOCATION: "location",
});

export const AUDIENCES = Object.freeze({
  PUBLIC: "public",
  SUPPORTERS: "supporters",
  PRIVATE: "private",
});

// ---- Block factories -------------------------------------------------

export function createTextBlock({ value = "" } = {}) {
  return { id: uid("text"), type: BLOCK_TYPES.TEXT, value };
}

export function createMediaBlock({ file, mediaType = "image", caption = "" } = {}) {
  return {
    id: uid("media"),
    type: mediaType === "video" ? BLOCK_TYPES.VIDEO : BLOCK_TYPES.IMAGE,
    file,
    previewUrl: file ? URL.createObjectURL(file) : null,
    caption,
  };
}

export function createQuoteBlock({ value = "", background = "sunset" } = {}) {
  return {
    id: uid("quote"),
    type: BLOCK_TYPES.QUOTE,
    value,
    style: { background },
  };
}

export function createPollBlock({ question = "", options = ["", ""] } = {}) {
  return {
    id: uid("poll"),
    type: BLOCK_TYPES.POLL,
    question,
    options: options.map((label) => ({ id: uid("opt"), label })),
  };
}

export function createLocationBlock({ name = "", lat = null, lng = null } = {}) {
  return { id: uid("loc"), type: BLOCK_TYPES.LOCATION, name, lat, lng };
}

export const BLOCK_FACTORIES = {
  [BLOCK_TYPES.TEXT]: createTextBlock,
  [BLOCK_TYPES.IMAGE]: createMediaBlock,
  [BLOCK_TYPES.VIDEO]: (opts) => createMediaBlock({ ...opts, mediaType: "video" }),
  [BLOCK_TYPES.QUOTE]: createQuoteBlock,
  [BLOCK_TYPES.POLL]: createPollBlock,
  [BLOCK_TYPES.LOCATION]: createLocationBlock,
};

export function createBlock(type, opts) {
  const factory = BLOCK_FACTORIES[type];
  if (!factory) throw new Error(`Unknown block type: ${type}`);
  return factory(opts);
}

// ---- Draft factory ----------------------------------------------------

export function createDraft({ authorId, blocks = [], audience = AUDIENCES.PUBLIC } = {}) {
  const now = Date.now();
  return {
    id: uid("draft"),
    authorId,
    blocks,
    audience,
    theme: { mood: null },
    createdAt: now,
    updatedAt: now,
  };
}

// ---- Validation ---------------------------------------------------------
// Kept dumb on purpose: PublishEngine owns *when* to call this and what
// to do with the result (toast, disable button, etc).

export function validateDraft(draft) {
  const errors = [];
  if (!draft || !draft.blocks || draft.blocks.length === 0) {
    errors.push("A vibe needs at least one block.");
    return { valid: false, errors };
  }
  const hasContent = draft.blocks.some((b) => {
    if (b.type === BLOCK_TYPES.TEXT || b.type === BLOCK_TYPES.QUOTE) return b.value?.trim().length > 0;
    if (b.type === BLOCK_TYPES.IMAGE || b.type === BLOCK_TYPES.VIDEO) return !!b.file || !!b.previewUrl;
    if (b.type === BLOCK_TYPES.POLL) return b.question?.trim().length > 0 && b.options.filter((o) => o.label.trim()).length >= 2;
    return true;
  });
  if (!hasContent) errors.push("Add some text, media, or a poll before publishing.");
  return { valid: errors.length === 0, errors };
}