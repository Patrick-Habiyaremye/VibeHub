import {
  useEffect,
  useRef,
} from "react";

import MessageBubble from "./MessageBubble";

export default function MessageList({
  messages,
  userId,
  onLoadOlder,
  hasMore,
  loadingOlder,
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  const nearBottom = () => {
    const el = containerRef.current;

    if (!el) return true;

    return (
      el.scrollHeight -
        el.scrollTop -
        el.clientHeight <
      120
    );
  };

  useEffect(() => {
    if (nearBottom()) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages.length]);

  const handleScroll = (event) => {
    if (
      event.currentTarget.scrollTop <
        100 &&
      hasMore &&
      !loadingOlder
    ) {
      onLoadOlder?.();
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4 bg-slate-950"
    >
      {loadingOlder && (
        <div className="text-center text-xs text-slate-500 mb-3">
          Loading older messages...
        </div>
      )}

      <div className="space-y-2">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            mine={
              message.senderId === userId
            }
          />
        ))}
      </div>

      <div ref={bottomRef} />
    </div>
  );
}