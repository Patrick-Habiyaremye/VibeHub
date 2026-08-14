// FILE: src/components/card/hooks/useShare.js

import { useCallback, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { sharePost } from "../../../../api/reactionsApi";

export default function useShare(postId) {
  const { user } = useAuth();
  const [sharing, setSharing] = useState(false);

  const share = useCallback(async () => {
    if (!postId || sharing) return;
    setSharing(true);
    try {
      // Native share sheet first (best UX); record the event regardless
      // of whether the user completes it, once they've triggered it.
      if (navigator.share) {
        await navigator.share({ url: `${window.location.origin}/posts/${postId}` });
      }
      if (user) {
        await sharePost(postId);
      }
    } catch (err) {
      // AbortError = user cancelled the native share sheet — not an error.
      if (err?.name !== "AbortError") {
        console.error("Share failed:", err);
      }
    } finally {
      setSharing(false);
    }
  }, [postId, sharing, user]);

  return { share, sharing };
}