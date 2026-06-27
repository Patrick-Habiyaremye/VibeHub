import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function AdminModeration() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    loadReports();
    subscribe();
  }, []);

  async function loadReports() {
    const { data } = await supabase
      .from("reports")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    setReports(data || []);
  }

  function subscribe() {
    supabase
      .channel("reports-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reports" }, (payload) => {
        setReports((prev) => [payload.new, ...prev]);
      })
      .subscribe();
  }

  async function resolveReport(id, action) {
    await supabase
      .from("reports")
      .update({ status: "reviewed" })
      .eq("id", id);

    if (action === "delete_post") {
      await supabase.from("posts").delete().eq("id", id);
    }

    setReports((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-4">
      {reports.map((r) => (
        <div key={r.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-white">🚨 {r.reason}</p>
          <p className="text-sm text-slate-400">Type: {r.target_type}</p>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => resolveReport(r.id, "delete_post")}
              className="bg-red-500 px-3 py-1 rounded"
            >
              Delete
            </button>

            <button
              onClick={() => resolveReport(r.id, "ignore")}
              className="bg-green-500 px-3 py-1 rounded"
            >
              Ignore
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}