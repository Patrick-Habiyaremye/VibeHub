// hooks/useAdminStats.js
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function useAdminStats() {
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    reports: 0,
    messages: 0,
  });

  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    const [{ count: users }, { count: posts }, { count: reports }, { count: messages }] =
      await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("reports").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
      ]);

    setStats({ users, posts, reports, messages });
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return { stats, loading, refresh: load };
}