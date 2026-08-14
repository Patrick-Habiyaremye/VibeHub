// features/reels/components/ReelViewerNavigation.jsx
//
// NEW FILE. Desktop-only prev/next controls (§27) — mobile relies on
// swipe, so this renders nothing below md breakpoint. Deliberately
// "subtle": no dominant chrome, just enough to be discoverable via
// hover/focus. Disabled state (not hidden) when unavailable, since
// disappearing-and-reappearing controls near a fixed layout position
// cause more layout shift than a dimmed button does.

import { memo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

function ReelViewerNavigation({ canGoPrevious, canGoNext, onPrevious, onNext }) {
  return (
    <div className="hidden md:flex flex-col gap-3 absolute right-4 top-1/2 -translate-y-1/2 z-30">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        aria-label="Previous reel"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronUp size={20} />
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Next reel"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronDown size={20} />
      </button>
    </div>
  );
}

export default memo(ReelViewerNavigation);