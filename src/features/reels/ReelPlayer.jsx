// features/reels/ReelPlayer.jsx
//
// Mute source of truth changed: `isAudioActive`/`onActivateAudio` (props
// from an unknown parent) replaced by a plain `muted` boolean prop.
// ReelCard now supplies this from useMutePreference, so mute state is
// shared/persisted independent of whatever the feed component does.
// Bottom-right mute button stays removed (ReelCard owns the one control,
// top-right).

import { useEffect, useRef, useState, memo } from "react";
import { Play, Loader2, AlertCircle } from "lucide-react";

const RATIO_MATCH_EPSILON = 0.04;

function ReelPlayer({
  src,
  poster,
  videoWidth,
  videoHeight,
  isActive,
  preloadNext = false,
  onEnded,
  setVideoRef,
  muted,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(isActive);
  const [error, setError] = useState(false);
  const [containerRatio, setContainerRatio] = useState(null);

  useEffect(() => {
    if (videoRef.current) setVideoRef?.(videoRef.current);
  }, [setVideoRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      if (el.clientHeight > 0) setContainerRatio(el.clientWidth / el.clientHeight);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Keep the live video element's muted flag in sync with the shared
  // preference on every change, not just on isActive change — so if the
  // user unmutes while THIS card is active, it applies immediately.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = muted;

    if (!isActive) {
      video.pause();
      video.currentTime = 0;
      setPlaying(false);
      return;
    }

    const playPromise = video.play();
    if (playPromise) {
      playPromise.then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [isActive, muted]);

  useEffect(() => {
    const handleVisibility = () => {
      const video = videoRef.current;
      if (!video) return;

      if (document.hidden) {
        video.pause();
      } else if (isActive) {
        video.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isActive]);

  const togglePlay = () => {
    if (!isActive) return;

    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  if (!src) {
    return (
      <div className="flex h-full items-center justify-center bg-black text-white">
        Video unavailable
      </div>
    );
  }

  const videoRatio = videoWidth && videoHeight ? videoWidth / videoHeight : null;
  const ratiosKnown = containerRatio !== null && videoRatio !== null;
  const ratiosMatch =
    ratiosKnown && Math.abs(containerRatio - videoRatio) / containerRatio < RATIO_MATCH_EPSILON;
  const showBackdrop = !!poster && !ratiosMatch;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full bg-black overflow-hidden"
      onClick={togglePlay}
    >
      {showBackdrop && (
        <div
          aria-hidden="true"
          className="absolute inset-0 scale-110 bg-center bg-cover blur-2xl opacity-40"
          style={{ backgroundImage: `url(${poster})` }}
        />
      )}

      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        preload={isActive ? "auto" : preloadNext ? "metadata" : "none"}
        muted={muted}
        onEnded={onEnded}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onLoadedData={() => setLoading(false)}
        onPlaying={() => {
          setLoading(false);
          setPlaying(true);
        }}
        onPause={() => setPlaying(false)}
        onError={() => setError(true)}
        className="relative h-full w-full object-contain"
      />

      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Loader2 className="animate-spin text-white" size={36} />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black">
          <AlertCircle size={42} className="text-red-400" />
          <p className="text-white">Unable to load video</p>
        </div>
      )}

      {!playing && !loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-black/50 p-5">
            <Play fill="white" className="text-white" size={36} />
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ReelPlayer);