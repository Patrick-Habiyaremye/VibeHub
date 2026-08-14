import { useCallback, useEffect, useRef, useState } from "react";

const IMAGE_DURATION_MS = 5_000;   // was 40_000 — 8x too long, felt like auto-advance was broken
const TEXT_MIN_DURATION_MS = 4_000;
const TEXT_MAX_DURATION_MS = 8_000;
const TEXT_MS_PER_CHAR = 60;       // rough reading-speed estimate
const TICK_MS = 100;

// Text moments get a duration scaled to caption length (within bounds)
// so a one-word caption and a three-sentence caption don't get the
// same fixed window. Images and any moment with an explicit
// `duration_ms` field use that instead.
function getTimedDurationMs(moment) {
  if (moment?.duration_ms) return moment.duration_ms;
  if (moment?.media_type === "text") {
    const len = (moment.caption || "").length;
    return Math.min(TEXT_MAX_DURATION_MS, Math.max(TEXT_MIN_DURATION_MS, len * TEXT_MS_PER_CHAR));
  }
  return IMAGE_DURATION_MS;
}

/**
 * The story engine: owns navigation (moment-level, crossing story
 * boundaries automatically), progress state, and pause gating.
 *
 * Auto-advance has exactly one driver per media type:
 * - image/text: the internal interval below (duration from getTimedDurationMs)
 * - video: the consumer's <video> element, via reportVideoProgress()
 *   (for the progress bar) and its own `onEnded` (for advancing)
 */
export function useStoryPlayer({ stories, initialStoryIndex = 0, initialMomentIndex = 0, onExit, onMomentChange }) {
  const [activeStoryIndex, setActiveStoryIndex] = useState(initialStoryIndex);
  const [activeMomentIndex, setActiveMomentIndex] = useState(initialMomentIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState("next");

  const pausedRef = useRef(false);
  const gateRef = useRef(false);
  const intervalRef = useRef(null);

  const activeStory = stories[activeStoryIndex] || null;
  const activeMoment = activeStory?.moments[activeMomentIndex] || null;
  const isVideo = activeMoment?.media_type === "video";

  const setGate = useCallback((value) => {
    gateRef.current = value;
  }, []);

  const togglePause = useCallback(() => {
    setPaused((p) => {
      pausedRef.current = !p;
      return !p;
    });
  }, []);

  useEffect(() => {
    setProgress(0);
    onMomentChange?.(activeMoment, { storyIndex: activeStoryIndex, momentIndex: activeMomentIndex });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMoment?.id]);

  const goNext = useCallback(() => {
    const story = stories[activeStoryIndex];
    if (!story) {
      onExit?.();
      return;
    }

    if (activeMomentIndex < story.moments.length - 1) {
      setDirection("next");
      setActiveMomentIndex((i) => i + 1);
      return;
    }

    if (activeStoryIndex < stories.length - 1) {
      setDirection("next");
      setActiveStoryIndex((i) => i + 1);
      setActiveMomentIndex(0);
      return;
    }

    onExit?.();
  }, [stories, activeStoryIndex, activeMomentIndex, onExit]);

  const goPrev = useCallback(() => {
    if (activeMomentIndex > 0) {
      setDirection("prev");
      setActiveMomentIndex((i) => i - 1);
      return;
    }

    if (activeStoryIndex > 0) {
      setDirection("prev");
      const prevStory = stories[activeStoryIndex - 1];
      setActiveStoryIndex((i) => i - 1);
      setActiveMomentIndex(Math.max(prevStory.moments.length - 1, 0));
    }
  }, [stories, activeStoryIndex, activeMomentIndex]);

  // Defensive: if `stories` shrinks while open (a moment expires or
  // gets deleted mid-view via realtime) and the current indices fall
  // out of range, clamp back into range instead of freezing on a null
  // activeMoment forever. If the whole list is now empty, exit —
  // matches StoryViewer's own `stories.length === 0` close effect,
  // but also covers the case where indices go stale without the
  // array becoming fully empty.
  useEffect(() => {
    if (stories.length === 0) {
      onExit?.();
      return;
    }
    if (activeStoryIndex > stories.length - 1) {
      setActiveStoryIndex(stories.length - 1);
      setActiveMomentIndex(0);
      return;
    }
    const story = stories[activeStoryIndex];
    if (story && activeMomentIndex > story.moments.length - 1) {
      setActiveMomentIndex(Math.max(story.moments.length - 1, 0));
    }
  }, [stories, activeStoryIndex, activeMomentIndex, onExit]);

  // Timer drives auto-advance ONLY for image/text moments.
  useEffect(() => {
    if (!activeMoment || isVideo) return;

    const durationMs = getTimedDurationMs(activeMoment);

    intervalRef.current = setInterval(() => {
      if (pausedRef.current || gateRef.current) return;
      setProgress((p) => {
        const next = p + (TICK_MS / durationMs) * 100;
        if (next >= 100) {
          goNext();
          return 0;
        }
        return next;
      });
    }, TICK_MS);

    return () => clearInterval(intervalRef.current);
  }, [activeMoment?.id, isVideo, goNext]); // eslint-disable-line react-hooks/exhaustive-deps

  // Called from the consumer's <video onTimeUpdate> — the sole driver
  // of progress for video moments. Advancing on completion is handled
  // by the consumer's <video onEnded>, not by this hook, so there's
  // exactly one place that decides "this video is done."
  const reportVideoProgress = useCallback((currentTime, duration) => {
    if (!duration) return;
    setProgress(Math.min(100, (currentTime / duration) * 100));
  }, []);

  return {
    stories,
    activeStoryIndex,
    activeMomentIndex,
    activeStory,
    activeMoment,
    progress,
    paused,
    direction,
    isVideo,
    goNext,
    goPrev,
    togglePause,
    setGate,
    reportVideoProgress,
  };
}