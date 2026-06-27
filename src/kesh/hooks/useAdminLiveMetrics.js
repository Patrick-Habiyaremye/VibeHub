import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function useAdminLiveMetrics() {
  const [data, setData] = useState({
    users: [],
    posts: [],
  });

  useEffect(() => {
    const channel = supabase
      .channel("admin-live-metrics")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, (payload) => {
        setData((prev) => ({
          ...prev,
          posts: [payload.new, ...prev.posts].slice(0, 20),
        }));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return data;
}