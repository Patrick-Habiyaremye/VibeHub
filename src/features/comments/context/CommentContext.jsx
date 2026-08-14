// src/features/comments/context/CommentContext.jsx
//
// Owns auth (via useAuth) internally now — nothing above this needs to
// pass currentUser down. ownerId is the content's author (needed for
// "new comment" notifications) and ISN'T derivable from auth, so it's
// still a required prop from whoever renders CommentSection.

import { createContext, useContext, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { SORT_OPTIONS } from "../constants/comment.constants";

const CommentContext = createContext(null);

export function CommentProvider({ contentType, contentId, ownerId, children }) {
  const { user } = useAuth();
  const [sort, setSort] = useState(SORT_OPTIONS.NEWEST);

  const value = useMemo(
    () => ({ contentType, contentId, ownerId, currentUser: user, sort, setSort }),
    [contentType, contentId, ownerId, user, sort]
  );

  return <CommentContext.Provider value={value}>{children}</CommentContext.Provider>;
}

export function useCommentContext() {
  const ctx = useContext(CommentContext);
  if (!ctx) {
    throw new Error("useCommentContext must be used inside CommentProvider.");
  }
  return ctx;
}