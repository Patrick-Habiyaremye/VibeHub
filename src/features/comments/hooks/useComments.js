// src/features/comments/hooks/useComments.js

import { useCallback, useEffect, useRef, useState } from "react";
import CommentEngine from "../engine/CommentEngine";
import { subscribeToComments, subscribeToCommentLikes } from "../realtime/CommentRealtime";
import CommentModel from "../models/CommentModel";
import {
  mergeCommentPage,
  upsertComment,
  removeComment,
  reconcileOptimistic,
  adjustCommentField,
} from "../utils/mergeComments";
import { useCommentContext } from "../context/CommentContext";

export default function useComments() {
  const { contentType, contentId, ownerId, currentUser, sort } = useCommentContext();
  const userId = currentUser?.id ?? null;

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [posting, setPosting] = useState(false);

  const cursorRef = useRef(null);
  const pageRef = useRef(1);
  const mountedRef = useRef(true);
  const idsRef = useRef(new Set());

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (!contentType || !contentId) return;
    setLoading(true);
    setError(null);
    cursorRef.current = null;
    pageRef.current = 1;

    const result = await CommentEngine.getComments({ contentType, contentId, userId, sort });
    if (!mountedRef.current) return;

    if (!result.success) {
      setError(result.message);
      setComments([]);
      setHasMore(false);
    } else {
      setComments(result.data);
      idsRef.current = new Set(result.data.map((c) => c.id));
      cursorRef.current = result.meta.nextCursor;
      pageRef.current = result.meta.nextPage;
      setHasMore(result.meta.hasMore);
    }
    setLoading(false);
  }, [contentType, contentId, userId, sort]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!contentId) return;

    const unsubscribe = subscribeToComments(contentId, {
      onInsert: (raw) => {
        if (raw.parent_id) return;
        const model = CommentModel.fromRaw(raw);
        idsRef.current.add(model.id);
        setComments((prev) => upsertComment(prev, model, { prepend: true }));
      },
      onUpdate: (raw) => {
        setComments((prev) => upsertComment(prev, CommentModel.fromRaw(raw)));
      },
      onDelete: (id) => {
        idsRef.current.delete(id);
        setComments((prev) => removeComment(prev, id));
      },
    });

    return unsubscribe;
  }, [contentId]);

  useEffect(() => {
    if (!contentId) return;

    const unsubscribe = subscribeToCommentLikes(
      `top:${contentId}`,
      () => idsRef.current,
      ({ commentId, delta }) => {
        setComments((prev) => adjustCommentField(prev, commentId, "likesCount", delta));
      }
    );

    return unsubscribe;
  }, [contentId]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    const result = await CommentEngine.getComments({
      contentType,
      contentId,
      userId,
      sort,
      cursor: cursorRef.current,
      page: pageRef.current,
    });

    if (mountedRef.current && result.success) {
      setComments((prev) => mergeCommentPage(prev, result.data));
      result.data.forEach((c) => idsRef.current.add(c.id));
      cursorRef.current = result.meta.nextCursor;
      pageRef.current = result.meta.nextPage;
      setHasMore(result.meta.hasMore);
    }
    setLoadingMore(false);
  }, [contentType, contentId, userId, sort, loadingMore, hasMore]);

  const addComment = useCallback(
    async (content) => {
      if (!userId) return { success: false, message: "You must be signed in to comment." };

      const tempId = `temp-${crypto.randomUUID()}`;
      const optimistic = new CommentModel(
        {
          id: tempId,
          content_type: contentType,
          content_id: contentId,
          parent_id: null,
          user_id: userId,
          content,
          likes_count: 0,
          replies_count: 0,
          created_at: new Date().toISOString(),
        },
        { optimistic: true }
      );

      setPosting(true);
      setComments((prev) => [optimistic, ...prev]);

      const result = await CommentEngine.addComment({ contentType, contentId, ownerId, user: currentUser, content });

      if (!mountedRef.current) return result;

      if (!result.success) {
        setComments((prev) => removeComment(prev, tempId));
      } else {
        idsRef.current.add(result.data.id);
        setComments((prev) => reconcileOptimistic(prev, tempId, result.data));
      }
      setPosting(false);
      return result;
    },
    [contentType, contentId, ownerId, userId, currentUser]
  );

  const editComment = useCallback(
    async (id, content) => {
      const existing = comments.find((c) => c.id === id);
      if (!existing) return { success: false, message: "Comment not found." };

      const result = await CommentEngine.updateComment({ id, user: currentUser, content, existingComment: existing });
      if (result.success && mountedRef.current) {
        setComments((prev) => upsertComment(prev, result.data));
      }
      return result;
    },
    [comments, currentUser]
  );

  const deleteComment = useCallback(
    async (id) => {
      const existing = comments.find((c) => c.id === id);
      if (!existing) return { success: false, message: "Comment not found." };

      const previous = comments;
      setComments((current) => removeComment(current, id));

      const result = await CommentEngine.deleteComment({ id, user: currentUser, existingComment: existing });
      if (!result.success && mountedRef.current) {
        setComments(previous);
      } else {
        idsRef.current.delete(id);
      }
      return result;
    },
    [comments, currentUser]
  );

  // Called by ReplySection (via CommentItem) after a reply is added/removed
  // so "Reply (7)" becomes "Reply (8)" without a refetch.
  const adjustReplyCount = useCallback((parentId, delta) => {
    setComments((prev) => adjustCommentField(prev, parentId, "repliesCount", delta));
  }, []);

  return {
    comments,
    loading,
    loadingMore,
    hasMore,
    error,
    posting,
    loadMore,
    addComment,
    editComment,
    deleteComment,
    adjustReplyCount,
    refresh: load,
  };
}