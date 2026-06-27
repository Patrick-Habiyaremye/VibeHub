import { supabase } from "../supabaseClient";

export async function searchEverything(query) {
  if (!query.trim()) return [];

  const [
    profiles,
    posts,
    videos,
    challenges,
  ] = await Promise.all([

    supabase
      .from("profiles")
      .select("*")
      .ilike("username", `%${query}%`),

    supabase
      .from("posts")
      .select("*")
      .ilike("content", `%${query}%`),

    supabase
      .from("posts")
      .select("*")
      .eq("media_type", "video")
      .ilike("content", `%${query}%`),

    supabase
      .from("challenges")
      .select("*")
      .ilike("title", `%${query}%`)
  ]);

  return [
    ...(profiles.data || []).map(item => ({
      ...item,
      type: "people",
    })),

    ...(posts.data || []).map(item => ({
      ...item,
      type: "posts",
    })),

    ...(videos.data || []).map(item => ({
      ...item,
      type: "videos",
    })),

    ...(challenges.data || []).map(item => ({
      ...item,
      type: "challenges",
    })),
  ];
}