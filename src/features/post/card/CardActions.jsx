import {
  Smile,
  MessageCircle,
  Share2,
  Bookmark,
} from "lucide-react";

export default function CardActions({
  onSmile,
  onComment,
  onShare,
  onSave,
}) {
  const buttonClass = `
    flex-1
    flex
    items-center
    justify-center
    gap-2
    py-3
    rounded-xl
    transition-all
    duration-200
    hover:bg-slate-800
    active:scale-95
    text-slate-300
    hover:text-yellow-400
  `;

  return (
    <div
      className="
        grid
        grid-cols-4
        gap-2
        px-4
        py-3
        border-b
        border-slate-800
      "
    >
      <button
        className={buttonClass}
        onClick={onSmile}
      >
        <Smile size={20} />
        <span className="hidden md:block">
          Smile
        </span>
      </button>

      <button
        className={buttonClass}
        onClick={onComment}
      >
        <MessageCircle size={20} />
        <span className="hidden md:block">
          Comment
        </span>
      </button>

      <button
        className={buttonClass}
        onClick={onShare}
      >
        <Share2 size={20} />
        <span className="hidden md:block">
          Share
        </span>
      </button>

      <button
        className={buttonClass}
        onClick={onSave}
      >
        <Bookmark size={20} />
        <span className="hidden md:block">
          Save
        </span>
      </button>
    </div>
  );
}