import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function MessageList({
  messages,
  user,
  loading,
}) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  // 🧠 Smart auto-scroll (only if user is near bottom)
  const shouldAutoScroll = () => {
    const el = containerRef.current;
    if (!el) return true;

    const threshold = 120;

    return (
      el.scrollHeight - el.scrollTop - el.clientHeight <
      threshold
    );
  };

  useEffect(() => {
    if (shouldAutoScroll()) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-950">
        Loading messages...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="
        flex-1
        overflow-y-auto
        px-4
        py-3
        space-y-3
        bg-slate-950
      "
    >
      {/* EMPTY STATE */}
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-slate-500">
          Start the conversation 💬
        </div>
      )}

      {/* MESSAGES */}
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          mine={msg.sender_id === user.id}
        />
      ))}

      {/* AUTO SCROLL TARGET */}
      <div ref={bottomRef} />
    </div>
  );
}