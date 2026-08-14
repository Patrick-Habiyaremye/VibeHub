// src/features/comments/components/CommentItem.jsx

import { useState } from "react";
import { Heart, MessageCircle, Pencil, Trash2 } from "lucide-react";
import useCommentLikes from "../hooks/useCommentLikes";
import ReplySection from "./ReplySection";

export default function CommentItem({ comment, currentUser, onDelete, onEdit, isReply = false }) {
  const [showReplies, setShowReplies] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [saving, setSaving] = useState(false);

  const { liked, count, pending, toggle } = useCommentLikes({
    commentId: comment.id,
    commentOwnerId: comment.userId,
    initialLiked: comment.likedByMe,
    initialCount: comment.likesCount,
  });

  const isOwner = !!currentUser?.id && currentUser.id === comment.userId;
  const username = comment.user?.username || "user";

  const handleSaveEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    setSaving(true);
    const result = await onEdit(comment.id, trimmed);
    setSaving(false);
    if (result?.success !== false) setEditing(false);
  };

  const handleConfirmDelete = async () => {
    await onDelete(comment.id);
  };

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-white/20 shrink-0 overflow-hidden">
        {comment.user?.avatarUrl && <img src={comment.user.avatarUrl} alt="" className="w-full h-full object-cover" />}
      </div>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              maxLength={1000}
              className="w-full bg-white/10 text-white text-sm p-2 rounded-lg outline-none"
              rows={2}
            />
            <div className="flex gap-2 text-xs">
              <button onClick={handleSaveEdit} disabled={saving} className="text-yellow-400 font-medium">
                {saving ? "Saving…" : "Save"}
              </button>
              <button onClick={() => setEditing(false)} className="text-white/50">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm">
            <span className="font-semibold">{username}</span>{" "}
            <span className="text-white/80 break-words">{comment.content}</span>
            {comment.updatedAt && <span className="text-white/30 text-xs ml-1">(edited)</span>}
          </p>
        )}

        {comment.optimistic && <p className="text-xs text-white/40">Sending…</p>}

        {!editing && (
          <div className="flex items-center gap-4 mt-1 text-xs text-white/50">
            <button onClick={toggle} disabled={pending || !currentUser} className={`flex items-center gap-1 ${liked ? "text-red-400" : ""}`}>
              <Heart size={14} fill={liked ? "currentColor" : "none"} />
              {count > 0 && count}
            </button>

            {!isReply && (
              <button onClick={() => setShowReplies((v) => !v)} className="flex items-center gap-1">
                <MessageCircle size={14} />
                {comment.repliesCount > 0 ? `Reply (${comment.repliesCount})` : "Reply"}
              </button>
            )}

            {isOwner && !confirmingDelete && (
              <>
                <button onClick={() => setEditing(true)} className="flex items-center gap-1 hover:text-white" aria-label="Edit comment">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setConfirmingDelete(true)} className="flex items-center gap-1 hover:text-red-400" aria-label="Delete comment">
                  <Trash2 size={14} />
                </button>
              </>
            )}

            {confirmingDelete && (
              <span className="flex items-center gap-2">
                <span className="text-white/70">Delete comment?</span>
                <button onClick={handleConfirmDelete} className="text-red-400 font-medium">Delete</button>
                <button onClick={() => setConfirmingDelete(false)} className="text-white/50">Cancel</button>
              </span>
            )}
          </div>
        )}

        {!isReply && showReplies && (
          <ReplySection parentComment={comment} currentUser={currentUser} />
        )}
      </div>
    </div>
  );
}