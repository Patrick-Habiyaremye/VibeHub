//C:\code\KeshApp\VibeHub\src\components\moments\MomentsProvider.jsx

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "../../supabaseClient";
import StoryViewer from "./StoryViewer";
import useSmileMoments from "../../hooks/useSmileMoments";

// ---------------------------------------------------------------------------
// Single source of truth for "who's posted, what's Recent, what's Viewed".
// Mount this ONCE, high in the tree (e.g. wrapping your router in App.jsx) —
// not inside a route/page component. Because the compact feed widget and the
// full Moments page are separate mount points (a route change unmounts one
// and mounts the other), state that lived inside either of them would reset
// on navigation: a moment you just watched on the Moments page would show as
// unseen again back on the feed. Lifting it here means both views — and the
// story viewer itself — read and write the exact same state no matter which
// page triggered it.
// ---------------------------------------------------------------------------

const MomentsContext = createContext(null);

function isFullySeen(group, idsSet) {
  return group.every((m) => idsSet.has(m.id));
}

export function MomentsProvider({ user, children }) {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeUserId, setActiveUserId] = useState(null);

  // Live view state — updates the instant a moment is watched.
  const [viewedIds, setViewedIds] = useState(() => new Set());

  // Committed view state — decides which section (Recent vs Viewed) a card
  // lives in. Only catches up to viewedIds when the story viewer closes, so
  // a row someone is still looking at can't reshuffle under them mid-session.
  const [committedViewedIds, setCommittedViewedIds] = useState(() => new Set());

  // Per-author "last watched" timestamp — Viewed sorts by this, most recent
  // first, rather than by original post time.
  const [viewedAtByUser, setViewedAtByUser] = useState(() => new Map());

  // Authors whose card just crossed into Viewed on the last close — used to
  // trigger a one-shot entrance animation there, then forgotten.
  const [recentlyMovedUserIds, setRecentlyMovedUserIds] = useState(() => new Set());

  const loadMoments = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("smile_moments")
        .select("*, profiles:user_id(username, avatar_url)")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMoments(data || []);
    } catch (err) {
      console.error("SmileMoments load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMoments();
  }, [loadMoments]);

  useSmileMoments({
    onInsert: (story) => {
      setMoments((prev) => (prev.some((m) => m.id === story.id) ? prev : [story, ...prev]));
    },
    onReaction: (reaction) => {
      setMoments((prev) =>
        prev.map((m) =>
          m.id === reaction.moment_id ? { ...m, reactions_count: (m.reactions_count || 0) + 1 } : m
        )
      );
    },
    onView: (view) => {
      setMoments((prev) =>
        prev.map((m) => (m.id === view.moment_id ? { ...m, views_count: (m.views_count || 0) + 1 } : m))
      );
    },
  });

  const groups = useMemo(() => {
    const map = new Map();
    for (const m of moments) {
      if (!map.has(m.user_id)) map.set(m.user_id, []);
      map.get(m.user_id).push(m);
    }
    return Array.from(map.values());
  }, [moments]);

  const flatOrdered = useMemo(() => groups.flat(), [groups]);

  // Recent: not fully watched yet, newest author activity first.
  const recentGroups = useMemo(
    () => groups.filter((g) => !isFullySeen(g, committedViewedIds)),
    [groups, committedViewedIds]
  );

  // Viewed: fully watched, most-recently-watched first.
  const viewedGroups = useMemo(() => {
    const seenGroups = groups.filter((g) => isFullySeen(g, committedViewedIds));
    return [...seenGroups].sort((a, b) => {
      const at = viewedAtByUser.get(a[0].user_id) || 0;
      const bt = viewedAtByUser.get(b[0].user_id) || 0;
      return bt - at;
    });
  }, [groups, committedViewedIds, viewedAtByUser]);

  const handleCreated = useCallback((newMoment) => {
    setMoments((prev) => [newMoment, ...prev]);
  }, []);

  const handleMomentDeleted = useCallback((momentId) => {
    setMoments((prev) => prev.filter((m) => m.id !== momentId));
    setViewedIds((prev) => {
      if (!prev.has(momentId)) return prev;
      const next = new Set(prev);
      next.delete(momentId);
      return next;
    });
    setCommittedViewedIds((prev) => {
      if (!prev.has(momentId)) return prev;
      const next = new Set(prev);
      next.delete(momentId);
      return next;
    });
  }, []);

  const handleMomentViewed = useCallback((momentId) => {
    setViewedIds((prev) => {
      if (prev.has(momentId)) return prev;
      const next = new Set(prev);
      next.add(momentId);
      return next;
    });

    // Functional read of `moments` so this callback never needs `moments`
    // in its dependency array — keeps its identity stable across renders.
    setMoments((currentMoments) => {
      const moment = currentMoments.find((m) => m.id === momentId);
      if (moment) {
        setViewedAtByUser((prevMap) => {
          const next = new Map(prevMap);
          next.set(moment.user_id, Date.now());
          return next;
        });
      }
      return currentMoments;
    });
  }, []);

  // Closing the viewer is the one moment cards are allowed to change
  // sections. Diff live vs. committed first to know exactly who's about to
  // cross over, flag them for the Viewed-row entrance animation, then commit.
  const handleViewerClose = useCallback(() => {
    const newlySeenUserIds = groups
      .filter((g) => !isFullySeen(g, committedViewedIds) && isFullySeen(g, viewedIds))
      .map((g) => g[0].user_id);

    setCommittedViewedIds(viewedIds);

    if (newlySeenUserIds.length) {
      setRecentlyMovedUserIds((prev) => {
        const next = new Set(prev);
        newlySeenUserIds.forEach((id) => next.add(id));
        return next;
      });
      setTimeout(() => {
        setRecentlyMovedUserIds((prev) => {
          const next = new Set(prev);
          newlySeenUserIds.forEach((id) => next.delete(id));
          return next;
        });
      }, 550);
    }

    setActiveUserId(null);
  }, [groups, committedViewedIds, viewedIds]);

  const activeGroup = useMemo(
    () => groups.find((g) => g[0].user_id === activeUserId) || null,
    [groups, activeUserId]
  );
  const activeStartIndex = activeGroup
    ? flatOrdered.findIndex((m) => m.id === activeGroup[0].id)
    : -1;

  const value = useMemo(
    () => ({
      user,
      loading,
      groups,
      flatOrdered,
      recentGroups,
      viewedGroups,
      viewedIds,
      recentlyMovedUserIds,
      openMoment: setActiveUserId,
      handleCreated,
      refetch: loadMoments,
    }),
    [
      user,
      loading,
      groups,
      flatOrdered,
      recentGroups,
      viewedGroups,
      viewedIds,
      recentlyMovedUserIds,
      handleCreated,
      loadMoments,
    ]
  );

  return (
    <MomentsContext.Provider value={value}>
      {children}

      {activeGroup && activeStartIndex !== -1 && (
        <StoryViewer
          moments={flatOrdered}
          startIndex={activeStartIndex}
          user={user}
          onClose={handleViewerClose}
          onMomentViewed={handleMomentViewed}
          onMomentPosted={loadMoments}
          onMomentDeleted={handleMomentDeleted}
        />
      )}
    </MomentsContext.Provider>
  );
}

export function useMoments() {
  const ctx = useContext(MomentsContext);
  if (!ctx) {
    throw new Error("useMoments() must be called within a <MomentsProvider>");
  }
  return ctx;
}