import { useEffect, useRef } from "react";

export default function useGameLoop(update, fps = 60) {
  const frame = useRef();
  const lastTime = useRef(performance.now());

  useEffect(() => {
    function loop(now) {
      const delta = now - lastTime.current;

      if (delta >= 1000 / fps) {
        update(delta);
        lastTime.current = now;
      }

      frame.current = requestAnimationFrame(loop);
    }

    frame.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frame.current);
  }, [update, fps]);
}