import { supabase } from "../supabaseClient";

/**
 * ----------------------------------------------------
 * Share Reel
 *
 * Increments cached share counter.
 * Can later be extended to insert into
 * reel_shares table for analytics.
 * ----------------------------------------------------
 */

export async function shareReel(reelId) {
  if (!reelId) {
    throw new Error("reelId is required");
  }

  // Get current count
  const { data: reel, error: fetchError } = await supabase
    .from("posts")
    .select("shares_count")
    .eq("id", reelId)
    .single();

  if (fetchError) throw fetchError;

  const current = reel?.shares_count || 0;

  const { data, error } = await supabase
    .from("posts")
    .update({
      shares_count: current + 1,
    })
    .eq("id", reelId)
    .select("shares_count")
    .single();

  if (error) throw error;

  return data.shares_count;
}

/**
 * ----------------------------------------------------
 * Undo Share
 * ----------------------------------------------------
 */

export async function unshareReel(reelId) {
  if (!reelId) {
    throw new Error("reelId is required");
  }

  const { data: reel, error: fetchError } = await supabase
    .from("posts")
    .select("shares_count")
    .eq("id", reelId)
    .single();

  if (fetchError) throw fetchError;

  const current = reel?.shares_count || 0;

  const { data, error } = await supabase
    .from("posts")
    .update({
      shares_count: Math.max(current - 1, 0),
    })
    .eq("id", reelId)
    .select("shares_count")
    .single();

  if (error) throw error;

  return data.shares_count;
}

/**
 * ----------------------------------------------------
 * Get Share Count
 * ----------------------------------------------------
 */

export async function getShareCount(reelId) {
  const { data, error } = await supabase
    .from("posts")
    .select("shares_count")
    .eq("id", reelId)
    .single();

  if (error) throw error;

  return data.shares_count || 0;
}