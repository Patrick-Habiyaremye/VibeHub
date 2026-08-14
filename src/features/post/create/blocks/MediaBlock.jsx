// blocks/MediaBlock.jsx
import React from "react";

export default function MediaBlock({
  block,
  onChange,
  onRemove,
}) {
  const isVideo = block.type === "video";

  const src = block.previewUrl || block.url || "";
  const caption = block.caption || "";

  const hasMedia = Boolean(src);

  function handleCaptionChange(e) {
    onChange({ caption: e.target.value });
  }

  return (
    <div className="relative border border-[#E7DFD2] rounded-2xl p-4 bg-white">
      
      {/* =========================
          MEDIA PREVIEW
      ========================= */}
      {hasMedia ? (
        isVideo ? (
          <video
            className="w-full rounded-xl block max-h-[320px] object-cover"
            src={src}
            controls
          />
        ) : (
          <img
            className="w-full rounded-xl block max-h-[320px] object-cover"
            src={src}
            alt="Uploaded media"
          />
        )
      ) : (
        <div className="w-full h-[180px] flex items-center justify-center rounded-xl bg-[#F5F1EA] text-sm text-[#6B7280]">
          No media selected
        </div>
      )}

      {/* =========================
          CAPTION INPUT
      ========================= */}
      <input
        type="text"
        className="w-full text-black border-0 border-t border-[#E7DFD2] mt-2.5 pt-2.5 text-sm bg-transparent outline-none placeholder:text-[#9CA3AF]"
        placeholder="Add a caption…"
        value={caption}
        onChange={handleCaptionChange}
      />

      {/* =========================
          REMOVE BUTTON
      ========================= */}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${block.type} block`}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#E7DFD2] text-[#232027] flex items-center justify-center text-sm leading-none hover:bg-[#d6ccbc] transition"
      >
        ×
      </button>
    </div>
  );
}