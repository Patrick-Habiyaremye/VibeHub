import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../../supabaseClient";

export default function useCommentMutations() {
  const queryClient = useQueryClient();

  const addComment = useMutation({
    mutationFn: async ({ postId, content }) => {
      const { data, error } = await supabase
        .from("comments")
        .insert({ post_id: postId, content })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // 🔥 OPTIMISTIC UPDATE (this is what you're missing)
    onMutate: async ({ postId, content }) => {
      await queryClient.cancelQueries(["comments", postId]);

      const previousComments = queryClient.getQueryData([
        "comments",
        postId,
      ]);

      const tempComment = {
        id: "temp-" + Date.now(),
        content,
        post_id: postId,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(
        ["comments", postId],
        (old = []) => [tempComment, ...old]
      );

      return { previousComments };
    },

    // ❌ rollback if failed
    onError: (_err, { postId }, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["comments", postId],
          context.previousComments
        );
      }
    },

    // ✅ sync real data + update feed
    onSuccess: (comment) => {
      queryClient.setQueryData(
        ["comments", comment.post_id],
        (old = []) => [
          comment,
          ...old.filter((c) => !c.id?.toString().startsWith("temp")),
        ]
      );

      // 🔥 sync feed count globally
      queryClient.setQueryData(["feed"], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((post) =>
              post.id === comment.post_id
                ? {
                    ...post,
                    comments_count:
                      (post.comments_count || 0) + 1,
                  }
                : post
            )
          ),
        };
      });
    },
  });

  return {
    addComment: addComment.mutate,
    adding: addComment.isPending,
  };
}