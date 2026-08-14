import {
  Copy,
  Edit3,
  Heart,
  MoreHorizontal,
  Reply,
  Trash2,
} from "lucide-react";

export default function MessageActions({
  message,
  mine = false,
  onReply,
  onReact,
  onEdit,
  onDelete,
  onCopy,
}) {
  if (!message) return null;

  const handleCopy = async () => {
    if (!message.content) return;

    try {
      await navigator.clipboard.writeText(
        message.content
      );

      onCopy?.(message);
    } catch (error) {
      console.error(
        "Failed to copy message:",
        error
      );
    }
  };

  return (
    <div
      className="
        flex
        items-center
        gap-1
        rounded-xl
        bg-slate-900
        border
        border-slate-700
        shadow-xl
        p-1
      "
    >
      <button
        type="button"
        onClick={() => onReply?.(message)}
        title="Reply"
        className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
      >
        <Reply size={16} />
      </button>

      <button
        type="button"
        onClick={() => onReact?.(message, "❤️")}
        title="React"
        className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
      >
        <Heart size={16} />
      </button>

      {message.content && (
        <button
          type="button"
          onClick={handleCopy}
          title="Copy"
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <Copy size={16} />
        </button>
      )}

      {mine && (
        <>
          <button
            type="button"
            onClick={() => onEdit?.(message)}
            title="Edit"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <Edit3 size={16} />
          </button>

          <button
            type="button"
            onClick={() => onDelete?.(message)}
            title="Delete"
            className="p-2 rounded-lg text-slate-300 hover:text-red-400 hover:bg-slate-800"
          >
            <Trash2 size={16} />
          </button>
        </>
      )}

      <button
        type="button"
        title="More"
        className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
      >
        <MoreHorizontal size={16} />
      </button>
    </div>
  );
}