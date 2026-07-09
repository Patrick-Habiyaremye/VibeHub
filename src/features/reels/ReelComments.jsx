import { useEffect, useState, useCallback, useRef } from "react";

export default function ReelComments({
  reelId,
  fetchComments,
  createComment,
  currentUser,
  onClose,
}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState(null);

  const inputRef = useRef(null);

  // --------------------------
  // LOAD COMMENTS
  // --------------------------
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchComments(reelId);
      setComments(data || []);
    } catch (err) {
      console.error("Fetch comments failed:", err);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [reelId, fetchComments]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // --------------------------
  // CREATE COMMENT (Optimistic)
  // --------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || posting) return;

    const tempId = Date.now();

    const optimisticComment = {
      id: tempId,
      content: text,
      user: currentUser,
      created_at: new Date().toISOString(),
      optimistic: true,
    };

    // Optimistic UI
    setComments((prev) => [optimisticComment, ...prev]);
    setText("");
    setPosting(true);

    try {
      const saved = await createComment({
        reelId,
        content: text,
      });

      // Replace optimistic with real
      setComments((prev) =>
        prev.map((c) => (c.id === tempId ? saved : c))
      );
    } catch (err) {
      console.error("Comment failed:", err);

      // Rollback
      setComments((prev) => prev.filter((c) => c.id !== tempId));
    } finally {
      setPosting(false);
    }
  };

  // --------------------------
  // RENDER
  // --------------------------
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <h2 className="text-white font-semibold">Comments</h2>
        <button onClick={onClose} className="text-white text-xl">✕</button>
      </div>

      {/* COMMENTS LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && (
          <p className="text-white/60">Loading comments...</p>
        )}

        {error && (
          <p className="text-red-400">{error}</p>
        )}

        {!loading && comments.length === 0 && (
          <p className="text-white/50">No comments yet</p>
        )}

        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20" />
            <div>
              <p className="text-white text-sm font-semibold">
                {c.user?.username || "user"}
              </p>
              <p className="text-white/80 text-sm">
                {c.content}
              </p>
              {c.optimistic && (
                <p className="text-xs text-white/40">Sending...</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-white/10 flex gap-2"
      >
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="
            flex-1
            bg-white/10
            text-white
            px-3 py-2
            rounded-lg
            outline-none
          "
        />

        <button
          type="submit"
          disabled={posting}
          className="
            px-4 py-2
            bg-white
            text-black
            rounded-lg
            disabled:opacity-50
          "
        >
          Post
        </button>
      </form>
    </div>
  );
}