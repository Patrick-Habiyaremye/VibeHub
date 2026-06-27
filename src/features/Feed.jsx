import { useEffect, useState, useCallback } from "react";

import { useAuth } from "../context/AuthContext";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import RightPanel from "../components/layout/RightPanel";
import Footer from "../components/layout/Footer";

import DailyChallenge from "../components/challenge/DailyChallenge";
import SmileMoments from "../components/moments/SmileMoments";

import FeedFilters from "../components/feed/FeedFilters";
import FeedList from "../components/feed/FeedList";
import FeedLoading from "../components/feed/FeedLoading";
import FeedEmpty from "../components/feed/FeedEmpty";

import ReelPreview from "../components/feed/ReelPreview";
import useReels from "../hooks/useReels";

import CreatePost from "../features/post/CreatePost";

import { getPosts } from "../api/posts";
import useRealtime from "../hooks/useRealtime";

export default function Feed() {
  const { user, authLoading } = useAuth();
  const { reels, loading } = useReels();

  const [posts, setPosts] = useState([]);
  const [loading1, setLoading1] = useState(true);
  const [filter, setFilter] = useState("Latest");

  // -----------------------
  // LOAD POSTS
  // -----------------------
  const loadPosts = useCallback(async () => {
    try {
      setLoading1(true);
      const data = await getPosts();
      setPosts(data || []);
    } catch (err) {
      console.error("Load posts error:", err);
    } finally {
      setLoading1(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // -----------------------
  // REALTIME
  // -----------------------
  useRealtime({
    channelName: user?.id ? "posts-feed" : null,
    table: "posts",
    enabled: !!user?.id,
    event: "INSERT",

    onChange: (payload) => {
      const newPost = payload.new;

      setPosts((prev) => {
        const exists = prev.some((p) => p.id === newPost.id);
        if (exists) return prev;
        return [newPost, ...prev];
      });
    },
  });

  // -----------------------
  // LOADING STATE
  // -----------------------
  if (authLoading) {
    return <FeedLoading />;
  }

  return (
    <div className="bg-slate-950 min-h-screen flex flex-col">
      
      {/* NAVBAR */}
      <Navbar />

      {/* MAIN LAYOUT */}
      <div
        className="
          flex
          justify-center
          w-full
          max-w-7xl
          mx-auto
          px-3
          sm:px-4
          lg:px-6
          gap-6
        "
      >

        {/* LEFT SIDEBAR (desktop only) */}
        <Sidebar />

        {/* CENTER FEED */}
        <main
          className="
            flex-1
            w-full
            max-w-3xl
            py-4
            lg:py-6
            pb-24
            lg:pb-6
          "
        >
          {/* STORIES */}
          <SmileMoments user={user} />

          {/* DAILY */}
          <DailyChallenge />

          {/* REELS */}
          <ReelPreview reels={reels} loading={loading} />

          {/* FILTERS */}
          <FeedFilters active={filter} setActive={setFilter} />

          {/* CREATE POST */}
          {user && (
            <CreatePost onPostCreated={loadPosts} />
          )}

          {/* CONTENT STATES */}
          {loading1 && <FeedLoading />}

          {!loading1 && posts.length === 0 && <FeedEmpty />}

          {!loading1 && posts.length > 0 && (
            <FeedList posts={posts} />
          )}
        </main>

        {/* RIGHT PANEL (desktop only) */}
        <RightPanel />

      </div>

      {/* FOOTER (desktop only) */}
      <Footer />

    </div>
  );
}