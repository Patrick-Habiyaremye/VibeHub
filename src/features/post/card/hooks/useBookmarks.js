// import { useState, useEffect, useCallback } from "react";
// import {
//   getBookmarks,
//   toggleBookmark,
// } from "../api/bookmarksApi";

// export default function useBookmarks() {
//   const [bookmarks, setBookmarks] = useState(new Set());
//   const [loading, setLoading] = useState(false);

//   //--------------------------------------------------
//   // LOAD
//   //--------------------------------------------------

//   useEffect(() => {
//     (async () => {
//       const data = await getBookmarks();
//       setBookmarks(new Set(data.map((b) => b.post_id)));
//     })();
//   }, []);

//   //--------------------------------------------------
//   // TOGGLE (OPTIMISTIC)
//   //--------------------------------------------------

//   const toggle = useCallback(async (postId) => {
//     setBookmarks((prev) => {
//       const next = new Set(prev);
//       next.has(postId) ? next.delete(postId) : next.add(postId);
//       return next;
//     });

//     try {
//       await toggleBookmark(postId);
//     } catch {
//       // rollback
//       setBookmarks((prev) => {
//         const next = new Set(prev);
//         next.has(postId)
//           ? next.delete(postId)
//           : next.add(postId);
//         return next;
//       });
//     }
//   }, []);

//   return {
//     bookmarks,
//     toggleBookmark: toggle,
//     isBookmarked: (id) => bookmarks.has(id),
//     loading,
//   };
// }


// import {
//   useQuery,
//   useMutation,
//   useQueryClient,
// } from "@tanstack/react-query";

// import {
//   getBookmarks,
//   toggleBookmark,
// } from "../../../../api/bookmarksApi";

// export default function useBookmarks() {
//   const queryClient = useQueryClient();

//   const { data = [] } = useQuery({
//     queryKey: ["bookmarks"],
//     queryFn: getBookmarks,
//   });

//   const mutation = useMutation({
//     mutationFn: toggleBookmark,

//     onMutate: async (postId) => {
//       await queryClient.cancelQueries(["bookmarks"]);

//       const prev =
//         queryClient.getQueryData(["bookmarks"]);

//       queryClient.setQueryData(
//         ["bookmarks"],
//         (old = []) => {
//           const exists = old.includes(postId);
//           return exists
//             ? old.filter((id) => id !== postId)
//             : [...old, postId];
//         }
//       );

//       return { prev };
//     },

//     onError: (_, __, ctx) => {
//       queryClient.setQueryData(
//         ["bookmarks"],
//         ctx.prev
//       );
//     },
//   });

//   return {
//     bookmarks: data,
//     toggleBookmark: mutation.mutate,
//     isBookmarked: (id) =>
//       data.includes(id),
//   };
// }

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