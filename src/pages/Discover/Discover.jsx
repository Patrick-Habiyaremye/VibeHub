// pages/Discover/Discover.jsx
//
// CORRECTION to the previous pass: that version dropped the entire
// upload entry point (ReelUpload modal, UploadDock, useUploadSystemInit,
// and the header button that opens the modal) while restructuring the
// layout. ReelFeed still reads from useUploadQueueUI() and renders
// upload-in-progress cards inline, but with no way to start an upload,
// that queue could never be populated. Restored here.
//
// Layout note: the centered-column redesign has no header of its own,
// so the search input + upload trigger from the older version are back
// as a slim top bar spanning the full width, sitting above the
// feed+comments row rather than inside the column.
//
// activeReel/comments-panel ownership is unchanged from the last pass:
// ReelFeed owns activeIndex/scroll tracking and reports up via
// onActiveReelChange; Discover only decides whether the panel is open.

import { useCallback, useState } from "react";
import { Film, Upload } from "lucide-react";

import ReelFeed from "./ReelFeed";
import ReelUpload from "../../features/reels/ReelUpload";
import UploadDock from "../../features/reels/UploadDock";
import ReelCommentsPanel from "../../features/reels/ReelCommentsPanel";
import { useUploadSystemInit } from "../../hooks/useUploadSystemInit";

export default function Discover() {
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeReel, setActiveReel] = useState(null);
  const [showComments, setShowComments] = useState(false);

  useUploadSystemInit();

  const handleOpenUpload = useCallback(() => setUploadOpen(true), []);
  const handleCloseUpload = useCallback(() => setUploadOpen(false), []);

  const handleActiveReelChange = useCallback((reel) => {
    setActiveReel((prev) => (prev?.id === reel?.id ? prev : reel));
  }, []);

  const handleOpenComments = useCallback(() => {
    // Guard: don't open a panel with nothing to show yet (e.g. feed still
    // loading its first reel).
    setShowComments((prev) => (activeReel ? true : prev));
  }, [activeReel]);

  const handleCloseComments = useCallback(() => setShowComments(false), []);

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-black text-white">
      {/* TOP BAR — search + upload trigger. Spans full width; the reel
          column below it stays centered/fixed-width independently. */}
      <header className="h-16 flex items-center justify-between px-5 border-b border-white/10 backdrop-blur-md bg-black/60 sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-2 font-semibold tracking-wide">
          <Film size={20} />
          <span>Smile Reels</span>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="bg-white/10 px-3 py-1.5 rounded-md text-sm outline-none focus:ring-1 focus:ring-yellow-400 transition"
        />

        <button
          onClick={handleOpenUpload}
          className="flex items-center gap-2 bg-yellow-400 text-black px-3 py-1.5 rounded-md text-sm font-medium hover:bg-yellow-300 transition active:scale-95"
        >
          <Upload size={16} />
          Upload
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1 flex items-center justify-center min-w-0">
          <div className="h-full w-full md:max-w-[480px] md:my-4 md:rounded-2xl md:overflow-hidden">
            <ReelFeed
              search={search}
              onActiveReelChange={handleActiveReelChange}
              onOpenComments={handleOpenComments}
            />
          </div>
        </div>

        {/* Desktop-only sidebar. Never rendered on mobile — mobile
            comments are handled per-card by ReelCard's own CommentSection
            sheet. */}
        {showComments && activeReel && (
          <div className="hidden md:flex w-[360px] shrink-0 border-l border-white/10 bg-neutral-950">
            <ReelCommentsPanel reel={activeReel} onClose={handleCloseComments} />
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}
      <ReelUpload open={uploadOpen} onClose={handleCloseUpload} />

      {/* GLOBAL UPLOAD UI (PERSISTENT, MULTI-TAB SAFE) */}
      <UploadDock />
    </div>
  );
}