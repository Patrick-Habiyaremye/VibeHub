import { Send, Image } from "lucide-react";

export default function MessageInput({
  value,
  setValue,
  onSend,
  onTyping,
}) {
  return (
    <div className="flex gap-2 items-center">
      <button className="p-3 bg-slate-800 rounded-xl">
        <Image size={18} />
      </button>

      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onTyping?.(); // 🔥 trigger typing
        }}
        placeholder="Type a message..."
        className="flex-1 bg-slate-800 text-white rounded-xl px-4 py-3 outline-none"
      />

      <button
        onClick={onSend}
        className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-3 rounded-xl"
      >
        <Send size={18} />
      </button>
    </div>
  );
}