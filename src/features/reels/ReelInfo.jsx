// features/reels/components/ReelInfo.jsx
//
// NEW FILE. Composes the existing ReelSidebar (creator/caption/hashtags —
// unchanged, still the single source of truth for that UI) with the new
// ReelVibe badge, so ReelViewer has one thing to render instead of two.
// Not a rewrite of ReelSidebar — just where the Vibe badge plugs in.

import { memo } from "react";
import ReelSidebar from "./ReelSidebar";
import ReelVibe from "./ReelVibe";

function ReelInfo({ reel }) {
  if (!reel) return null;

  return (
    <div className="relative">
      <ReelSidebar reel={reel} />
      {reel.tags?.length > 0 && (
        <div className="absolute bottom-6 right-24 z-20">
          <ReelVibe tags={reel.tags} />
        </div>
      )}
    </div>
  );
}

export default memo(ReelInfo);