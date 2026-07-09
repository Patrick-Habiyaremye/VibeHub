import { useState } from "react";
import useReports from "./hooks/useReports";

export default function ReportButton({
  type = "post",
  id,
}) {
  const { report, loading } = useReports();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const submitReport = async () => {
    if (!reason.trim()) return;

    await report({
      type,
      id,
      reason,
    });

    setOpen(false);
    setReason("");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="text-sm text-gray-400 hover:text-red-400"
      >
        🚨 Report
      </button>

      {open && (
        <div
          className="
            absolute right-0 mt-2
            w-64 bg-slate-800 p-3 rounded-lg
            shadow-lg space-y-2
          "
        >
          <textarea
            value={reason}
            onChange={(e) =>
              setReason(e.target.value)
            }
            placeholder="What's wrong?"
            className="
              w-full bg-slate-900 p-2 rounded text-sm
            "
          />

          <button
            onClick={submitReport}
            disabled={loading}
            className="
              w-full bg-red-500 py-1 rounded text-sm
              disabled:opacity-50
            "
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}