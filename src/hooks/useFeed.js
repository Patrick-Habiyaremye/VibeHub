import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabaseClient";

const PAGE_SIZE = 10;

export default function useFeed() {
  const queryClient = useQueryClient();

  // -------------------------
  // QUERY
  // -------------------------
  const query = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles(username, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      return data ?? [];
    },

    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length; // next page index
    },

    staleTime: 1000 * 60,
  });

  // -------------------------
  // FLATTEN (SAFE)
  // -------------------------
  const feed =
    query.data?.pages.flatMap((page) => page) ?? [];

  // -------------------------
  // INSERT POST (DEDUP SAFE)
  // -------------------------
  const insertPost = (post) => {
    queryClient.setQueryData(["feed"], (old) => {
      if (!old) return old;

      // 🔥 GLOBAL dedup (not per-page)
      const allPosts = old.pages.flat();
      const exists = allPosts.some((p) => p.id === post.id);

      if (exists) return old;

      return {
        ...old,
        pages: [
          [post, ...(old.pages[0] || [])],
          ...old.pages.slice(1),
        ],
      };
    });
  };

  // -------------------------
  // RESET (REAL FIX)
  // -------------------------
  const resetFeed = () => {
    queryClient.removeQueries({ queryKey: ["feed"] });
  };

  // -------------------------
  // RETURN API
  // -------------------------
  return {
    feed,

    // pagination
    fetchMore: query.fetchNextPage,
    hasMore: query.hasNextPage,

    // loading states (granular)
    loadingInitial: query.isLoading,
    loadingMore: query.isFetchingNextPage,
    refreshing: query.isRefetching,

    // actions
    insertPost,
    resetFeed,
    refetch: query.refetch,
  };
}