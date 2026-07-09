import { useEffect, useState } from "react";

export default function useVideoVisibility(
  ref,
  {
    threshold = 0.6,
    root = null,
    rootMargin = "0px",
  } = {}
) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold,
        root,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, threshold, root, rootMargin]);

  return isVisible;
}