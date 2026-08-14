// features/create/constants.js

// Resumable uploads (TUS) make large video uploads reliable, so the video
// cap can be realistic instead of an arbitrary small number.
export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_VIDEO_SIZE_MB = 500;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export const DRAFT_KEY = "create_post_draft";

