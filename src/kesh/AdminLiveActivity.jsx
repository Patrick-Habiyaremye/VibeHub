import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function AdminLiveActivity() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    supabase
      .channel("live-activity")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, (payload) => {
        setLogs((prev) => [
          {
            type: "post",
            text: `New post created`,
            time: new Date().toLocaleTimeString(),
          },
          ...prev.slice(0, 19),
        ]);
      })
      .subscribe();
  }, []);

  return (
    <div className="bg-slate-900 p-4 rounded-xl">
      <h2 className="text-yellow-400 mb-3">⚡ Live Activity</h2>

      <div className="space-y-2 text-sm">
        {logs.map((log, i) => (
          <div key={i} className="text-slate-300">
            [{log.time}] {log.text}
          </div>
        ))}
      </div>
    </div>
  );
}