// src/features/comments/hooks/useCommentLikes.js

import { useCallback, useEffect, useState } from "react";
import LikeEngine from "../engine/LikeEngine";
import { useCommentContext } from "../context/CommentContext";

export default function useCommentLikes({ commentId, commentOwnerId, initialLiked = false, initialCount = 0 }) {
  const { contentType, contentId, currentUser } = useCommentContext();
  const userId = currentUser?.id ?? null;

  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!pending) {
      setLiked(initialLiked);
      setCount(initialCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLiked, initialCount]);

  const toggle = useCallback(async () => {
    if (!userId || pending) return;

    const nextLiked = !liked;
    const prevLiked = liked;
    const prevCount = count;

    setLiked(nextLiked);
    setCount((c) => Math.max(c + (nextLiked ? 1 : -1), 0));
    setPending(true);

    const result = await LikeEngine.setLiked({
      commentId,
      commentOwnerId,
      contentType,
      contentId,
      user: currentUser,
      liked: nextLiked,
    });

    if (!result.success) {
      setLiked(prevLiked);
      setCount(prevCount);
    }
    setPending(false);
    return result;
  }, [commentId, commentOwnerId, contentType, contentId, currentUser, userId, liked, count, pending]);

  return { liked, count, pending, toggle };
}