import { supabase } from "../supabaseClient";

/**
 * Send support to a post.
 * One support per user per post.
 */
export async function sendSupport(postId) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("You must be logged in.");

  // Check whether the user already supported the post
  const { data: existing, error: checkError } = await supabase
    .from("post_supports")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (checkError) throw checkError;

  if (existing) {
    return {
      supported: true,
      message: "Already supported.",
    };
  }

  const { data, error } = await supabase
    .from("post_supports")
    .insert({
      post_id: postId,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    supported: true,
    data,
  };
}

/**
 * Remove support from a post.
 */
export async function removeSupport(postId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("You must be logged in.");

  const { error } = await supabase
    .from("post_supports")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", user.id);

  if (error) throw error;

  return {
    supported: false,
  };
}

/**
 * Check whether the current user supports a post.
 */
export async function hasSupported(postId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("post_supports")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;

  return !!data;
}

/**
 * Get support count for a post.
 */
export async function getSupportCount(postId) {
  const { count, error } = await supabase
    .from("post_supports")
    .select("*", {
      head: true,
      count: "exact",
    })
    .eq("post_id", postId);

  if (error) throw error;

  return count ?? 0;
}