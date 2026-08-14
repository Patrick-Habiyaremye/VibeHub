// FILE: src/features/reactions/api/reactions.api.js

import { supabase } from "../../../supabaseClient";
import { isValidReactionType } from "../utils/reactionTypes";

async function getAuthUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Current authenticated user's reaction on a post, or null.
 */
export async function getUserReaction(postId, userId) {
  if (!postId || !userId) return null;

  const { data, error } = await supabase
    .from("post_reactions")
    .select("reaction")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.reaction ?? null;
}

/**
 * Per-type breakdown for a post. Intended to be called on demand
 * (e.g. when the user opens the reaction details view), not per-render.
 */
export async function getPostReactions(postId) {
  if (!postId) return { total: 0, counts: {} };

  const { data, error } = await supabase
    .from("post_reactions")
    .select("reaction")
    .eq("post_id", postId);

  if (error) throw error;

  const counts = {};
  for (const row of data) {
    counts[row.reaction] = (counts[row.reaction] || 0) + 1;
  }

  return { total: data.length, counts };
}

/**
 * Add / change / remove-on-repeat, atomically, via RPC.
 * Returns { action: "added" | "changed" | "removed", reaction: string | null }.
 */
export async function setReaction({ postId, reactionType }) {
  if (!postId) throw new Error("postId is required");
  if (!isValidReactionType(reactionType)) {
    throw new Error(`Invalid reaction type: ${reactionType}`);
  }

  const { data, error } = await supabase.rpc("set_post_reaction", {
    p_post_id: postId,
    p_reaction: reactionType,
  });

  if (error) throw error;
  return data?.[0] ?? null;
}

/**
 * Explicit removal, independent of the toggle RPC — used by
 * "remove my reaction" affordances that don't want toggle semantics.
 */
export async function removeReaction({ postId }) {
  const userId = await getAuthUserId();
  if (!userId) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("post_reactions")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
}