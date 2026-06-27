// api/storage.js

import { supabase } from "../supabaseClient";

export async function uploadAvatar(
  userId,
  file
) {
  const fileExt =
    file.name.split(".").pop();

  const filePath =
    `${userId}/${Date.now()}.${fileExt}`;

  const { error } =
    await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        upsert: true,
      });

  if (error) throw error;

  const { data } =
    supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

  return data.publicUrl;
}


// Upload image or video for posts

export async function uploadPostMedia(
  userId,
  file,
  type
) {

  const fileExt =
    file.name.split(".").pop();

  const fileName =
    `${Date.now()}.${fileExt}`;

  const folder =
    type === "video"
      ? "videos"
      : "images";

  const filePath =
    `${folder}/${userId}/${fileName}`;

  const { error } =
    await supabase.storage
      .from("posts-media")
      .upload(
        filePath,
        file,
        {
          upsert: true,
        }
      );

  if (error)
    throw error;

  const { data } =
    supabase.storage
      .from("posts-media")
      .getPublicUrl(filePath);

  return data.publicUrl;
}