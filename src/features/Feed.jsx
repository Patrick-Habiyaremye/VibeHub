import { useEffect, useRef, useCallback } from "react";
import { supabase } from "../supabaseClient";

import { useAuth } from "../context/AuthContext";
import useFeed from "../hooks/useFeed";

import CreatePost from "../features/post/CreatePost";
import ContentCard from "../features/post/ContentCard";

export default function Feed() {
  const { user, authLoading } = useAuth();

  const {
    feed,
    fetchMore,
    hasMore,
    loading,
    insertPost,
    resetFeed,
  } = useFeed();

  const observerRef = useRef(null);

  // -----------------------
  // INFINITE SCROLL
  // -----------------------
  const lastRef = useCallback(
    (node) => {
      if (loading) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && hasMore) {
            fetchMore();
          }
        },
        { rootMargin: "200px" }
      );

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, fetchMore]
  );

  // -----------------------
  // INITIAL LOAD + RESET ON USER CHANGE
  // -----------------------
  // useEffect(() => {
  //   resetFeed();
  //   fetchMore();
  // }, [user]); // 🔥 important: refetch when auth changes

  // -----------------------
  // REALTIME INSERT (DEDUP SAFE)
  // -----------------------

  useEffect(() => {
  if (!user) return;

  const channel = supabase
    .channel("feed-insert")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "posts",
      },
      async (payload) => {
        const post = payload.new;

        const { data: profile } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", post.user_id)
          .single();

        insertPost({
          ...post,
          profiles: profile,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user, insertPost]);
  // useEffect(() => {
  //   if (!user) return;

  //   const channel = supabase
  //     .channel("feed-insert")
  //     .on(
  //       "postgres_changes",
  //       {
  //         event: "INSERT",
  //         schema: "public",
  //         table: "posts",
  //       },
  //       async (payload) => {
  //         const post = payload.new;

  //         // 🚨 prevent duplicates
  //         const exists = feed.some((p) => p.id === post.id);
  //         if (exists) return;

  //         const { data: profile } = await supabase
  //           .from("profiles")
  //           .select("username, avatar_url")
  //           .eq("id", post.user_id)
  //           .single();

  //         insertPost({
  //           ...post,
  //           profiles: profile,
  //         });
  //       }
  //     )
  //     .subscribe();

  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, [user, insertPost, feed]); // include feed for dedup

  // -----------------------
  // CREATE POST HANDLER
  // -----------------------
  const handlePostCreated = (newPost) => {
    // ⚠️ Only insert if we actually receive the post
    if (newPost) {
      insertPost(newPost);
    }
  };

  // -----------------------
  // STATES
  // -----------------------
  if (authLoading) {
    return (
      <p className="text-center mt-10 text-gray-400">
        Loading...
      </p>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      {/* CREATE POST */}
      {user && (
        <CreatePost onPostCreated={handlePostCreated} />
      )}

      {/* EMPTY */}
      {!loading && feed.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          No posts yet
        </p>
      )}

      {/* FEED */}
      {feed.map((post, index) => {
        const isLast = index === feed.length - 1;

        return (
          <div
            key={post.id}
            ref={isLast ? lastRef : null}
          >
            <ContentCard post={post} />
          </div>
        );
      })}

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-400">
          Loading...
        </p>
      )}
    </div>
  );
}