// features/reels/pages/ReelPage.jsx
//
// NEW FILE. Route-level immersive experience per §24. Loads via
// ContentApi.getReel(reelId) — the existing single-reel API — never the
// full feed. If the user arrived here by clicking "Open reel" from
// ReelFeed (not a cold direct link), ReelCard/ReelFeed can pass the
// already-loaded reel list via router state so prev/next work
// immediately; a cold direct link (no state) correctly has no siblings
// to navigate to — that's the honest state, not a bug, per §24 ("do not
// fetch the entire feed just to display one reel").
//
// fallbackBackHref is hardcoded to "/discover" as a placeholder — I do
// not have your router config to confirm this is the real path. VERIFY
// this against your actual route for the Discover page before shipping;
// a wrong value here silently breaks Back on any direct link.

import { useEffect, useState, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import ReelViewer from "./ReelViewer";
import { ContentApi } from "../../api/contentApi";

const FALLBACK_BACK_HREF = "/discover"; // ⚠️ VERIFY against real router config

export default function ReelPage() {
  const { reelId } = useParams();
  const location = useLocation();

  // Optional: ReelFeed/ReelCard can navigate here with
  // navigate(`/reel/${id}`, { state: { reels, index } }) to preserve
  // prev/next context. Absent that, this page loads just the one reel.
  const preloaded = location.state?.reels;
  const preloadedIndex = location.state?.index ?? 0;

  const [status, setStatus] = useState(preloaded ? "ready" : "loading"); // loading | ready | error | not_found
  const [reel, setReel] = useState(preloaded ? preloaded[preloadedIndex] : null);

  useEffect(() => {
    if (preloaded) return; // already have it from navigation state

    let cancelled = false;
    setStatus("loading");

    ContentApi.getReel(reelId)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setStatus("not_found");
          return;
        }
        setReel(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("ReelPage: failed to load reel", err);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [reelId, preloaded]);

  const items = useMemo(() => preloaded ?? (reel ? [reel] : []), [preloaded, reel]);

  if (status === "loading") {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-black">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  if (status === "not_found") {
    return (
      <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-3 bg-black text-white">
        <AlertCircle size={40} className="text-white/50" />
        <p className="text-white/70">This reel doesn't exist or was removed.</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-3 bg-black text-white">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-white/70">Couldn't load this reel.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <ReelViewer
      items={items}
      initialIndex={preloaded ? preloadedIndex : 0}
      fallbackBackHref={FALLBACK_BACK_HREF}
    />
  );
}