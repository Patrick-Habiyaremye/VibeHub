// utils/resumableUploader.js
//
// Thin wrapper around tus-js-client for uploading to Supabase's resumable
// storage endpoint. Returns the raw tus.Upload instance so callers
// (uploadWorker.js) can drive pause (`.abort()`), resume (`.start()`), and
// cancel (`.abort(true)`) directly.

import * as tus from "tus-js-client";
import { CHUNKING, RETRY_DELAYS_MS } from "./config";
import { supabase } from "../supabaseClient";

function chunkSizeForConnection() {
  const effectiveType = navigator.connection?.effectiveType;
  switch (effectiveType) {
    case "slow-2g":
    case "2g":
      return CHUNKING.MIN_BYTES;
    case "3g":
      return CHUNKING.MID_BYTES;
    default:
      // 4g or unknown — assume decent bandwidth and go big; tus will still
      // back off via retryDelays if this turns out to be too aggressive.
      return CHUNKING.MAX_BYTES;
  }
}

export function createResumableUpload({
  file,
  path,
  id,
  onProgress,
  onSuccess,
  onError,
}) {
  return new tus.Upload(file, {
    endpoint: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/upload/resumable`,

    headers: {
      "x-upsert": "true",
    },

    // Supabase Storage's row-level security policies run in Postgres
    // against auth.uid(), which is only populated when the request is
    // authenticated as an actual signed-in user — not the anon key.
    // Sending the anon key as the bearer token (as this previously did)
    // makes every request run as Postgres's anonymous role, so any
    // owner-scoped RLS policy on storage.objects rejects it outright,
    // regardless of path or who's actually signed in — this is what
    // produced "new row violates row-level security policy" no matter
    // what else was correct.
    //
    // Fetching the session fresh in onBeforeRequest (rather than once,
    // up front) also means a long-running or paused-then-resumed upload
    // keeps working even if the original access token has since expired
    // and been refreshed by supabase-js in the background.
    onBeforeRequest: async (req) => {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      // apikey identifies the project; Authorization identifies the
      // acting user. Supabase's storage gateway wants both.
      req.setHeader("apikey", import.meta.env.VITE_SUPABASE_ANON_KEY);
      if (token) {
        req.setHeader("authorization", `Bearer ${token}`);
      }
      // If there's no session (signed out mid-upload), we deliberately
      // don't fall back to the anon key here — better to fail with a
      // clear RLS/auth error the user can retry after signing back in
      // than to silently upload as the wrong identity.
    },

    metadata: {
      bucketName: "reels",
      objectName: path,
      contentType: file.type,
    },

    chunkSize: chunkSizeForConnection(),

    retryDelays: RETRY_DELAYS_MS,

    // Include the upload id (not just name/size/lastModified) so two
    // different queue items that happen to reference the same underlying
    // File object (e.g. retry-with-same-blob) never share a resume slot.
    fingerprint: async (file, options) =>
      `${id}-${path}-${file.name}-${file.size}-${file.lastModified}`,

    // Clean up tus's own localStorage bookkeeping once we're done so it
    // doesn't accumulate forever across many uploads.
    removeFingerprintOnSuccess: true,

    onError,

    onProgress(bytesUploaded, bytesTotal) {
      if (!bytesTotal) return;
      const percent = Math.floor((bytesUploaded / bytesTotal) * 100);
      onProgress(percent, { bytesUploaded, bytesTotal });
    },

    onSuccess,
  });
}

/**
 * Look up and resume a previous (paused/interrupted) upload for this
 * Upload instance, if one exists. Returns true if a previous upload was
 * found and resumed.
 */
export async function resumeIfPossible(upload) {
  const previous = await upload.findPreviousUploads();
  if (previous.length) {
    upload.resumeFromPreviousUpload(previous[0]);
    return true;
  }
  return false;
}