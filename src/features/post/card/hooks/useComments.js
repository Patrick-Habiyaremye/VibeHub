// import { useState, useEffect, useCallback } from "react";
// import {
//   getComments,
//   createComment,
//   subscribeToComments,
// } from "../api/commentsApi";

// export default function useComments(postId) {
//   const [comments, setComments] = useState([]);
//   const [cursor, setCursor] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [hasMore, setHasMore] = useState(true);

//   //--------------------------------------------------
//   // LOAD
//   //--------------------------------------------------

//   const loadMore = useCallback(async () => {
//     if (!postId || loading || !hasMore) return;

//     setLoading(true);

//     const data = await getComments({
//       postId,
//       cursor,
//       limit: 10,
//     });

//     setComments((prev) => {
//       const ids = new Set(prev.map((c) => c.id));
//       const merged = [...prev];

//       data.forEach((c) => {
//         if (!ids.has(c.id)) merged.push(c);
//       });

//       return merged;
//     });

//     if (data.length < 10) setHasMore(false);

//     if (data.length > 0) {
//       setCursor(data[data.length - 1].created_at);
//     }

//     setLoading(false);
//   }, [postId, cursor, loading, hasMore]);

//   //--------------------------------------------------
//   // CREATE (OPTIMISTIC)
//   //--------------------------------------------------

//   const addComment = async (content, parentId = null) => {
//     const tempId = "temp-" + Date.now();

//     const optimistic = {
//       id: tempId,
//       content,
//       parent_id: parentId,
//       profiles: { username: "You" },
//       created_at: new Date().toISOString(),
//       optimistic: true,
//     };

//     setComments((prev) => [optimistic, ...prev]);

//     try {
//       const real = await createComment({
//         postId,
//         content,
//         parentId,
//       });

//       setComments((prev) =>
//         prev.map((c) => (c.id === tempId ? real : c))
//       );
//     } catch {
//       setComments((prev) =>
//         prev.filter((c) => c.id !== tempId)
//       );
//     }
//   };

//   //--------------------------------------------------
//   // REALTIME (SAFE MERGE)
//   //--------------------------------------------------

//   useEffect(() => {
//     if (!postId) return;

//     const unsub = subscribeToComments(postId, (payload) => {
//       const newComment = payload.new;

//       setComments((prev) => {
//         if (prev.find((c) => c.id === newComment.id)) return prev;
//         return [newComment, ...prev];
//       });
//     });

//     return unsub;
//   }, [postId]);

//   return {
//     comments,
//     loading,
//     hasMore,
//     loadMore,
//     addComment,
//   };
// }


import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getComments,
  createComment,
} from "../../../../api/commentsApi";

export default function useComments(postId) {
  const queryClient = useQueryClient();

  //--------------------------------------------------
  // QUERY
  //--------------------------------------------------

  const query = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getComments({ postId }),
    enabled: !!postId,
  });

  //--------------------------------------------------
  // MUTATION (OPTIMISTIC)
  //--------------------------------------------------

  const mutation = useMutation({
    mutationFn: createComment,

    onMutate: async (newComment) => {
      await queryClient.cancelQueries(["comments", postId]);

      const prev =
        queryClient.getQueryData([
          "comments",
          postId,
        ]);

      const optimistic = {
        id: "temp-" + Date.now(),
        content: newComment.content,
        profiles: { username: "You" },
      };

      queryClient.setQueryData(
        ["comments", postId],
        (old = []) => [optimistic, ...old]
      );

      return { prev };
    },

    onError: (err, _, context) => {
      queryClient.setQueryData(
        ["comments", postId],
        context.prev
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries([
        "comments",
        postId,
      ]);
    },
  });

  return {
    comments: query.data || [],
    loading: query.isLoading,
    addComment: (content) =>
      mutation.mutate({
        postId,
        content,
      }),
  };
}