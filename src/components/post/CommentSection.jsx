import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../../supabaseClient";

export default function CommentSection({
  postId,
}) {
  const [comments, setComments] =
    useState([]);

  const [comment, setComment] =
    useState("");

  const loadComments =
    async () => {
      const { data } =
        await supabase
          .from("comments")
          .select("*")
          .eq("post_id", postId)
          .order(
            "created_at",
            {
              ascending: true,
            }
          );

      setComments(data || []);
    };

  useEffect(() => {
    loadComments();
  }, []);

  const addComment =
    async () => {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) return;

      await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          post_id: postId,
          content: comment,
        });

      setComment("");

      loadComments();
    };

  return (
    <div className="mt-4">

      <div className="space-y-2">

        {comments.map((c) => (
          <div
            key={c.id}
            className="bg-slate-700 rounded-lg p-2"
          >
            <p className="text-white">
              {c.content}
            </p>
          </div>
        ))}

      </div>

      <div className="flex gap-2 mt-3">

        <input
          value={comment}
          onChange={(e) =>
            setComment(
              e.target.value
            )
          }
          placeholder="Say something kind 💛"
          className="
            flex-1
            bg-slate-900
            text-white
            px-3
            py-2
            rounded-lg
          "
        />

        <button
          onClick={addComment}
          className="
            bg-yellow-500
            px-4
            rounded-lg
            text-black
          "
        >
          Post
        </button>

      </div>

    </div>
  );
}