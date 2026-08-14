// hooks/useReports.js
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../supabaseClient";
import useAuditLog from "./useAuditLog";

const PAGE_SIZE = 20;

export default function useReports() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logAction } = useAuditLog();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: err, count } = await supabase
      .from("reports")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setReports(data || []);
    setTotal(count || 0);
    setLoading(false);
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  // Resolving now marks the report resolved instead of deleting it,
  // so there's a record for the audit trail. Add a "resolved" boolean
  // column to `reports` (see migration file) if you don't have one yet.
  const resolveReport = async (id) => {
    const { error: err } = await supabase
      .from("reports")
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .eq("id", id);

    if (err) {
      setError(err.message);
      return;
    }

    await logAction("resolve_report", "report", id);
    setReports((prev) => prev.filter((r) => r.id !== id));
    setTotal((t) => Math.max(0, t - 1));
  };

  return {
    reports,
    total,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    loading,
    error,
    load,
    resolveReport,
  };
}
