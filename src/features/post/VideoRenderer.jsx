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
      autoPlay = true,
      muted = true,
      loop = true,
      controls = true,
      overlay = true,
      className = "",
      onEnded,
      onPlay,
      onPause,
    },
    ref
  ) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(muted);
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hasError, setHasError] = useState(false);

    // ---------- PLAY / PAUSE ----------
    const play = useCallback(async () => {
      try {
        await videoRef.current?.play();
        setIsPlaying(true);
        onPlay?.();
      } catch (err) {
        console.warn("Play failed:", err);
      }
    }, [onPlay]);

    const pause = useCallback(() => {
      videoRef.current?.pause();
      setIsPlaying(false);
      onPause?.();
    }, [onPause]);

    const togglePlay = () => {
      isPlaying ? pause() : play();
    };

    // ---------- MUTE ----------
    const toggleMute = () => {
      const video = videoRef.current;
      if (!video) return;
      video.muted = !video.muted;
      setIsMuted(video.muted);
    };

    // ---------- PROGRESS ----------
    const handleTimeUpdate = () => {
      const video = videoRef.current;
      if (!video) return;

      const percent = (video.currentTime / video.duration) * 100;
      setProgress(percent || 0);
    };

    // ---------- FULLSCREEN ----------
    const toggleFullscreen = async () => {
      const el = containerRef.current;
      if (!el) return;

      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    };

    // ---------- AUTOPLAY ----------
    const handleCanPlay = async () => {
      setIsLoading(false);

      if (autoPlay) {
        try {
          await play();
        } catch {}
      }
    };

    // ---------- VISIBILITY (TikTok-style) ----------
    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          const video = videoRef.current;
          if (!video) return;

          if (entry.isIntersecting) {
            if (autoPlay) play();
          } else {
            pause();
          }
        },
        { threshold: 0.6 }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => observer.disconnect();
    }, [autoPlay, play, pause]);

    // ---------- ERROR ----------
    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    // ---------- EXPOSE METHODS ----------
    useImperativeHandle(ref, () => ({
      play,
      pause,
      togglePlay,
      toggleMute,
      toggleFullscreen,
      video: videoRef.current,
    }));

    return (
      <div
        ref={containerRef}
        className={`relative bg-black overflow-hidden w-full h-full ${className}`}
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

        {/* LOADING */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
            Loading...
          </div>
        )}

        {/* OVERLAY */}
        {overlay && (
          <VideoOverlay
    playing={isPlaying}
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
    playing={isPlaying}
    muted={isMuted}
    progress={videoRef.current?.currentTime || 0}
    duration={videoRef.current?.duration || 0}
    onPlayPause={togglePlay}
    onMute={toggleMute}
    onSeek={(time) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
        }
    }}
    onFullscreen={toggleFullscreen}
/>
        )}
      </div>
    );
  }
);

VideoRenderer.displayName = "VideoRenderer";

export default VideoRenderer;

