// api/contentApi.js

import * as postsApi from "./postsApi";
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
    // REELS
    //-----------------------------------

    getReels: reelsApi.getReels,
    getReel: reelsApi.getReel,
    uploadReel: reelsApi.uploadReel,
    deleteReel: reelsApi.deleteReel,
    updateReel: reelsApi.updateReel,

};