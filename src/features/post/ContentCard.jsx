import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  memo,
} from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// UI
import MediaRenderer from "./MediaRenderer";
import ReactionBar from "./card/ReactionBar";
import CommentSection from "./card/CommentSection";
import CommentComposer from "./card/CommentComposer";

import BookmarkButton from "./card/BookmarkButton";
import ShareButton from "./card/ShareButton";
import SupportButton from "./card/SupportButton";
import ReportButton from "./card/ReportButton";

import ContentSkeleton from "./card/ContentSkeleton";
import ContentError from "./card/ContentError";
import ContentMedia from "./ContentMedia";
// hooks
import useIntersectionAnimation from "./card/hooks/useIntersectionAnimation";
import useReactions from "./card/hooks/useReactions";
import useComments from "./card/hooks/useComments";
import useCommentsRealtime from "./card/hooks/useCommentsRealtime";
import usePostMutations from "./card/hooks/usePostMutations";
import useShare from "./card/hooks/useShare";
import useSupport from "./card/hooks/useSupport";
import useReports from "./card/hooks/useReports";
import useKeyboardActions from "./card/hooks/useKeyboardActions";

//--------------------------------------------------
// COMPONENT
//--------------------------------------------------

function ContentCard({ post }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showComments, setShowComments] = useState(false);

  //--------------------------------------------------
  // VISIBILITY (perf)
  //--------------------------------------------------

  const { ref, isVisible } = useIntersectionAnimation({
    rootMargin: "600px",
  });

  //--------------------------------------------------
  // DATA HOOKS
  //--------------------------------------------------

  const reactions = useReactions(post?.id, {
    enabled: !!post && isVisible,
  });

  const comments = useComments(post?.id, {
    enabled: !!post && showComments && isVisible,
  });

  useCommentsRealtime(post?.id, {
    enabled: !!post && isVisible,
  });

  const { react } = usePostMutations();
  const share = useShare(post?.id);
  const support = useSupport(post?.id);
  const reports = useReports(post?.id);

  //--------------------------------------------------
  // BATCHED REACTION
  //--------------------------------------------------

  const queue = useRef(null);

  const handleReact = useCallback(
    (type) => {
      if (!user) {
        navigate("/login");
        return;
      }

      if (!post?.id) return;

      if (queue.current) clearTimeout(queue.current);

      queue.current = setTimeout(() => {
        react({ postId: post.id, type });
      }, 200);
    },
    [react, post?.id, user, navigate]
  );

  //--------------------------------------------------
  // KEYBOARD SHORTCUTS
  //--------------------------------------------------

  useKeyboardActions({
    enabled: !!post && isVisible,
    onLike: () => handleReact("smile"),
    onComment: () => setShowComments(true),
    onShare: share.share,
  });

  //--------------------------------------------------
  // DERIVED STATS
  //--------------------------------------------------

  const stats = useMemo(() => {
    return {
      smiles: reactions?.data?.smiles ?? 0,
      comments: reactions?.data?.comments ?? 0,
      shares: reactions?.data?.shares ?? 0,
    };
  }, [reactions?.data]);

  //--------------------------------------------------
  // SAFETY
  //--------------------------------------------------

  if (!post) return <ContentError message="Post not found" />;

  if (post.deleted) {
    return <ContentError message="This post was removed" />;
  }

  if (!isVisible) {
    return (
      <div ref={ref}>
        <ContentSkeleton media />
      </div>
    );
  }

  //--------------------------------------------------
  // RENDER
  //--------------------------------------------------

  return (
    <article
      ref={ref}
      className="
        bg-slate-900
        rounded-2xl
        overflow-hidden
        mb-6
        border border-slate-800
        hover:border-yellow-500/30
        transition
      "
    >
      {/* HEADER */}
      <div className="flex items-center gap-3 p-2">
        <img
          src={post.profiles?.avatar_url}
          className="w-10 h-10 rounded-full object-cover"
        />

        <div className="flex-1">
          <div className="font-semibold text-white">
            {post.profiles?.username || "Unknown"}
          </div>

          <div className="text-xs text-slate-400">
            {new Date(post.created_at).toLocaleString()}
          </div>
        </div>
      </div>

      {/* TEXT */}
      {post.content && post.media?.type !== "quote" && (
        <div className="px-4 pb-3 text-sm text-slate-300">
          {post.content}
        </div>
      )}

      {/* MEDIA */}
      {/* <div className="aspect-[4/5] w-full overflow-hidden">
  <MediaRenderer post={post} isActive={isVisible} />
</div> */}
      {/* <div className="bg-black">
        <MediaContainer>
  <MediaRenderer post={post} isActive={isVisible} />
</MediaContainer>
      </div> */}

      <div className="">
        <ContentMedia>
          <MediaRenderer post={post} isActive={isVisible} />
        </ContentMedia>
      </div>

      {/* STATS */}
      <div className="px-4 pt-3 text-xs text-slate-400 flex gap-4">
        <span>{stats.smiles} smiles</span>
        <span>{stats.comments} comments</span>
        <span>{stats.shares} shares</span>
        <span>{stats.bookmarks} bookmarks</span>
      </div>

      {/* ACTIONS */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        {user ? (
          <>
            {/* <ReactionBar onReact={handleReact} /> */}
            <ReactionBar post={post} /> 
            

            <div className="flex gap-6">
              <BookmarkButton postId={post.id} />
              <ShareButton onClick={share.share} />
              <SupportButton onClick={support.support} />
              <ReportButton onClick={reports.report} />
            </div>

            <button
              onClick={() =>
                setShowComments((s) => !s)
              }
              className="text-sm text-slate-400 hover:text-white"
            >
              {showComments
                ? "Hide comments"
                : "View comments"}
            </button>

            {showComments && (
              <div className="space-y-3">
                <CommentSection
                  postId={post.id}
                  query={comments}
                />
                <CommentComposer postId={post.id} />
              </div>
            )}
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="text-yellow-400 text-sm"
          >
            Sign in to interact
          </button>
        )}
      </div>
    </article>
  );
}

//--------------------------------------------------
// MEMO (IMPORTANT)
//--------------------------------------------------

export default memo(
  ContentCard,
  (prev, next) =>
    prev.post.id === next.post.id &&
    prev.post.updated_at === next.post.updated_at
);