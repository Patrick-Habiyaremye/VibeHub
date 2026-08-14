// src/features/comments/realtime/CommentRealtime.js


// subscribeToCommentLikes: comment_reactions has no content_id column
// (flagged above), so this listens table-wide with no server-side
// filter and checks client-side whether the changed row's comment_id is
// one we currently care about. `getRelevantIds` is a function (not a
// static array) so the caller can update which IDs matter (e.g. as more
// comments load) without tearing down and recreating the channel.

import { supabase } from "../../../supabaseClient";

export function subscribeToComments(contentId, { onInsert, onUpdate, onDelete } = {}) {
  if (!contentId) return () => {};

  const channel = supabase
    .channel(`comments:${contentId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "comments", filter: `content_id=eq.${contentId}` },
      async (payload) => {
        const { data } = await supabase
          .from("comments")
          .select(`*, profiles(id, username, avatar_url)`)
          .eq("id", payload.new.id)
          .single();
        if (data) onInsert?.(data);
      }
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "comments", filter: `content_id=eq.${contentId}` },
      (payload) => onUpdate?.(payload.new)
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "comments", filter: `content_id=eq.${contentId}` },
      (payload) => onDelete?.(payload.old.id)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export function subscribeToCommentLikes(channelKey, getRelevantIds, { onChange } = {}) {
  const channel = supabase
    .channel(`comment-likes:${channelKey}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "comment_reactions" },
      (payload) => {
        const ids = getRelevantIds();
        if (ids.has(payload.new.comment_id)) {
          onChange?.({ commentId: payload.new.comment_id, delta: 1, userId: payload.new.user_id, type: "insert" });
        }
      }
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "comment_reactions" },
      (payload) => {
        const ids = getRelevantIds();
        if (ids.has(payload.old.comment_id)) {
          onChange?.({ commentId: payload.old.comment_id, delta: -1, userId: payload.old.user_id, type: "delete" });
        }
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}