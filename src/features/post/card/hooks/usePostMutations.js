import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../../supabaseClient";

export default function usePostMutations() {
  const queryClient = useQueryClient();

  // -------------------------
  // LIKE / REACTION
  // -------------------------
  const reactMutation = useMutation({
    mutationFn: async ({ postId, type }) => {
      const { error } = await supabase
        .from("reactions")
        .upsert({
          post_id: postId,
          type,
        });

      if (error) throw error;
    },

    // 🔥 OPTIMISTIC UPDATE
    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries(["feed"]);

      const previous = queryClient.getQueryData(["feed"]);

      queryClient.setQueryData(["feed"], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    reactions_count:
                      (post.reactions_count || 0) + 1,
                  }
                : post
            )
          ),
        };
      });

      return { previous };
    },

    // ❌ rollback if failed
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["feed"],
          context.previous
        );
      }
    },

    // ✅ ensure sync with server
    onSettled: () => {
      queryClient.invalidateQueries(["feed"]);
    },
  });

  // -------------------------
  // CREATE POST
  // -------------------------
  const createPostMutation = useMutation({
    mutationFn: async (newPost) => {
      const { data, error } = await supabase
        .from("posts")
        .insert(newPost)
        .select(`
          *,
          profiles(username, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data;
    },

    onSuccess: (post) => {
      queryClient.setQueryData(["feed"], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: [
            [post, ...old.pages[0]],
            ...old.pages.slice(1),
          ],
        };
      });
    },
  });

  return {
    react: reactMutation.mutate,
    createPost: createPostMutation.mutate,
    reacting: reactMutation.isPending,
  };
}