// pages/Discover/ReelFeed.jsx
//
// CHANGES this pass:
// 1. Reapplied the Phase 1 fix that had reverted: destructures `remove`
//    from useReels() and passes it as onDeleted, instead of a no-op.
// 2. Added navigation to the immersive /reel/:id route. handleOpenReel
//    is built with useCallback + a ref mirror of `filtered` (rather than
//    depending on `filtered` directly) so its identity stays stable
//    across pagination/search changes — a fresh callback reference on
//    every filtered update would otherwise defeat ReelCard's memo
//    comparator for every visible card on every page load.

import { useRef, useState, useMemo, useEffect, useLayoutEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";

import ReelCard from "../../features/reels/ReelCard";
import useReels from "../../hooks/useReels";
import { useUploadQueueUI } from "../../hooks/useUploadQueueUI";

const ReelFeed = ({ search = "", onActiveReelChange, onOpenComments }) => {
  const { reels, fetchMore, hasMore, remove } = useReels();
  const uploads = useUploadQueueUI();
  const navigate = useNavigate();

  const containerRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [rowHeight, setRowHeight] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateHeight = () => {
      const h = container.clientHeight;
      if (h > 0) setRowHeight(h);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const merged = useMemo(() => {
    const uploadCards = uploads.map((u) => {
      const width = u.width ?? 0;
      const height = u.height ?? 0;
      return {
        id: u.id,
        fileId: u.fileId,
        uploading: true,
        status: u.status,
        progress: u.progress ?? 0,
        error: u.error ?? null,
        content: u.caption ?? "",
        media: u.finalUrl ? { url: u.finalUrl, width, height } : null,
        width,
        height,
        hasThumbnail: !!u.hasThumbnail,
        user_id: u.userId,
        created_at: u.createdAt ?? Date.now(),
      };
    });

    const uploadingIds = new Set(uploadCards.map((u) => u.id));
    const filteredReels = (reels || []).filter((r) => !uploadingIds.has(r.id));

    return [...uploadCards, ...filteredReels].sort(
      (a, b) => (b.created_at || 0) - (a.created_at || 0)
    );
  }, [uploads, reels]);

  const filtered = useMemo(() => {
    if (!search.trim()) return merged;
    const q = search.toLowerCase();
    return merged.filter((r) => (r.content || r.caption || "").toLowerCase().includes(q));
  }, [merged, search]);

  // Mirrors `filtered` without forcing handleOpenReel to be recreated
  // every time it changes — see file header.
  const filteredRef = useRef(filtered);
  useEffect(() => {
    filteredRef.current = filtered;
  }, [filtered]);

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => rowHeight || window.innerHeight,
    overscan: 3,
  });

  useEffect(() => {
    if (rowHeight) rowVirtualizer.measure();
  }, [rowHeight, rowVirtualizer]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const items = rowVirtualizer.getVirtualItems();
      if (!items.length) return;

      const viewportCenter = container.scrollTop + container.clientHeight / 2;
      let closest = items[0];
      let minDistance = Infinity;

      for (const item of items) {
        const itemCenter = item.start + item.size / 2;
        const distance = Math.abs(itemCenter - viewportCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closest = item;
        }
      }

      setActiveIndex(closest.index);
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [rowVirtualizer]);

  useEffect(() => {
    const items = rowVirtualizer.getVirtualItems();
    if (!items.length) return;
    const lastItem = items[items.length - 1];
    if (lastItem.index >= filtered.length - 3 && hasMore) fetchMore();
  }, [filtered.length, hasMore, fetchMore, rowVirtualizer]);

  useEffect(() => {
    onActiveReelChange?.(filtered[activeIndex] ?? null);
  }, [activeIndex, filtered, onActiveReelChange]);

  const handleReelEnd = useCallback(
    (postId) => {
      const idx = filtered.findIndex((p) => p.id === postId);
      if (idx === -1) return;

      const nextIndex = idx + 1;
      if (nextIndex >= filtered.length) return;

      rowVirtualizer.scrollToIndex(nextIndex, { align: "start", behavior: "smooth" });
    },
    [filtered, rowVirtualizer]
  );

  // Canonical entry point into the immersive route (§40). Stable identity
  // across renders — see filteredRef above.
  const handleOpenReel = useCallback(
    (postId) => {
      const list = filteredRef.current;
      const idx = list.findIndex((p) => p.id === postId);
      if (idx === -1) return;

      navigate(`/reel/${postId}`, { state: { reels: list, index: idx } });
    },
    [navigate]
  );

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-y-scroll snap-y snap-mandatory overscroll-contain"
    >
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const post = filtered[virtualRow.index];
          if (!post) return null;

          return (
            <div
              key={post.id}
              className="snap-start"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                scrollSnapStop: "always",
              }}
            >
              <ReelCard
                reel={post}
                isActive={virtualRow.index === activeIndex}
                priority={Math.abs(virtualRow.index - activeIndex) <= 1}
                onOpenComments={onOpenComments}
                onDeleted={remove}
                onReelEnd={handleReelEnd}
                onOpenReel={handleOpenReel}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReelFeed;