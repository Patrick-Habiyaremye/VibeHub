import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    messages: 0,
    reactions: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);

  // INITIAL LOAD
  useEffect(() => {
    fetchStats();
    fetchRecent();
    subscribeRealtime();
  }, []);

  async function fetchStats() {
    const [{ count: users }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
    ]);

    const [{ count: posts }] = await Promise.all([
      supabase.from("posts").select("*", { count: "exact", head: true }),
    ]);

    const [{ count: messages }] = await Promise.all([
      supabase.from("messages").select("*", { count: "exact", head: true }),
    ]);

    const [{ count: reactions }] = await Promise.all([
      supabase.from("reactions").select("*", { count: "exact", head: true }),
    ]);

    setStats({ users, posts, messages, reactions });
  }

  async function fetchRecent() {
    const { data: users } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: posts } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    setRecentUsers(users || []);
    setRecentPosts(posts || []);
  }

  function subscribeRealtime() {
    // USERS LIVE
    supabase
      .channel("admin-users")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "profiles" },
        (payload) => {
          setStats((prev) => ({
            ...prev,
            users: prev.users + 1,
          }));

          setRecentUsers((prev) => [payload.new, ...prev.slice(0, 4)]);
        }
      )
      .subscribe();

    // POSTS LIVE
    supabase
      .channel("admin-posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          setStats((prev) => ({
            ...prev,
            posts: prev.posts + 1,
          }));

          setRecentPosts((prev) => [payload.new, ...prev.slice(0, 4)]);
        }
      )
      .subscribe();

    // MESSAGES LIVE
    supabase
      .channel("admin-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          setStats((prev) => ({
            ...prev,
            messages: prev.messages + 1,
          }));
        }
      )
      .subscribe();

    // REACTIONS LIVE
    supabase
      .channel("admin-reactions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reactions" },
        () => {
          setStats((prev) => ({
            ...prev,
            reactions: prev.reactions + 1,
          }));
        }
      )
      .subscribe();
  }

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-white">
      <h1 className="text-2xl font-bold text-yellow-400 mb-6">
        ⚡ VibeHub Admin Dashboard (Live)
      </h1>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Users" value={stats.users} />
        <StatCard label="Posts" value={stats.posts} />
        <StatCard label="Messages" value={stats.messages} />
        <StatCard label="Reactions" value={stats.reactions} />
      </div>

      {/* LIVE ACTIVITY */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-4 rounded-xl">
          <h2 className="text-yellow-400 mb-3">🔥 New Users</h2>
          {recentUsers.map((u) => (
            <p key={u.id} className="text-sm text-slate-300">
              👤 {u.username || "New user"}
            </p>
          ))}
        </div>

        <div className="bg-slate-900 p-4 rounded-xl">
          <h2 className="text-blue-400 mb-3">📝 New Posts</h2>
          {recentPosts.map((p) => (
            <p key={p.id} className="text-sm text-slate-300">
              📌 {p.content?.slice(0, 40)}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}