import { normalizeComment } from "./comment.mapper";
import * as commentsApi from "../../api/commentsApi";

export function subscribeToComments({ postId, reelId }, cb) {
  const handler = (event) => {
    const { type, new: newRow, old: oldRow } = event;

    if (type === "INSERT") {
      cb({ type, comment: normalizeComment(newRow) });
    }

    if (type === "DELETE") {
      cb({ type, id: oldRow.id });
    }

    if (type === "UPDATE") {
      cb({ type, comment: normalizeComment(newRow) });
    }
  };

  if (postId) {
    return commentsApi.subscribeToComments(postId, handler);
  }

  if (reelId) {
    return commentsApi.subscribeToReelComments(reelId, handler);
  }
}