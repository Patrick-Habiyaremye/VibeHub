import useComments from "../hooks/useComments";
import { useCommentContext } from "../context/CommentContext";
import CommentItem from "./CommentItem";
import CommentComposer from "./CommentComposer";
import EmptyConversation from "./EmptyConversation";
import ConversationHeader from "./ConversationHeader";

export default function CommentList({ onClose }) {
  const { currentUser } = useCommentContext();

  const { comments, loading, loadingMore, hasMore, error, loadMore, addComment, editComment, deleteComment } =
    useComments();

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ConversationHeader count={comments.length} onClose={onClose} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && <p className="text-white/60">Loading comments…</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && comments.length === 0 && <EmptyConversation />}

        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUser={currentUser}
            onDelete={deleteComment}
            onEdit={editComment}
          />
        ))}

        {hasMore && !loading && (
          <button onClick={loadMore} disabled={loadingMore} className="text-white/60 text-sm hover:text-white disabled:opacity-50">
            {loadingMore ? "Loading…" : "Load more comments"}
          </button>
        )}
      </div>

      <CommentComposer onSubmit={addComment} />
    </div>
  );
}