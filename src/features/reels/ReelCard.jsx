// features/reels/ReelCard.jsx
//
// Canonical ReelCard.
//
// IMPORTANT:
// - This component accepts `reel`, never `post`.
// - SavedFeed, ReelFeed, and every other caller must pass:
//       <ReelCard reel={reel} />
//
// The reel object is the canonical normalized reel shape produced by
// normalizeReel().
//
// This component is also defensive against a temporarily missing reel,
// which prevents crashes during async saved-content resolution.

import { memo, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

import ReelPlayer from "./ReelPlayer";
import ReelProgress from "./ReelProgress";
import ReelSidebar from "./ReelSidebar";
import ReelActions from "./ReelActions";
import ReelMenu from "./ReelMenu";

import { useAuth } from "../../context/AuthContext";
import { ContentApi } from "../../api/contentApi";
import useReelInteractions from "../../hooks/useReelInteractions";
import { useUploadControls } from "../../hooks/useUploadControls";
import { useUploadPreviewUrl } from "../../hooks/useUploadPreviewUrl";
import { useMutePreference } from "../../hooks/useMutePreference";
import { CommentSection } from "../comments";

const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

function ReelCard({
  reel,
  isActive = false,
  priority = false,
  onOpenComments,
  onDeleted,
  onReelEnd,
  onOpenReel,
}) {
  const { user } = useAuth();

  const { pause, resume, retry, cancel } = useUploadControls();
  const { react } = useReelInteractions();
  const { muted, setMuted } = useMutePreference();

  const videoElRef = useRef(null);

  const [showComments, setShowComments] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /*
   * IMPORTANT:
   *
   * Do not access reel.foo directly until after verifying reel exists.
   *
   * Hooks must remain unconditional, so the safe pattern is:
   * - call hooks
   * - safely derive values using optional chaining
   * - return null before rendering anything that requires a reel
   */

  const reelId = reel?.id ?? null;
  const userId = reel?.user_id ?? null;

  const isOwner =
    !!user &&
    !!userId &&
    user.id === userId;

  const setVideoRef = useCallback((element) => {
    videoElRef.current = element;
  }, []);

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = useCallback(async () => {
    if (!reelId || deleting) return;

    setDeleting(true);

    try {
      await ContentApi.deleteReel(reelId);

      onDeleted?.(reelId);
    } catch (error) {
      console.error(
        "[ReelCard] Delete reel failed:",
        error
      );

      setDeleting(false);
    }
  }, [reelId, deleting, onDeleted]);

  /* =========================================================
     COMMENTS
  ========================================================= */

  const handleComment = useCallback(() => {
    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia?.(DESKTOP_MEDIA_QUERY).matches;

    if (isDesktop) {
      onOpenComments?.();
    } else {
      setShowComments(true);
    }
  }, [onOpenComments]);

  /* =========================================================
     REACTION
  ========================================================= */

  const handleReact = useCallback(
    ({ reelId: targetReelId, reaction }) => {
      return react({
        reelId: targetReelId,
        reaction,
      });
    },
    [react]
  );

  /* =========================================================
     SHARE
  ========================================================= */

  const handleShare = useCallback(async (targetReel) => {
    if (!targetReel?.id) return;

    const shareUrl =
      `${window.location.origin}/reel/${targetReel.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this VibeHub Reel",
          text: targetReel.content || "",
          url: shareUrl,
        });
      } catch {
        /*
         * Native share cancellation is not an application error.
         */
      }

      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (error) {
      console.error(
        "[ReelCard] Share failed:",
        error
      );
    }
  }, []);

  /* =========================================================
     VIDEO END
  ========================================================= */

  const handleEnded = useCallback(() => {
    if (!reelId) return;

    onReelEnd?.(reelId);
  }, [onReelEnd, reelId]);

  /* =========================================================
     MUTE
  ========================================================= */

  const handleToggleMute = useCallback(() => {
    setMuted(!muted);
  }, [muted, setMuted]);

  /* =========================================================
     IMMERSIVE VIEW
  ========================================================= */

  const handleEnterImmersive = useCallback(() => {
    if (!reelId) return;

    onOpenReel?.(reelId);
  }, [onOpenReel, reelId]);

  /* =========================================================
     UPLOAD STATE
  ========================================================= */

  const isUploading = !!reel?.uploading;

  const progress = reel?.progress ?? 0;

  const status = reel?.status;

  const isPaused =
    status === "paused";

  const isFailed =
    status === "failed";

  const isCompressing =
    status === "compressing";

  /*
   * IMPORTANT:
   *
   * hasThumbnail does not exist on normal database reels.
   *
   * Therefore optional chaining is intentional.
   *
   * For uploaded local reels:
   *   reel.hasThumbnail may exist.
   *
   * For persisted reels:
   *   it will normally be undefined/false.
   */

  const hasThumbnail =
    !!reel?.hasThumbnail;

  const uploadPreviewId =
    isUploading
      ? reel?.fileId ?? reelId
      : null;

  const localPreviewUrl =
    useUploadPreviewUrl(
      uploadPreviewId,
      status
    );

  const localPosterId =
    isUploading && hasThumbnail
      ? `${reelId}:thumb`
      : null;

  const localPosterUrl =
    useUploadPreviewUrl(
      localPosterId,
      hasThumbnail
    );

  /* =========================================================
     DEFENSIVE GUARD
  ========================================================= */

  /*
   * This now occurs BEFORE any render-time access to reel.media,
   * reel.user_id, reel.id, etc.
   *
   * Hooks above remain unconditional, so React's Rules of Hooks
   * are preserved.
   */

  if (!reel) {
    return null;
  }

  /* =========================================================
     MEDIA
  ========================================================= */

  const videoSrc =
    reel.media?.url ??
    localPreviewUrl ??
    null;

  const posterSrc =
    reel.media?.poster ??
    localPosterUrl ??
    null;

  /* =========================================================
     SIDEBAR DATA
  ========================================================= */

  /*
   * Upload placeholders may not have the canonical `user`
   * structure yet.
   *
   * Persisted reels use the normalized reel directly.
   */

  const sidebarReel = isUploading
    ? {
        ...reel,

        username:
          user?.user_metadata?.username ??
          user?.email?.split("@")[0] ??
          "User",

        avatar:
          user?.user_metadata?.avatar_url ??
          null,

        verified:
          user?.user_metadata?.verified ??
          false,
      }
    : reel;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div
        className={
          isUploading
            ? "pointer-events-none opacity-80"
            : ""
        }
      >
        <ReelPlayer
          src={videoSrc}
          poster={posterSrc}
          videoWidth={
            reel.media?.width ??
            reel.width ??
            null
          }
          videoHeight={
            reel.media?.height ??
            reel.height ??
            null
          }
          isActive={
            isActive &&
            !isUploading
          }
          preloadNext={priority}
          setVideoRef={setVideoRef}
          muted={muted}
          onEnded={handleEnded}
        />

        <ReelProgress
          videoRef={videoElRef}
        />

        <ReelSidebar
          reel={sidebarReel}
        />
      </div>

      {/* =====================================================
          MENU
      ===================================================== */}

      {!isUploading && (
        <div className="absolute right-4 top-4 z-30">
          <ReelMenu
            isOwner={isOwner}
            reel={reel}
            onDeleted={onDeleted}
            onEnterImmersive={
              handleEnterImmersive
            }
            onShare={() =>
              handleShare(reel)
            }
            onOpenComments={
              handleComment
            }
          />
        </div>
      )}

      {/* =====================================================
          ACTIONS
      ===================================================== */}

      {!isUploading && (
        <>
          <ReelActions
            reel={reel}
            onComment={handleComment}
            onReact={handleReact}
            onShare={handleShare}
            initialReaction={
              reel.myReaction ?? null
            }
          />

          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={
              muted
                ? "Unmute"
                : "Mute"
            }
            aria-pressed={!muted}
            className="
              absolute
              right-3
              top-16
              z-30
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-black/50
              text-white
              backdrop-blur-md
              transition
              hover:bg-black/70
              active:scale-95
            "
          >
            {muted ? (
              <VolumeX size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>
        </>
      )}

      {/* =====================================================
          UPLOAD STATUS
      ===================================================== */}

      {isUploading && (
        <div
          className="
            absolute
            inset-x-0
            bottom-0
            z-30
            bg-black/80
            px-4
            py-3
            backdrop-blur
          "
        >
          <div
            className="
              h-1
              w-full
              overflow-hidden
              rounded
              bg-white/20
            "
          >
            <div
              className={`
                h-full
                transition-all
                duration-200
                ${
                  isFailed
                    ? "bg-red-500"
                    : "bg-yellow-400"
                }
              `}
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div
            className="
              mt-2
              flex
              items-center
              justify-between
              text-xs
              text-white/80
            "
          >
            <span>
              {isFailed
                ? "❌ Upload failed"
                : isPaused
                ? "⏸ Paused"
                : isCompressing
                ? "Preparing your reel…"
                : `Uploading… ${progress}%`}
            </span>

            <div className="flex gap-2">
              {status === "uploading" && (
                <button
                  type="button"
                  onClick={() =>
                    pause(reel.id)
                  }
                  className="
                    rounded
                    bg-white/10
                    px-2
                    py-1
                  "
                >
                  Pause
                </button>
              )}

              {isPaused && (
                <button
                  type="button"
                  onClick={() =>
                    resume(reel.id)
                  }
                  className="
                    rounded
                    bg-yellow-500
                    px-2
                    py-1
                    text-black
                  "
                >
                  Resume
                </button>
              )}

              {isFailed && (
                <button
                  type="button"
                  onClick={() =>
                    retry(reel.id)
                  }
                  className="
                    rounded
                    bg-red-500
                    px-2
                    py-1
                  "
                >
                  Retry
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  cancel(reel.id)
                }
                className="
                  rounded
                  bg-white/10
                  px-2
                  py-1
                  text-white/70
                "
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MOBILE COMMENTS
      ===================================================== */}

      {showComments && (
        <CommentSection
          contentType="reel"
          contentId={reel.id}
          ownerId={reel.user_id}
          variant="sheet"
          onClose={() =>
            setShowComments(false)
          }
        />
      )}
    </div>
  );
}

/* ===========================================================
   MEMO
=========================================================== */

export default memo(
  ReelCard,
  (prev, next) => {
    /*
     * Defensive comparison.
     *
     * Saved content can briefly be unresolved while async
     * requests are completing, so never assume `reel` exists.
     */

    const prevReel = prev.reel;
    const nextReel = next.reel;

    if (prevReel === nextReel) {
      return (
        prev.isActive === next.isActive &&
        prev.priority === next.priority &&
        prev.onReelEnd === next.onReelEnd &&
        prev.onOpenReel === next.onOpenReel
      );
    }

    if (!prevReel || !nextReel) {
      return false;
    }

    return (
      prevReel.id === nextReel.id &&

      prevReel.uploading ===
        nextReel.uploading &&

      prevReel.progress ===
        nextReel.progress &&

      prevReel.status ===
        nextReel.status &&

      prevReel.error ===
        nextReel.error &&

      prevReel.hasThumbnail ===
        nextReel.hasThumbnail &&

      prevReel.content ===
        nextReel.content &&

      prevReel.likesCount ===
        nextReel.likesCount &&

      prevReel.commentsCount ===
        nextReel.commentsCount &&

      prevReel.myReaction ===
        nextReel.myReaction &&

      prevReel.media?.url ===
        nextReel.media?.url &&

      prevReel.media?.poster ===
        nextReel.media?.poster &&

      prevReel.media?.width ===
        nextReel.media?.width &&

      prevReel.media?.height ===
        nextReel.media?.height &&

      prev.isActive ===
        next.isActive &&

      prev.priority ===
        next.priority &&

      prev.onReelEnd ===
        next.onReelEnd &&

      prev.onOpenReel ===
        next.onOpenReel
    );
  }
);