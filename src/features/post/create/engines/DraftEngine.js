// engines/DraftEngine.js
//
// Pure, synchronous reducer-style functions over a draft. No React, no I/O.
// useComposerSession calls these; useDraftPersistence decides when to save
// the result. Keeping this pure means it's trivially unit-testable and
// reusable from a future mobile/RN composer.

import { createBlock } from "../models/composerModel";

export function addBlock(draft, type, opts) {
  const block = createBlock(type, opts);
  return touch({ ...draft, blocks: [...draft.blocks, block] });
}

export function removeBlock(draft, blockId) {
  return touch({ ...draft, blocks: draft.blocks.filter((b) => b.id !== blockId) });
}

export function updateBlock(draft, blockId, patch) {
  return touch({
    ...draft,
    blocks: draft.blocks.map((b) => (b.id === blockId ? { ...b, ...patch } : b)),
  });
}

export function reorderBlocks(draft, fromIndex, toIndex) {
  const blocks = [...draft.blocks];
  const [moved] = blocks.splice(fromIndex, 1);
  blocks.splice(toIndex, 0, moved);
  return touch({ ...draft, blocks });
}

export function setAudience(draft, audience) {
  return touch({ ...draft, audience });
}

export function setMood(draft, mood) {
  return touch({ ...draft, theme: { ...draft.theme, mood } });
}

export function isEmpty(draft) {
  return !draft || draft.blocks.length === 0;
}

function touch(draft) {
  return { ...draft, updatedAt: Date.now() };
}