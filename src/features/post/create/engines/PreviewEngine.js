// engines/PreviewEngine.js
//
// Projects a draft into the exact shape the <PreviewPane> renders, and that
// PublishEngine sends as a "rendered" snapshot alongside raw blocks. Having
// one projection function means preview and published post can never
// visually drift apart.

import { resolveMoodTheme, resolveQuoteBackground } from "./StyleEngine";

export function projectDraft(draft) {
  const theme = resolveMoodTheme(draft.theme?.mood);
  return {
    theme,
    audience: draft.audience,
    items: draft.blocks.map((block) => projectBlock(block, theme)),
  };
}

function projectBlock(block, theme) {
  switch (block.type) {
    case "text":
      return { kind: "text", id: block.id, text: block.value };
    case "image":
    case "video":
      return {
        kind: block.type,
        id: block.id,
        src: block.previewUrl,
        caption: block.caption,
      };
    case "quote":
      return {
        kind: "quote",
        id: block.id,
        text: block.value,
        background: resolveQuoteBackground(block.style?.background),
      };
    case "poll":
      return {
        kind: "poll",
        id: block.id,
        question: block.question,
        options: block.options,
      };
    case "location":
      return { kind: "location", id: block.id, name: block.name };
    default:
      return { kind: "unknown", id: block.id };
  }
}

// Word/media summary used in small UI chrome (e.g. "3 blocks · 2 photos").
export function summarizeDraft(draft) {
  const counts = draft.blocks.reduce((acc, b) => {
    acc[b.type] = (acc[b.type] || 0) + 1;
    return acc;
  }, {});
  return { total: draft.blocks.length, counts };
}