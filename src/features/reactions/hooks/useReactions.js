// FILE: src/features/reactions/hooks/useReactions.js

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import useOptimisticReaction from "../../../features/post/card/hooks/useOptimisticReaction";
import {
  getUserReaction,
  getPostReactions,
  setReaction,
  removeReaction,
} from "../api/reactions.api";

/**
 * @param {string} postId
 * @param {{ initialTotal?: number, initialReaction?: string|null }} options
 */
export default function useReactions(postId, { initialTotal = 0 } = {}) {
  const { user } = useAuth();

  const [initReaction, setInitReaction] = useState(null);
  const [ready, setReady] = useState(!user);

  const [breakdown, setBreakdown] = useState(null);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [breakdownError, setBreakdownError] = useState(null);

  // Fetch the user's own reaction once (guarded by visibility upstream in ContentCard)
  useEffect(() => {
    let cancelled = false;

    if (!postId || !user) {
      setReady(true);
      return;
    }

    setReady(false);
    getUserReaction(postId, user.id)
      .then((r) => {
        if (!cancelled) setInitReaction(r);
      })
      .catch(() => {
        // safe default: no reaction known
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [postId, user]);

  const {
    reaction: userReaction,
    count: total,
    loading: mutating,
    toggleReaction,
  } = useOptimisticReaction({
    initialReaction: initReaction,
    initialCount: initialTotal,
    onReact: (type) => setReaction({ postId, reactionType: type }),
    onRemove: () => removeReaction({ postId }),
  });

  const react = useCallback(
    (type) => {
      if (!user) throw new Error("Not authenticated");
      if (!postId) return;
      return toggleReaction(type);
    },
    [toggleReaction, user, postId]
  );

  const removeMyReaction = useCallback(() => {
    if (!userReaction) return;
    return toggleReaction(userReaction);
  }, [toggleReaction, userReaction]);

  const loadBreakdown = useCallback(async () => {
    if (!postId) return;
    setBreakdownLoading(true);
    setBreakdownError(null);
    try {
      const result = await getPostReactions(postId);
      setBreakdown(result);
    } catch (err) {
      setBreakdownError(err);
    } finally {
      setBreakdownLoading(false);
    }
  }, [postId]);

  return {
    total,
    counts: breakdown?.counts ?? null,
    userReaction,
    loading: mutating || !ready,
    error: breakdownError,
    react,
    removeReaction: removeMyReaction,
    breakdownLoading,
    loadBreakdown,
  };
}