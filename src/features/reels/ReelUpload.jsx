// features/reels/ReelUpload.jsx
//
// Self-contained upload modal: gathers file + caption, then calls
// useUploadQueue().trigger() itself. It does NOT accept an onSubmit prop —
// the whole point of the Zustand-backed queue is that nothing needs to be
// manually threaded up to a parent; UploadDock and ReelFeed pick up new
// uploads reactively on their own. This matches how ReelPage.jsx already
// uses this component (just `open`/`onClose`, no onSubmit).
//
// Previously this called utils/uploadActions.enqueueUpload directly with
// a second "onUpdate" callback argument — enqueueUpload never accepted
// one; progress/status now flow through the global store instead of a
// per-call callback. It also had its own file-size/type constants (50MB,
// startsWith("video/")) that quietly disagreed with the authoritative
// checks in utils/validateFile.js (500MB, exact MIME allow-list, duration
// limit) — now sourced from the same utils/config.js so there's one
// definition of "what's a valid reel", not two that can drift apart.

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import useUploadQueue from "../../hooks/useUploadQueue";
import { VALIDATION } from "../../utils/config";

export default function ReelUpload({ open, onClose }) {
  const [video, setVideo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [localError, setLocalError] = useState("");

  const inputRef = useRef();
  const { user } = useAuth();
  const { trigger, isSubmitting, error: submitError } = useUploadQueue();

  const error = localError || submitError;

  const resetForm = useCallback(() => {
    setVideo(null);
    setCaption("");
    setPreview(null);
    setLocalError("");
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleClose = useCallback(() => {
    if (isSubmitting) return; // don't let ESC/backdrop cancel mid-submit
    resetForm();
    onClose();
  }, [isSubmitting, resetForm, onClose]);

  // ESC close — only listens while actually open
  useEffect(() => {
    if (!open) return;

    const handleKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, handleClose]);

  // cleanup preview object URL whenever it changes or unmounts
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  if (!open) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setLocalError("");

    if (!file) return;

    // Fast, cheap client-side pre-check for instant feedback. The
    // authoritative check (including duration, corruption) still runs
    // inside trigger() via utils/validateFile.js — this just avoids
    // showing a preview for something that will obviously be rejected.
    if (!VALIDATION.ALLOWED_TYPES.includes(file.type)) {
      setLocalError("Only MP4, MOV, or WebM video files are allowed.");
      return;
    }

    if (file.size > VALIDATION.MAX_BYTES) {
      const maxMB = Math.round(VALIDATION.MAX_BYTES / (1024 * 1024));
      setLocalError(`Max file size is ${maxMB}MB.`);
      return;
    }

    setVideo(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUploadClick = async () => {
    if (!video || isSubmitting) return;

    if (!user) {
      setLocalError("You must be signed in to upload.");
      return;
    }

    setLocalError("");

    try {
      await trigger({ file: video, caption, userId: user.id });
      resetForm();
      onClose();
    } catch (err) {
      // trigger() already captured err.message into submitError for
      // display; nothing else to do here besides keeping the modal open
      // so the user can see it and retry.
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* modal */}
      <div className="relative z-10 w-full max-w-lg bg-slate-800 p-6 rounded-xl text-white space-y-4 shadow-2xl">
        <h2 className="text-lg font-semibold">Upload Reel</h2>

        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          disabled={isSubmitting}
          className="block w-full text-sm disabled:opacity-50"
        />

        {preview && (
          <video
            src={preview}
            controls
            className="w-full rounded-lg max-h-80 object-cover"
          />
        )}

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={200}
          disabled={isSubmitting}
          placeholder="Share something meaningful..."
          className="w-full bg-slate-900 p-3 rounded-lg disabled:opacity-50"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex justify-between items-center">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-sm text-gray-400 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleUploadClick}
            disabled={!video || isSubmitting}
            className="bg-yellow-500 text-black px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {isSubmitting ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}