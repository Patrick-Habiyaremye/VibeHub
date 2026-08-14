// src/features/comments/utils/mergeComments.js

export function mergeCommentPage(existing, incoming) {
  const seen = new Set(existing.map((c) => c.id));
  const merged = [...existing];
  for (const item of incoming) {
    if (!seen.has(item.id)) {
      merged.push(item);
      seen.add(item.id);
    }
  }
  return merged;
}

export function upsertComment(list, comment, { prepend = false } = {}) {
  const idx = list.findIndex((c) => c.id === comment.id);
  if (idx === -1) {
    return prepend ? [comment, ...list] : [...list, comment];
  }
  const copy = [...list];
  copy[idx] = { ...copy[idx], ...comment };
  return copy;
}

export function removeComment(list, id) {
  return list.filter((c) => c.id !== id);
}

export function reconcileOptimistic(list, tempId, realComment) {
  return list.map((c) => (c.id === tempId ? realComment : c));
}

export function adjustCommentField(list, id, field, delta) {
  return list.map((c) => (c.id === id ? { ...c, [field]: Math.max((c[field] ?? 0) + delta, 0) } : c));
}