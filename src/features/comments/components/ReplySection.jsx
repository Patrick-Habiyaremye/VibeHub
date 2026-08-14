// src/features/comments/components/ReplySection.jsx

import { useEffect, useRef } from "react";
import useReplies from "../hooks/useReplies";
import CommentItem from "./CommentItem";
import CommentComposer from "./CommentComposer";

export default function ReplySection({ parentComment, currentUser }) {
  const endRef = useRef(null);

  const { replies, loading, loadingMore, hasMore, error, lastAddedId, loadMore, addReply, deleteReply } = useReplies({
    parentId: parentComment.id,
    parentAuthorId: parentComment.userId,
    enabled: true,
  });

  useEffect(() => {
    if (lastAddedId) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [lastAddedId]);

  const handleEdit = async (id, content) => {
    // Replies share CommentEngine.updateComment via useComments' sibling
    // logic — but useReplies doesn't expose editComment yet in this pass.
    // Flagging rather than silently no-oping: wire this the same way
    // useComments.editComment works if you need reply editing too.
    console.warn("Reply editing not wired yet — see ReplySection.jsx comment.");
    return { success: false, message: "Editing replies isn't available yet." };
  };

  return (
    <div className="mt-3 pl-4 border-l border-white/10 space-y-3">
      {loading && <p className="text-xs text-white/40">Loading replies…</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          currentUser={currentUser}
          onDelete={deleteReply}
          onEdit={handleEdit}
          isReply
        />
      ))}
      <div ref={endRef} />

      {hasMore && !loading && (
        <button onClick={loadMore} disabled={loadingMore} className="text-xs text-white/50 hover:text-white">
          {loadingMore ? "Loading…" : "View more replies"}
        </button>
      )}

      <CommentComposer onSubmit={addReply} placeholder={`Reply to ${parentComment.user?.username || "this comment"}...`} />
    </div>
  );
}