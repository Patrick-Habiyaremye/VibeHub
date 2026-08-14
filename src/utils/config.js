// utils/config.js
//
// Single place to tune upload-system behavior. Everything here was
// previously a magic number buried inside individual files — pulling it
// out means you can adjust "how aggressive is compression" or "how many
// uploads run at once" without hunting through five files.

export const COMPRESSION = {
  // Below this, skip re-encoding entirely — WASM transcoding a small clip
  // is often slower than just uploading the original bytes.
  SKIP_UNDER_BYTES: 15 * 1024 * 1024,
  // Above this, use a faster/cheaper preset so encode time doesn't dominate.
  LARGE_FILE_BYTES: 80 * 1024 * 1024,
  CRF: 28,
};

export const CHUNKING = {
  MIN_BYTES: 1 * 1024 * 1024,
  MID_BYTES: 2 * 1024 * 1024,
  MAX_BYTES: 6 * 1024 * 1024,
};

export const CONCURRENCY = {
  SLOW_CONNECTION_MAX: 1, // 2g/slow-2g
  MEDIUM_CONNECTION_MAX: 2, // 3g
  DEFAULT_CAP: 3, // 4g / unknown, still bounded by CPU cores
};

export const RETRY_DELAYS_MS = [0, 1000, 3000, 5000, 10000];

export const LEADER_ELECTION_RETRY_MS = 2000;

export const VALIDATION = {
  ALLOWED_TYPES: ["video/mp4", "video/quicktime", "video/webm", "video/x-m4v"],
  MIN_BYTES: 1024, // guards against empty/zero-byte or corrupt uploads
  MAX_BYTES: 500 * 1024 * 1024,
  MAX_DURATION_SECONDS: 15 * 60,
};

export const THUMBNAIL = {
  CAPTURE_AT_SECONDS: 0.5,
  JPEG_QUALITY: 0.8,
};

export const RETRY_POLICY = {
  // After this many manual retries, stop offering retry and tell the user
  // to re-upload from scratch instead of hammering a transfer that keeps
  // failing for the same reason.
  MAX_RETRIES: 3,
};

export const QUEUE_UX = {
  // How long a "done" item stays visible in the live queue (so the UI can
  // show a checkmark) before being dropped from the Zustand store. The
  // finished reel itself lives on in the server-fetched feed by this point.
  DONE_LINGER_MS: 1500,
};