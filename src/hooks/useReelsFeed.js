// hooks/useReelsFeed.js

import { useState, useRef, useCallback } from "react";
import { ContentApi } from "../api/contentApi";

const PAGE_SIZE = 10;

export default function useReelsFeed(userId, upsertMany) {
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef(null);
  const loadingRef = useRef(false);

  const fetchMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;

    try {
      const { data } = await ContentApi.getReels({
        limit: PAGE_SIZE,
        cursor: cursorRef.current, // plain timestamp now, matches reelsApi
      });

      if (!data?.length) {
        setHasMore(false);
        return;
      }

      upsertMany(data);

      const last = data[data.length - 1];
      cursorRef.current = last.created_at;

      if (data.length < PAGE_SIZE) setHasMore(false);
    } catch (err) {
      console.error("fetchMore failed:", err);
      // don't flip hasMore false here — a transient network error
      // shouldn't permanently kill pagination
    } finally {
      loadingRef.current = false;
    }
  }, [hasMore, upsertMany]);

  return { fetchMore, hasMore };
}