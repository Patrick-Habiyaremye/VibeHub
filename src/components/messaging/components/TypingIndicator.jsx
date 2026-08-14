import { useMemo } from "react";

export default function TypingIndicator({
  typingUsers = [],
}) {
  const users = useMemo(
    () =>
      typingUsers.filter(
        (user) => user?.is_typing !== false
      ),
    [typingUsers]
  );

  if (!users.length) return null;

  const names = users
    .map(
      (user) =>
        user?.username ||
        user?.profile?.username
    )
    .filter(Boolean);

  let text = "Someone is typing";

  if (names.length === 1) {
    text = `${names[0]} is typing`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing`;
  } else if (names.length > 2) {
    text = `${names.length} people are typing`;
  }

  return (
    <div
      className="
        px-4
        py-2
        flex
        items-center
        gap-2
        text-xs
        text-slate-400
      "
      aria-live="polite"
    >
      <span>{text}</span>

      <span className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
      </span>
    </div>
  );
}