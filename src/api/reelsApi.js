import { supabase } from "../supabaseClient";
import normalizeReel from "../utils/normalizeReel"; // was incorrectly importing normalizePost

/* ----------------------------------------
   SAFE AUTH (NON-BREAKING)
----------------------------------------- */
export async function getOptionalUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user || null;
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
// FIX: the select list was missing width/height, even though the reels
// table has both columns (uploadWorker.js's insert proves this) and
// getReel(id) already gets them via select("*"). Feed-loaded reels were
// silently losing aspect-ratio data that freshly-uploaded reels had.
// Also added tags, needed for normalizeReel's tags passthrough.

// api/reelsApi.js — getReels() only, rest unchanged
export async function getReels({ userId = null, limit = 10, cursor = null }) {
  let query = supabase
    .from("reels")
    .select(
      `
      id,
      user_id,
      video_url,
      thumbnail_url,
      caption,
      created_at,
      width,
      height,
      tags,
      duration,
      likes_count,
      comments_count,
      views_count,
      shares_count,
      profiles(username, avatar_url)
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (userId) query = query.eq("user_id", userId);
  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query;
  if (error) {
    console.error("getReels error:", error);
    throw error;
  }

  return {
    data: data.map(normalizeReel),
    nextCursor: data.length ? data[data.length - 1].created_at : null,
  };
}

/* ----------------------------------------
   GET SINGLE REEL
----------------------------------------- */
export async function getReel(id) {
  const { data, error } = await supabase
    .from("reels")
    .select(
      `
      *,
      profiles (
        id,
        username,
        avatar_url,
        bio
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;

  return normalizeReel(data);
}

/* ----------------------------------------
   UPLOAD REEL (direct/synchronous path)
----------------------------------------- */
export async function uploadReel({ video, caption = "", tags = [] }) {
  if (!video) throw new Error("No video selected.");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  validateVideo(video);

  const ext = video.name.split(".").pop();
  const filename = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("reels")
    .upload(filename, video);

  if (uploadError) throw uploadError;

  const { data: publicData } = supabase.storage
    .from("reels")
    .getPublicUrl(filename);

  const { data, error } = await supabase
    .from("reels")
    .insert({
      user_id: user.id,
      video_url: publicData.publicUrl,
      caption,
      tags,
    })
    .select(
      `
      *,
      profiles (
        id,
        username,
        avatar_url
      )
    `
    )
    .single();

  if (error) throw error;

  return normalizeReel(data);
}

/* ----------------------------------------
   UPDATE REEL
----------------------------------------- */
export async function updateReel(reelId, { caption, tags, newVideo = null }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

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

    if (uploadError) throw uploadError;

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

  if (error) throw error;

  return normalizeReel(data);
}

/* ----------------------------------------
   DELETE REEL
----------------------------------------- */
export async function deleteReel(reelId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("reels")
    .delete()
    .eq("id", reelId)
    .eq("user_id", user.id);

  if (error) throw error;

  return true;
}