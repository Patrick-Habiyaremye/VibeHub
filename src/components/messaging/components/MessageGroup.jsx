import MessageBubble from "./MessageBubble";

function isSameSender(a, b) {
  return (
    a?.sender_id &&
    b?.sender_id &&
    a.sender_id === b.sender_id
  );
}

function isWithinGroupingWindow(a, b) {
  if (!a?.created_at || !b?.created_at) {
    return false;
  }

  const first = new Date(a.created_at).getTime();
  const second = new Date(b.created_at).getTime();

  return Math.abs(second - first) <= 5 * 60 * 1000;
}

export default function MessageGroup({
  messages = [],
  currentUserId,
  onReply,
  onReact,
  onEdit,
  onDelete,
}) {
  if (!messages.length) return null;

  const senderId = messages[0]?.sender_id;
  const mine = senderId === currentUserId;

  return (
    <div
      className={`
        flex
        flex-col
        ${mine ? "items-end" : "items-start"}
        gap-1
      `}
    >
      {messages.map((message, index) => {
        const previous = messages[index - 1];
        const grouped =
          index > 0 &&
          isSameSender(previous, message) &&
          isWithinGroupingWindow(previous, message);

        return (
          <div
            key={message.id}
            className={`
              w-full
              flex
              ${mine ? "justify-end" : "justify-start"}
              ${grouped ? "mt-0" : "mt-2"}
            `}
          >
            <MessageBubble
              message={message}
              mine={mine}
              grouped={grouped}
              onReply={onReply}
              onReact={onReact}
              onEdit={
                mine
                  ? () => onEdit?.(message)
                  : undefined
              }
              onDelete={
                mine
                  ? () => onDelete?.(message)
                  : undefined
              }
            />
          </div>
        );
      })}
    </div>
  );
}