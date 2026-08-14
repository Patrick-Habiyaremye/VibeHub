// features/reels/hooks/useReelViewer.js
//
// NEW FILE. Single source of truth for viewer-level UI state, as
// distinct from playback state (owned by ReelPlayer) and navigation
// state (owned by useReelNavigation). Deliberately does NOT own `muted`
// — useMutePreference already owns that globally, and duplicating it
// here would create exactly the second mute source of truth the spec
// prohibits (§16/§17). This hook just re-exposes it alongside the state
// that IS local to "is the viewer chrome open right now."

import { useState, useCallback } from "react";
import { useMutePreference } from "./useMutePreference";
import { useReelFullscreen } from "./useReelFullscreen";

export function useReelViewer() {
  const { muted, setMuted } = useMutePreference();
  const fullscreen = useReelFullscreen();

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const toggleMute = useCallback(() => setMuted(!muted), [muted, setMuted]);
  const openComments = useCallback(() => setCommentsOpen(true), []);
  const closeComments = useCallback(() => setCommentsOpen(false), []);
  const toggleComments = useCallback(() => setCommentsOpen((v) => !v), []);

  return {
    muted,
    toggleMute,
    fullscreen,
    commentsOpen,
    openComments,
    closeComments,
    toggleComments,
    menuOpen,
    setMenuOpen,
    feedbackOpen,
    setFeedbackOpen,
  };
}