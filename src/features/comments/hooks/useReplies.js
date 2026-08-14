// src/features/comments/hooks/useReplies.js

import { useCallback, useEffect, useRef, useState } from "react";
import ReplyEngine from "../engine/ReplyEngine";
import CommentEngine from "../engine/CommentEngine";
import { subscribeToCommentLikes } from "../realtime/CommentRealtime";
import CommentModel from "../models/CommentModel";
import { mergeCommentPage, removeComment, adjustCommentField, upsertComment } from "../utils/mergeComments";
import { useCommentContext } from "../context/CommentContext";

export default function useReplies({ parentId, parentAuthorId, enabled = false, onCountChange }) {
  const { contentType, contentId, currentUser } = useCommentContext();
  const userId = currentUser?.id ?? null;

  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [posting, setPosting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [lastAddedId, setLastAddedId] = useState(null);

  const cursorRef = useRef(null);
  const mountedRef = useRef(true);
  const idsRef = useRef(new Set());

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (!parentId) return;
    setLoading(true);
    setError(null);
    cursorRef.current = null;

    const result = await ReplyEngine.getReplies({ parentId, userId });
    if (!mountedRef.current) return;

    if (!result.success) {
      setError(result.message);
      setReplies([]);
      setHasMore(false);
    } else {
      setReplies(result.data);
      idsRef.current = new Set(result.data.map((r) => r.id));
      cursorRef.current = result.meta.nextCursor;
      setHasMore(result.meta.hasMore);
    }
    setLoading(false);
    setLoaded(true);
  }, [parentId, userId]);

  useEffect(() => {
    if (enabled && !loaded) load();
  }, [enabled, loaded, load]);

  useEffect(() => {
    if (!enabled || !parentId) return;

    const unsubscribe = subscribeToCommentLikes(
      `reply:${parentId}`,
      () => idsRef.current,
      ({ commentId, delta }) => {
        setReplies((prev) => adjustCommentField(prev, commentId, "likesCount", delta));
      }
    );

    return unsubscribe;
  }, [enabled, parentId]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) return;
    setLoadingMore(true);

    const result = await ReplyEngine.getReplies({ parentId, userId, cursor: cursorRef.current });

    if (mountedRef.current && result.success) {
      setReplies((prev) => mergeCommentPage(prev, result.data));
      result.data.forEach((r) => idsRef.current.add(r.id));
      cursorRef.current = result.meta.nextCursor;
      setHasMore(result.meta.hasMore);
    }
    setLoadingMore(false);
  }, [parentId, userId, loadingMore, hasMore]);

  const addReply = useCallback(
    async (content) => {
      if (!userId) return { success: false, message: "You must be signed in to reply." };

      const tempId = `temp-${crypto.randomUUID()}`;
      const optimistic = new CommentModel(
        {
          id: tempId,
          content_type: contentType,
          content_id: contentId,
          parent_id: parentId,
          user_id: userId,
          content,
          likes_count: 0,
          replies_count: 0,
          created_at: new Date().toISOString(),
        },
        { optimistic: true }
      );

      setPosting(true);
      setReplies((prev) => [...prev, optimistic]);

      const result = await ReplyEngine.addReply({
        contentType,
        contentId,
        parentId,
        parentAuthorId,
        user: currentUser,
        content,
      });

      if (!mountedRef.current) return result;

      if (!result.success) {
        setReplies((prev) => removeComment(prev, tempId));
      } else {
        idsRef.current.add(result.data.id);
        setReplies((prev) => prev.map((r) => (r.id === tempId ? result.data : r)));
        setLastAddedId(result.data.id);
        onCountChange?.(1); // instant "Reply (7)" -> "Reply (8)", no refetch
      }
      setPosting(false);
      return result;
    },
    [contentType, contentId, parentId, parentAuthorId, userId, currentUser, onCountChange]
  );

  const deleteReply = useCallback(
    async (id) => {
      const existing = replies.find((r) => r.id === id);
      if (!existing) return { success: false, message: "Reply not found." };

      const previous = replies;
      setReplies((current) => removeComment(current, id));

      const result = await CommentEngine.deleteComment({ id, user: currentUser, existingComment: existing });
      if (!result.success && mountedRef.current) {
        setReplies(previous);
      } else {
        idsRef.current.delete(id);
        onCountChange?.(-1);
      }
      return result;
    },
    [replies, currentUser, onCountChange]
  );

  return {
    replies,
    loading,
    loadingMore,
    hasMore,
    error,
    posting,
    loaded,
    lastAddedId,
    loadMore,
    addReply,
    deleteReply,
    refresh: load,
  };
}