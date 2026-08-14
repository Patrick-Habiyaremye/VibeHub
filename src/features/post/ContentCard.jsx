// FILE: src/components/post/ContentCard.jsx

import React, { useState, useCallback, useEffect, memo } from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { deletePost } from "../../services/postService";

import CardHeader from "./card/CardHeader";
import MediaRenderer from "./MediaRenderer";
import { ReactionBar } from "../../features/reactions";

import SaveButton from "./card/SaveButton";
import ShareButton from "./card/ShareButton";
import SupportButton from "./card/SupportButton";
import ReportButton from "./card/ReportButton";

import ContentSkeleton from "./card/ContentSkeleton";
import ContentError from "./card/ContentError";

import { CommentSection } from "../../features/comments";
import { resolveQuoteBackground } from "../../features/post/create/engines/StyleEngine";

import useIntersectionAnimation from "./card/hooks/useIntersectionAnimation";
import useShare from "./card/hooks/useShare";
import useReports from "./card/hooks/useReports";
import useKeyboardActions from "./card/hooks/useKeyboardActions";

const QUOTE_SERIF = { fontFamily: "'Fraunces', Georgia, serif" };

function ContentCard({ post, isActive = false, priority = false, onDeleted }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showComments, setShowComments] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const { ref, isVisible } = useIntersectionAnimation({ rootMargin: "600px" });

  // Single ownership of each cross-cutting concern — no duplicate hooks.
  const share = useShare(post?.id);
  const reports = useReports(post?.id, "post");

  const canDelete = !!user && user.id === post?.user_id;
  const isSelf = !!user && user.id === post?.user_id;

  const handleDelete = useCallback(async () => {
    if (!post?.id || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deletePost(post.id);
      onDeleted?.(post.id);
      setConfirmDelete(false);
    } catch (err) {
      setDeleteError(err.message || "Failed to delete post.");
    } finally {
      setDeleting(false);
    }
  }, [post?.id, deleting, onDeleted]);

  const handleRequireAuth = useCallback(() => navigate("/login"), [navigate]);

  useKeyboardActions({
    enabled: !!post && isVisible,
    onComment: () => setShowComments(true),
    onShare: share.share,
  });

  if (!post) return <ContentError message="Post not found" />;
  if (post.deleted) return <ContentError message="This post was removed" />;

  if (!isVisible) {
    return (
      <div ref={ref}>
        <ContentSkeleton media />
      </div>
    );
  }

  const isQuote = post.media?.kind === "quote";
  const quoteText = isQuote ? post.content?.trim() || "" : "";
  const caption = !isQuote ? post.content?.trim() || "" : "";

  return (
    <article
      ref={ref}
      className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800"
    >
      <CardHeader
        post={post}
        canDelete={canDelete}
        onDelete={() => {
          if (!canDelete) return;
          setDeleteError(null);
          setConfirmDelete(true);
        }}
        onReport={() => reports.report("inappropriate")}
      />

      {isQuote && quoteText && (
        <div className="mx-4 mb-2">
          <blockquote
            className="rounded-2xl p-20 text-white text-2xl leading-snug text-center"
            style={{
              background: resolveQuoteBackground(post.style?.background),
              ...QUOTE_SERIF,
            }}
          >
            {quoteText}
          </blockquote>
        </div>
      )}

      {!isQuote && caption && (
        <div className="px-4 pb-3 text-sm text-slate-300">{caption}</div>
      )}

      {!isQuote && (
        <MediaRenderer post={post} isActive={isActive} priority={priority} />
      )}

      <div className="p-4 border-t border-slate-800 space-y-3">
        {user ? (
          <>
            <ReactionBar post={post} />

            <div className="flex gap-9">
  <SaveButton contentType="post" contentId={post.id} />
  <ShareButton onShare={share.share} sharing={share.sharing} />
  <SupportButton creatorId={post.user_id} isSelf={isSelf} onRequireAuth={handleRequireAuth} />
  <ReportButton type="post" id={post.id} />
</div>

            <button
              onClick={() => setShowComments((v) => !v)}
              className="text-sm text-slate-400 hover:text-white"
            >
              {showComments ? "Hide comments" : "View comments"}
            </button>

            {showComments && (
              <CommentSection
                contentType="post"
                contentId={post.id}
                ownerId={post.user_id}
                onClose={() => setShowComments(false)}
              />
            )}
          </>
        ) : (
          <button onClick={() => navigate("/login")} className="text-yellow-400 text-sm">
            Sign in to interact
          </button>
        )}
      </div>

      {confirmDelete && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-post-title"
        >
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 w-full max-w-sm">
            <h2 id="delete-post-title" className="text-white text-base font-semibold mb-2">
              Delete this post?
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              This can't be undone. The post and its media will be permanently removed.
            </p>

            {deleteError && <p className="text-red-400 text-sm mb-3">{deleteError}</p>}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="text-sm text-slate-300 hover:text-white px-3 py-2 disabled:opacity-40"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="text-sm bg-red-500 hover:bg-red-600 text-white rounded-full px-4 py-2 disabled:opacity-40"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default memo(
  ContentCard,
  (prev, next) =>
    prev.post.id === next.post.id &&
    prev.post.updated_at === next.post.updated_at &&
    prev.post.smile_score === next.post.smile_score &&
    prev.isActive === next.isActive &&
    prev.priority === next.priority
);