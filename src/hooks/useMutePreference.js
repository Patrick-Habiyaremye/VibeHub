// hooks/useMutePreference.js
//
// Shared mute flag across every ReelCard instance. Once the user unmutes,
// every reel — current and future — reads muted=false immediately, and it
// survives page reloads via localStorage. No per-card local state.

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "vibehub:reelsMuted";
const EVENT_NAME = "vibehub:reelsMutedChange";

function readStored() {
  if (typeof window === "undefined") return true; // default muted (safe for autoplay policies)
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === null ? true : raw === "true";
}

export function useMutePreference() {
  const [muted, setMutedState] = useState(readStored);

  useEffect(() => {
    const onChange = () => setMutedState(readStored());
    window.addEventListener(EVENT_NAME, onChange);
    return () => window.removeEventListener(EVENT_NAME, onChange);
  }, []);

  const setMuted = useCallback((value) => {
    window.localStorage.setItem(STORAGE_KEY, String(value));
    window.dispatchEvent(new Event(EVENT_NAME));
  }, []);

  return { muted, setMuted };
}