import {
  useEffect,
  useRef,
  useState,
  memo,
} from "react";

import {
  Play,
  Volume2,
  VolumeX,
  Loader2,
  AlertCircle,
} from "lucide-react";

function ReelPlayer({
  src,
  poster,
  isActive,
  preloadNext = false,

  onEnded,

  setVideoRef,

  isAudioActive,
  onActivateAudio,
}) {
  const videoRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /* -----------------------------
     Register video with ReelFeed
  ----------------------------- */

  useEffect(() => {
    if (videoRef.current) {
      setVideoRef?.(videoRef.current);
    }
  }, [setVideoRef]);

  /* -----------------------------
     Play / Pause
  ----------------------------- */

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = !isAudioActive;

    if (!isActive) {
      video.pause();
      video.currentTime = 0;
      setPlaying(false);
      return;
    }

    const playPromise = video.play();

    if (playPromise) {
      playPromise
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  }, [isActive, isAudioActive]);

  /* -----------------------------
     Pause when tab hidden
  ----------------------------- */

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

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () =>
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
  }, [isActive]);

  /* -----------------------------
     Play / Pause
  ----------------------------- */

  const togglePlay = () => {
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

  /* -----------------------------
     Global audio
  ----------------------------- */

  const handleMute = (e) => {
    e.stopPropagation();
    onActivateAudio?.();
  };

  /* -----------------------------
     Missing video
  ----------------------------- */

  if (!src) {
    return (
      <div className="flex h-full items-center justify-center bg-black text-white">
        Video unavailable
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full bg-black"
      onClick={togglePlay}
    >
      {/* VIDEO */}

      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        preload={
          isActive
            ? "auto"
            : preloadNext
            ? "metadata"
            : "none"
        }
        muted={!isAudioActive}
        onEnded={onEnded}
        onWaiting={() => setLoading(true)}
        onPlaying={() => {
          setLoading(false);
          setPlaying(true);
        }}
        onPause={() => setPlaying(false)}
        onError={() => setError(true)}
        className="h-full w-full object-cover"
      />

      {/* BUFFER */}

      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Loader2
            className="animate-spin text-white"
            size={36}
          />
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black">
          <AlertCircle
            size={42}
            className="text-red-400"
          />

          <p className="text-white">
            Unable to load video
          </p>
        </div>
      )}

      {/* PLAY BUTTON */}

      {!playing && !loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-black/50 p-5">
            <Play
              fill="white"
              className="text-white"
              size={36}
            />
          </div>
        </div>
      )}

      {/* AUDIO */}

      <button
        onClick={handleMute}
        className="absolute bottom-5 right-5 rounded-full bg-black/60 p-3 text-white backdrop-blur"
      >
        {isAudioActive ? (
          <Volume2 size={18} />
        ) : (
          <VolumeX size={18} />
        )}
      </button>
    </div>
  );
}

export default memo(ReelPlayer);