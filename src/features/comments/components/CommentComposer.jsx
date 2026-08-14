// src/features/comments/components/CommentComposer.jsx
//
// Mention/emoji scope note: the emoji row is a real, working quick-insert
// UI. The "@" mention detection below only fires an optional callback —
// there's no user-search backend wired in, so without `onMentionQuery`
// supplied it's inert. Don't ship an autocomplete dropdown against this
// without building that lookup first.

import { useState, useCallback } from "react";
import { useCommentContext } from "../context/CommentContext";
import { QUICK_REACTIONS } from "../constants/comment.constants";

export default function CommentComposer({ onSubmit, placeholder = "Share something uplifting...", autoFocus = false, onMentionQuery }) {
  const { currentUser } = useCommentContext();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);

    const match = value.match(/@(\w*)$/);
    if (match && onMentionQuery) onMentionQuery(match[1]);
  };

  const insertEmoji = (emoji) => {
    setText((t) => t + emoji);
    setShowEmoji(false);
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const trimmed = text.trim();
      if (!trimmed || submitting) return;

      if (!currentUser) {
        setError("You must be signed in to comment.");
        return;
      }

      setSubmitting(true);
      setError(null);

      const result = await onSubmit(trimmed);

      if (result?.success === false) {
        setError(result.message);
      } else {
        setText("");
      }
      setSubmitting(false);
    },
    [text, submitting, currentUser, onSubmit]
  );

  return (
    <div className="border-t border-white/10 shrink-0">
      {showEmoji && (
        <div className="flex gap-2 px-3 pt-2">
          {QUICK_REACTIONS.map((emoji) => (
            <button key={emoji} type="button" onClick={() => insertEmoji(emoji)} className="text-xl">
              {emoji}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-3 flex gap-2 items-center">
        <button
          type="button"
          onClick={() => setShowEmoji((v) => !v)}
          aria-label="Quick emoji"
          className="text-lg shrink-0"
        >
          😊
        </button>

        <input
          value={text}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={1000}
          autoFocus={autoFocus}
          disabled={submitting}
          className="flex-1 bg-white/10 text-white px-3 py-2 rounded-lg outline-none disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="px-4 py-2 bg-yellow-400 text-black rounded-lg disabled:opacity-50 whitespace-nowrap"
        >
          Share Smile
        </button>
      </form>
      {error && <p className="text-red-400 text-xs px-3 pb-2">{error}</p>}
    </div>
  );
}