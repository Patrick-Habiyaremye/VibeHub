// src/features/messaging/api/attachments.api.js

import { supabase } from "../../../supabaseClient";

const BUCKET = "chat-media";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_AUDIO_SIZE = 20 * 1024 * 1024;

function validateFile(file) {
  if (!file) {
    throw new Error("No file selected");
  }

  if (file.type.startsWith("image/")) {
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error(
        "Images must be smaller than 10 MB"
      );
    }

    return;
  }

  if (file.type.startsWith("video/")) {
    if (file.size > MAX_VIDEO_SIZE) {
      throw new Error(
        "Videos must be smaller than 100 MB"
      );
    }

    return;
  }

  if (file.type.startsWith("audio/")) {
    if (file.size > MAX_AUDIO_SIZE) {
      throw new Error(
        "Audio must be smaller than 20 MB"
      );
    }

    return;
  }

  throw new Error(
    "Unsupported attachment type"
  );
}

function getExtension(file) {
  const extension =
    file.name?.split(".").pop()?.toLowerCase();

  return extension || "bin";
}

export async function uploadAttachment({
  file,
  userId,
  conversationId,
}) {
  validateFile(file);

  if (!userId) {
    throw new Error("userId is required");
  }

  const extension = getExtension(file);

  const filePath =
    `${userId}/${conversationId || "direct"}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath,
    type: file.type,
    size: file.size,
    name: file.name,
  };
}

export async function deleteAttachment(path) {
  if (!path) return;

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([path]);

  if (error) {
    throw error;
  }
}