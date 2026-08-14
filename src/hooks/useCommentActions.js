import * as api from "../api/commentLikesApi";

export function useCommentActions(postId, setComments) {
  const toggleLike = async (commentId) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, likes: c.likes + 1 } // optimistic
          : c
      )
    );

    try {
      await api.toggleLike(commentId);
    } catch {
      // rollback
    }
  };

  return { toggleLike };
}