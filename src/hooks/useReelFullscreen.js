// features/reels/hooks/useReelFullscreen.js
//
// NEW FILE. Single source of truth for browser fullscreen — requested on
// a container element (ref), never on <video> directly, per spec §5:
// controls/overlays must stay visible while fullscreen. Tracks the real
// document.fullscreenElement rather than trusting its own "did I ask for
// it" flag, because the browser can exit fullscreen out from under the
// app (ESC, OS gesture, another element requesting fullscreen) and React
// state must follow that, not assume it stays in sync.

import { useState, useEffect, useCallback, useRef } from "react";

function getFullscreenElement() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement || // Safari
    null
  );
}

export function useReelFullscreen() {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(() => !!getFullscreenElement());
  const [isSupported] = useState(
    () =>
      typeof document !== "undefined" &&
      !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen)
  );

  useEffect(() => {
    const handleChange = () => {
      const el = getFullscreenElement();
      setIsFullscreen(el != null && el === containerRef.current);
    };

    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("webkitfullscreenchange", handleChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
    };
  }, []);

  const enter = useCallback(async () => {
    const el = containerRef.current;
    if (!el || !isSupported) return false;

    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else {
        return false;
      }
      return true;
    } catch (err) {
      // Fullscreen can be denied (not a user gesture, permissions policy,
      // etc.) — never let that throw into the caller/crash the viewer.
      console.warn("Fullscreen request failed:", err);
      return false;
    }
  }, [isSupported]);

  const exit = useCallback(async () => {
    if (!getFullscreenElement()) return;

    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen exit failed:", err);
    }
  }, []);

  const toggle = useCallback(() => {
    return isFullscreen ? exit() : enter();
  }, [isFullscreen, enter, exit]);

  return { containerRef, isFullscreen, isSupported, enter, exit, toggle };
}