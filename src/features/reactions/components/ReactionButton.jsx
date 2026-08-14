// FILE: src/features/reactions/components/ReactionButton.jsx

import { useCallback, useEffect, useRef, useState } from "react";
import { reactionMeta, REACTION_TYPES } from "../utils/reactionTypes";
import ReactionPicker from "./ReactionPicker";

const HOVER_OPEN_DELAY = 350;

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(hover: none)")?.matches ?? false;
}

export default function ReactionButton({ userReaction, onReact, disabled }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const anchorRef = useRef(null);
  const hoverTimer = useRef(null);
  const touch = isTouchDevice();

  useEffect(() => {
    return () => clearTimeout(hoverTimer.current);
  }, []);

  const openPicker = useCallback(() => setPickerOpen(true), []);
  const closePicker = useCallback(() => setPickerOpen(false), []);

  const handleMouseEnter = () => {
    if (touch) return;
    hoverTimer.current = setTimeout(openPicker, HOVER_OPEN_DELAY);
  };

  const handleMouseLeave = () => {
    if (touch) return;
    clearTimeout(hoverTimer.current);
    setPickerOpen(false);
  };

  const handleClick = () => {
    if (touch) {
      setPickerOpen((v) => !v);
      return;
    }
    // Desktop click = quick toggle of the default/current reaction.
    onReact(userReaction || REACTION_TYPES.SMILE);
  };

  const handleSelect = (type) => {
    onReact(type);
    closePicker();
  };

  const current = reactionMeta(userReaction || REACTION_TYPES.SMILE);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={anchorRef}
        type="button"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={pickerOpen}
        aria-label={userReaction ? `Your reaction: ${current.label}` : "React"}
        onClick={handleClick}
        onFocus={openPicker}
        onBlur={closePicker}
        className={`
          flex items-center gap-1.5 text-sm rounded-full px-3 py-1.5 transition
          motion-safe:duration-200
          ${userReaction ? "text-yellow-300 bg-slate-800" : "text-slate-400 hover:text-white"}
          disabled:opacity-50
        `}
      >
        <span aria-hidden="true">{current.emoji}</span>
        <span>{userReaction ? current.label : "Smile"}</span>
      </button>

      {pickerOpen && (
        <ReactionPicker
          anchorRef={anchorRef}
          selected={userReaction}
          onSelect={handleSelect}
          onClose={closePicker}
        />
      )}
    </div>
  );
}