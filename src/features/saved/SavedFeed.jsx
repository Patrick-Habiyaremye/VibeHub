// features/saved/SavedFeed.jsx
//
// Universal saved-content feed.
//
// Responsibilities:
// - Read the authenticated user's universal saves.
// - Batch-resolve posts and reels.
// - Preserve save order.
// - Normalize all resolved content.
// - Render canonical Post/Reel components.
// - Activate only the visible saved reel.
// - Keep saved content centered and compact.
//
// Canonical contracts:
//   Post -> <ContentCard post={post} />
//   Reel -> <ReelCard reel={reel} />
//
// DO NOT pass a reel through the `post` prop.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { getSavedContent } from "../../api/savesApi";
import { supabase } from "../../supabaseClient";

import normalizePost from "../../utils/normalizePost";
import normalizeReel from "../../utils/normalizeReel";

import ContentCard from "../post/ContentCard";
import ReelCard from "../reels/ReelCard";

import SavedSkeleton from "./SavedSkeleton";

const PAGE_SIZE = 12;

/* =========================================================
   RESOLVE SAVED CONTENT
========================================================= */

async function resolveBatch(saveRows) {
  if (!Array.isArray(saveRows) || saveRows.length === 0) {
    return [];
  }

  const postIds = saveRows
    .filter((row) => row.content_type === "post")
    .map((row) => row.content_id)
    .filter(Boolean);

  const reelIds = saveRows
    .filter((row) => row.content_type === "reel")
    .map((row) => row.content_id)
    .filter(Boolean);

  const [postsResult, reelsResult] = await Promise.all([
    postIds.length
      ? supabase
          .from("posts")
          .select(`
            id,
            user_id,
            content,
            media,
            style,
            created_at,
            smile_score,
            share_count,
            comments_count,
            profiles(
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .in("id", postIds)
      : Promise.resolve({
          data: [],
          error: null,
        }),

    reelIds.length
      ? supabase
          .from("reels")
          .select(`
            id,
            user_id,
            video_url,
            thumbnail_url,
            caption,
            created_at,
            width,
            height,
            tags,
            duration,
            likes_count,
            comments_count,
            views_count,
            shares_count,
            profiles(
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .in("id", reelIds)
      : Promise.resolve({
          data: [],
          error: null,
        }),
  ]);

  /* -------------------------------------------------------
     DATABASE ERRORS
  ------------------------------------------------------- */

  if (postsResult.error) {
    console.error(
      "[SavedFeed] Failed to resolve posts:",
      postsResult.error
    );

    throw postsResult.error;
  }

  if (reelsResult.error) {
    console.error(
      "[SavedFeed] Failed to resolve reels:",
      reelsResult.error
    );

    throw reelsResult.error;
  }

  /* -------------------------------------------------------
     NORMALIZE POSTS
  ------------------------------------------------------- */

  const postsById = new Map(
    (postsResult.data ?? [])
      .map(normalizePost)
      .filter(Boolean)
      .map((post) => [post.id, post])
  );

  /* -------------------------------------------------------
     NORMALIZE REELS
  ------------------------------------------------------- */

  const reelsById = new Map(
    (reelsResult.data ?? [])
      .map(normalizeReel)
      .filter(Boolean)
      .map((reel) => [reel.id, reel])
  );

  /* -------------------------------------------------------
     RESTORE SAVE ORDER
  ------------------------------------------------------- */

  return saveRows.map((row) => {
    if (row.content_type === "post") {
      const post = postsById.get(row.content_id);

      if (post) {
        return {
          kind: "post",
          savedAt: row.created_at,
          data: post,
        };
      }

      return {
        kind: "unavailable",
        contentType: "post",
        contentId: row.content_id,
        savedAt: row.created_at,
      };
    }

    if (row.content_type === "reel") {
      const reel = reelsById.get(row.content_id);

      if (reel) {
        return {
          kind: "reel",
          savedAt: row.created_at,
          data: reel,
        };
      }

      /*
       * This is important during debugging.
       *
       * If a save row exists but the reel cannot be resolved,
       * the save system is working but the reel query cannot
       * see that reel.
       */
      console.warn(
        "[SavedFeed] Saved reel could not be resolved:",
        {
          reelId: row.content_id,
          savedAt: row.created_at,
        }
      );

      return {
        kind: "unavailable",
        contentType: "reel",
        contentId: row.content_id,
        savedAt: row.created_at,
      };
    }

    return {
      kind: "unavailable",
      contentType: row.content_type,
      contentId: row.content_id,
      savedAt: row.created_at,
    };
  });
}

/* =========================================================
   SAVED REEL
========================================================= */

function SavedReel({ reel, onDeleted }) {
  const containerRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(
          entry.isIntersecting &&
            entry.intersectionRatio >= 0.5
        );
      },
      {
        threshold: [0, 0.5, 0.75, 1],
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  if (!reel) return null;

  return (
    <article
      ref={containerRef}
      className="
        mx-auto
        w-full
        max-w-md
        overflow-hidden
        rounded-2xl
        border
        border-white/10
        bg-black
        shadow-xl
      "
    >
      <div
        className="
          relative
          aspect-[9/16]
          w-full
          max-h-[620px]
          overflow-hidden
          bg-black
        "
      >
        {/*
         * IMPORTANT:
         *
         * ReelCard's canonical prop is `reel`.
         *
         * NEVER use:
         *
         *     post={reel}
         */}
        <ReelCard
          reel={reel}
          isActive={isVisible}
          priority={isVisible}
          onDeleted={onDeleted}
        />
      </div>
    </article>
  );
}

/* =========================================================
   MAIN FEED
========================================================= */

export default function SavedFeed({ contentType }) {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const requestIdRef = useRef(0);

  /* -------------------------------------------------------
     LOAD
  ------------------------------------------------------- */

  const loadPage = useCallback(
    async (nextCursor = null) => {
      const requestId = ++requestIdRef.current;

      const firstPage = !nextCursor;

      setStatus(
        firstPage
          ? "loading"
          : "loadingMore"
      );

      if (firstPage) {
        setErrorMessage("");
      }

      try {
        const result = await getSavedContent({
          contentType,
          limit: PAGE_SIZE,
          cursor: nextCursor,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        const resolved = await resolveBatch(
          result.data
        );

        if (requestId !== requestIdRef.current) {
          return;
        }

        setItems((previous) =>
          firstPage
            ? resolved
            : [...previous, ...resolved]
        );

        setCursor(result.nextCursor);
        setHasMore(Boolean(result.nextCursor));

        setStatus("ready");
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        console.error(
          "[SavedFeed] Load failed:",
          error
        );

        setErrorMessage(
          error?.message ||
            "We couldn't load your saved content."
        );

        setStatus("error");
      }
    },
    [contentType]
  );

  /* -------------------------------------------------------
     FILTER CHANGE
  ------------------------------------------------------- */

  useEffect(() => {
    requestIdRef.current += 1;

    setItems([]);
    setCursor(null);
    setHasMore(true);
    setErrorMessage("");

    loadPage(null);
  }, [contentType, loadPage]);

  /* -------------------------------------------------------
     DELETED REEL
  ------------------------------------------------------- */

  const handleDeleted = useCallback(
    (deletedId) => {
      if (!deletedId) return;

      setItems((previous) =>
        previous.filter(
          (item) =>
            !(
              item.kind === "reel" &&
              item.data?.id === deletedId
            )
        )
      );
    },
    []
  );

  /* =======================================================
     LOADING
  ======================================================= */

  if (status === "loading") {
    return <SavedSkeleton />;
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (status === "error") {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 py-20 text-center">
        <div className="text-4xl">
          ⚠️
        </div>

        <p className="font-medium text-white">
          We couldn't load your saved content.
        </p>

        {errorMessage && (
          <p className="max-w-md text-sm text-white/50">
            {errorMessage}
          </p>
        )}

        <button
          type="button"
          onClick={() => loadPage(null)}
          className="
            rounded-lg
            bg-white/10
            px-5
            py-2.5
            text-sm
            text-white
            transition
            hover:bg-white/20
            active:scale-95
          "
        >
          Retry
        </button>
      </div>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (!items.length) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-2 py-20 text-center text-white/60">
        <div className="text-5xl">
          🔖
        </div>

        <p className="font-medium text-white">
          No saved content yet.
        </p>

        <p className="max-w-md text-sm">
          Save posts, reels, and moments to
          find them here later.
        </p>
      </div>
    );
  }

  /* =======================================================
     CONTENT
  ======================================================= */

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {items.map((item, index) => {
        /* -----------------------------------------------
           POST
        ------------------------------------------------ */

        if (item.kind === "post") {
          return (
            <section
              key={`post-${item.data.id}`}
              className="
                mx-auto
                w-full
              "
            >
              <ContentCard
                post={item.data}
              />
            </section>
          );
        }

        /* -----------------------------------------------
           REEL
        ------------------------------------------------ */

        if (item.kind === "reel") {
          return (
            <SavedReel
              key={`reel-${item.data.id}`}
              reel={item.data}
              onDeleted={handleDeleted}
            />
          );
        }

        /* -----------------------------------------------
           UNAVAILABLE
        ------------------------------------------------ */

        return (
          <div
            key={`unavailable-${item.contentType}-${item.contentId ?? index}`}
            className="
              mx-auto
              w-full
              max-w-md
              rounded-2xl
              border
              border-white/10
              bg-white/[0.03]
              p-6
              text-center
              text-sm
              text-white/40
            "
          >
            This{" "}
            {item.contentType || "content"}{" "}
            is no longer available.
          </div>
        );
      })}

      {/* -----------------------------------------------
         LOAD MORE
      ------------------------------------------------ */}

      {hasMore && (
        <div className="flex justify-center pb-8 pt-2">
          <button
            type="button"
            disabled={
              status === "loadingMore"
            }
            onClick={() =>
              loadPage(cursor)
            }
            className="
              rounded-lg
              bg-white/5
              px-6
              py-3
              text-sm
              text-white/70
              transition
              hover:bg-white/10
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {status === "loadingMore"
              ? "Loading…"
              : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}