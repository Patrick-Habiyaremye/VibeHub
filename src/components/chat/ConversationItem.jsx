import { useMemo } from "react";

export default function ConversationItem({
  conversation,
  isActive,
  onSelect,
  currentUserId,
}) {
  const {
    id,
    username,
    avatar_url,
    last_message,
    last_message_at,
    unread_count,
    is_online,
  } = conversation;

  const formattedTime = useMemo(() => {
    if (!last_message_at) return "";

    const date = new Date(last_message_at);
    const now = new Date();

    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  }, [last_message_at]);

  return (
    <button
      onClick={() => onSelect(conversation)}
      className={`
        w-full flex items-center gap-3 px-4 py-3
        border-b border-slate-800
        transition
        hover:bg-slate-800/60
        ${
          isActive
            ? "bg-slate-800/70"
            : "bg-transparent"
        }
      `}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-11 h-11 rounded-full bg-slate-700 overflow-hidden">
          {avatar_url ? (
            <img
              src={avatar_url}
              alt={username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold">
              {username?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Online dot */}
        {is_online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full" />
        )}
      </div>

      {/* Middle content */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold truncate">
            {username}
          </h3>

          <span className="text-xs text-slate-400 ml-2">
            {formattedTime}
          </span>
        </div>

        <p className="text-sm text-slate-400 truncate">
          {last_message || "Start a conversation 💬"}
        </p>
      </div>

      {/* Unread badge */}
      {unread_count > 0 && (
        <div className="ml-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full min-w-[22px] text-center">
          {unread_count > 99 ? "99+" : unread_count}
        </div>
      )}
    </button>
  );
}