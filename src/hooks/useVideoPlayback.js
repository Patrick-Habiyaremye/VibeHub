import { useEffect, useRef, useState, useCallback } from "react";

export default function useVideoPlayback(videoRef, isVisible) {
  const lastTime = useRef(0);

  const [playing, setPlaying] = useState(false);

  const [muted, setMuted] = useState(true);

  const [progress, setProgress] = useState(0);

  const [duration, setDuration] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  // ----------------------------
  // Autoplay / Pause
  // ----------------------------

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (isVisible) {
      video.currentTime = lastTime.current;

      video
        .play()
        .then(() => {
          setPlaying(true);
        })
        .catch(() => {});
    } else {
      lastTime.current = video.currentTime;

      video.pause();

      setPlaying(false);
    }
  }, [isVisible, videoRef]);

  // ----------------------------
  // Events
  // ----------------------------

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const handleLoaded = () => {
      setDuration(video.duration);

      setLoading(false);

      setError(false);
    };

    const handleTime = () => {
      setProgress(video.currentTime);
    };

    const handleEnded = () => {
      video.currentTime = 0;

      video.play();

      setPlaying(true);
    };

    const handleError = () => {
      setError(true);

      setLoading(false);
    };

    video.addEventListener(
      "loadedmetadata",
      handleLoaded
    );

    video.addEventListener(
      "timeupdate",
      handleTime
    );

    video.addEventListener(
      "ended",
      handleEnded
    );

    video.addEventListener(
      "error",
      handleError
    );

    return () => {
      video.removeEventListener(
        "loadedmetadata",
        handleLoaded
      );

      video.removeEventListener(
        "timeupdate",
        handleTime
      );

      video.removeEventListener(
        "ended",
        handleEnded
      );

      video.removeEventListener(
        "error",
        handleError
      );
    };
  }, [videoRef]);

  // ----------------------------
  // Controls
  // ----------------------------

  const togglePlay = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      video.play();

      setPlaying(true);
    } else {
      video.pause();

      setPlaying(false);
    }
  }, [videoRef]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = !video.muted;

    setMuted(video.muted);
  }, [videoRef]);

  const seek = useCallback(
    (seconds) => {
      const video = videoRef.current;

      if (!video) return;

      video.currentTime = seconds;

      setProgress(seconds);
    },
    [videoRef]
  );

  const fullscreen = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  }, [videoRef]);

  return {
    playing,
    muted,
    loading,
    error,
    progress,
    duration,
    togglePlay,
    toggleMute,
    seek,
    fullscreen,
  };
}