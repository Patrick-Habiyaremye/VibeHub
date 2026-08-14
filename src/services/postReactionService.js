import { supabase } from "../supabaseClient";

export const POST_REACTIONS = [
  "smile",
  "inspired",
  "appreciate",
  "positive",
  "love",
];

/**
 * Set/change/remove the current user's reaction.
 *
 * Database function:
 *   set_post_reaction(p_post_id, p_reaction)
 *
 * The database remains the source of truth.
 */
export async function setPostReaction({
  postId,
  reaction,
}) {
  if (!postId) {
    throw new Error("Post ID is required.");
  }

  if (!POST_REACTIONS.includes(reaction)) {
    throw new Error(`Invalid reaction type: ${reaction}`);
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(authError.message);
  }

  if (!user) {
    throw new Error("You must be signed in to react.");
  }

  const { data, error } = await supabase.rpc(
    "set_post_reaction",
    {
      p_post_id: postId,
      p_reaction: reaction,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  const result = Array.isArray(data)
    ? data[0]
    : data;

  /*
   * Get the authoritative Smile total after
   * the database mutation.
   *
   * The trigger keeps posts.smile_score synchronized.
   */
  const {
    data: post,
    error: postError,
  } = await supabase
    .from("posts")
    .select("smile_score")
    .eq("id", postId)
    .single();

  if (postError) {
    throw new Error(postError.message);
  }

  return {
    action: result?.action ?? null,
    reaction: result?.reaction ?? null,
    count: Number(post?.smile_score ?? 0),
  };
}


/**
 * Remove the current user's reaction.
 *
 * The existing SQL function removes a reaction when
 * the same reaction is submitted again.
 */
export async function removePostReaction({
  postId,
  reaction,
}) {
  return setPostReaction({
    postId,
    reaction,
  });
}


/**
 * Get the current user's reaction for a post.
 */
export async function getMyPostReaction(postId) {
  if (!postId) {
    return null;
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("post_reactions")
    .select("reaction")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.reaction ?? null;
}


/**
 * Get the Smile total.
 */
export async function getPostSmileScore(postId) {
  if (!postId) {
    return 0;
  }

  const { data, error } = await supabase
    .from("posts")
    .select("smile_score")
    .eq("id", postId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return Number(data?.smile_score ?? 0);
}