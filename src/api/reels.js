// api/reels.js

import { supabase } from "../supabaseClient";

export async function getReels() {
  const { data, error } =
    await supabase
      .from("posts")
      .select(`
        *,
        profiles(
          username,
          avatar_url
        )
      `)
      .eq("media_type", "video")
      .order("created_at", {
        ascending: false,
      });

  if (error) throw error;

  return data;
}

export async function getReel(id) {
  const { data, error } =
    await supabase
      .from("posts")
      .select(`
        *,
        profiles(
          username,
          avatar_url
        )
      `)
      .eq("id", id)
      .single();

  if (error) throw error;

  return data;
}