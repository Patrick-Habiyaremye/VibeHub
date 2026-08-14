import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";

import VideoControls from "./VideoControls";
import VideoOverlay from "./VideoOverlay";

const VideoRenderer = forwardRef(
  (
    {
      src,
      poster,
      isActive,      // 🔥 SINGLE SOURCE OF TRUTH
      priority = false,

      muted = true,
      loop = true,
      controls = true,
      overlay = true,

      className = "",
      onEnded,
    },
    ref
  ) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);

    const [isMuted, setIsMuted] = useState(muted);
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    //--------------------------------------------------
    // 🎯 FEED-DRIVEN PLAYBACK (CRITICAL)
    //--------------------------------------------------
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      if (isActive) {
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0; // TikTok reset
      }
    }, [isActive]);

    //--------------------------------------------------
    // ⚡ PRELOAD (NEXT / PREV)
    //--------------------------------------------------
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      if (priority) {
        video.preload = "auto";
        video.load();
      }
    }, [priority]);

    //--------------------------------------------------
    // 🎚 CONTROLS
    //--------------------------------------------------
    const togglePlay = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }, []);

    const toggleMute = () => {
      const video = videoRef.current;
      if (!video) return;

      video.muted = !video.muted;
      setIsMuted(video.muted);
    };

    //--------------------------------------------------
    // 📊 PROGRESS
    //--------------------------------------------------
    const handleTimeUpdate = () => {
      const video = videoRef.current;
      if (!video) return;

      setProgress(video.currentTime);
    };

    //--------------------------------------------------
    // 📦 LOADING
    //--------------------------------------------------
    const handleCanPlay = () => {
      setIsLoading(false);
    };

    //--------------------------------------------------
    // ❌ ERROR
    //--------------------------------------------------
    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    //--------------------------------------------------
    // 🎮 EXPOSE API
    //--------------------------------------------------
    useImperativeHandle(ref, () => ({
      play: () => videoRef.current?.play(),
      pause: () => videoRef.current?.pause(),
      video: videoRef.current,
    }));

    return (
      <div
        ref={containerRef}
        className={`relative bg-black w-full h-full overflow-hidden ${className}`}
      >
        {/* VIDEO */}
        {!hasError ? (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            muted={isMuted}
            loop={loop}
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"

            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onCanPlay={handleCanPlay}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => setIsLoading(false)}
            onEnded={onEnded}
            onError={handleError}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-white">
            Failed to load video
          </div>
        )}

        {/* OVERLAY */}
        {overlay && (
          <VideoOverlay
            playing={isActive} // 🔥 derived, not state
            loading={isLoading}
            error={hasError}
            muted={isMuted}
            duration={videoRef.current?.duration || 0}
            onPlayPause={togglePlay}
          />
        )}

        {/* CONTROLS */}
        {controls && (
          <VideoControls
            playing={isActive}
            muted={isMuted}
            progress={progress}
            duration={videoRef.current?.duration || 0}
            onPlayPause={togglePlay}
            onMute={toggleMute}
            onSeek={(time) => {
              if (videoRef.current) {
                videoRef.current.currentTime = time;
              }
            }}
          />
        )}

        {/* LOADING */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
            Loading...
          </div>
        )}
      </div>
    );
  }
);

VideoRenderer.displayName = "VideoRenderer";
export default VideoRenderer;
