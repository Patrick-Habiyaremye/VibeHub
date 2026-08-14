// features/reels/ReelProgress.jsx
//
// Carried over unchanged — no bugs found.

import { useEffect, useRef, useState } from "react";

export default function ReelProgress({ videoRef }) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const video = videoRef?.current;
    if (!video) return;

    const update = () => {
      if (!video.duration || isNaN(video.duration)) {
        rafRef.current = requestAnimationFrame(update);
        return;
      }

      const next = (video.currentTime / video.duration) * 100;
      setProgress((prev) => (Math.abs(prev - next) > 0.5 ? next : prev));

      rafRef.current = requestAnimationFrame(update);
    };

    const handlePlay = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    const handlePause = () => {
      cancelAnimationFrame(rafRef.current);
    };

    const handleEnded = () => {
      cancelAnimationFrame(rafRef.current);
      setProgress(100);
    };

    const handleLoaded = () => {
      setProgress(0);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("loadedmetadata", handleLoaded);

    return () => {
      cancelAnimationFrame(rafRef.current);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("loadedmetadata", handleLoaded);
    };
  }, [videoRef]);

  return (
    <div className="absolute top-0 left-0 w-full h-1 bg-white/20 z-30">
      <div
        className="h-full bg-white transition-[width] duration-75 ease-linear will-change-[width]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
