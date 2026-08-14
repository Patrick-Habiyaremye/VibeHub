import { useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getBookmarks,
  addBookmark,
  removeBookmark,
} from "../../../../api/bookmarksApi";

export default function useBookmarks() {
  const queryClient = useQueryClient();

  //--------------------------------------------------
  // QUERY
  //--------------------------------------------------

  const { data = [] } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: getBookmarks,
    staleTime: 1000 * 60 * 5,
  });

  //--------------------------------------------------
  // DERIVED (OPTIMIZED)
  //--------------------------------------------------

  const bookmarkedIds = useMemo(
    () => new Set(data.map((b) => b.post_id)),
    [data]
  );

  //--------------------------------------------------
  // MUTATION
  //--------------------------------------------------

  const mutation = useMutation({
    mutationFn: async ({ postId, currentlyBookmarked }) => {
      if (currentlyBookmarked) {
        return removeBookmark(postId);
      } else {
        return addBookmark(postId);
      }
    },

    //--------------------------------------------------
    // OPTIMISTIC UPDATE
    //--------------------------------------------------

    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries(["bookmarks"]);

      const previous =
        queryClient.getQueryData(["bookmarks"]);

      queryClient.setQueryData(["bookmarks"], (old = []) => {
        const exists = old.some(
          (b) => b.post_id === postId
        );

        if (exists) {
          return old.filter((b) => b.post_id !== postId);
        }

        return [
          {
            id: `temp-${Date.now()}`,
            post_id: postId,
            created_at: new Date().toISOString(),
          },
          ...old,
        ];
      });

      return { previous };
    },

    //--------------------------------------------------
    // ROLLBACK
    //--------------------------------------------------

    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["bookmarks"],
          context.previous
        );
      }
    },

    //--------------------------------------------------
    // SYNC
    //--------------------------------------------------

    onSettled: () => {
      queryClient.invalidateQueries(["bookmarks"]);
    },
  });

  //--------------------------------------------------
  // PUBLIC API
  //--------------------------------------------------

  const toggleBookmark = (postId) => {
    const currentlyBookmarked =
      bookmarkedIds.has(postId);

    mutation.mutate({
      postId,
      currentlyBookmarked,
    });
  };

  return {
    bookmarks: data,
    bookmarkedIds,
    isBookmarked: (id) => bookmarkedIds.has(id),
    toggleBookmark,
    loading: mutation.isPending,
  };
}