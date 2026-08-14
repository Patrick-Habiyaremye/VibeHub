// src/features/comments/api/comments.api.js

import { supabase } from "../../../supabaseClient";
import { SORT_OPTIONS } from "../constants/comment.constants";

const TABLE = "comments";
const REACTIONS_TABLE = "comment_reactions";
const PAGE_SIZE = 20;

/**
 * IMPORTANT:
 * comments has two FK relationships to profiles.
 *
 * We explicitly select the relationship that uses:
 * comments.user_id -> profiles.id
 */
const PROFILE_RELATIONSHIP = "comments_user_id_fkey";

const COMMENT_SELECT = `
  *,
  profiles!${PROFILE_RELATIONSHIP}(
    id,
    username,
    avatar_url
  )
`;

function handle(result, operation) {
  if (!result?.error) return;

  console.error(`[comments.api] ${operation}`, result.error);
  throw result.error;
}

function applySort(query, sort) {
  if (sort === SORT_OPTIONS.OLDEST) {
    return query.order("created_at", {
      ascending: true,
    });
  }

  if (sort === SORT_OPTIONS.MOST_LOVED) {
    return query
      .order("likes_count", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      });
  }

  return query.order("created_at", {
    ascending: false,
  });
}

/**
 * ---------------------------------------------
 * FETCH ROOT COMMENTS
 * ---------------------------------------------
 */
export async function fetchComments({
  contentType,
  contentId,
  cursor = null,
  page = 1,
  limit = PAGE_SIZE,
  sort = SORT_OPTIONS.NEWEST,
}) {
  if (!contentType) {
    throw new Error("contentType is required");
  }

  if (!contentId) {
    throw new Error("contentId is required");
  }

  let query = supabase
    .from(TABLE)
    .select(COMMENT_SELECT)
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .is("parent_id", null);

  query = applySort(query, sort);

  if (sort === SORT_OPTIONS.MOST_LOVED) {
    const from = (Math.max(page, 1) - 1) * limit;

    query = query.range(
      from,
      from + limit - 1
    );
  } else {
    query = query.limit(limit);

    if (cursor) {
      query =
        sort === SORT_OPTIONS.OLDEST
          ? query.gt("created_at", cursor)
          : query.lt("created_at", cursor);
    }
  }

  const result = await query;

  handle(result, "fetchComments");

  return result.data ?? [];
}

/**
 * ---------------------------------------------
 * FETCH REPLIES
 * ---------------------------------------------
 */
export async function fetchReplies({
  parentId,
  cursor = null,
  limit = PAGE_SIZE,
}) {
  if (!parentId) {
    throw new Error("parentId is required");
  }

  let query = supabase
    .from(TABLE)
    .select(COMMENT_SELECT)
    .eq("parent_id", parentId)
    .order("created_at", {
      ascending: true,
    })
    .limit(limit);

  if (cursor) {
    query = query.gt("created_at", cursor);
  }

  const result = await query;

  handle(result, "fetchReplies");

  return result.data ?? [];
}

/**
 * ---------------------------------------------
 * CREATE COMMENT
 * ---------------------------------------------
 */
export async function insertComment({
  contentType,
  contentId,
  parentId = null,
  userId,
  content,
}) {
  if (!contentType) {
    throw new Error("contentType is required");
  }

  if (!contentId) {
    throw new Error("contentId is required");
  }

  if (!userId) {
    throw new Error("userId is required");
  }

  if (!content?.trim()) {
    throw new Error("Comment content is required");
  }

  const result = await supabase
    .from(TABLE)
    .insert({
      content_type: contentType,
      content_id: contentId,
      parent_id: parentId,
      user_id: userId,
      content: content.trim(),
    })
    .select(COMMENT_SELECT)
    .single();

  handle(result, "insertComment");

  return result.data;
}

/**
 * ---------------------------------------------
 * UPDATE COMMENT
 * ---------------------------------------------
 */
export async function updateCommentContent({
  id,
  userId,
  content,
}) {
  if (!id) {
    throw new Error("Comment id is required");
  }

  if (!userId) {
    throw new Error("userId is required");
  }

  if (!content?.trim()) {
    throw new Error("Comment content is required");
  }

  const result = await supabase
    .from(TABLE)
    .update({
      content: content.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select(COMMENT_SELECT)
    .single();

  handle(result, "updateCommentContent");

  return result.data;
}

/**
 * ---------------------------------------------
 * DELETE COMMENT
 * ---------------------------------------------
 */
export async function deleteCommentRow({
  id,
  userId,
}) {
  const result = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  handle(result, "deleteCommentRow");

  return true;
}

/**
 * ---------------------------------------------
 * LIKE
 * ---------------------------------------------
 */
export async function likeComment({
  commentId,
  userId,
}) {
  const result = await supabase
    .from(REACTIONS_TABLE)
    .insert({
      comment_id: commentId,
      user_id: userId,
      reaction_type: "like",
    });

  if (result.error && result.error.code !== "23505") {
    handle(result, "likeComment");
  }

  return true;
}

/**
 * ---------------------------------------------
 * UNLIKE
 * ---------------------------------------------
 */
export async function unlikeComment({
  commentId,
  userId,
}) {
  const result = await supabase
    .from(REACTIONS_TABLE)
    .delete()
    .eq("comment_id", commentId)
    .eq("user_id", userId);

  handle(result, "unlikeComment");

  return true;
}

/**
 * ---------------------------------------------
 * FETCH LIKED COMMENT IDS
 * ---------------------------------------------
 */
export async function fetchLikedCommentIds({
  commentIds,
  userId,
}) {
  if (!Array.isArray(commentIds) || !commentIds.length) {
    return [];
  }

  if (!userId) {
    return [];
  }

  const result = await supabase
    .from(REACTIONS_TABLE)
    .select("comment_id")
    .eq("user_id", userId)
    .in("comment_id", commentIds);

  handle(result, "fetchLikedCommentIds");

  return (result.data ?? []).map(
    (row) => row.comment_id
  );
}

/**
 * ---------------------------------------------
 * NOTIFICATION
 * ---------------------------------------------
 */
export async function insertNotification({
  userId,
  actorId,
  type,
  contentType,
  contentId,
  commentId,
}) {
  if (!userId || userId === actorId) {
    return true;
  }

  const result = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      actor_id: actorId,
      type,
      content_type: contentType,
      content_id: contentId,
      comment_id: commentId,
    });

  handle(result, "insertNotification");

  return true;
}