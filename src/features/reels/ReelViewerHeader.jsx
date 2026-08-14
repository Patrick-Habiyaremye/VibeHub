// features/reels/components/ReelViewerHeader.jsx
//
// NEW FILE. Back + creator context + mute + menu trigger, per spec §26.
// Back falls back to a safe route when there's no navigation history to
// go back to (e.g. a direct /reel/:id link opened in a new tab) — using
// window.history.state?.idx, which react-router v6's data/browser router
// sets on every entry it creates, as the signal for "did we get here by
// navigating within the app." NOTE: fallbackHref is a prop, not hardcoded
// here, since I don't yet have your router config to know the canonical
// discover route path — wire the real one in when you pass it down.

import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";

function ReelViewerHeader({
  creatorName,
  creatorAvatar,
  muted,
  onToggleMute,
  menuTrigger, // the <ReelMenu /> element itself, rendered by the parent
  fallbackHref = "/",
}) {
  const navigate = useNavigate();

  const hasHistory = typeof window !== "undefined" && window.history.state?.idx > 0;

  const handleBack = () => {
    if (hasHistory) {
      navigate(-1);
    } else {
      navigate(fallbackHref);
    }
  };

  return (
    <header className="absolute top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-[calc(env(safe-area-inset-top,0px)+0.75rem)] bg-gradient-to-b from-black/60 to-transparent">
      <button
        type="button"
        onClick={handleBack}
        aria-label="Back"
        className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10 transition"
      >
        <ArrowLeft size={20} />
      </button>

      {creatorName && (
        <div className="flex items-center gap-2 text-white text-sm font-medium truncate px-2">
          {creatorAvatar && (
            <img
              src={creatorAvatar}
              alt=""
              className="h-6 w-6 rounded-full object-cover border border-white/20"
            />
          )}
          <span className="truncate max-w-[140px]">@{creatorName}</span>
        </div>
      )}

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          aria-pressed={!muted}
          className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10 transition"
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {menuTrigger}
      </div>
    </header>
  );
}

export default memo(ReelViewerHeader);