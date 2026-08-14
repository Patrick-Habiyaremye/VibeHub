import { supabase } from "../supabaseClient";
import { normalizeComment } from "../utils/normalizeComment";

const DEFAULT_LIMIT = 10;

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

  return normalizeComment(data);
}

 //--------------------------------------------------
 // READ (paginated, consistent contract)
 //--------------------------------------------------

export async function getComments({
  postId,
  cursor = null,
  limit = DEFAULT_LIMIT,
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

  const normalized = data.map(normalizeComment);

  return {
    data: normalized,
    nextCursor: normalized.length
      ? normalized[normalized.length - 1].created_at
      : null,
  };
}

 //--------------------------------------------------
 // REPLIES
 //--------------------------------------------------

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

  return data.map(normalizeComment);
}

 //--------------------------------------------------
 // DELETE (safer)
 //--------------------------------------------------

export async function deleteComment(id) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // enforce ownership

  if (error) throw error;

  return true;
}

 //--------------------------------------------------
 // REALTIME (explicit + structured)
 //--------------------------------------------------

export function subscribeToComments(postId, cb) {
  const channel = supabase
    .channel(`comments-${postId}`)

    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "comments",
        filter: `post_id=eq.${postId}`,
      },
      (payload) => cb({ ...payload, type: "INSERT" })
    )

    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "comments",
        filter: `post_id=eq.${postId}`,
      },
      (payload) => cb({ ...payload, type: "DELETE" })
    )

    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "comments",
        filter: `post_id=eq.${postId}`,
      },
      (payload) => cb({ ...payload, type: "UPDATE" })
    )

    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}