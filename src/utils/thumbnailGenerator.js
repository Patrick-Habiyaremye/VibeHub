// utils/thumbnailGenerator.js
//
// Reels need a preview image before/while the video itself is uploading.
// This uses the browser's native <video>/<canvas>, not ffmpeg — grabbing
// one frame doesn't need a WASM transcoder and is near-instant.

import { THUMBNAIL } from "./config";

/**
 * @param {File|Blob} file
 * @param {Object} [opts]
 * @param {number} [opts.atSeconds] - where in the clip to capture the frame
 * @returns {Promise<Blob>} JPEG thumbnail blob
 */
export async function generateThumbnail(file, opts = {}) {
  const atSeconds = opts.atSeconds ?? THUMBNAIL.CAPTURE_AT_SECONDS;
  const url = URL.createObjectURL(file);

  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;

    await waitFor(video, "loadedmetadata", "Could not read video metadata");

    video.currentTime = Math.min(atSeconds, Math.max(0, video.duration - 0.1));
    await waitFor(video, "seeked", "Could not seek video");

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Thumbnail encode failed"))),
        "image/jpeg",
        THUMBNAIL.JPEG_QUALITY
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function waitFor(video, event, errorMessage) {
  return new Promise((resolve, reject) => {
    video.addEventListener(event, resolve, { once: true });
    video.addEventListener("error", () => reject(new Error(errorMessage)), { once: true });
  });
}