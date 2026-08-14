import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCommentsRealtime } from "../../hooks/useCommentsRealtime";
import { useComments } from "../../hooks/useComments";

export default function CommentSection({ postId, reelId }) {
  const { user } = useAuth();

  const {
    comments,
    loading,
    error,
    load,
    add,
    remove,
    setComments,
  } = useComments({ postId, reelId });

  //--------------------------------------------------
  // 🔒 HARD GUARD (FINAL DEFENSE)
  //--------------------------------------------------
  const safeComments = Array.isArray(comments) ? comments : [];

  //--------------------------------------------------
  // REALTIME
  //--------------------------------------------------
  useCommentsRealtime({ postId, reelId }, setComments);

  //--------------------------------------------------
  // LOAD
  //--------------------------------------------------
  useEffect(() => {
    load();
  }, [load]);

  //--------------------------------------------------
  // LOCAL STATE
  //--------------------------------------------------
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  //--------------------------------------------------
  // ADD COMMENT (OPTIMISTIC)
  //--------------------------------------------------
  const handleAdd = async () => {
    const trimmed = text.trim();
    if (!trimmed || posting || !user) return;

    const tempId = `temp-${crypto.randomUUID()}`;

    const optimistic = {
      id: tempId,
      content: trimmed,
      user_id: user.id,
      username: user.username || "You",
      created_at: new Date().toISOString(),
      optimistic: true,
    };

    setComments((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return [optimistic, ...safePrev];
    });

    setText("");
    setPosting(true);

    try {
      const saved = await add(trimmed);

      setComments((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return safePrev.map((c) =>
          c.id === tempId ? saved : c
        );
      });
    } catch (err) {
      console.error("Add failed:", err);

      setComments((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return safePrev.filter((c) => c.id !== tempId);
      });
    } finally {
      setPosting(false);
    }
  };

  //--------------------------------------------------
  // DELETE (OPTIMISTIC)
  //--------------------------------------------------
  const handleDelete = async (id) => {
    let backup = [];

    setComments((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      backup = safePrev;
      return safePrev.filter((c) => c.id !== id);
    });

    try {
      await remove(id);
    } catch (err) {
      console.error("Delete failed:", err);
      setComments(backup);
    }
  };

  //--------------------------------------------------
  // RENDER
  //--------------------------------------------------
  return (
    <div className="mt-4">
      {loading && (
        <p className="text-slate-400 text-sm">Loading comments...</p>
      )}

      {error && (
        <p className="text-red-400 text-sm mb-2">{error}</p>
      )}

      {!loading && safeComments.length === 0 && (
        <p className="text-slate-500 text-sm">No comments yet</p>
      )}

      <div className="space-y-2">
        {safeComments.map((c) => {
          const isOwner = c.user_id === user?.id;

          return (
            <div
              key={c.id}
              className="bg-slate-800 rounded-lg p-3 flex justify-between"
            >
              <div>
                <p className="text-yellow-400 text-xs">
                  {c.username || "User"}
                </p>

                <p className="text-white">{c.content}</p>

                {c.optimistic && (
                  <p className="text-xs text-slate-400">
                    Sending...
                  </p>
                )}
              </div>

              {isOwner && !c.optimistic && (
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-red-400 text-xs"
                >
                  Delete
                </button>
              )}
            </div>
          );
        })}
      </div>

      {user ? (
        <div className="flex gap-2 mt-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 bg-slate-900 text-white px-3 py-2 rounded"
          />

          <button
            onClick={handleAdd}
            disabled={posting || !text.trim()}
            className="bg-yellow-500 px-4 rounded disabled:opacity-50"
          >
            {posting ? "..." : "Post"}
          </button>
        </div>
      ) : (
        <p className="text-slate-400 text-sm mt-3">
          Sign in to comment
        </p>
      )}
    </div>
  );
}