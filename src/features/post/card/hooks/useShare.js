import { useCallback } from "react";
import { sharePost } from "../../../../api/reactionsApi";

export default function useShare() {
  const share = useCallback(async (postId) => {
    try {
      await sharePost(postId);

      if (navigator.share) {
        await navigator.share({
          url: window.location.href,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  return { share };
}