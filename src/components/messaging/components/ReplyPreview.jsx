import { CornerUpLeft, X } from "lucide-react";

export default function ReplyPreview({
  replyTo,
  onCancel,
}) {
  if (!replyTo) return null;

  const sender =
    replyTo.sender?.username ||
    replyTo.sender_username ||
    (replyTo.mine ? "You" : "User");

  const content =
    replyTo.content ||
    "Media message";

  return (
    <div
      className="
        mx-3
        mt-2
        flex
        items-center
        gap-3
        rounded-xl
        border
        border-slate-700
        bg-slate-800
        p-3
      "
    >
      <div className="w-1 self-stretch rounded-full bg-yellow-500" />

      <CornerUpLeft
        size={17}
        className="text-yellow-400 shrink-0"
      />

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-yellow-400">
          Replying to {sender}
        </p>

        <p className="mt-0.5 text-sm text-slate-300 truncate">
          {content}
        </p>
      </div>

      <button
        type="button"
        onClick={onCancel}
        aria-label="Cancel reply"
        className="
          p-1.5
          rounded-full
          text-slate-400
          hover:text-white
          hover:bg-slate-700
          transition
        "
      >
        <X size={17} />
      </button>
    </div>
  );
}