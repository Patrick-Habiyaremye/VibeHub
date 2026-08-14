import { useCommentContext } from "../context/CommentContext";
import { SORT_OPTIONS } from "../constants/comment.constants";

export default function ConversationHeader({ count, onClose }) {
  const { sort, setSort } = useCommentContext();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
      {onClose ? (
        <button onClick={onClose} className="text-white/80 text-sm flex items-center gap-1" aria-label="Back to post">
          ← Back
        </button>
      ) : (
        <span className="w-12" aria-hidden="true" />
      )}

      <div className="text-center">
        <p className="font-semibold text-white">💬 Smile Conversation</p>
        <p className="text-xs text-white/50">{count} {count === 1 ? "comment" : "comments"}</p>
      </div>

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="bg-transparent text-white/70 text-xs outline-none"
        aria-label="Sort comments"
      >
        <option className="text-black" value={SORT_OPTIONS.NEWEST}>Newest</option>
        <option className="text-black" value={SORT_OPTIONS.MOST_LOVED}>Most Loved</option>
        <option className="text-black" value={SORT_OPTIONS.OLDEST}>Oldest</option>
      </select>
    </div>
  );
}