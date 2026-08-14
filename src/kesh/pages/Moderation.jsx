// pages/Moderation.jsx
import { useState } from "react";
import useReports from "../hooks/useReports";
import ReportItem from "../components/ReportItem";
import ConfirmDialog from "../components/ConfirmDialog";
import ErrorBanner from "../components/ErrorBanner";

export default function Moderation() {
  const {
    reports,
    total,
    page,
    setPage,
    pageSize,
    loading,
    error,
    load,
    resolveReport,
  } = useReports();

  const [pendingResolve, setPendingResolve] = useState(null);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Moderation</h1>

      <ErrorBanner message={error} onRetry={load} />

      {loading ? (
        <div className="text-slate-400">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="text-slate-400">No open reports. 🎉</div>
      ) : (
        reports.map((r) => (
          <ReportItem key={r.id} report={r} onResolve={setPendingResolve} />
        ))
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-3 py-1 rounded bg-slate-800 disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded bg-slate-800 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingResolve}
        title="Resolve this report?"
        description="This marks the report as handled. You can still find it in the audit log afterward."
        confirmLabel="Resolve"
        onConfirm={() => {
          resolveReport(pendingResolve.id);
          setPendingResolve(null);
        }}
        onCancel={() => setPendingResolve(null)}
      />
    </>
  );
}
