import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscribeToComments } from "../../../../api/commentsApi";

export default function useCommentsRealtime(postId) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!postId) return;

    const unsub = subscribeToComments(
      postId,
      (payload) => {
        const newComment = payload.new;

        queryClient.setQueryData(
          ["comments", postId],
          (old = []) => {
            if (old.find((c) => c.id === newComment.id))
              return old;

            return [newComment, ...old];
          }
        );
      }
    );

    return unsub;
  }, [postId]);
}