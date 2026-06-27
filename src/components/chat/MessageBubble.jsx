export default function MessageBubble({
  message,
  mine,
}) {

  return (
    <div
      className={`
      max-w-[80%]
      rounded-2xl
      px-4
      py-3

      ${
        mine
          ? "bg-yellow-500 text-black ml-auto"
          : "bg-slate-800 text-white"
      }
      `}
    >

      <p className="break-words">
        {message.content}
      </p>

      {mine && (
        <div
          className="
          text-xs
          text-right
          mt-1
          "
        >
          {message.seen_at
            ? "✓✓"
            : "✓"}
        </div>
      )}

    </div>
  );
}