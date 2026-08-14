// Extracted from the original component: crop -> downsample -> re-encode as
// JPEG, then upload. Kept UI-free so it can be unit tested and reused
// (e.g. from a settings page) without a crop modal attached.
import { ProfileRepository } from "../repository/ProfileRepository";
import {
  AVATAR_MAX_DIMENSION,
  COVER_MAX_WIDTH,
  OUTPUT_QUALITY,
} from "../constants/profile.constants";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = src;
  });
}

/**
 * Crops `imageSrc` to `croppedAreaPixels`, downsamples it to fit the
 * target's max dimension, and re-encodes as JPEG so uploads stay small
 * and fast regardless of the source image size.
 */
export async function cropAndCompressImage({ imageSrc, croppedAreaPixels, target }) {
  const image = await loadImage(imageSrc);
  const { width: cropWidth, height: cropHeight, x, y } = croppedAreaPixels;

  const maxDimension = target === "cover" ? COVER_MAX_WIDTH : AVATAR_MAX_DIMENSION;
  const boundBy = target === "cover" ? cropWidth : Math.max(cropWidth, cropHeight);
  const scale = Math.min(1, maxDimension / boundBy);

  const outputWidth = Math.round(cropWidth * scale);
  const outputHeight = Math.round(cropHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, x, y, cropWidth, cropHeight, 0, 0, outputWidth, outputHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to process image"))),
      "image/jpeg",
      OUTPUT_QUALITY
    );
  });
}

export const ProfileMutationService = {
  cropAndCompressImage,
  updateAvatar: (userId, blob, onProgress) =>
    ProfileRepository.mutations.updateAvatar(userId, blob, onProgress),
  updateCover: (userId, blob, onProgress) =>
    ProfileRepository.mutations.updateCover(userId, blob, onProgress),
  deleteAvatar: (userId, currentUrl) =>
    ProfileRepository.mutations.deleteAvatar(userId, currentUrl),
  deleteCover: (userId, currentUrl) =>
    ProfileRepository.mutations.deleteCover(userId, currentUrl),
};