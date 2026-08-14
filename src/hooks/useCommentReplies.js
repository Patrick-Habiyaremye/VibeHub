import { useState, useEffect } from "react";
import * as service from "../domain/comments/comment.service";

export function useCommentReplies(commentId) {
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    service.getReplies(commentId).then(setReplies);
  }, [commentId]);

  return { replies };
}