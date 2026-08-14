// studio/PublishProgress.jsx
//
// TikTok-style circular publish indicator: a centered ring overlay instead
// of an inline bar, since publishing is a modal moment (blocks interaction)
// rather than a background task like pausable file uploads.
//
// PROGRESS CAVEAT: this is simulated, not real network progress. Supabase's
// basic `storage.upload()` (what postsApi.createPost calls) is a plain
// fetch with no onUploadProgress hook, so there's no real byte count to
// read. useComposerSession ramps `progress` toward ~90% on an interval
// while the publish request is in flight, then snaps to 100 on success.
// If you move media uploads to Supabase's resumable (tus) upload, that DOES
// emit real progress events — swap the ramp in useComposerSession.publish
// for real numbers and this component needs no changes.
//
// DISMISS FLOW: on success we briefly show a checkmark as confirmation,
// then the center swaps to a tappable X. Tapping it (or the "Back to
// feed" button beneath it) calls onDone, which the parent uses to close
// the composer and return to the feed. It doesn't auto-dismiss on its
// own — the user decides when they're ready to leave the confirmation.

import React, { useEffect, useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CONFIRM_DISPLAY_MS = 700;

export default function PublishProgress({ status, progress, error, onRetry, onDone }) {
  const [confirmed, setConfirmed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (status !== "published") {
      setConfirmed(false);
      setDismissed(false);
      return;
    }
    const t = setTimeout(() => setConfirmed(true), CONFIRM_DISPLAY_MS);
    return () => clearTimeout(t);
  }, [status]);

  // Reset in case a brand new publish starts (e.g. user posts again)
  // while status briefly passes back through "publishing".
  useEffect(() => {
    if (status === "publishing") setDismissed(false);
  }, [status]);

  if (dismissed) return null;
  if (status !== "publishing" && status !== "error" && status !== "published") return null;

  const clamped = Math.max(0, Math.min(100, progress));
  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;
  const showDismiss = status === "published" && confirmed;

  // Close the overlay immediately, then let the parent do whatever it
  // wants with onDone (navigate, reset composer state, etc). We don't
  // rely on that navigation to hide the overlay — if the user's already
  // on the feed, a navigate("/feed") is a no-op and the overlay would
  // otherwise just sit there looking stuck.
  function handleDismiss() {
    setDismissed(true);
    onDone?.();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-28 h-28">
          <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
            <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke={status === "error" ? "#EF4444" : "#EAB308"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={status === "published" ? 0 : offset}
              className="transition-[stroke-dashoffset] duration-200 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {showDismiss ? (
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Back to feed"
                className="w-full h-full flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition"
              >
                <X className="text-white" size={32} />
              </button>
            ) : status === "published" ? (
              <Check className="text-yellow-400 animate-in zoom-in duration-200" size={32} />
            ) : status === "error" ? (
              <X className="text-red-400" size={28} />
            ) : (
              <span className="text-white text-lg font-semibold">{Math.round(clamped)}%</span>
            )}
          </div>
        </div>

        <p className="text-white text-sm font-medium">
          {status === "publishing" && "Publishing your vibe…"}
          {status === "published" && !showDismiss && "Published!"}
          {status === "published" && showDismiss && "Published! Tap to return to feed"}
          {status === "error" && (error || "Publish failed")}
        </p>

        {status === "error" && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2"
          >
            <RotateCcw size={14} /> Try again
          </button>
        )}

        {showDismiss && (
          <button
            type="button"
            onClick={handleDismiss}
            className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2"
          >
            <X size={14} /> Back to feed
          </button>
        )}
      </div>
    </div>
  );
}