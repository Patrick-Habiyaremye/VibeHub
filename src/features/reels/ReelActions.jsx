// features/reels/ReelActions.jsx
//
// CHANGES: save state/logic no longer comes from onSave prop + reel.saved
// — that was reel-specific save plumbing, exactly what §27 says to
// remove. Now calls useSaves() directly for its custom icon-stack layout
// (see SaveButton.jsx header for why this isn't just <SaveButton /> here).
// onSave prop removed entirely; `like` logic (onReact) is UNCHANGED — 
// likes/reactions stay a fully separate system per §23.

import { useState, useEffect, useCallback, memo } from "react";
import { MessageCircle, Bookmark, Share2, Heart } from "lucide-react";
import { useSaves } from "../../hooks/useSaves";


function ReelActions({ reel, onComment, onReact, onShare, initialReaction = null }) {
  const [liked, setLiked] = useState(Boolean(initialReaction));
  const [pending, setPending] = useState(false);

  const { isSaved, isSaving, toggleSave } = useSaves();
  const saved = isSaved("reel", reel?.id);
  const savePending = isSaving("reel", reel?.id);

  useEffect(() => {
    setLiked(Boolean(initialReaction));
  }, [initialReaction]);

  const handleReaction = useCallback(async () => {
    if (pending) return;
    const previous = liked;
    const next = !previous;

    setLiked(next);
    setPending(true);
    try {
      await onReact?.({ reelId: reel.id, reaction: next ? "like" : null });
    } catch (err) {
      console.error(err);
      setLiked(previous);
    } finally {
      setPending(false);
    }
  }, [pending, liked, reel?.id, onReact]);

const handleSave = useCallback(async () => {
  if (!reel?.id) return;
  try {
    await toggleSave("reel", reel.id);
  } catch (err) {
    console.error("Save failed:", err);
  }
}, [reel?.id, toggleSave]);

  const handleShare = () => onShare?.(reel);

  const likeCount = reel?.likesCount ?? 0;

  return (
    <aside className="absolute right-3 bottom-28 z-30 flex flex-col items-center gap-5">
      <button
        onClick={handleReaction}
        disabled={pending}
        aria-label="Like"
        aria-pressed={liked}
        className="flex flex-col items-center transition-all duration-200 disabled:opacity-60"
      >
        <Heart
          size={30}
          fill={liked ? "#ff3b5c" : "none"}
          stroke={liked ? "#ff3b5c" : "white"}
          className={`transition-transform duration-200 ${liked ? "scale-125" : "hover:scale-110"}`}
        />
        <span className="text-[10px] text-white/80 mt-1">{likeCount}</span>
      </button>

      <button
        onClick={onComment}
        className="flex flex-col items-center text-white hover:scale-110 transition"
      >
        <MessageCircle size={30} />
        <span className="text-[11px] mt-1">{reel?.commentsCount ?? 0}</span>
      </button>

      <button
        onClick={handleSave}
        disabled={savePending}
        aria-label={saved ? "Unsave" : "Save"}
        aria-pressed={saved}
        className="flex flex-col items-center text-white hover:scale-110 transition disabled:opacity-60"
      >
        <Bookmark size={28} fill={saved ? "white" : "none"} />
        <span className="text-[11px] mt-1">Save</span>
      </button>

      <button
        onClick={handleShare}
        className="flex flex-col items-center text-white hover:scale-110 transition"
      >
        <Share2 size={28} />
        <span className="text-[11px] mt-1">Share</span>
      </button>
    </aside>
  );
}

export default memo(ReelActions);