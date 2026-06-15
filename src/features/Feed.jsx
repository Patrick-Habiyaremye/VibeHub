import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"
import { Navigate } from "react-router-dom"
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import RightPanel from "../components/layout/RightPanel";
import DailyChallenge from "../components/challenge/DailyChallenge";
import CreatePost from "../components/post/CreatePost";
import PostCard from "../components/post/PostCard";
import { getPosts } from "../api/posts";

export default function Feed() {

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <p className="text-white">Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const loadPosts = async () => {
    const data = await getPosts();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div className="bg-slate-950 min-h-screen">

      <Navbar />

      <div className="max-w-7xl mx-auto flex">

        <Sidebar />

        <main className="flex-1 max-w-3xl p-6">

          <DailyChallenge />

          <CreatePost
            onPostCreated={loadPosts}
          />

          {postsLoading && (
            <p className="text-slate-400">
              Loading posts...
            </p>
          )}

          {!postsLoading &&
            posts.length === 0 && (
              <p className="text-slate-400">
                No posts found 😔
              </p>
            )}

          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
            />
          ))}

        </main>

        <RightPanel />

      </div>

    </div>
  );
}