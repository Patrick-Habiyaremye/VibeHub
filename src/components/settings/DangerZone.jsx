import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { supabase } from "../../supabaseClient";

export default function DangerZone() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      setError('Type "DELETE" exactly to confirm.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Your session expired. Please log in again.");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
        { method: "POST", headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "Failed to delete account.");
      }
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (err) {
      console.error("Account deletion error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-red-950/30 border border-red-900/60 p-5 sm:p-6 rounded-2xl">
      <div className="flex items-start gap-3 mb-3">
        <div className="shrink-0 w-9 h-9 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center">
          <AlertTriangle size={18} />
        </div>
        <div>
          <h2 className="text-red-400 font-semibold leading-tight">Delete account</h2>
          <p className="text-slate-500 text-xs mt-0.5">This cannot be undone</p>
        </div>
      </div>

      <p className="text-slate-300 text-sm mb-4">
        This permanently deletes your account, posts, and messages. There's no way to recover it afterward.
      </p>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          Delete account
        </button>
      ) : (
        <div className="space-y-3">
          <label className="block text-xs text-slate-400">
            Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm
          </label>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-900 text-white border border-red-900/60 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            autoFocus
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={loading || confirmText !== "DELETE"}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              {loading ? "Deleting…" : "Confirm deletion"}
            </button>
            <button
              onClick={() => { setShowConfirm(false); setConfirmText(""); setError(null); }}
              disabled={loading}
              className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}