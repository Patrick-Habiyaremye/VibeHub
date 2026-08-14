// features/reels/hooks/useReelNavigation.js
//
// NEW FILE. Single source of truth for "which reel is active and can we
// move" — every input method (swipe, wheel, keyboard, buttons, autoplay
// completion) must call goNext/goPrevious/goToIndex rather than compute
// an index itself. `items` is the caller's current list (feed's
// `filtered`, or ReelPage's single-reel-plus-siblings list); this hook
// doesn't fetch — pagination stays the caller's responsibility, this just
// exposes whether moving forward is currently possible.

import { useState, useCallback, useMemo } from "react";

export function useReelNavigation({ items, initialIndex = 0, onIndexChange } = {}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const length = items?.length ?? 0;
  const clamped = Math.min(Math.max(currentIndex, 0), Math.max(length - 1, 0));

  const canGoNext = clamped < length - 1;
  const canGoPrevious = clamped > 0;

  const goToIndex = useCallback(
    (index) => {
      if (index < 0 || index >= length) return false;
      setCurrentIndex(index);
      onIndexChange?.(index);
      return true;
    },
    [length, onIndexChange]
  );

  const goNext = useCallback(() => goToIndex(clamped + 1), [clamped, goToIndex]);
  const goPrevious = useCallback(() => goToIndex(clamped - 1), [clamped, goToIndex]);

  const activeItem = useMemo(() => items?.[clamped] ?? null, [items, clamped]);

  return {
    currentIndex: clamped,
    activeItem,
    canGoNext,
    canGoPrevious,
    goNext,
    goPrevious,
    goToIndex,
  };
}