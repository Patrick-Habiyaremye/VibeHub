import useComments from "./hooks/useComments";
import CommentComposer from "./CommentComposer";

export default function CommentSection({ postId }) {
  const {
    comments,
    addComment,
    loadMore,
    loading,
  } = useComments(postId);

  return (
    <div className="space-y-4">
      {/* Composer */}
      <CommentComposer onSubmit={addComment} />

      {/* Comments */}
      {comments.map((c) => (
        <div
          key={c.id}
          className="bg-slate-800 p-3 rounded"
        >
          <p className="text-sm font-bold">
            {c.profiles?.username}
          </p>

          <p>{c.content}</p>

          {/* reply */}
          <CommentComposer
            onSubmit={addComment}
            parentId={c.id}
          />
        </div>
      ))}

      {/* Load more */}
      <button onClick={loadMore}>
        Load more
      </button>

      {loading && <p>Loading...</p>}
    </div>
  );
}