// features/reels/components/ReelViewer.jsx
//
// NEW FILE. The reusable immersive viewer — used by both ReelPage
// (single reel + optional sibling list) and, later, ReelFeed's own
// immersive-mode entry point if you want feed cards to expand into this
// same component instead of their own inline layout. All navigation
// inputs (wheel, keyboard, swipe, buttons, autoplay-end) call the SAME
// goNext/goPrevious from useReelNavigation — no per-input logic branches
// duplicate that decision, per §11.
//
// Keyboard shortcuts are suppressed while any input/textarea/
// contenteditable has focus (§12) by checking document.activeElement's
// tag, not by trying to guess at "is a modal open" — this is more
// reliable since it doesn't need to know about every overlay that might
// exist.

import { useEffect, useRef, useCallback } from "react";
import ReelPlayer from "./ReelPlayer";
import ReelActions from "./ReelActions";
import ReelProgress from "./ReelProgress";
import ReelMenu from "./ReelMenu";
import ReelViewerHeader from "./ReelViewerHeader";
import ReelViewerNavigation from "./ReelViewerNavigation";
import ReelInfo from "./ReelInfo";
import ReelCommentsPanel from "./ReelCommentsPanel";
import CommentSection from "../comments/components/CommentSection";
import { useReelNavigation } from "../../hooks/useReelNavigation";
import { useReelViewer } from "../../hooks/useReelViewer";
import useReelInteractions from "../../hooks/useReelInteractions";
import { useAuth } from "../../context/AuthContext";

function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName?.toLowerCase();
  return tag === "input" || tag === "textarea" || el.isContentEditable;
}

export default function ReelViewer({
  items,
  initialIndex = 0,
  onIndexChange,
  onDeleted,
  fallbackBackHref = "/",
  layout = "immersive", // "immersive" (ReelPage) — feed usage would pass its own chrome instead
}) {
  const { user } = useAuth();
  const { react } = useReelInteractions();

  const videoElRef = useRef(null);
  const setVideoRef = useCallback((el) => { videoElRef.current = el; }, []);

  const nav = useReelNavigation({ items, initialIndex, onIndexChange });
  const viewer = useReelViewer();

  const reel = nav.activeItem;
  const isOwner = !!user && !!reel && user.id === reel.user_id;

  // AUTOPLAY / MANUAL REPLAY (§32): video end always tries to advance;
  // if there's nowhere to advance to, ReelPlayer's own replay affordance
  // (native loop-on-click via its play/pause toggle) is what lets the
  // user manually replay instead of autoplay fighting them for control.
  const handleEnded = useCallback(() => {
    nav.goNext();
  }, [nav]);

  // NAVIGATION SOURCES — all funnel into nav.goNext/goPrevious (§11).
  useEffect(() => {
    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) < 20) return;
      if (e.deltaY > 0) nav.goNext();
      else nav.goPrevious();
    };

    const handleKeydown = (e) => {
      if (isTypingTarget(document.activeElement)) return;

      switch (e.key) {
        case "ArrowDown":
        case "w":
        case "W":
          e.preventDefault();
          nav.goNext();
          break;
        case "ArrowUp":
        case "s":
        case "S":
          e.preventDefault();
          nav.goPrevious();
          break;
        case " ":
          e.preventDefault();
          videoElRef.current?.paused ? videoElRef.current.play() : videoElRef.current?.pause();
          break;
        case "m":
        case "M":
          viewer.toggleMute();
          break;
        case "f":
        case "F":
          viewer.fullscreen.toggle();
          break;
        case "c":
        case "C":
          viewer.toggleComments();
          break;
        case "l":
        case "L":
          if (reel) react({ reelId: reel.id, reaction: "like" }).catch(() => {});
          break;
        case "b":
        case "B":
          if (reel) save({ reelId: reel.id, saved: true }).catch(() => {});
          break;
        case "Escape":
          if (viewer.menuOpen) viewer.setMenuOpen(false);
          else if (viewer.commentsOpen) viewer.closeComments();
          else if (viewer.fullscreen.isFullscreen) viewer.fullscreen.exit();
          break;
        default:
          break;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [nav, viewer, react, reel]);

  // [nav, viewer, react, save, reel]

  // MOBILE SWIPE (§13) — minimal, only active in immersive layout, since
  // the feed already gets this for free from native scroll-snap.
  const touchStartY = useRef(null);
  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e) => {
    if (touchStartY.current == null) return;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    touchStartY.current = null;
    if (Math.abs(deltaY) < 50) return; // ignore taps/small scrolls
    if (deltaY > 0) nav.goNext();
    else nav.goPrevious();
  };

  const handleShare = useCallback(async (targetReel) => {
    const shareUrl = `${window.location.origin}/reel/${targetReel.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Check out this VibeHub Reel", text: targetReel.content || "", url: shareUrl });
      } catch {
        // user cancelled — not an error
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (err) {
      console.error("Share failed:", err);
    }
  }, []);

  if (!reel) return null;

  const username = reel.user?.username || "unknown";
  const avatar = reel.user?.avatar || null;

  return (
    <div
      ref={viewer.fullscreen.containerRef}
      className="relative h-[100dvh] w-full bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <ReelViewerHeader
        creatorName={username}
        creatorAvatar={avatar}
        muted={viewer.muted}
        onToggleMute={viewer.toggleMute}
        fallbackHref={fallbackBackHref}
        menuTrigger={
          <ReelMenu
  isOwner={isOwner}
  reel={reel}
  hideImmersiveEntry   // already immersive — don't show the entry point to itself
  open={viewer.menuOpen}
  onOpenChange={viewer.setMenuOpen}
  onDeleted={onDeleted}
  onEnterFullscreen={viewer.fullscreen.enter}
  onOpenComments={viewer.openComments}
  onOpenFeedback={() => viewer.setFeedbackOpen(true)}
  onShare={() => handleShare(reel)}
/>
        }
      />

      <ReelPlayer
        src={reel.media?.url}
        poster={reel.media?.poster}
        videoWidth={reel.media?.width}
        videoHeight={reel.media?.height}
        isActive={true}
        preloadNext={nav.canGoNext}
        setVideoRef={setVideoRef}
        muted={viewer.muted}
        onEnded={handleEnded}
      />

      <ReelProgress videoRef={videoElRef} />

      <ReelInfo reel={reel} />

      <ReelActions
        reel={reel}
        onComment={viewer.toggleComments}
        onReact={react}
        onShare={() => handleShare(reel)}
        initialReaction={reel.myReaction ?? null}
      />

      <ReelViewerNavigation
        canGoPrevious={nav.canGoPrevious}
        canGoNext={nav.canGoNext}
        onPrevious={nav.goPrevious}
        onNext={nav.goNext}
      />

      {viewer.commentsOpen && (
        <>
          {/* Desktop: side panel. Mobile: sheet. Same source component
              either way, per §22 — no duplicate comment fetching. */}
          <div className="hidden md:flex absolute right-0 top-0 h-full w-[360px] z-40 bg-neutral-950 border-l border-white/10">
            <ReelCommentsPanel reel={reel} onClose={viewer.closeComments} />
          </div>
          <div className="md:hidden">
            <CommentSection
              contentType="reel"
              contentId={reel.id}
              ownerId={reel.user_id}
              variant="sheet"
              onClose={viewer.closeComments}
            />
          </div>
        </>
      )}
    </div>
  );
}