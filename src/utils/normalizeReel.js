// utils/normalizeReel.js
export default function normalizeReel(raw) {
  if (!raw) return null;

  const normalized = {
    id: raw.id,

    content: raw.caption ?? "",

    created_at: raw.created_at,

    profiles: raw.profiles ?? null,

    media: {
      type: "video",

      url: raw.video_url ?? null,

      poster: raw.thumbnail_url ?? null,
    },
  };

  console.log("✅ NORMALIZED REEL:", normalized);

  return Object.freeze(normalized);
}
