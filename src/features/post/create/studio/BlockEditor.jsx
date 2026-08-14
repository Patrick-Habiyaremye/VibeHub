// studio/BlockEditor.jsx
//
// Dumb-ish list renderer + the "+" tray + emoji picker. Doesn't know how a
// session is created or persisted — just takes blocks and a set of
// callbacks. This is what lets you unit-test/story-book it without
// spinning up the whole composer session.
//
// Emoji targeting: `activeBlockId` tracks whichever block last had a
// text/textarea inside it receive focus (via onFocusCapture on each block's
// wrapper — React's onFocus is implemented via the bubbling "focusin"
// event, so a listener on an ancestor div reliably catches focus from a
// nested input/textarea without every block component needing to know
// about this). On emoji select, that block's relevant field (quote/text ->
// `value`, image/video -> `caption`) gets the emoji appended. If nothing's
// been focused yet, it falls back to the most recently added block that
// has a text target.
//
// Styling: Tailwind utility classes — see note in ComposerStudio.jsx.

import React, { useEffect, useRef, useState } from "react";
import TextBlock from "../blocks/TextBlock";
import MediaBlock from "../blocks/MediaBlock";
import QuoteBlock from "../blocks/QuoteBlock";
import PollBlock from "../blocks/PollBlock";
import EmojiPickerButton from "../EmojiPickerButton";

const BLOCK_COMPONENTS = {
  text: TextBlock,
  image: MediaBlock,
  video: MediaBlock,
  quote: QuoteBlock,
  poll: PollBlock,
};

const TRAY_ITEMS = [
  { type: "image", label: "Image", icon: "🖼️" },
  { type: "video", label: "Video", icon: "🎬" },
  { type: "quote", label: "Quote Style", icon: "❝" },
  { type: "poll", label: "Poll", icon: "📊" },
];

// Which field on a block holds user-typed text an emoji can land in. Poll
// has no single unambiguous target (question vs. one of several options),
// so it's excluded — the fallback search below just skips past poll blocks.
function editableFieldFor(blockType) {
  if (blockType === "text" || blockType === "quote") return "value";
  if (blockType === "image" || blockType === "video") return "caption";
  return null;
}

export default function BlockEditor({ blocks, onAddBlock, onUpdateBlock, onRemoveBlock, onReorder }) {
  const [openPanel, setOpenPanel] = useState(null); // null | "tray" | "emoji"
  const [activeBlockId, setActiveBlockId] = useState(null);
  const fileInputRef = useRef(null);
  const pendingMediaType = useRef("image");
  const dragIndex = useRef(null);
  const actionRowRef = useRef(null);

  const trayOpen = openPanel === "tray";
  const emojiOpen = openPanel === "emoji";

  useEffect(() => {
    if (!openPanel) return;
    const handleClickOutside = (e) => {
      if (actionRowRef.current && !actionRowRef.current.contains(e.target)) {
        setOpenPanel(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openPanel]);

  const handleTraySelect = (type) => {
    setOpenPanel(null);
    if (type === "image" || type === "video") {
      pendingMediaType.current = type;
      fileInputRef.current?.click();
      return;
    }
    onAddBlock(type);
  };

  const handleFileChosen = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Pass raw options — onAddBlock/DraftEngine already calls the block
    // factory internally. Building a full block here first and handing
    // it in as "opts" made the factory run twice per file and leaked an
    // un-revoked blob URL from the first, discarded call.
    onAddBlock(pendingMediaType.current, { file });
    e.target.value = "";
  };

  const handleEmojiSelect = (emoji) => {
    let target = blocks.find((b) => b.id === activeBlockId && editableFieldFor(b.type));
    if (!target) {
      target = [...blocks].reverse().find((b) => editableFieldFor(b.type));
    }
    if (!target) return;

    const field = editableFieldFor(target.type);
    const current = target[field] || "";
    onUpdateBlock(target.id, { [field]: current + emoji });
    setActiveBlockId(target.id);
  };

  const hasEditableBlock = blocks.some((b) => editableFieldFor(b.type));

  return (
    <div>
      <div className="flex flex-col gap-3.5">
        {blocks.map((block, index) => {
          const Component = BLOCK_COMPONENTS[block.type];
          if (!Component) return null;
          return (
            <div
              key={block.id}
              className="cursor-grab active:cursor-grabbing"
              draggable
              onFocusCapture={() => setActiveBlockId(block.id)}
              onDragStart={() => (dragIndex.current = index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex.current === null || dragIndex.current === index) return;
                onReorder(dragIndex.current, index);
                dragIndex.current = null;
              }}
            >
              <Component
                block={block}
                autoFocus={index === blocks.length - 1 && block.type === "text"}
                onChange={(patch) => onUpdateBlock(block.id, patch)}
                onRemove={() => onRemoveBlock(block.id)}
              />
            </div>
          );
        })}
      </div>

      <div ref={actionRowRef} className="relative mt-3.5 flex items-center gap-2">
        <button
          type="button"
          className="w-11 h-11 rounded-full bg-[#232027] text-white text-xl cursor-pointer flex items-center justify-center leading-none"
          aria-expanded={trayOpen}
          onClick={() => setOpenPanel((p) => (p === "tray" ? null : "tray"))}
        >
          +
        </button>

        <EmojiPickerButton
          open={emojiOpen}
          disabled={!hasEditableBlock}
          onToggle={() => setOpenPanel((p) => (p === "emoji" ? null : "emoji"))}
          onSelect={handleEmojiSelect}
        />

        {trayOpen && (
          <div
            className="absolute top-[52px] left-0 bg-white border border-[#E7DFD2] rounded-2xl shadow-lg overflow-hidden flex flex-col z-10 min-w-[180px]"
            role="menu"
          >
            {TRAY_ITEMS.map((item) => (
              <button
                key={item.type}
                type="button"
                role="menuitem"
                className="flex items-center gap-2.5 px-4 py-3 text-left text-sm text-black bg-transparent border-0 cursor-pointer hover:bg-[#FBF7F0]"
                onClick={() => handleTraySelect(item.type)}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={pendingMediaType.current === "video" ? "video/*" : "image/*"}
        hidden
        onChange={handleFileChosen}
      />
    </div>
  );
}