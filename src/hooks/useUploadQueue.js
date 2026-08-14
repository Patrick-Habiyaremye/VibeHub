// hooks/useUploadQueue.js
//
// Entry point for starting a new upload. This is deliberately thin — all
// the real work (validate → save file → thumbnail → compress → persist →
// show in queue) already lives in utils/uploadActions.js. Reimplementing
// any of that here (as the previous version did) means drifting out of
// sync with it — e.g. the previous version never called saveFile(), so
// resuming after a refresh would break, and never called the Zustand
// store's enqueue(), so new uploads wouldn't appear in the UI until a
// reload triggered restoreQueue().

import { useState, useCallback } from "react";
import { enqueueUpload } from "../utils/uploadActions";
import { supabase } from "../supabaseClient";

export default function useUploadQueue() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const trigger = useCallback(async ({ file, caption, userId }) => {
    setError(null);
    setIsSubmitting(true);

    try {
      let resolvedUserId = userId;

      if (!resolvedUserId) {
        const { data, error: authError } = await supabase.auth.getUser();
        if (authError || !data?.user) {
          throw new Error("You must be signed in to upload.");
        }
        resolvedUserId = data.user.id;
      }

      // Throws with a user-facing message if the file fails validation
      // (wrong type, too large, too long, corrupt) — let it propagate so
      // the caller can decide how to surface it, but also capture it here
      // for convenience.
      const id = await enqueueUpload({ file, caption, userId: resolvedUserId });
      return id;
    } catch (err) {
      setError(err.message || "Upload failed to start.");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { trigger, isSubmitting, error };
}