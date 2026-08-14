//C:\code\KeshApp\VibeHub\src\pages\SmileMomentsPage.jsx

import { useNavigate } from "react-router-dom";
import CreateSmileMoment from "./CreateSmileMoment";
import SmileMomentCard from "./SmileMomentCard";
import { useMoments } from "./MomentsProvider";

const LIVE_GRADIENT = "linear-gradient(135deg, #FFB238, #FF3D77)";

// ---------------------------------------------------------------------------
// The full archive: everything that's on the compact feed row (Recent),
// plus everything that isn't (Viewed). Deliberately laid out differently
// from the feed — a wrapping grid instead of a horizontal scroller, bigger
// rings — so this reads as its own destination, not a longer version of the
// same widget.
//
// Wired directly as a route with zero props needed:
//   <Route path="moments" element={<SmileMomentsPage />} />
// (must be nested inside the same route tree as <MomentsRoot>/<MomentsProvider>)
// onBack only needs to be passed if you want to override the default
// navigate(-1) — e.g. if this is ever rendered outside routing as a modal.
// ---------------------------------------------------------------------------

export default function SmileMomentsPage({ onBack }) {
  const navigate = useNavigate();
  const { user, loading, recentGroups, viewedGroups, viewedIds, recentlyMovedUserIds, openMoment, handleCreated } =
    useMoments();
  const goBack = onBack || (() => navigate(-1));

  const isEmpty = !loading && recentGroups.length === 0 && viewedGroups.length === 0;

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white">
      {/* Ambient backdrop — same brand gradient as the rings, subdued into
          a wash so the page feels like a continuation of the feed, not a
          different app. */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-72 opacity-[0.14] blur-3xl"
        style={{ background: "radial-gradient(60% 60% at 50% 0%, #FF3D77, transparent)" }}
        aria-hidden="true"
      />

      <header className="relative z-10 flex items-center gap-3 px-4 pt-5 pb-4 max-w-3xl mx-auto">
        <button
          onClick={goBack}
          aria-label="Back"
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors shrink-0"
        >
          <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" aria-hidden="true">
            <path
              d="M12.5 15 7 10l5.5-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight">Moments</h1>
          <p className="text-xs text-white/40">Everything shared today, in one place</p>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 pb-16 space-y-8">
        {user && (
          <section>
            <CreateSmileMoment user={user} onCreated={handleCreated} />
          </section>
        )}

        {loading && (
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-[92px] h-[92px] rounded-full bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {isEmpty && (
          <div className="flex flex-col items-center text-center gap-2 py-16">
            <div
              className="w-14 h-14 rounded-full mb-2"
              style={{ background: LIVE_GRADIENT, opacity: 0.25 }}
              aria-hidden="true"
            />
            <p className="text-white/70 font-medium">No moments yet</p>
            <p className="text-sm text-white/40 max-w-xs">
              When people share a smile moment, it'll show up here — recent ones first, watched ones after.
            </p>
          </div>
        )}

        {recentGroups.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                <span
                  className="absolute inline-flex h-full w-full rounded-full animate-vh-recent-ping motion-reduce:animate-none"
                  style={{ background: LIVE_GRADIENT }}
                />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: LIVE_GRADIENT }} />
              </span>
              <h2 className="text-sm font-semibold uppercase tracking-wide">Recent</h2>
              <span className="text-xs text-white/40">{recentGroups.length}</span>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-5">
              {recentGroups.map((group, i) => (
                <div
                  key={group[0].user_id}
                  className="vh-stagger-in"
                  style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
                >
                  <SmileMomentCard
                    group={group}
                    seen={group.every((m) => viewedIds.has(m.id))}
                    onClick={() => openMoment(group[0].user_id)}
                    size="lg"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {viewedGroups.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 text-white/35" fill="none" aria-hidden="true">
                <path
                  d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
                <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.4" />
              </svg>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">Viewed</h2>
              <span className="text-xs text-white/25">{viewedGroups.length}</span>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-5 opacity-90">
              {viewedGroups.map((group) => {
                const userId = group[0].user_id;
                const justMoved = recentlyMovedUserIds.has(userId);
                return (
                  <div key={userId} className={justMoved ? "vh-move-to-viewed" : ""}>
                    <SmileMomentCard group={group} seen={true} onClick={() => openMoment(userId)} size="lg" />
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <style>{`
        @keyframes vh-recent-ping {
          0% { transform: scale(1); opacity: 0.75; }
          75%, 100% { transform: scale(2.4); opacity: 0; }
        }
        .animate-vh-recent-ping { animation: vh-recent-ping 1.8s cubic-bezier(0,0,0.2,1) infinite; }

        @keyframes vh-move-to-viewed {
          0% { opacity: 0; transform: translateY(-8px) scale(0.9); filter: blur(3px); }
          55% { opacity: 1; transform: translateY(1px) scale(1.02); filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .vh-move-to-viewed { animation: vh-move-to-viewed 0.5s cubic-bezier(0.22,1,0.36,1); }

        @keyframes vh-stagger-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .vh-stagger-in { animation: vh-stagger-in 0.35s ease-out both; }
      `}</style>
    </div>
  );
}