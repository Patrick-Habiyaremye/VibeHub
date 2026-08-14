export default function ConversationListItem({
  conversation,
  active,
  onClick,
}) {
  const participant =
    conversation.participants?.[0];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center gap-3
        px-4 py-3 text-left
        border-b border-slate-800
        transition
        ${
          active
            ? "bg-slate-800"
            : "hover:bg-slate-900"
        }
      `}
    >
      <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-700 shrink-0">
        {participant?.avatarUrl ? (
          <img
            src={participant.avatarUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold">
            {participant?.username
              ?.charAt(0)
              ?.toUpperCase()}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-2">
          <span className="font-semibold text-white truncate">
            {participant?.username ?? "User"}
          </span>

          <span className="text-xs text-slate-500">
            {conversation.lastMessageAt
              ? new Date(
                  conversation.lastMessageAt
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-slate-400 truncate">
            {conversation.lastMessage
              ?.content ??
              "Start a conversation"}
          </span>

          {conversation.unreadCount > 0 && (
            <span className="min-w-5 h-5 px-1 rounded-full bg-yellow-500 text-black text-xs font-bold flex items-center justify-center">
              {conversation.unreadCount > 99
                ? "99+"
                : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}