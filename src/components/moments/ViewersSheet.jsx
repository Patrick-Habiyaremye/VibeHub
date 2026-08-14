// components/moments/ViewersSheet.jsx

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabaseClient";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

/**
 * WhatsApp-style "who saw this" sheet. Owner-only, lazy-loaded on open.
 *
 * Loads via get_moment_viewers / get_moment_reactions RPCs (server-side
 * join, sidesteps PostgREST embedding/RLS issues) and subscribes to
 * realtime inserts on both tables while open.
 *
 * List rendering uses `content-visibility: auto` on each row instead of
 * a virtualization library — for a "who saw my story" list (hundreds,
 * not tens of thousands of rows) that's enough to keep paint/layout
 * cheap without adding a dependency. If this list needs to support
 * many thousands of viewers, swap the row map for react-window/
 * react-virtuoso; the data-loading logic below doesn't change.
 */
export default function ViewersSheet({ momentId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState("all"); // "all" | "reactions"
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const [viewsRes, reactionsRes] = await Promise.all([
        supabase.rpc("get_moment_viewers", { p_moment_id: momentId }),
        supabase.rpc("get_moment_reactions", { p_moment_id: momentId }),
      ]);

      if (cancelled) return;

      if (viewsRes.error || reactionsRes.error) {
        console.error(viewsRes.error || reactionsRes.error);
        setError("Couldn't load viewers.");
        setLoading(false);
        return;
      }

      const reactionByUser = new Map();
      for (const r of reactionsRes.data || []) {
        if (!reactionByUser.has(r.user_id)) reactionByUser.set(r.user_id, r.reaction);
      }

      const byUser = new Map();
      for (const v of viewsRes.data || []) {
        byUser.set(v.user_id, {
          userId: v.user_id,
          username: v.username,
          avatarUrl: v.avatar_url,
          at: v.viewed_at,
          reaction: reactionByUser.get(v.user_id) || null,
        });
      }
      for (const r of reactionsRes.data || []) {
        if (!byUser.has(r.user_id)) {
          byUser.set(r.user_id, {
            userId: r.user_id,
            username: r.username,
            avatarUrl: r.avatar_url,
            at: r.created_at,
            reaction: r.reaction,
          });
        }
      }

      const merged = Array.from(byUser.values()).sort((a, b) => new Date(b.at) - new Date(a.at));
      setEntries(merged);
      setLoading(false);
    }

    load();

    const channel = supabase
      .channel(`moment-activity-${momentId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "smile_moment_views", filter: `moment_id=eq.${momentId}` },
        () => !cancelled && load()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "smile_moment_reactions", filter: `moment_id=eq.${momentId}` },
        () => !cancelled && load()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [momentId]);

  const visibleEntries = useMemo(
    () => (filter === "reactions" ? entries.filter((e) => e.reaction) : entries),
    [entries, filter]
  );
  const reactionCount = useMemo(() => entries.filter((e) => e.reaction).length, [entries]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 180);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <style>{`
        @keyframes vs-sheet-in { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes vs-modal-in { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @media (max-width: 639px) { .vs-sheet { animation: vs-sheet-in 0.22s ease-out; } }
        @media (min-width: 640px) { .vs-sheet { animation: vs-modal-in 0.18s ease-out; } }
        .vs-row { content-visibility: auto; contain-intrinsic-size: 56px; }
      `}</style>

      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Story viewers"
        className={`vs-sheet relative w-full sm:w-[420px] sm:max-w-[92vw] max-h-[75vh] sm:max-h-[70vh] bg-[#111A2E] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl shadow-black/60 pb-[env(safe-area-inset-bottom)] transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <p className="text-sm font-semibold text-white">
            Viewers {entries.length > 0 && <span className="text-slate-400">· {entries.length}</span>}
          </p>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm"
          >
            ✕
          </button>
        </div>

        {entries.length > 0 && reactionCount > 0 && (
          <div className="flex gap-2 px-4 py-2 border-b border-white/10 shrink-0" role="tablist" aria-label="Filter viewers">
            <button
              role="tab"
              aria-selected={filter === "all"}
              onClick={() => setFilter("all")}
              className={`text-xs px-3 py-1 rounded-full transition ${filter === "all" ? "bg-white/15 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              All {entries.length}
            </button>
            <button
              role="tab"
              aria-selected={filter === "reactions"}
              onClick={() => setFilter("reactions")}
              className={`text-xs px-3 py-1 rounded-full transition ${filter === "reactions" ? "bg-white/15 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              Reactions {reactionCount}
            </button>
          </div>
        )}

        <div className="overflow-y-auto flex-1">
          {loading && (
            <div role="status" aria-live="polite" className="p-6 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Loading…
            </div>
          )}

          {!loading && error && (
            <div role="alert" className="p-6 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && visibleEntries.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-400">
              {filter === "reactions" ? "No reactions yet." : "No one has seen this yet."}
            </div>
          )}

          {!loading &&
            !error &&
            visibleEntries.map((entry) => (
              <div key={entry.userId} className="vs-row flex items-center gap-3 px-4 py-2.5 hover:bg-white/5">
                {entry.avatarUrl ? (
                  <img src={entry.avatarUrl} className="w-9 h-9 rounded-full object-cover shrink-0" alt="" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-700 shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{entry.username || "Someone"}</p>
                  <p className="text-[11px] text-slate-500">{timeAgo(entry.at)}</p>
                </div>

                {entry.reaction && <span className="text-lg shrink-0">{entry.reaction}</span>}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}