// api/contentApi.js

import * as postsApi from "./postsApi";
import * as commentsApi from "./commentsApi";
import * as reelsApi from "./reelsApi";

export const ContentApi = {
  //-----------------------------------
  // POSTS
  //-----------------------------------
  getPosts: postsApi.getPosts,
  createPost: postsApi.createPost,
  deletePost: postsApi.deletePost,
  updatePost: postsApi.updatePost,

  //-----------------------------------
  // POST COMMENTS
  //-----------------------------------
  getPostComments: commentsApi.getComments,
  createPostComment: commentsApi.createComment,
  deletePostComment: commentsApi.deleteComment,
  getPostCommentReplies: commentsApi.getReplies,
  subscribeToPostComments: commentsApi.subscribeToComments,

  //-----------------------------------
  // REELS
  //-----------------------------------
  getReels: reelsApi.getReels,
  getReel: reelsApi.getReel,
  uploadReel: reelsApi.uploadReel,
  deleteReel: reelsApi.deleteReel,
  updateReel: reelsApi.updateReel,
};