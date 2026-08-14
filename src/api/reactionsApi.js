// FILE: src/api/reactionsApi.js
// (trimmed to just share — reaction functions now live in features/reactions/api)

import { supabase } from "../supabaseClient";

async function getAuthUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");
  return user;
}

/**
 * Records a share event (idempotent per user/post — posts.share_count
 * is kept in sync by a DB trigger, so no manual counter math here).
 */
export async function sharePost(postId) {
  const user = await getAuthUser();

  const { error } = await supabase
    .from("shares")
    .upsert(
      { post_id: postId, user_id: user.id },
      { onConflict: "post_id,user_id", ignoreDuplicates: true }
    );

  if (error) throw error;
  return true;
}

export function subscribeToPostReactions(postId, callback) {
  const channel = supabase
    .channel(`post-${postId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "post_reactions", filter: `post_id=eq.${postId}` },
      callback
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "shares", filter: `post_id=eq.${postId}` },
      callback
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}