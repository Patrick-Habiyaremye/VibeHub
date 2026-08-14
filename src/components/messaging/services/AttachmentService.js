// src/features/messaging/services/AttachmentService.js

import { supabase } from "../../../supabaseClient";

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

const MAX_VIDEO_SIZE =
  50 * 1024 * 1024;

const MAX_AUDIO_SIZE =
  20 * 1024 * 1024;

const BUCKET = "message-media";

function validateFile(file) {
  if (!file) {
    throw new Error(
      "No file selected."
    );
  }

  if (
    file.type.startsWith("image/") &&
    file.size > MAX_IMAGE_SIZE
  ) {
    throw new Error(
      "Images must be smaller than 10MB."
    );
  }

  if (
    file.type.startsWith("video/") &&
    file.size > MAX_VIDEO_SIZE
  ) {
    throw new Error(
      "Videos must be smaller than 50MB."
    );
  }

  if (
    file.type.startsWith("audio/") &&
    file.size > MAX_AUDIO_SIZE
  ) {
    throw new Error(
      "Audio files must be smaller than 20MB."
    );
  }

  const supported =
    file.type.startsWith("image/") ||
    file.type.startsWith("video/") ||
    file.type.startsWith("audio/");

  if (!supported) {
    throw new Error(
      "This file type is not supported."
    );
  }
}

function getMediaType(file) {
  if (file.type.startsWith("image/"))
    return "image";

  if (file.type.startsWith("video/"))
    return "video";

  if (file.type.startsWith("audio/"))
    return "audio";

  return "file";
}

function sanitizeFilename(name) {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 100);
}

export const AttachmentService = {
  async upload({
    file,
    userId,
  }) {
    validateFile(file);

    if (!userId) {
      throw new Error(
        "Authentication required."
      );
    }

    const mediaType =
      getMediaType(file);

    const extension =
      file.name.split(".").pop() ||
      "bin";

    const path = [
      userId,
      new Date()
        .toISOString()
        .slice(0, 10),
      `${crypto.randomUUID()}-${sanitizeFilename(
        file.name
      )}`,
    ].join("/");

    const { error } =
      await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

    if (error) {
      throw error;
    }

    const {
      data: publicData,
    } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    return {
      path,
      url: publicData.publicUrl,
      mediaType,
      mimeType: file.type,
      size: file.size,
      filename: file.name,
      extension,
    };
  },

  async remove(path) {
    if (!path) return;

    const { error } =
      await supabase.storage
        .from(BUCKET)
        .remove([path]);

    if (error) throw error;
  },

  validateFile,

  getMediaType,
};

export default AttachmentService;