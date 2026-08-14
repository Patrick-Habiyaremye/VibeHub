export default function CommentItem({ comment, onReply, onLike }) {
  return (
    <div className="p-2 border-b">
      <p>{comment.username}</p>
      <p>{comment.content}</p>

      <div className="flex gap-3 text-sm">
        <button onClick={() => onLike(comment.id)}>
          ❤️ {comment.likes}
        </button>

        <button onClick={() => onReply(comment.id)}>
          Reply
        </button>
      </div>
    </div>
  );
}