// hooks/useReels.js
//
// FIX: now exposes `remove` (from useReelsStore) so the feed can actually
// wire up reel deletion instead of passing onDeleted={() => {}}. Realtime
// DELETE events (useReelsRealtime) still call the same store `remove` —
// this makes the owner's own delete action equally immediate instead of
// depending on the realtime round-trip to self-heal the UI.

import { useEffect } from "react";
import useReelsFeed from "./useReelsFeed";
import useReelsStore from "./useReelsStore";
import useReelsRealtime from "./useReelsRealtime";
import { useAuth } from "../context/AuthContext";

export default function useReels() {
  const { user } = useAuth();
  const store = useReelsStore();

  const feed = useReelsFeed(user?.id, store.upsertMany);

  useReelsRealtime(store.insertTop, store.remove, user);

  useEffect(() => {
    if (user?.id) {
      feed.fetchMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user?.id) {
    return { reels: [], fetchMore: () => {}, hasMore: false, remove: () => {} };
  }

  return {
    reels: store.reels,
    fetchMore: feed.fetchMore,
    hasMore: feed.hasMore,
    remove: store.remove,
  };
}