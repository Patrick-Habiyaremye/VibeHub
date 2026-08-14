export default function MessageBubble({
  message,
  mine,
  onReply,
  onReact,
  onEdit,
  onDelete,
}) {
  const deleted = Boolean(
    message.deletedAt
  );

  return (
    <div
      className={`flex ${
        mine
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`
          group relative max-w-[75%]
          rounded-2xl px-4 py-2.5
          ${
            mine
              ? "bg-yellow-500 text-black"
              : "bg-slate-800 text-white"
          }
        `}
      >
        {deleted ? (
          <p className="italic opacity-60">
            Message deleted
          </p>
        ) : (
          <>
            {message.replyTo && (
              <div className="mb-2 border-l-2 border-current/40 pl-2 text-xs opacity-70">
                {message.replyTo.content}
              </div>
            )}

            <p className="break-words whitespace-pre-wrap">
              {message.content}
            </p>

            <div
              className={`
                flex items-center justify-end
                gap-1 mt-1 text-[10px]
                ${
                  mine
                    ? "text-black/60"
                    : "text-slate-500"
                }
              `}
            >
              {message.editedAt && (
                <span>Edited</span>
              )}

              <span>
                {new Date(
                  message.createdAt
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}