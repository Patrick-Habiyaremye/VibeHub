import { useState, memo } from "react";
import { useAuth } from "../../context/AuthContext";

import ReelPlayer from "./ReelPlayer";
import ReelSidebar from "./ReelSidebar";
import ReelActions from "./ReelActions";
import ReelComments from "./ReelComments";
import ReelMenu from "./ReelMenu";

function ReelCard({
  reel,
  isActive,
  preloadNext = false,
  onVideoEnd,
  setVideoRef,
  isAudioActive,
  onActivateAudio,
  onEdit,
  onDelete,
  onReport,
}) {
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();
  const isOwner = user?.id === reel.user_id;

  return (
    <article className="relative h-full w-full overflow-hidden rounded-xl bg-black">

      {/* VIDEO */}
      {/* <ReelPlayer
        src={reel.videoUrl}
        poster={reel.thumbnailUrl}
        isActive={isActive}
        preloadNext={preloadNext}
        onEnded={onVideoEnd}
        setVideoRef={setVideoRef}
        isAudioActive={isAudioActive}
        onActivateAudio={onActivateAudio}
      /> */}
      <ReelPlayer
    src={reel.video_url}
    poster={reel.thumbnail_url}
    isActive={isActive}
    preloadNext={preloadNext}
    onEnded={onVideoEnd}
    setVideoRef={setVideoRef}
    isAudioActive={isAudioActive}
    onActivateAudio={onActivateAudio}
/>

      {/* Top Gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />

      {/* Bottom Gradient */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Creator */}
      <ReelSidebar reel={reel} />

      {/* Actions */}
      <ReelActions
        reel={reel}
        onComment={() => setShowComments(true)}
      />

      {/* Menu */}
      <ReelMenu
        isOwner={reel.isOwner}
        onEdit={onEdit}
        onDelete={onDelete}
        onReport={onReport}
      />

      {/* Comments */}
      {showComments && (
        <ReelComments
          reelId={reel.id}
          onClose={() => setShowComments(false)}
        />
      )}

    </article>
  );
}

export default memo(ReelCard);