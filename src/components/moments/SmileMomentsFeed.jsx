//C:\code\KeshApp\VibeHub\src\components\moments\SmileMomentsFeed.jsx

import { useNavigate } from "react-router-dom";
import CreateSmileMoment from "./CreateSmileMoment";
import SmileMomentCard, { initialsFallbackUrl } from "./SmileMomentCard";
import { useMoments } from "./MomentsProvider";

// ---------------------------------------------------------------------------
// This is the ONLY smile-moments surface that belongs on the main feed.
// It intentionally never renders Viewed cards — those live on the full
// Moments page. If there's anything to catch up on there, it shows a single
// quiet entry point (avatar stack + count) instead, so the feed stays about
// what's new, not an archive of what you've already watched.
//
// Drop straight into Feed.jsx with no wiring:  <SmileMomentsFeed />
// onOpenAll is only needed if you want to override the default
// navigate("/moments") — e.g. to open a modal instead of routing.
// ---------------------------------------------------------------------------

export default function SmileMomentsFeed({ onOpenAll }) {
  const navigate = useNavigate();
  const { user, loading, groups, recentGroups, viewedGroups, viewedIds, openMoment, handleCreated } =
    useMoments();
  const goToMoments = onOpenAll || (() => navigate("/moments"));

  if (loading) {
    return (
      <div className="flex gap-3 overflow-hidden py-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-14 h-14 rounded-full bg-slate-700 animate-pulse" />
        ))}
      </div>
    );
  }

  const nothingToShow = !groups.length && !user;

  return (
    <div className="py-3 space-y-3">
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory scroll-smooth">
        {user && (
          <div className="snap-start shrink-0">
            <CreateSmileMoment user={user} onCreated={handleCreated} />
          </div>
        )}

        {recentGroups.map((group) => (
          <div key={group[0].user_id} className="snap-start shrink-0">
            <SmileMomentCard
              group={group}
              seen={group.every((m) => viewedIds.has(m.id))}
              onClick={() => openMoment(group[0].user_id)}
            />
          </div>
        ))}

        {/* Nothing new, but not empty either — reassure rather than
            leave a blank row after the "your vibe" tile. */}
        {!recentGroups.length && groups.length > 0 && (
          <div className="flex items-center px-1">
            <p className="text-xs text-white/35 whitespace-nowrap">You're all caught up ✨</p>
          </div>
        )}
      </div>

      {nothingToShow && <p className="text-sm text-slate-400 px-0.5">No smile moments yet 🌱</p>}

      {/* The one and only doorway into Viewed from the main feed. */}
      {viewedGroups.length > 0 && (
        <button
          type="button"
          onClick={goToMoments}
          className="w-full flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.99] transition-all px-3.5 py-2.5 text-left"
        >
          <div className="flex -space-x-2.5 shrink-0">
            {viewedGroups.slice(0, 3).map((g) => {
              const author = g[0].profiles;
              const src = author?.avatar_url || initialsFallbackUrl(author?.username);
              return (
                <img
                  key={g[0].user_id}
                  src={src}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-[#0B0B0F]"
                />
              );
            })}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white/80">Viewed moments</p>
            <p className="text-[11px] text-white/40 truncate">
              {viewedGroups.length} {viewedGroups.length === 1 ? "moment" : "moments"} you've already seen
            </p>
          </div>
          <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 text-white/30 shrink-0" fill="none" aria-hidden="true">
            <path
              d="M7.5 4.5 13 10l-5.5 5.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}