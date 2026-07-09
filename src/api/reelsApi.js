import { supabase } from "../supabaseClient";
import  normalizeReel from "../utils/normalizePost";

/* ----------------------------------------
   AUTH USER
----------------------------------------- */
async function getAuthUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("User not authenticated");
  }

  return user;
}

/* ----------------------------------------
   VALIDATION
----------------------------------------- */
function validateVideo(file) {
  const MAX_SIZE = 50 * 1024 * 1024;

  if (file.size > MAX_SIZE) {
    throw new Error("Video too large (max 50MB)");
  }

  if (!file.type.startsWith("video/")) {
    throw new Error("Invalid video type");
  }
}

/* ----------------------------------------
   GET REELS
----------------------------------------- */
export async function getReels(limit = 10, cursor = null) {
  let query = supabase
    .from("reels")
    .select(`
      id,
      user_id,
      video_url,
      thumbnail_url,
      caption,
      tags,
      duration,
      views_count,
      likes_count,
      comments_count,
      shares_count,
      created_at,
      profiles (
        id,
        username,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return data.map(normalizeReel); // ✅ FIX
}

/* ----------------------------------------
   GET SINGLE REEL
----------------------------------------- */
export async function getReel(id) {
  const { data, error } = await supabase
    .from("reels")
    .select(`
      *,
      profiles (
        id,
        username,
        avatar_url,
        bio
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  return normalizeReel(data); // ✅ FIX
}

/* ----------------------------------------
   UPLOAD REEL
----------------------------------------- */
export async function uploadReel({
  video,
  caption = "",
  tags = [],
}) {
  if (!video) throw new Error("No video selected.");

  const user = await getAuthUser();
  validateVideo(video);

  const ext = video.name.split(".").pop();
  const filename = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("reels")
    .upload(filename, video);

  if (uploadError) throw new Error(uploadError.message);

  const { data: publicData } = supabase.storage
    .from("reels")
    .getPublicUrl(filename);

  const { data, error } = await supabase
    .from("reels")
    .insert({
      user_id: user.id,
      video_url: publicData.publicUrl,
      thumbnail_url: null,
      caption,
      tags,
      duration: null,
    })
    .select(`
      *,
      profiles (
        id,
        username,
        avatar_url
      )
    `)
    .single();

  if (error) throw new Error(error.message);

  return normalizeReel(data); // ✅ FIX
}

/* ----------------------------------------
   UPDATE REEL
----------------------------------------- */
export async function updateReel(
  reelId,
  { caption, tags, newVideo = null }
) {
  const user = await getAuthUser();

  let updates = {};

  if (caption !== undefined) updates.caption = caption;
  if (tags !== undefined) updates.tags = tags;

  if (newVideo) {
    validateVideo(newVideo);

    const ext = newVideo.name.split(".").pop();
    const filename = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("reels")
      .upload(filename, newVideo);

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicData } = supabase.storage
      .from("reels")
      .getPublicUrl(filename);

    updates.video_url = publicData.publicUrl;
  }

  const { data, error } = await supabase
    .from("reels")
    .update(updates)
    .eq("id", reelId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return normalizeReel(data); // ✅ FIX
}

/* ----------------------------------------
   DELETE REEL
----------------------------------------- */
export async function deleteReel(reelId) {
  const user = await getAuthUser();

  const { error } = await supabase
    .from("reels")
    .delete()
    .eq("id", reelId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  return true;
}