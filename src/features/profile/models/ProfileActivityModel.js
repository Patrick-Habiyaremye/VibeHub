export function createProfileActivityItemModel(raw = {}) {
  return {
    id: raw.id,
    type: raw.type ?? "default",
    createdAt: raw.created_at ?? raw.createdAt ?? null,
    actor: raw.actor ?? null,
    meta: raw.meta ?? {},
  };
}