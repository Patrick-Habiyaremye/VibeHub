// FILE: src/features/reactions/components/ReactionPicker.jsx

import { useEffect, useRef, useState } from "react";
import { REACTION_LIST } from "../utils/reactionTypes";

/**
 * Floating flyout of the 5 reactions. Positions itself to stay in the
 * viewport and is fully keyboard/screen-reader operable.
 */
export default function ReactionPicker({
  anchorRef,
  selected,
  onSelect,
  onClose,
}) {
  const pickerRef = useRef(null);
  const [style, setStyle] = useState({ left: 0, bottom: "100%" });

  useEffect(() => {
    const anchor = anchorRef.current;
    const picker = pickerRef.current;
    if (!anchor || !picker) return;

    const anchorRect = anchor.getBoundingClientRect();
    const pickerWidth = picker.offsetWidth || 260;
    const margin = 8;

    let left = anchorRect.left;
    const overflowRight = left + pickerWidth + margin - window.innerWidth;
    if (overflowRight > 0) left -= overflowRight;
    if (left < margin) left = margin;

    setStyle({
      position: "fixed",
      left,
      top: Math.max(anchorRect.top - 56, margin),
    });
  }, [anchorRef]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      role="menu"
      aria-label="Choose a reaction"
      style={style}
      className="
        z-40 flex items-center gap-1 bg-slate-800 border border-slate-700
        rounded-full px-2 py-1.5 shadow-xl
        motion-safe:animate-[fadeIn_150ms_ease-out]
        motion-reduce:animate-none
      "
    >
      {REACTION_LIST.map(({ type, emoji, label }) => {
        const isSelected = selected === type;
        return (
          <button
            key={type}
            type="button"
            role="menuitemradio"
            aria-checked={isSelected}
            aria-label={label}
            title={label}
            onClick={() => onSelect(type)}
            className={`
              relative text-2xl leading-none p-1.5 rounded-full transition-transform
              hover:scale-125 focus-visible:scale-125 focus-visible:outline
              focus-visible:outline-2 focus-visible:outline-yellow-400
              motion-safe:duration-200
              ${isSelected ? "bg-slate-700" : ""}
            `}
          >
            <span aria-hidden="true">{emoji}</span>
            {isSelected && (
              <span className="absolute -bottom-1 right-0 text-[10px]" aria-hidden="true">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}