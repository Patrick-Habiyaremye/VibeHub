import { supabase } from "../supabaseClient";

//--------------------------------------------------
// CREATE
//--------------------------------------------------

export async function createComment({
  postId,
  content,
  parentId = null,
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      parent_id: parentId,
      content,
    })
    .select(`
      *,
      profiles(username, avatar_url)
    `)
    .single();

  if (error) throw error;

  return data;
}

export async function getComments({
  postId,
  cursor = null,
  limit = 10,
}) {
  let query = supabase
    .from("comments")
    .select(`
      *,
      profiles(username, avatar_url)
    `)
    .eq("post_id", postId)
    .is("parent_id", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data;
}

export async function getReplies(commentId) {
  const { data, error } = await supabase
    .from("comments")
    .select(`
      *,
      profiles(username, avatar_url)
    `)
    .eq("parent_id", commentId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data;
}

export async function deleteComment(id) {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export function subscribeToComments(postId, cb) {
  const channel = supabase
    .channel(`comments-${postId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "comments",
        filter: `post_id=eq.${postId}`,
      },
      cb
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}