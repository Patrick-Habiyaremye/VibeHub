// hooks/useAdminStats.js
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../supabaseClient";

export default function useAdminStats() {
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    reports: 0,
    messages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [usersRes, postsRes, reportsRes, messagesRes] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase
          .from("reports")
          .select("*", { count: "exact", head: true })
          .eq("resolved", false),
        supabase.from("messages").select("*", { count: "exact", head: true }),
      ]);

      const firstError =
        usersRes.error || postsRes.error || reportsRes.error || messagesRes.error;

      if (firstError) throw firstError;

      setStats({
        users: usersRes.count || 0,
        posts: postsRes.count || 0,
        reports: reportsRes.count || 0,
        messages: messagesRes.count || 0,
      });
    } catch (err) {
      setError(err.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, loading, error, refresh: load };
}
