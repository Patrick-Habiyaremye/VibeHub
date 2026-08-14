// utils/validateFile.js
//
// Nothing in the previous pipeline stopped a corrupt file, a 2GB file, or
// a .txt renamed to .mp4 from entering the queue — it would just fail
// (expensively) partway through compression or upload. Validate up front
// instead, so bad input is rejected in milliseconds, not minutes.
//
// FIX: now also captures the video's real width/height alongside
// duration. Without this, ReelPlayer had no way to know a video's actual
// aspect ratio, so it always rendered a blurred backdrop behind every
// video "just in case" — even for the common case of a 9:16 video that
// exactly matches the player's own aspect ratio and never needs one.

import { VALIDATION } from "./config";

/**
 * @param {File} file
 * @returns {Promise<{valid: boolean, error?: string, duration?: number, width?: number, height?: number}>}
 */
export async function validateVideoFile(file) {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (!VALIDATION.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type${file.type ? `: ${file.type}` : ""}. Please upload MP4, MOV, or WebM.`,
    };
  }

  if (file.size < VALIDATION.MIN_BYTES) {
    return { valid: false, error: "File is empty or corrupted." };
  }

  if (file.size > VALIDATION.MAX_BYTES) {
    const maxMB = Math.round(VALIDATION.MAX_BYTES / (1024 * 1024));
    return { valid: false, error: `File is too large (max ${maxMB}MB).` };
  }

  let meta;
  try {
    meta = await readVideoMetadata(file);
  } catch {
    return { valid: false, error: "Could not read this video — it may be corrupted." };
  }

  if (meta.duration > VALIDATION.MAX_DURATION_SECONDS) {
    const maxMin = Math.round(VALIDATION.MAX_DURATION_SECONDS / 60);
    return { valid: false, error: `Video is too long (max ${maxMin} minutes).` };
  }

  return {
    valid: true,
    duration: meta.duration,
    width: meta.width,
    height: meta.height,
  };
}

// Renamed from readDuration — now reads width/height off the same
// <video> element in the same loadedmetadata event, instead of opening a
// second video element just to get dimensions.
function readVideoMetadata(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";

    const cleanup = () => URL.revokeObjectURL(url);

    video.onloadedmetadata = () => {
      const { duration, videoWidth, videoHeight } = video;
      cleanup();
      resolve({ duration, width: videoWidth, height: videoHeight });
    };
    video.onerror = () => {
      cleanup();
      reject(new Error("Invalid video file"));
    };

    video.src = url;
  });
}