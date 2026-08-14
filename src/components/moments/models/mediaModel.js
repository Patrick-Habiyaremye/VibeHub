// models/mediaModel.js

export function createMedia({
  url,
  type,
  width = null,
  height = null,
  duration = null,
}) {
  return {
    id: crypto.randomUUID(),
    url,
    type, // "image" | "video"
    width,
    height,
    duration,
    created_at: new Date().toISOString(),
  };
}