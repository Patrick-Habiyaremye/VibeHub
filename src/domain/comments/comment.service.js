import * as commentsApi from "../../api/commentsApi";
import { normalizeComment, normalizeListResponse } from "./comment.mapper";

export async function getComments({ postId, reelId, cursor }) {
  let res;

  if (postId) {
    res = await commentsApi.getComments({ postId, cursor });
  } else {
    res = await commentsApi.getReelComments({ reelId, cursor });
  }

  return {
    data: normalizeListResponse(res.data),
    nextCursor: res.nextCursor ?? null,
  };
}

export async function createComment({ postId, reelId, content }) {
  let res;

  if (postId) {
    res = await commentsApi.createComment({ postId, content });
  } else {
    res = await commentsApi.createReelComment({ reelId, content });
  }

  return normalizeComment(res);
}

export async function deleteComment({ id, postId, reelId }) {
  if (postId) {
    return commentsApi.deleteComment(id);
  } else {
    return commentsApi.deleteReelComment(id);
  }
}