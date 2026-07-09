// import {
//   useState,
//   useEffect,
//   useCallback,
// } from "react";

// import {
//   getReactionStats,
//   reactToPost,
//   sharePost,
//   subscribeToPostReactions,
// } from "../api/reactionsApi";

// export default function useReactions(postId) {
//   const [stats, setStats] = useState({
//     smiles: 0,
//     shares: 0,
//     comments: 0,
//   });

//   const [loading, setLoading] =
//     useState(false);

//   //--------------------------------------------------
//   // Load latest stats
//   //--------------------------------------------------

//   const refresh = useCallback(async () => {
//     if (!postId) return;

//     try {
//       const data =
//         await getReactionStats(postId);

//       setStats(data);
//     } catch (err) {
//       console.error(err);
//     }
//   }, [postId]);

//   //--------------------------------------------------
//   // Initial load + realtime
//   //--------------------------------------------------

//   useEffect(() => {
//     if (!postId) return;

//     refresh();

//     const unsubscribe =
//       subscribeToPostReactions(
//         postId,
//         refresh
//       );

//     return unsubscribe;
//   }, [
//     postId,
//     refresh,
//   ]);

//   //--------------------------------------------------
//   // React
//   //--------------------------------------------------

//   const react =
//     useCallback(async (type) => {
//       try {
//         setLoading(true);

//         await reactToPost({
//           postId,
//           type,
//         });

//         await refresh();
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     }, [
//       postId,
//       refresh,
//     ]);

//   //--------------------------------------------------
//   // Share
//   //--------------------------------------------------

//   const share =
//     useCallback(async () => {
//       try {
//         await sharePost(postId);

//         await refresh();
//       } catch (err) {
//         console.error(err);
//       }
//     }, [
//       postId,
//       refresh,
//     ]);

//   return {

//     loading,

//     stats,

//     react,

//     share,

//     refresh,

//   };
// }

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getReactionStats,
  reactToPost,
} from "../../../../api/reactionsApi";

export default function useReactions(postId) {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["reactions", postId],
    queryFn: () => getReactionStats(postId),
    enabled: !!postId,
  });

  const mutation = useMutation({
    mutationFn: reactToPost,

    onMutate: async ({ type }) => {
      await queryClient.cancelQueries([
        "reactions",
        postId,
      ]);

      const prev =
        queryClient.getQueryData([
          "reactions",
          postId,
        ]);

      queryClient.setQueryData(
        ["reactions", postId],
        (old) => ({
          ...old,
          smiles: old.smiles + 1,
        })
      );

      return { prev };
    },

    onError: (_, __, ctx) => {
      queryClient.setQueryData(
        ["reactions", postId],
        ctx.prev
      );
    },
  });

  return {
    stats: data || {},
    react: (type) =>
      mutation.mutate({ postId, type }),
  };
}