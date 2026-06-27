import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function AdminAnalytics() {
  const [data, setData] = useState({
    users: 0,
    posts: 0,
    reports: 0,
    activeToday: 0,
  });

  useEffect(() => {
    loadAnalytics();
    subscribe();
  }, []);

  async function loadAnalytics() {
    const [{ count: users }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
    ]);

    const [{ count: posts }] = await Promise.all([
      supabase.from("posts").select("*", { count: "exact", head: true }),
    ]);

    const [{ count: reports }] = await Promise.all([
      supabase.from("reports").select("*", { count: "exact", head: true }),
    ]);

    const { data: active } = await supabase
      .from("profiles")
      .select("*")
      .gte("last_seen", new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString());

    setData({
      users,
      posts,
      reports,
      activeToday: active?.length || 0,
    });
  }

  function subscribe() {
    supabase
      .channel("analytics-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, () => {
        setData((d) => ({ ...d, posts: d.posts + 1 }));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "profiles" }, () => {
        setData((d) => ({ ...d, users: d.users + 1 }));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reports" }, () => {
        setData((d) => ({ ...d, reports: d.reports + 1 }));
      })
      .subscribe();
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card label="Users" value={data.users} />
      <Card label="Posts" value={data.posts} />
      <Card label="Reports" value={data.reports} />
      <Card label="Active 24h" value={data.activeToday} />
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
      <p className="text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}