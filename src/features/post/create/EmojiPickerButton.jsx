// features/create/EmojiPickerButton.jsx
import { Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

// One emoji entry point, wired by BlockEditor to whichever block/field last
// had focus — a quote's text, an image/video caption, or a plain text
// block. Open/closed state is controlled from BlockEditor (not owned
// locally) so it can be made mutually exclusive with the "+" tray; two
// floating panels open at once would overlap.
export default function EmojiPickerButton({ open, onToggle, onSelect, disabled }) {
  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-label="Add emoji"
        onClick={onToggle}
        className="w-11 h-11 rounded-full bg-[#232027] text-yellow-400 flex items-center justify-center cursor-pointer hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Smile size={20} />
      </button>

      {open && (
        <div className="absolute top-[52px] left-0 z-10">
          <EmojiPicker theme="dark" onEmojiClick={(data) => onSelect(data.emoji)} />
        </div>
      )}
    </div>
  );
}