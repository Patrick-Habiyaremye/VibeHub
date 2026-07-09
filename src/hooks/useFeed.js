import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabaseClient";

const PAGE_SIZE = 10;

export default function useFeed() {
  const queryClient = useQueryClient();

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

      return data;
    },

    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },

    staleTime: 1000 * 60,
  });

  // 🔥 Flatten pages
  const feed = query.data?.pages.flat() ?? [];

  // -------------------------
  // INSERT POST (CACHE LEVEL)
  // -------------------------
  const insertPost = (post) => {
    queryClient.setQueryData(["feed"], (old) => {
      if (!old) return old;

      // prevent duplicates
      const exists = old.pages.some((page) =>
        page.some((p) => p.id === post.id)
      );
      if (exists) return old;

      return {
        ...old,
        pages: [
          [post, ...old.pages[0]],
          ...old.pages.slice(1),
        ],
      };
    });
  };

  return {
    feed,
    fetchMore: query.fetchNextPage,
    hasMore: query.hasNextPage,
    loading: query.isFetching,
    insertPost,
    refetch: query.refetch,
  };
}