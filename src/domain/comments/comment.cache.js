import { create } from "zustand";

export const useCommentStore = create((set) => ({
  commentsByPost: {},

  setComments: (postId, comments) =>
    set((state) => ({
      commentsByPost: {
        ...state.commentsByPost,
        [postId]: comments,
      },
    })),

  addComment: (postId, comment) =>
    set((state) => ({
      commentsByPost: {
        ...state.commentsByPost,
        [postId]: [comment, ...(state.commentsByPost[postId] || [])],
      },
    })),

  updateComment: (postId, comment) =>
    set((state) => ({
      commentsByPost: {
        ...state.commentsByPost,
        [postId]: state.commentsByPost[postId].map((c) =>
          c.id === comment.id ? comment : c
        ),
      },
    })),

  removeComment: (postId, id) =>
    set((state) => ({
      commentsByPost: {
        ...state.commentsByPost,
        [postId]: state.commentsByPost[postId].filter(
          (c) => c.id !== id
        ),
      },
    })),
}));