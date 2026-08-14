// blocks/QuoteBlock.jsx
import React, { useMemo } from "react";
import {
  resolveQuoteBackground,
  listQuoteBackgroundKeys,
} from "../engines/StyleEngine";

const SERIF = { fontFamily: "'Fraunces', Georgia, serif" };

const BACKGROUND_KEYS = listQuoteBackgroundKeys();

/* ============================================================
   🧠 UTILS
============================================================ */

// crude luminance check → decides white or dark text
function getContrastColor(bg) {
  if (!bg) return "#fff";
  const darkHints = ["#0F", "#1B", "#13", "#2C", "#20"];
  const isDark = darkHints.some((h) => bg.includes(h));
  return isDark ? "#fff" : "#111";
}

/* ============================================================
   💬 COMPONENT
============================================================ */

export default function QuoteBlock({ block, onChange, onRemove }) {
  const bgKey = block.style?.background || "sunset";

  // StyleEngine is now the single source of truth for every gradient
  const background = resolveQuoteBackground(bgKey);

  const textColor = useMemo(
    () => getContrastColor(background),
    [background]
  );

  return (
    <div
      className="relative rounded-2xl p-5 min-h-[160px] flex flex-col justify-between transition-all duration-300"
      style={{ background, color: textColor }}
    >
      {/* TEXTAREA */}
      <textarea
        className="text-black bg-transparent border-0 text-xl resize-none outline-none placeholder:opacity-60"
        style={SERIF}
        placeholder="Drop a quote…"
        value={block.value}
        onChange={(e) => onChange({ value: e.target.value })}
      />

      {/* BACKGROUND PICKER */}
      <div className="flex gap-2 mt-3 flex-wrap">
        {BACKGROUND_KEYS.map((key) => {
          const active = bgKey === key;

          return (
            <button
              key={key}
              type="button"
              aria-label={`Use ${key} background`}
              className={`w-6 h-6 rounded-full border-2 transition ${
                active
                  ? "border-white scale-110"
                  : "border-white/40 hover:scale-105"
              }`}
              style={{ background: resolveQuoteBackground(key) }}
              onClick={() =>
                onChange({
                  style: { ...block.style, background: key },
                })
              }
            />
          );
        })}
      </div>

      {/* REMOVE BUTTON */}
      <button
        type="button"
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center text-sm hover:bg-black/50 transition"
        aria-label="Remove quote block"
        onClick={onRemove}
      >
        ×
      </button>
    </div>
  );
}