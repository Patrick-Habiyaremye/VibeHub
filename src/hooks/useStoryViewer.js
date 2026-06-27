import { useEffect, useRef, useState } from "react";

export default function useStoryViewer(moments, startIndex, onClose) {
  const [index, setIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);

  const intervalRef = useRef(null);
  const hold = useRef(false);

  const current = moments[index];

  const start = () => {
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (hold.current) return;

      setProgress((p) => {
        if (p >= 100) {
          next();
          return 0;
        }
        return p + 2;
      });
    }, 100);
  };

  const next = () => {
    if (index < moments.length - 1) {
      setIndex((i) => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const prev = () => {
    if (index > 0) {
      setIndex((i) => i - 1);
      setProgress(0);
    }
  };

  useEffect(() => {
    start();
    return () => clearInterval(intervalRef.current);
  }, [index]);

  return {
    index,
    progress,
    current,
    next,
    prev,
    hold,
  };
}