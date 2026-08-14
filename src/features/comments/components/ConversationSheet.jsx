// src/features/comments/components/ConversationSheet.jsx
//
// Slide-up sheet with swipe-down-to-dismiss. Uses 100dvh (dynamic
// viewport height), not 100vh — 100vh on mobile Safari/Chrome doesn't
// account for the address bar, so the composer at the bottom can end up
// hidden behind it. dvh is the fix; make sure your Tailwind/PostCSS
// setup doesn't strip it (it's supported in all current browsers as of
// this codebase's target).

import { useEffect, useRef, useState } from "react";

const DISMISS_THRESHOLD_PX = 120;

export default function ConversationSheet({ onClose, children }) {
  const [translateY, setTranslateY] = useState(100);
  const dragStartRef = useRef(null);
  const currentDragRef = useRef(0);
  const sheetRef = useRef(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setTranslateY(0));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = () => {
    setTranslateY(100);
    setTimeout(() => onClose?.(), 200);
  };

  const handlePointerDown = (e) => {
    dragStartRef.current = e.clientY;
  };

  const handlePointerMove = (e) => {
    if (dragStartRef.current == null) return;
    const delta = Math.max(e.clientY - dragStartRef.current, 0);
    currentDragRef.current = delta;
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }
  };

  const handlePointerUp = () => {
    if (currentDragRef.current > DISMISS_THRESHOLD_PX) {
      handleClose();
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = "translateY(0px)";
    }
    dragStartRef.current = null;
    currentDragRef.current = 0;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60" onClick={handleClose}>
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          transform: `translateY(${translateY}%)`,
          transition: "transform 200ms ease-out",
          height: "100dvh",
        }}
        className="absolute bottom-0 left-0 right-0 bg-black rounded-t-2xl flex flex-col text-white touch-none"
      >
        <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mt-2 mb-1 shrink-0" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}