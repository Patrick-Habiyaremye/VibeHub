import {
  Image,
  Send,
} from "lucide-react";

export default function MessageInput({
  value = "",
  setValue,
  onSend,
  onTyping,
  disabled = false,
  sending = false,
}) {
  const handleKeyDown = (event) => {
    if (event.key !== "Enter") return;

    if (event.shiftKey) return;

    event.preventDefault();

    if (!disabled) {
      onSend?.();
    }
  };

  return (
    <div className="p-3">
      <div
        className="
          flex
          items-end
          gap-2
          rounded-2xl
          bg-slate-800
          border
          border-slate-700
          p-2
          focus-within:border-yellow-500/40
        "
      >
        <button
          type="button"
          disabled={disabled}
          aria-label="Add attachment"
          className="
            shrink-0
            p-2.5
            rounded-xl
            text-slate-400
            hover:text-white
            hover:bg-slate-700
            disabled:opacity-40
            transition
          "
        >
          <Image size={19} />
        </button>

        <textarea
          value={value}
          onChange={(event) => {
            setValue?.(event.target.value);
            onTyping?.();
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder="Write a message..."
          aria-label="Message"
          className="
            flex-1
            resize-none
            bg-transparent
            text-white
            placeholder:text-slate-500
            outline-none
            px-2
            py-2
            text-sm
            max-h-32
          "
        />

        <button
          type="button"
          onClick={onSend}
          disabled={
            disabled ||
            sending ||
            !value.trim()
          }
          aria-label="Send message"
          className="
            shrink-0
            p-2.5
            rounded-xl
            bg-yellow-500
            text-black
            hover:bg-yellow-400
            disabled:opacity-40
            disabled:cursor-not-allowed
            transition
          "
        >
          <Send size={18} />
        </button>
      </div>

      <p className="hidden sm:block text-[11px] text-slate-600 mt-1 px-2">
        Enter to send · Shift + Enter for a new line
      </p>
    </div>
  );
}