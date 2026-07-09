import { useState } from "react";
import useCommentMutations from "./hooks/useCommentMutations";

const MAX_LENGTH = 500;

export default function CommentComposer({
  postId,
  parentId = null,
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(null);

  const { addComment, adding } = useCommentMutations();

  const trimmed = value.trim();
  const isValid = trimmed.length > 0 && trimmed.length <= MAX_LENGTH;

  const handleSubmit = () => {
    if (!isValid || adding) return;

    setError(null);

    addComment(
      {
        postId,
        content: trimmed,
        parentId,
      },
      {
        onError: () => {
          setError("Failed to post comment");
        },
      }
    );

    // optimistic clear (feels instant)
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-1 mt-2">
      <div className="flex gap-2">
        <textarea
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Write a comment..."
          maxLength={MAX_LENGTH}
          className="
            flex-1 
            bg-slate-800 
            p-2 
            rounded 
            resize-none
            outline-none
          "
        />

        <button
          onClick={handleSubmit}
          disabled={!isValid || adding}
          className={`
            px-3 rounded text-black transition
            ${
              !isValid || adding
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-400"
            }
          `}
        >
          {adding ? "Posting..." : "Post"}
        </button>
      </div>

      {/* 🔥 UX feedback layer */}
      <div className="flex justify-between text-xs px-1">
        <span className="text-red-400">
          {error}
        </span>

        <span
          className={`${
            value.length > MAX_LENGTH
              ? "text-red-400"
              : "text-gray-400"
          }`}
        >
          {value.length}/{MAX_LENGTH}
        </span>
      </div>
    </div>
  );
}