// blocks/TextBlock.jsx
import React from "react";

export default function TextBlock({ block, onChange, onRemove, autoFocus }) {
  return (
    <div className="relative border border-[#E7DFD2] rounded-2xl p-4 bg-white">
      <textarea
        autoFocus={autoFocus}
        className="w-full border-0 resize-none text-[17px] leading-relaxed bg-transparent outline-none font-sans"
        placeholder="What's your vibe?"
        value={block.value}
        rows={Math.min(8, Math.max(2, block.value.split("\n").length))}
        onChange={(e) => onChange({ value: e.target.value })}
      />
      <button
        type="button"
        className="absolute top-2 right-2 w-6 h-6 rounded-full border-0 bg-[#E7DFD2] text-[#232027] cursor-pointer flex items-center justify-center text-sm leading-none"
        aria-label="Remove text block"
        onClick={onRemove}
      >
        ×
      </button>
    </div>
  );
}