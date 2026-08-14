import { useState, useCallback } from "react";
import * as commentService from "../domain/comments/comment.service";

export function useComments({ postId, reelId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //--------------------------------------------------
  // SAFE SETTER (never break shape)
  //--------------------------------------------------
  const safeSet = (updater) => {
    setComments((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const next =
        typeof updater === "function" ? updater(safePrev) : updater;

      return Array.isArray(next) ? next : safePrev;
    });
  };

  //--------------------------------------------------
  // LOAD
  //--------------------------------------------------
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await commentService.getComments({ postId, reelId });

      const data = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];

      safeSet(data);
    } catch (err) {
      console.error("Load comments failed:", err);
      setError("Failed to load comments");
      safeSet([]); // never break UI
    } finally {
      setLoading(false);
    }
  }, [postId, reelId]);

  //--------------------------------------------------
  // ADD (OPTIMISTIC - SINGLE SOURCE)
  //--------------------------------------------------
  const add = useCallback(async (content, user) => {
    const tempId = `temp-${crypto.randomUUID()}`;

    const optimistic = {
      id: tempId,
      content,
      user_id: user.id,
      username: user.username || "You",
      created_at: new Date().toISOString(),
      likes: 0,
      optimistic: true,
    };

    // optimistic insert
    safeSet((prev) => [optimistic, ...prev]);

    try {
      const saved = await commentService.createComment({
        postId,
        reelId,
        content,
      });

      // replace temp safely
      safeSet((prev) => {
        const withoutTemp = prev.filter((c) => c.id !== tempId);

        // avoid duplicates from realtime
        if (withoutTemp.some((c) => c.id === saved.id)) {
          return withoutTemp;
        }

        return [saved, ...withoutTemp];
      });

      return saved;
    } catch (err) {
      console.error("Add failed:", err);

      // rollback
      safeSet((prev) => prev.filter((c) => c.id !== tempId));

      throw err;
    }
  }, [postId, reelId]);

  //--------------------------------------------------
  // DELETE (OPTIMISTIC)
  //--------------------------------------------------
  const remove = useCallback(async (id) => {
    let backup;

    safeSet((prev) => {
      backup = prev;
      return prev.filter((c) => c.id !== id);
    });

    try {
      await commentService.deleteComment({ id, postId, reelId });
    } catch (err) {
      console.error("Delete failed:", err);
      safeSet(backup); // rollback
    }
  }, [postId, reelId]);

  //--------------------------------------------------
  // REALTIME MERGE (IMPORTANT)
  //--------------------------------------------------
  const mergeRealtime = useCallback((incoming) => {
    if (!Array.isArray(incoming)) return;

    safeSet((prev) => {
      const map = new Map(prev.map((c) => [c.id, c]));

      incoming.forEach((c) => {
        map.set(c.id, { ...map.get(c.id), ...c });
      });

      return Array.from(map.values());
    });
  }, []);

  return {
    comments,
    loading,
    error,
    load,
    add,
    remove,
    mergeRealtime,
    setComments: safeSet, // controlled exposure
  };
}